/**
 * Chatbots Routes
 * Backend route definitions for chatbot management endpoints
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
    message: 'Chatbots endpoint - to be implemented',
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

    if (limits.maxChatbots !== -1) {
      // Count chatbots via creator's projects
      const { data: projects, error: projErr } = await supabaseAdmin
        .from('projects')
        .select('id, end_client_id')
        .eq('status', 'active');

      if (projErr) {
        return res.status(500).json({ success: false, error: projErr.message, code: 'DB_ERROR' });
      }

      const { data: endClients } = await supabaseAdmin
        .from('end_clients')
        .select('id')
        .eq('creator_id', creatorId);

      const endClientIds = (endClients || []).map(ec => ec.id);
      const projectIds = (projects || [])
        .filter(p => endClientIds.includes(p.end_client_id))
        .map(p => p.id);

      let chatbotsCount = 0;
      if (projectIds.length > 0) {
        const { count, error: cbErr } = await supabaseAdmin
          .from('chatbots')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);
        if (cbErr) {
          return res.status(500).json({ success: false, error: cbErr.message, code: 'DB_ERROR' });
        }
        chatbotsCount = count || 0;
      }

      if (chatbotsCount >= limits.maxChatbots) {
        return res.status(403).json({
          success: false,
          error: 'Chatbot limit reached for your plan. Upgrade to create more chatbots.',
          code: 'LIMIT_REACHED',
        });
      }
    }

    return res.json({ success: true, message: 'Create chatbot - allowed (placeholder)' });
  } catch (err) {
    console.error('Create chatbot error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get chatbot - to be implemented',
    data: { id: req.params.id }
  });
});

router.put('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Update chatbot - to be implemented',
    data: { id: req.params.id }
  });
});

router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete chatbot - to be implemented',
    data: { id: req.params.id }
  });
});

export default router;

