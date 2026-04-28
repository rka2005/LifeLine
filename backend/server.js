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

const app = express();
const httpServer = createServer(app);

// Dynamic CORS origin matching
const allowedOrigins = [
  'https://lifeline-frontend-240882103415.us-central1.run.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed)) || 
                     origin.includes('localhost') || 
                     origin.includes('127.0.0.1');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const io = new Server(httpServer, {
  cors: corsOptions
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors(corsOptions));
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
