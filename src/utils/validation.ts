/**
 * Enterprise-grade input validation and sanitization utilities
 * Provides comprehensive validation for all user inputs
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

export const urlSchema = z.string().url('Invalid URL format');

export const uuidSchema = z.string().uuid('Invalid UUID format');

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};

// Validation functions
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid email' };
  }
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid password' };
  }
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  try {
    phoneSchema.parse(phone);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid phone number' };
  }
};

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    urlSchema.parse(url);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid URL' };
  }
};

export const validateUuid = (uuid: string): { isValid: boolean; error?: string } => {
  try {
    uuidSchema.parse(uuid);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid UUID' };
  }
};

// Input sanitization for different contexts
export const sanitizeUserInput = (input: string, context: 'text' | 'html' | 'filename' = 'text'): string => {
  switch (context) {
    case 'html':
      return sanitizeHtml(input);
    case 'filename':
      return sanitizeFilename(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
};

// Rate limiting validation
export const validateRateLimit = (
  identifier: string,
  limit: number,
  windowMs: number,
  attempts: Map<string, { count: number; resetTime: number }>
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const key = identifier;
  const attempt = attempts.get(key);

  if (!attempt || now > attempt.resetTime) {
    // Reset or create new attempt
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (attempt.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: attempt.resetTime };
  }

  // Increment count
  attempt.count++;
  return { allowed: true, remaining: limit - attempt.count, resetTime: attempt.resetTime };
};

// SQL injection prevention
export const sanitizeSqlInput = (input: string): string => {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, ''); // Remove SQL keywords
};

// XSS prevention
export const preventXSS = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<iframe\b[^>]*>/gi, '') // Remove iframe tags
    .replace(/<object\b[^>]*>/gi, '') // Remove object tags
    .replace(/<embed\b[^>]*>/gi, '') // Remove embed tags
    .replace(/<link\b[^>]*>/gi, '') // Remove link tags
    .replace(/<meta\b[^>]*>/gi, ''); // Remove meta tags
};

// File upload validation
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { isValid: false, error: `File extension .${extension} is not allowed` };
    }
  }

  return { isValid: true };
};

// Comprehensive input validation
export const validateAndSanitizeInput = (
  input: string,
  options: {
    type: 'email' | 'password' | 'phone' | 'url' | 'uuid' | 'text' | 'html' | 'filename';
    sanitize?: boolean;
    maxLength?: number;
    minLength?: number;
  }
): { isValid: boolean; sanitizedValue?: string; error?: string } => {
  const { type, sanitize = true, maxLength, minLength } = options;

  // Check length constraints
  if (minLength && input.length < minLength) {
    return { isValid: false, error: `Input must be at least ${minLength} characters long` };
  }
  if (maxLength && input.length > maxLength) {
    return { isValid: false, error: `Input must be no more than ${maxLength} characters long` };
  }

  // Validate based on type
  let validation: { isValid: boolean; error?: string };
  switch (type) {
    case 'email':
      validation = validateEmail(input);
      break;
    case 'password':
      validation = validatePassword(input);
      break;
    case 'phone':
      validation = validatePhone(input);
      break;
    case 'url':
      validation = validateUrl(input);
      break;
    case 'uuid':
      validation = validateUuid(input);
      break;
    default:
      validation = { isValid: true };
  }

  if (!validation.isValid) {
    return { isValid: false, error: validation.error };
  }

  // Sanitize if requested
  const sanitizedValue = sanitize ? sanitizeUserInput(input, type as 'text' | 'html' | 'filename') : input;

  return { isValid: true, sanitizedValue };
};


