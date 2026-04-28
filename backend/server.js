import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import serviceRoutes from './routes/services.js';
import routeRoutes from './routes/routes.js';
import ambulanceRoutes from './routes/ambulance.js';
import verifyRoutes from './routes/verify.js';
import bookingRoutes from './routes/booking.js';
import policeRoutes from './routes/police.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import { initSocketHandlers } from './sockets/handlers.js';
import { getFirebaseAdmin } from './lib/firebaseAdmin.js';

dotenv.config();
getFirebaseAdmin();

function buildAllowedOrigins() {
  const configuredOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = new Set([
    configuredOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]);

  return origins;
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowedOrigins = buildAllowedOrigins();
  if (allowedOrigins.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/nearest-services', serviceRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/ambulance-request', ambulanceRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'LifeLine+ Backend',
    firebaseAdmin: Boolean(getFirebaseAdmin()),
    mapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'LifeLine+ Backend',
    firebaseAdmin: Boolean(getFirebaseAdmin()),
    mapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

initSocketHandlers(io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`LifeLine+ Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
