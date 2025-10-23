/**
 * Backend Error Handler
 * Centralized error handling for backend services
 */

import { isDevelopment } from '../config/env.js';
import logger from './logger.js';

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.sub || 'anonymous',
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError();
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    error = new DatabaseError('Database operation failed', err);
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = new RateLimitError();
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.code = 'INTERNAL_ERROR';
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    code: error.code,
    ...(isDevelopment && {
      stack: error.stack,
      originalError: error.originalError?.message
    })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error response helper
const sendErrorResponse = (res, statusCode, message, code = 'ERROR') => {
  res.status(statusCode).json({
    success: false,
    error: message,
    code: code
  });
};

// Success response helper
const sendSuccessResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data: data,
    message: message
  });
};

// Validation error helper
const createValidationError = (field, message) => {
  return new ValidationError(message, field);
};

// Database error helper
const handleDatabaseError = (error, operation = 'database operation') => {
  logger.error(`Database error during ${operation}`, {
    error: error.message,
    code: error.code,
    detail: error.detail
  });

  if (error.code === '23505') { // Unique constraint violation
    return new ConflictError('Resource already exists');
  }

  if (error.code === '23503') { // Foreign key constraint violation
    return new ValidationError('Referenced resource does not exist');
  }

  if (error.code === '23502') { // Not null constraint violation
    return new ValidationError('Required field is missing');
  }

  return new DatabaseError(`Failed to ${operation}`, error);
};

// External service error helper
const handleExternalServiceError = (service, error, operation = 'operation') => {
  logger.error(`External service error: ${service}`, {
    service: service,
    operation: operation,
    error: error.message,
    status: error.status || error.statusCode
  });

  return new ExternalServiceError(service, `Failed to ${operation}: ${error.message}`);
};

// Error logging helper
const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    ...context
  };

  if (error.statusCode >= 500) {
    logger.error('Server error', errorInfo);
  } else {
    logger.warn('Client error', errorInfo);
  }
};

// Export all error classes and utilities
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  errorHandler,
  asyncHandler,
  sendErrorResponse,
  sendSuccessResponse,
  createValidationError,
  handleDatabaseError,
  handleExternalServiceError,
  logError
};

