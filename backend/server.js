
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

import { cronJobGame1p } from './controllers/cronJobs.js';

// Admin Routes
import downlineRoutes from './routes/admin/downlineRoutes.js';
import manualResultRoutes from './routes/admin/manualResultRoutes.js';
import marketAnalizeRoutes from './routes/admin/marketAnalizeRoutes.js';
import matchSettingsRoutes from './routes/admin/matchSettingsRoute.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';

// Application Routes
import betRoute from './routes/betRoute.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cashoutRoute from './routes/cashoutRoute.js';
import nonDeclaredRoutes from './routes/nonDeclaredRoutes.js';
import casinobetRoutes from './routes/casinobetRoutes.js';

// WebSocket
import { setupWebSocket } from './socket/bettingSocket.js';

// --------------------------------------------------
// ENVIRONMENT
// --------------------------------------------------

dotenv.config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'development';

const API_PORT = Number(process.env.PORT || 3000);
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 8000);
const DASHBOARD_PORT = Number(process.env.DASHBOARD_PORT || 8001);

// --------------------------------------------------
// MAIN API APPLICATION
// --------------------------------------------------

const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:8001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',

  'https://reddy-777.site',
  'https://www.reddy-777.site',
  'https://dashboard.reddy-777.site',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server and Postman requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.set('trust proxy', true);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('dev', {
    skip: (req, res) =>
      req.method === 'GET' &&
      req.path === '/api/casino-data' &&
      res.statusCode < 400,
  })
);

// Settlement tracking middleware
app.use((req, res, next) => {
  next();
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api', subRouteRoutes);
app.use('/api', downlineRoutes);
app.use('/api', userRoutes);
app.use('/api', betRoute);
app.use('/api', crickeRoute);
app.use('/api', soccerRoutes);
app.use('/api', tennisRoutes);
app.use('/api', horseRacingRoutes);
app.use('/api', casinoRoutes);
app.use('/api', marketAnalizeRoutes);
app.use('/api', matchSettingsRoutes);
app.use('/api', manualResultRoutes);
app.use('/api', cashoutRoute);
app.use('/api', casinobetRoutes);

app.use(nonDeclaredRoutes);

// API fallback
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// --------------------------------------------------
// CLIENT APPLICATION
// --------------------------------------------------

const clientApp = express();

const clientDist = path.resolve(
  __dirname,
  '../client/dist'
);

clientApp.use(
  express.static(clientDist)
);

clientApp.get('*', (req, res) => {
  res.sendFile(
    path.join(clientDist, 'index.html'),
    (error) => {
      if (error && !res.headersSent) {
        res.status(500).send('Client build not found. Run npm run build.');
      }
    }
  );
});

// --------------------------------------------------
// DASHBOARD APPLICATION
// --------------------------------------------------

const dashboardApp = express();

const dashboardDist = path.resolve(
  __dirname,
  '../dashboard/dist'
);

dashboardApp.use(
  express.static(dashboardDist)
);

dashboardApp.get('*', (req, res) => {
  res.sendFile(
    path.join(dashboardDist, 'index.html'),
    (error) => {
      if (error && !res.headersSent) {
        res.status(500).send('Dashboard build not found. Run npm run build.');
      }
    }
  );
});

// --------------------------------------------------
// SEPARATE HTTP SERVERS
// --------------------------------------------------

const clientServer = http.createServer(clientApp);
const dashboardServer = http.createServer(dashboardApp);

// --------------------------------------------------
// SERVER STARTUP
// --------------------------------------------------

const listen = (httpServer, port, name) => {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      httpServer.off('listening', onListening);
      reject(error);
    };

    const onListening = () => {
      httpServer.off('error', onError);
      console.log(`[${name}] Running on port ${port}`);
      resolve();
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);

    httpServer.listen(port, '0.0.0.0');
  });
};

// --------------------------------------------------
// START APPLICATION
// --------------------------------------------------

const startServer = async () => {
  try {
    console.log('====================================');
    console.log('        APPLICATION STARTING        ');
    console.log('====================================');

    // 1. MongoDB connection
    console.log('[DB] Connecting MongoDB...');
    await connectDB();
    console.log('[DB] MongoDB connected successfully');

    // 2. Redis connection
    console.log('[REDIS] Connecting Redis...');
    await connectRedis();
    console.log('[REDIS] Redis connected successfully');

    // 3. WebSocket
    setupWebSocket(server);
    console.log('[SOCKET] WebSocket initialized');

    // 4. Cron jobs - only once
    cronJobGame1p();
    console.log('[CRON] Settlement cron started');

    // 5. Start all three servers
    await Promise.all([
      listen(server, API_PORT, 'API'),
      listen(clientServer, CLIENT_PORT, 'CLIENT'),
      listen(dashboardServer, DASHBOARD_PORT, 'DASHBOARD'),
    ]);

    console.log('====================================');
    console.log('       ALL SERVERS STARTED          ');
    console.log('====================================');

    console.log(`API       : http://localhost:${API_PORT}`);
    console.log(`CLIENT    : http://localhost:${CLIENT_PORT}`);
    console.log(`DASHBOARD : http://localhost:${DASHBOARD_PORT}`);

    console.log('====================================');

  } catch (error) {
    console.error('[SERVER STARTUP ERROR]', error);

    // Close servers if startup fails
    server.close();
    clientServer.close();
    dashboardServer.close();

    process.exit(1);
  }
};

// --------------------------------------------------
// GRACEFUL SHUTDOWN
// --------------------------------------------------

const shutdown = (signal) => {
  console.log(`[SERVER] ${signal} received. Shutting down...`);

  Promise.all([
    new Promise((resolve) => server.close(resolve)),
    new Promise((resolve) => clientServer.close(resolve)),
    new Promise((resolve) => dashboardServer.close(resolve)),
  ]).finally(() => {
    console.log('[SERVER] All HTTP servers stopped');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start
startServer();
