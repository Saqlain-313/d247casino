import jwt from 'jsonwebtoken';

import env from './env.js';

const createToken = async (data) => {
  return jwt.sign(data, env.jwtSecret || process.env.JWT_SECRET, {
    expiresIn: env.jwtExpiresIn,
  });
};

export default createToken;
