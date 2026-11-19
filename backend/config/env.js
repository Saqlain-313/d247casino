import dotenv from 'dotenv';

dotenv.config();

const parseCsv = (value, fallback = []) => {
  if (!value || !String(value).trim()) return fallback;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const trimTrailingSlash = (url = '') => String(url).trim().replace(/\/+$/, '');

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5180',
  'https://reddy-777.site',
  'https://www.reddy-777.site',
  'https://dashboard.reddy-777.site',
];

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const appType = process.env.APP_TYPE || 'dashboard';

const port = !isProduction
  ? Number(process.env.PORT) || (appType === 'dashboard' ? 8101 : 8100)
  : Number(
      appType === 'dashboard'
        ? process.env.DASHBOARD_PORT
        : process.env.CLIENT_PORT
    ) ||
    Number(process.env.PORT) ||
    3000;

export const env = {
  nodeEnv,
  isProduction,
  isLocal: !isProduction,
  appType,
  port,
  mongoUri: process.env.MONGO_URI || '',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: parseCsv(process.env.CORS_ORIGINS, DEFAULT_CORS_ORIGINS),
  dnsServers: parseCsv(process.env.DNS_SERVERS, ['1.1.1.1', '8.8.8.8']),
  ipGeoApiUrl: trimTrailingSlash(
    process.env.IP_GEO_API_URL || 'https://ipapi.co'
  ),
  nonDeclaredApiUrl: trimTrailingSlash(
    process.env.NON_DECLARED_API_URL || 'https://a.81club.fun'
  ),
};

export default env;
