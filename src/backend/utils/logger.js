/**
 * Logger Utility
 * Centralized logging functionality
 */

import { loggingConfig, isDevelopment } from '../config/env.js';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = LOG_LEVELS[loggingConfig.level.toUpperCase()] || LOG_LEVELS.INFO;

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaStr}`;
};

/**
 * Log error message
 */
export const error = (message, meta = {}) => {
  if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message, meta));
  }
};

/**
 * Log warning message
 */
export const warn = (message, meta = {}) => {
  if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message, meta));
  }
};

/**
 * Log info message
 */
export const info = (message, meta = {}) => {
  if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
    console.log(formatMessage('INFO', message, meta));
  }
};

/**
 * Log debug message
 */
export const debug = (message, meta = {}) => {
  if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
    console.log(formatMessage('DEBUG', message, meta));
  }
};

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.sub || 'anonymous'
    };

    if (res.statusCode >= 400) {
      error('Request failed', logData);
    } else {
      info('Request completed', logData);
    }
  });

  next();
};

/**
 * Database query logger
 */
export const logQuery = (query, params = [], duration = 0) => {
  if (isDevelopment) {
    debug('Database query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params.length > 0 ? params : undefined,
      duration: `${duration}ms`
    });
  }
};

/**
 * Authentication logger
 */
export const logAuth = (action, userId, success = true, error = null) => {
  const level = success ? 'info' : 'warn';
  const message = `Authentication ${action} ${success ? 'successful' : 'failed'}`;
  const meta = {
    userId,
    action,
    success,
    ...(error && { error: error.message })
  };

  if (level === 'info') {
    info(message, meta);
  } else {
    warn(message, meta);
  }
};

/**
 * Business logic logger
 */
export const logBusiness = (action, userId, resourceId = null, meta = {}) => {
  info(`Business action: ${action}`, {
    userId,
    resourceId,
    action,
    ...meta
  });
};

/**
 * Performance logger
 */
export const logPerformance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  const message = `Performance: ${operation} took ${duration}ms`;
  
  if (level === 'warn') {
    warn(message, meta);
  } else {
    info(message, meta);
  }
};

/**
 * Security logger
 */
export const logSecurity = (event, severity = 'info', meta = {}) => {
  const message = `Security event: ${event}`;
  
  switch (severity) {
    case 'error':
      error(message, meta);
      break;
    case 'warn':
      warn(message, meta);
      break;
    default:
      info(message, meta);
  }
};

// Export default logger object
export default {
  error,
  warn,
  info,
  debug,
  requestLogger,
  logQuery,
  logAuth,
  logBusiness,
  logPerformance,
  logSecurity
};

