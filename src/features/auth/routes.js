/**
 * Authentication Routes
 * HTTP route definitions for authentication endpoints
 */

import express from 'express';
import {
  register,
  login,
  logout,
  resetPasswordRequest,
  updateUserPassword,
  getProfile,
  updateUserProfile,
  verifyToken
} from './controller.js';
import { authenticateToken } from '../../backend/middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPasswordRequest);
router.get('/verify', verifyToken);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, logout);
router.put('/password', authenticateToken, updateUserPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateUserProfile);

export default router;

