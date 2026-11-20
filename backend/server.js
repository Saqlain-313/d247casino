import cookieParser from 'cookie-parser';
import cors from 'cors';
import dns from 'dns';
import express from 'express';
import fs from 'fs';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import env from './config/env.js';
import { connectRedis } from './config/redis.js';
import { startResultPoller } from './controllers/casinobetController.js';
import { cronJobGame1p } from './controllers/cronJobs.js';
import downlineRoutes from './routes/admin/downlineRoutes.js';
import manualResultRoutes from './routes/admin/manualResultRoutes.js';
import marketAnalizeRoutes from './routes/admin/marketAnalizeRoutes.js';
import matchSettingsRoutes from './routes/admin/matchSettingsRoute.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';
import betRoute from './routes/betRoute.js';
import cashoutRoute from './routes/cashoutRoute.js';
import casinobetRoutes from './routes/casinobetRoutes.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import nonDeclaredRoutes from './routes/nonDeclaredRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { startCasinoResultArchiveSync } from './services/casinoResultStore.js';
import { setupWebSocket } from './socket/bettingSocket.js';

// DNS
if (env.dnsServers.length > 0) {
  dns.setServers(env.dnsServers);
}

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);
app.use(
  morgan('dev', {
    skip: (req, res) =>
      req.method === 'GET' &&
      req.path === '/api/casino-data' &&
      res.statusCode < 400,
  })
);

// API Routes
const apiRoutes = [
  subRouteRoutes,
  downlineRoutes,
  userRoutes,
  betRoute,
  crickeRoute,
  soccerRoutes,
  tennisRoutes,
  horseRacingRoutes,
  casinoRoutes,
  marketAnalizeRoutes,
  matchSettingsRoutes,
  manualResultRoutes,
  cashoutRoute,
  casinobetRoutes,
];
apiRoutes.forEach((router) => app.use('/api', router));
app.use(nonDeclaredRoutes);

// ---------------------------------------------------------------------------
// Static frontend bundles
//   /dashboard  -> ../dashboard/dist   (always, if built)
//   /           -> ../client/dist      (client app)
// Works on the same port, whatever appType is.
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDashboard = env.appType === 'dashboard';
const clientDist = path.join(__dirname, '../client/dist');
const dashboardDist = path.join(__dirname, '../dashboard/dist');
const clientIndex = path.join(clientDist, 'index.html');
const dashboardIndex = path.join(dashboardDist, 'index.html');

const hasClient = fs.existsSync(clientIndex);
const hasDashboard = fs.existsSync(dashboardIndex);

console.log(`[STATIC] appType=${env.appType}`);
console.log(`[STATIC] client    : ${hasClient ? 'OK' : 'NOT BUILT'} (${clientDist})`);
console.log(`[STATIC] dashboard : ${hasDashboard ? 'OK' : 'NOT BUILT'} (${dashboardDist})`);

const notBuilt = (res, name, folder) =>
  res
    .status(404)
    .send(`${name} build not found. Run "npm run build" inside the "${folder}" folder.`);

// Dashboard: /dashboard and /dashboard/*
app.use('/dashboard', express.static(dashboardDist));
app.get('/dashboard/*', (req, res) => {
  if (!hasDashboard) return notBuilt(res, 'Dashboard', 'dashboard');
  res.sendFile(dashboardIndex);
});

// Root (client app, or dashboard if this process is the dashboard process)
app.use(express.static(isDashboard ? dashboardDist : clientDist));

app.get('*', (req, res) => {
  // Unknown API routes should return JSON, not index.html
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  if (isDashboard) {
    if (!hasDashboard) return notBuilt(res, 'Dashboard', 'dashboard');
    return res.sendFile(dashboardIndex);
  }

  if (!hasClient) return notBuilt(res, 'Client', 'client');
  return res.sendFile(clientIndex);
});

// Start server
const startServer = async () => {
  try {
    console.log('[DB] Connecting MongoDB...');
    await connectDB();
    console.log('[DB] MongoDB connected');

    console.log('[REDIS] Connecting Redis...');
    await connectRedis();
    console.log('[REDIS] Redis connected successfully');

    setupWebSocket(server);

    if (!isDashboard) {
      cronJobGame1p();
      startResultPoller();
      startCasinoResultArchiveSync();
      console.log(
        '[CRON] Settlement & 4-day casino result sync started (client process)'
      );
    } else {
      console.log('[CRON] Settlement crons SKIPPED (dashboard process)');
    }

    server.listen(env.port, () => {
      console.log(
        `${env.appType} server running on port ${env.port} (${env.isLocal ? 'local' : 'prod'})`
      );
    });
  } catch (error) {
    console.error('[SERVER STARTUP ERROR]', error);
    process.exit(1);
  }
};

startServer();