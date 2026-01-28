import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import bookingsRoutes from './routes/bookings';
import motorcyclesRoutes from './routes/motorcycles';
import dealersRoutes from './routes/public_dealers';
import usersRoutes from './routes/users';
import sessionsRoutes from './routes/sessions';
import satisfactionRoutes from './routes/satisfaction';
import analyticsRoutes from './routes/analytics';
import statsRoutes from './routes/stats';
import emailsRoutes from './routes/emails';
import uploadRoutes from './routes/upload';

// Load environment variables
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  logger.error('FATAL: DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

logger.info(`Loading env from: ${path.resolve(__dirname, '../../../.env')}`);
logger.info(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
logger.info(`DATABASE_URL starts with: ${process.env.DATABASE_URL?.substring(0, 10)}...`);

// Socket.io pour les mises à jour temps réel (tablettes)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Désactiver CSP pour permettre le chargement des images
}));
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost
    if (origin.startsWith('http://localhost:')) return callback(null, true);

    // Check against allowed list
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logger pour les requêtes
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/motorcycles', motorcyclesRoutes);
app.use('/api/dealers', dealersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/satisfaction', satisfactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.io pour temps réel
io.on('connection', (socket) => {
  logger.info(`Client connecté: ${socket.id}`);

  socket.on('join-event', (eventId: string) => {
    socket.join(`event-${eventId}`);
    logger.info(`Client ${socket.id} a rejoint l'événement ${eventId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client déconnecté: ${socket.id}`);
  });
});

// Rendre io accessible aux routes
app.set('io', io);

// Error handlers (doivent être en dernier)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 API server démarré sur le port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔄 Server successfully reloaded at ${new Date().toISOString()}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, fermeture du serveur...');
  httpServer.close(() => {
    logger.info('Serveur fermé');
    process.exit(0);
  });
});

export { io };
