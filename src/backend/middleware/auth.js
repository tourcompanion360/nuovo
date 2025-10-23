/**
 * Authentication Middleware
 * JWT token validation and subscription checking
 */

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/env.js';
import { supabaseAdmin } from '../config/db.js';
import { getSubscriptionStatus, hasFeatureAccess } from '../../services/stripe/subscriptions.js';

/**
 * Authenticate JWT token and check subscription status
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_REQUIRED',
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    // Check if user still exists
    const { data: creator, error } = await supabaseAdmin
      .from('creators')
      .select('id, user_id, is_tester, subscription_status, subscription_period_end')
      .eq('user_id', decoded.userId)
      .single();

    if (error || !creator) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

  // Check subscription status (unless user is a tester)
  if (!creator.is_tester) {
      const subscriptionStatus = await getSubscriptionStatus(decoded.userId);
      
      if (!subscriptionStatus.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED',
          data: {
            subscriptionStatus,
          },
        });
      }
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      creatorId: creator.id,
      isTester: creator.is_tester,
      subscriptionStatus: creator.subscription_status,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    // Check if user exists
    const { data: creator } = await supabaseAdmin
      .from('creators')
      .select('id, user_id, is_tester, subscription_status')
      .eq('user_id', decoded.userId)
      .single();

    if (creator) {
      req.user = {
        id: decoded.userId,
        creatorId: creator.id,
        isTester: creator.is_tester,
        subscriptionStatus: creator.subscription_status,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

/**
 * Check if user has specific feature access
 */
export const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // Testers have access to all features
      if (req.user.isTester) {
        return next();
      }

      // Check subscription status
      const subscriptionStatus = await getSubscriptionStatus(req.user.id);
      
      if (!subscriptionStatus.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED',
        });
      }

      // Check specific feature access
      const hasAccess = await hasFeatureAccess(req.user.id, feature);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: `${feature} feature requires Pro subscription`,
          code: 'FEATURE_ACCESS_DENIED',
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({
        success: false,
        error: 'Feature access check failed',
        code: 'FEATURE_CHECK_ERROR',
      });
    }
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Check if user is a tester (simple admin check)
    if (!req.user.isTester) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin check failed',
      code: 'ADMIN_CHECK_ERROR',
    });
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId, additionalClaims = {}) => {
  const payload = {
    userId,
    ...additionalClaims,
  };

  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};

/**
 * Refresh JWT token if subscription is still active
 */
export const refreshToken = async (userId) => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(userId);
    
    // Only refresh if user has active subscription or is a tester
    if (subscriptionStatus.isActive || subscriptionStatus.isTester) {
      return generateToken(userId, {
        subscriptionStatus: subscriptionStatus.status,
        isTester: subscriptionStatus.isTester,
      });
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};
