/**
 * Clients Routes
 * Backend route definitions for client management endpoints
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
    message: 'Clients endpoint - to be implemented',
    data: []
  });
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const creatorId = req.user?.creatorId;

    if (!userId || !creatorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    const limits = await getSubscriptionLimits(userId);

    if (limits.maxClients !== -1) {
      const { count, error } = await supabaseAdmin
        .from('end_clients')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId);

      if (error) {
        return res.status(500).json({ success: false, error: error.message, code: 'DB_ERROR' });
      }

      const clientsCount = count || 0;
      if (clientsCount >= limits.maxClients) {
        return res.status(403).json({
          success: false,
          error: 'Client limit reached for your plan. Upgrade to add more clients.',
          code: 'LIMIT_REACHED',
        });
      }
    }

    return res.json({ success: true, message: 'Create client - allowed (placeholder)' });
  } catch (err) {
    console.error('Create client error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get client - to be implemented',
    data: { id: req.params.id }
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update client - to be implemented',
    data: { id: req.params.id }
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete client - to be implemented',
    data: { id: req.params.id }
  });
});

export default router;

