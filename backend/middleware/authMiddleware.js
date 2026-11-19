import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import SubAdmin from '../models/subAdminModel.js';

const ADMIN_ROLES = new Set([
  'supperadmin',
  'admin',
  'white',
  'super',
  'master',
  'agent',
]);

export function extractAuthToken(req) {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies?.auth || null;
}

export const authMiddleware = (req, res, next) => {
  const token = extractAuthToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      env.jwtSecret || process.env.JWT_SECRET
    );
    const userRole = decodedToken.role;

    if (!userRole || userRole !== 'user') {
      return res
        .status(403)
        .json({ message: 'Access denied, Only user can access' });
    }

    req.role = decodedToken.role;
    req.user = decodedToken.user;
    req.id = decodedToken.id;

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = extractAuthToken(req);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decodedToken = jwt.verify(
      token,
      env.jwtSecret || process.env.JWT_SECRET
    );
    const userRole = decodedToken.role;

    if (!ADMIN_ROLES.has(userRole)) {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const user = await SubAdmin.findById(decodedToken.id);
    if (!user || user.sessionToken !== decodedToken.sessionToken) {
      return res.status(401).json({
        message: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED',
      });
    }

    req.role = userRole;
    req.id = decodedToken.id;
    req.admin = decodedToken.user;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
