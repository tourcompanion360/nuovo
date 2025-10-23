/**
 * Backend Entry Point
 * Main server entry point for the TourCompanion SaaS backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import configuration
import { 
  serverConfig, 
  rateLimitConfig, 
  isDevelopment, 
  isProduction 
} from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import clientsRoutes from './routes/clients.js';
import chatbotsRoutes from './routes/chatbots.js';
import analyticsRoutes from './routes/analytics.js';
import healthRoutes from './routes/health.js';

// Import middleware
import { errorHandler } from './utils/errorHandler.js';
import { requestLogger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: serverConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (isDevelopment) {
  app.use(requestLogger);
}

// Health check endpoint (before other routes)
app.use('/healthz', healthRoutes);

// API routes
app.use(`${serverConfig.apiPrefix}/auth`, authRoutes);
app.use(`${serverConfig.apiPrefix}/projects`, projectsRoutes);
app.use(`${serverConfig.apiPrefix}/clients`, clientsRoutes);
app.use(`${serverConfig.apiPrefix}/chatbots`, chatbotsRoutes);
app.use(`${serverConfig.apiPrefix}/analytics`, analyticsRoutes);

// Serve static files in production
if (isProduction) {
  app.use(express.static(join(__dirname, '../../dist')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../../dist/index.html'));
  });
}

// 404 handler for API routes
app.use(`${serverConfig.apiPrefix}/*`, (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

// Database connection check
const initializeServer = async () => {
  try {
    // Check database connection
    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.success) {
      console.error('❌ Database connection failed:', dbCheck.error);
      process.exit(1);
    }
    
    // Start server
    const server = app.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`🚀 TourCompanion Backend Server running on:`);
      console.log(`   Local:   http://${serverConfig.host}:${serverConfig.port}`);
      console.log(`   Network: http://0.0.0.0:${serverConfig.port}`);
      console.log(`   Environment: ${serverConfig.nodeEnv}`);
      console.log(`   API Prefix: ${serverConfig.apiPrefix}`);
      
      if (isDevelopment) {
        console.log(`   Health Check: http://${serverConfig.host}:${serverConfig.port}/healthz`);
      }
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize server
initializeServer();

export default app;

