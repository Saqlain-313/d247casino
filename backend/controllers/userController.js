import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import betModel from '../models/betModel.js';
import CasinoBet from '../models/CasinoBet.js';
import LoginHistory from '../models/loginHistory.js';
import passwordHistory from '../models/passwordHistory.js';
import SubAdmin from '../models/subAdminModel.js';
import { calcTotalCasinoExposure } from '../services/casinoEngine.js';
import { getDateRangeUTC } from '../utils/dateUtils.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';
import { saveLoginHistory } from '../utils/loginHistory.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await SubAdmin.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const subAdmin = await SubAdmin.create({ name, email, password });
    res
      .status(201)
      .json({ message: 'SubAdmin registered successfully', data: subAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide both username and password.' });
    }

    const user = await SubAdmin.findOne({ userName: userName.toLowerCase() });
    if (!user) {
      await saveLoginHistory(
        userName,
        'user not found',
        'Invalid UserName.',
        req
      );
      return res.status(400).json({ message: 'Username not found.' });
    }
    if (user.status !== 'active') {
      return res
        .status(400)
        .json({ message: `Your Account is ${user.status}...` });
    }

    if (user.role !== 'user') {
      await saveLoginHistory(userName, user._id, 'Login With Admin Id', req);
      return res
        .status(400)
        .json({ message: 'This Dashboard is for User Dashboard...' });
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await saveLoginHistory(userName, user._id, 'Invalid Password.', req);
      return res.status(400).json({ message: 'Incorrect password.' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await saveLoginHistory(userName, user._id, 'Success', req);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: user,
      isPasswordChanged: user.isPasswordChanged,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DEMO_DEFAULT_BALANCE = 1500;
const DEMO_USERNAME = 'demouser';

export const demoLoginUser = async (req, res) => {
  try {
    let demoUser = await SubAdmin.findOne({ userName: DEMO_USERNAME });

    if (!demoUser) {
      demoUser = await SubAdmin.create({
        name: 'Demo User',
        userName: DEMO_USERNAME,
        account: 'demo',
        code: 'DEMOUSER',
        balance: DEMO_DEFAULT_BALANCE,
        baseBalance: DEMO_DEFAULT_BALANCE,
        totalBalance: DEMO_DEFAULT_BALANCE,
        avbalance: DEMO_DEFAULT_BALANCE,
        totalAvbalance: DEMO_DEFAULT_BALANCE,
        exposure: 0,
        exposureLimit: DEMO_DEFAULT_BALANCE,
        phone: 0,
        isPasswordChanged: true,
        password: `Demo${crypto.randomBytes(8).toString('hex')}1`,
        role: 'user',
        status: 'active',
        isDemo: true,
      });
    } else {
      let dirty = false;
      if (demoUser.status !== 'active') {
        demoUser.status = 'active';
        dirty = true;
      }
      if (!demoUser.isPasswordChanged) {
        demoUser.isPasswordChanged = true;
        dirty = true;
      }
      if (!demoUser.isDemo) {
        demoUser.isDemo = true;
        dirty = true;
      }
      if (demoUser.invite) {
        demoUser.invite = undefined;
        dirty = true;
      }
      // Auto-refill play balance when depleted and no open exposure
      if (
        Number(demoUser.avbalance || 0) < 100 &&
        Number(demoUser.exposure || 0) <= 0
      ) {
        demoUser.balance = DEMO_DEFAULT_BALANCE;
        demoUser.baseBalance = DEMO_DEFAULT_BALANCE;
        demoUser.totalBalance = DEMO_DEFAULT_BALANCE;
        demoUser.avbalance = DEMO_DEFAULT_BALANCE;
        demoUser.totalAvbalance = DEMO_DEFAULT_BALANCE;
        demoUser.exposureLimit = DEMO_DEFAULT_BALANCE;
        dirty = true;
      }
      if (dirty) await demoUser.save();
    }

    const token = jwt.sign(
      { id: demoUser._id, role: 'user', isDemo: true },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await saveLoginHistory(DEMO_USERNAME, demoUser._id, 'Success', req);

    const safeUser = demoUser.toObject();
    delete safeUser.password;
    delete safeUser.masterPassword;

    return res.status(200).json({
      success: true,
      message: 'Demo login successful',
      token,
      data: safeUser,
      isPasswordChanged: true,
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    return res
      .status(500)
      .json({ message: 'Demo login failed', error: error.message });
  }
};
export const getUserById = async (req, res) => {
  try {
    const { id } = req;

    if (!id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    const user = await SubAdmin.findById(id).select(
      '-password -masterPassword'
    );

    if (!user) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    const [updatedPendingBets, pendingCasinoBets] = await Promise.all([
      betModel.find({ userId: id, status: 0 }),
      CasinoBet.find({ userId: id, status: 'pending' })
        .select('slug roundId side selection odds stake exposure')
        .lean(),
    ]);
    const sportsExposure = calculateAllExposure(updatedPendingBets);
    const casinoExposure = calcTotalCasinoExposure(pendingCasinoBets);
    const currentExposure = sportsExposure + casinoExposure;

    const userWithExposure = {
      ...user.toObject(),
      exposure: currentExposure,
    };

    res.status(200).json({
      message: 'Sub-admin details retrieved successfully',
      data: userWithExposure, // ← Send the new object, not the modified user
    });
  } catch (error) {
    console.error('Error fetching sub-admin:', error);
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};
export const changePasswordByUserSelf = async (req, res) => {
  const { id } = req;
  try {
    const { oldPassword, newPassword } = req.body;

    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (subAdmin.isDemo || subAdmin.account === 'demo') {
      return res
        .status(403)
        .json({ message: 'Password change is not allowed for Demo account' });
    }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Wrong !' });
    }

    // Validate new password: must contain letters AND numbers, NO special characters
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    // Assign plaintext - pre-save hook will hash it
    subAdmin.password = newPassword;

    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By Self.',
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',

      data: subAdmin,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const changePasswordByFirstLogin = async (req, res) => {
  const { id } = req;
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log('oldPassword', oldPassword);
    console.log('newPassword', newPassword);
    console.log('confirmPassword', confirmPassword);

    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (subAdmin.isDemo || subAdmin.account === 'demo') {
      return res
        .status(403)
        .json({ message: 'Password change is not allowed for Demo account' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New Password and Password Confirmation should be same',
      });
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Has Not Matched!' });
    }
    subAdmin.password = newPassword;

    //Also i have to match the newPassword and the confirmPassword
    if (!subAdmin.isPasswordChanged) {
      subAdmin.isPasswordChanged = true;
    }

    await subAdmin.save();

    // Create password history record
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By First Login.',
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      isPasswordChanged: true,
      data: subAdmin,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const getPasswordHistoryByUserId = async (req, res) => {
  const { id } = req;
  try {
    // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const filter = {
      userId: id,
    };

    if (startDate && endDate) {
      filter.createdAt = getDateRangeUTC(startDate, endDate);
    }

    const data = await passwordHistory
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await passwordHistory.countDocuments(filter);

    return res.status(200).json({
      message: 'Password History fetched successfully',
      data,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching creditRefHistory:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      success: false,
    });
  }
};
export const getLoginHistory = async (req, res) => {
  try {
    const isAdminCaller = req.role && req.role !== 'user';
    const targetUserId = isAdminCaller
      ? req.params.userId
      : String(req.id || req.params.userId);
    const { startDate, endDate } = req.query || {};

    const filter = { userId: String(targetUserId) };
    if (startDate && endDate) {
      filter.createdAt = getDateRangeUTC(startDate, endDate);
    }

    const data = await LoginHistory.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Login history fetched successfully',
      data,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const user_logout = async (req, res) => {
  res.clearCookie('auth', {
    httpOnly: true, // must match the cookie options used when setting
    secure: true, // only if you're using HTTPS
    sameSite: 'None', // or 'Lax' or 'Strict', must match
    path: '/', // make sure path is same as when set
  });

  res.status(200).json({ message: 'Logout success' });
};

export const updateQuickStakes = async (req, res) => {
  try {
    const { id } = req;
    const { quickStakes, casinoQuickStakes } = req.body;

    const updateFields = {};

    const validateStakes = (arr, name) => {
      if (!Array.isArray(arr) || arr.length < 1) {
        return `Please provide at least 1 ${name} stake`;
      }
      const valid = arr.every(
        (item) =>
          item &&
          typeof item.label === 'string' &&
          item.label.trim() &&
          typeof item.value === 'number' &&
          item.value > 0
      );
      if (!valid) {
        return `All ${name} stakes must have a label and a positive value`;
      }
      return null;
    };

    if (quickStakes !== undefined) {
      const err = validateStakes(quickStakes, 'game');
      if (err) return res.status(400).json({ message: err });
      updateFields.quickStakes = quickStakes;
    }

    if (casinoQuickStakes !== undefined) {
      const err = validateStakes(casinoQuickStakes, 'casino');
      if (err) return res.status(400).json({ message: err });
      updateFields.casinoQuickStakes = casinoQuickStakes;
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: 'Please provide quickStakes or casinoQuickStakes' });
    }

    const user = await SubAdmin.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).select('-password -masterPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quick stakes updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update Quick Stakes Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateTheme = async (req, res) => {
  try {
    const { id } = req;
    const { theme } = req.body;

    // Define allowed themes (must match your theme config)
    const allowedThemes = [
      'blueGreen',
      'blackOrange',
      'tealDarkteal',
      'grayBlack',
      'greenBlack',
    ];

    if (!theme || !allowedThemes.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme selection' });
    }

    const user = await SubAdmin.findByIdAndUpdate(
      id,
      { theme },
      { new: true }
    ).select('-password -masterPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update Theme Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
