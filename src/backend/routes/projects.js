/**
 * Projects Routes
 * Backend route definitions for project management endpoints
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/db.js';
import { getSubscriptionLimits } from '../../services/stripe/subscriptions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Projects endpoint - to be implemented',
    data: []
  });
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const creatorId = req.user?.creatorId;

    if (!userId || !creatorId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
      });
    }

    // Get subscription limits
    const limits = await getSubscriptionLimits(userId);

    // Unlimited for testers/pro
    if (limits.maxProjects !== -1) {
      // Count projects for this creator via end_clients → projects
      const { data: endClients, error: ecErr } = await supabaseAdmin
        .from('end_clients')
        .select('id')
        .eq('creator_id', creatorId);

      if (ecErr) {
        return res.status(500).json({ success: false, error: ecErr.message, code: 'DB_ERROR' });
      }

      const endClientIds = (endClients || []).map(ec => ec.id);
      let projectsCount = 0;

      if (endClientIds.length > 0) {
        const { count, error: pErr } = await supabaseAdmin
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .in('end_client_id', endClientIds);

        if (pErr) {
          return res.status(500).json({ success: false, error: pErr.message, code: 'DB_ERROR' });
        }
        projectsCount = count || 0;
      }

      if (projectsCount >= limits.maxProjects) {
        return res.status(403).json({
          success: false,
          error: 'Project limit reached for your plan. Upgrade to create more projects.',
          code: 'LIMIT_REACHED',
        });
      }
    }

    // Placeholder: creation not implemented yet
    return res.json({
      success: true,
      message: 'Create project - allowed (placeholder)',
    });
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get project - to be implemented',
    data: { id: req.params.id }
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update project - to be implemented',
    data: { id: req.params.id }
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete project - to be implemented',
    data: { id: req.params.id }
  });
});

export default router;

