/**
 * Health Check Routes
 * System health monitoring and status endpoints
 */

import express from 'express';
import { checkDatabaseConnection } from '../config/db.js';
import { serverConfig } from '../config/env.js';

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const dbCheck = await checkDatabaseConnection();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbCheck.success ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
    };
    
    const statusCode = dbCheck.success ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'unhealthy',
        api: 'unhealthy',
      },
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const dbCheck = await checkDatabaseConnection();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: serverConfig.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: {
        loadAverage: process.platform !== 'win32' ? process.loadavg() : [0, 0, 0],
      },
      services: {
        database: {
          status: dbCheck.success ? 'healthy' : 'unhealthy',
          responseTime: dbCheck.responseTime || 0,
          error: dbCheck.error || null,
        },
        api: {
          status: 'healthy',
          routes: [
            '/api/v1/auth',
            '/api/v1/projects',
            '/api/v1/clients',
            '/api/v1/chatbots',
            '/api/v1/analytics',
          ],
        },
      },
    };
    
    const statusCode = dbCheck.success ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'unhealthy',
        api: 'unhealthy',
      },
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    const dbCheck = await checkDatabaseConnection();
    
    if (dbCheck.success) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database connection failed',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: error.message,
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;

