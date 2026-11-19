import axios from 'axios';

import env from '../config/env.js';

const createUpstreamProxy = (endpointPath, fallbackMessage) => {
  return async (req, res) => {
    try {
      const response = await axios.get(
        `${env.nonDeclaredApiUrl}${endpointPath}`,
        { params: req.query, timeout: 30000 }
      );
      return res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        success: false,
        message: error.message || fallbackMessage,
      };
      return res.status(status).json(data);
    }
  };
};

export const getNonDeclaredFancies = createUpstreamProxy(
  '/getNonDeclaredFancies',
  'Failed to fetch non-declared fancies'
);

export const getNonDeclaredMatches = createUpstreamProxy(
  '/getNonDeclaredMatches',
  'Failed to fetch non-declared matches'
);
