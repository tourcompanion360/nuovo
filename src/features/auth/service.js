/**
 * Authentication Service
 * Business logic for authentication operations
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../../backend/config/db.js';
import { authConfig } from '../../backend/config/env.js';
import { 
  validateRegistration, 
  validateLogin, 
  validatePasswordReset,
  validatePasswordUpdate,
  validateProfileUpdate 
} from './model.js';

// Password hashing configuration
const SALT_ROUNDS = 12;

/**
 * Register a new user and creator profile
 */
export const registerUser = async (registrationData) => {
  try {
    // Validate input data
    const validation = validateRegistration(registrationData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR'
      };
    }

    const { email, password, agencyName, contactEmail, phone, website } = validation.data;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (existingUser.user) {
      return {
        success: false,
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        agency_name: agencyName,
        phone: phone || null,
        website: website || null,
      }
    });

    if (authError) {
      return {
        success: false,
        error: `Failed to create user: ${authError.message}`,
        code: 'AUTH_ERROR'
      };
    }

    // Create creator profile
    const { data: creatorData, error: creatorError } = await supabaseAdmin
      .from('creators')
      .insert({
        user_id: authData.user.id,
        agency_name: agencyName,
        contact_email: contactEmail,
        phone: phone || null,
        website: website || null,
        agency_logo: '/tourcompanion-logo.png',
        subscription_plan: 'basic',
        subscription_status: 'active',
      })
      .select()
      .single();

    if (creatorError) {
      // Clean up auth user if creator creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: `Failed to create creator profile: ${creatorError.message}`,
        code: 'CREATOR_ERROR'
      };
    }

    // Generate JWT token
    const token = generateJWT(authData.user.id, email, 'creator');

    return {
      success: true,
      data: {
        user: authData.user,
        creator: creatorData,
        accessToken: token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      },
      message: 'User registered successfully'
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Internal server error during registration',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Authenticate user login
 */
export const loginUser = async (loginData) => {
  try {
    // Validate input data
    const validation = validateLogin(loginData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR'
      };
    }

    const { email, password } = validation.data;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      };
    }

    // Get creator profile
    const { data: creatorData, error: creatorError } = await supabaseAdmin
      .from('creators')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (creatorError) {
      return {
        success: false,
        error: 'Creator profile not found',
        code: 'PROFILE_NOT_FOUND'
      };
    }

    // Generate JWT token
    const token = generateJWT(authData.user.id, email, 'creator');

    return {
      success: true,
      data: {
        user: authData.user,
        creator: creatorData,
        accessToken: token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      },
      message: 'Login successful'
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Internal server error during login',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (userId) => {
  try {
    // Revoke all sessions for the user
    const { error } = await supabaseAdmin.auth.admin.signOut(userId);
    
    if (error) {
      return {
        success: false,
        error: `Failed to logout: ${error.message}`,
        code: 'LOGOUT_ERROR'
      };
    }

    return {
      success: true,
      message: 'Logout successful'
    };

  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Internal server error during logout',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (resetData) => {
  try {
    // Validate input data
    const validation = validatePasswordReset(resetData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR'
      };
    }

    const { email } = validation.data;

    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: `Failed to send reset email: ${error.message}`,
        code: 'RESET_ERROR'
      };
    }

    return {
      success: true,
      message: 'Password reset email sent successfully'
    };

  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'Internal server error during password reset',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Update password
 */
export const updatePassword = async (userId, passwordData) => {
  try {
    // Validate input data
    const validation = validatePasswordUpdate(passwordData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR'
      };
    }

    const { newPassword } = validation.data;

    // Update password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: `Failed to update password: ${error.message}`,
        code: 'UPDATE_ERROR'
      };
    }

    return {
      success: true,
      message: 'Password updated successfully'
    };

  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      error: 'Internal server error during password update',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, profileData) => {
  try {
    // Validate input data
    const validation = validateProfileUpdate(profileData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR'
      };
    }

    // Update creator profile
    const { data: updatedCreator, error: creatorError } = await supabaseAdmin
      .from('creators')
      .update(validation.data)
      .eq('user_id', userId)
      .select()
      .single();

    if (creatorError) {
      return {
        success: false,
        error: `Failed to update profile: ${creatorError.message}`,
        code: 'UPDATE_ERROR'
      };
    }

    return {
      success: true,
      data: updatedCreator,
      message: 'Profile updated successfully'
    };

  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: 'Internal server error during profile update',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      return {
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      };
    }

    // Get creator profile
    const { data: creatorData, error: creatorError } = await supabaseAdmin
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (creatorError) {
      return {
        success: false,
        error: 'Creator profile not found',
        code: 'PROFILE_NOT_FOUND'
      };
    }

    return {
      success: true,
      data: {
        user: userData.user,
        creator: creatorData,
      }
    };

  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: 'Internal server error while fetching profile',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Generate JWT token
 */
const generateJWT = (userId, email, role) => {
  const payload = {
    sub: userId,
    email: email,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};

/**
 * Verify JWT token
 */
export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

