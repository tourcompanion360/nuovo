/**
 * Authentication Model
 * Data models and validation schemas for authentication
 */

import { z } from 'zod';

// User registration schema
const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agencyName: z.string().min(2, 'Agency name must be at least 2 characters'),
  contactEmail: z.string().email('Invalid contact email'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

// User login schema
const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Password reset schema
const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Password update schema
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile update schema
const profileUpdateSchema = z.object({
  agencyName: z.string().min(2, 'Agency name must be at least 2 characters').optional(),
  contactEmail: z.string().email('Invalid contact email').optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  agencyLogo: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  description: z.string().optional(),
});

// JWT payload schema
const jwtPayloadSchema = z.object({
  sub: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email'),
  role: z.enum(['creator', 'admin']).default('creator'),
  iat: z.number(),
  exp: z.number(),
});

// User session schema
const userSessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    emailConfirmed: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  creator: z.object({
    id: z.string().uuid(),
    agencyName: z.string(),
    contactEmail: z.string().email(),
    subscriptionPlan: z.enum(['basic', 'pro']),
    subscriptionStatus: z.enum(['active', 'inactive', 'cancelled']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number(),
});

// API response schemas
const authResponseSchema = z.object({
  success: z.boolean(),
  data: userSessionSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Validation helper functions
const validateRegistration = (data) => {
  try {
    return { success: true, data: userRegistrationSchema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => err.message).join(', ') 
    };
  }
};

const validateLogin = (data) => {
  try {
    return { success: true, data: userLoginSchema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => err.message).join(', ') 
    };
  }
};

const validatePasswordReset = (data) => {
  try {
    return { success: true, data: passwordResetSchema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => err.message).join(', ') 
    };
  }
};

const validatePasswordUpdate = (data) => {
  try {
    return { success: true, data: passwordUpdateSchema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => err.message).join(', ') 
    };
  }
};

const validateProfileUpdate = (data) => {
  try {
    return { success: true, data: profileUpdateSchema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => err.message).join(', ') 
    };
  }
};

// Export all schemas
export {
  userRegistrationSchema,
  userLoginSchema,
  passwordResetSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  jwtPayloadSchema,
  userSessionSchema,
  authResponseSchema,
};

