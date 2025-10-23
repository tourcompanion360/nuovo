/**
 * Main Backend Routes
 * Central router that combines all feature routes
 */

import express from 'express';

// Import feature routes
import authRoutes from './auth.js';
import projectsRoutes from './projects.js';
import clientsRoutes from './clients.js';
import chatbotsRoutes from './chatbots.js';
import analyticsRoutes from './analytics.js';
import billingRoutes from './billing.js';
import healthRoutes from './health.js';

const router = express.Router();

// Health check routes (no prefix)
router.use('/healthz', healthRoutes);

// API routes with version prefix
router.use('/auth', authRoutes);
router.use('/projects', projectsRoutes);
router.use('/clients', clientsRoutes);
router.use('/chatbots', chatbotsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/billing', billingRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'TourCompanion API',
    version: '1.0.0',
    description: 'TourCompanion SaaS Backend API',
    endpoints: {
      health: '/healthz',
      auth: '/auth',
      projects: '/projects',
      clients: '/clients',
      chatbots: '/chatbots',
      analytics: '/analytics',
      billing: '/billing'
    },
    documentation: '/docs',
    status: 'operational'
  });
});

export default router;

