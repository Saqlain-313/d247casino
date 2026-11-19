import axios from 'axios';

import env from '../config/env.js';
import LoginHistory from '../models/loginHistory.js';

export function getClientIp(req) {
  return (
    req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req?.connection?.remoteAddress ||
    req?.socket?.remoteAddress ||
    req?.connection?.socket?.remoteAddress ||
    'IP not found'
  );
}

/**
 * Shared login history logger used by both user and admin/subadmin logins.
 * Uses env.ipGeoApiUrl with a 3s timeout so geo lookup failures never block auth.
 */
export async function saveLoginHistory(userName, id, status, req) {
  try {
    const ip = getClientIp(req);
    let geo = {};
    if (ip && ip !== 'IP not found') {
      try {
        const response = await axios.get(`${env.ipGeoApiUrl}/${ip}/json/`, {
          timeout: 3000,
        });
        geo = response.data || {};
      } catch {
        // Geo lookup failure should not prevent recording login history
      }
    }

    const { city, region, country_name: country, org: isp } = geo;
    const formattedDateTime = new Date()
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');

    await LoginHistory.create({
      userName,
      userId: id,
      status: status === 'Success' ? 'Login Successful' : 'Login Failed',
      dateTime: formattedDateTime,
      ip,
      isp,
      city,
      region,
      country,
    });
  } catch (error) {
    console.error('Login history error:', error.message);
  }
}

export default saveLoginHistory;
