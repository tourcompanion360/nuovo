/**
 * Authentication Controller
 * HTTP request handlers for authentication endpoints
 */

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  updatePassword,
  updateProfile,
  getUserProfile,
  verifyJWT
} from './service.js';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Register controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user?.sub; // From JWT middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await logoutUser(userId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Logout controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
export const resetPasswordRequest = async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Reset password controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update password
 * PUT /api/v1/auth/password
 */
export const updateUserPassword = async (req, res) => {
  try {
    const userId = req.user?.sub; // From JWT middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await updatePassword(userId, req.body);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Update password controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get user profile
 * GET /api/v1/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.sub; // From JWT middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await getUserProfile(userId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Get profile controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.sub; // From JWT middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await updateProfile(userId, req.body);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      const statusCode = getStatusCode(result.code);
      res.status(statusCode).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Update profile controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Verify JWT token
 * GET /api/v1/auth/verify
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyJWT(token);
    
    res.status(200).json({
      success: true,
      data: {
        user: decoded,
        valid: true
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Get HTTP status code based on error code
 */
const getStatusCode = (code) => {
  const statusMap = {
    'VALIDATION_ERROR': 400,
    'USER_EXISTS': 409,
    'INVALID_CREDENTIALS': 401,
    'USER_NOT_FOUND': 404,
    'PROFILE_NOT_FOUND': 404,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'AUTH_ERROR': 400,
    'CREATOR_ERROR': 400,
    'LOGOUT_ERROR': 400,
    'RESET_ERROR': 400,
    'UPDATE_ERROR': 400,
    'NO_TOKEN': 401,
    'INVALID_TOKEN': 401,
    'INTERNAL_ERROR': 500,
  };
  
  return statusMap[code] || 500;
};

