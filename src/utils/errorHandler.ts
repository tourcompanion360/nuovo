/**
 * Global Error Handler
 * Centralized error handling with logging, reporting, and user-friendly messages
 */

import { ERROR_MESSAGES, isDevelopment, features } from '@/config';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom error class
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public code?: string,
    public details?: Record<string, unknown>,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
  stack?: string;
}

// Error handler class
class ErrorHandler {
  private errorLog: Array<{ error: AppError; context: ErrorContext }> = [];

  /**
   * Handle and process errors
   */
  handleError(
    error: Error | AppError | any,
    context: ErrorContext = {}
  ): AppError {
    const appError = this.normalizeError(error);
    const errorContext = this.enrichContext(context);

    // Log error
    this.logError(appError, errorContext);

    // Report error (in production)
    if (isProduction && features.analytics) {
      this.reportError(appError, errorContext);
    }

    // Store error for debugging
    this.errorLog.push({ error: appError, context: errorContext });

    return appError;
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        this.determineErrorType(error),
        this.determineErrorSeverity(error),
        undefined,
        { originalError: error.name },
        this.getUserFriendlyMessage(error)
      );
    }

    if (typeof error === 'string') {
      return new AppError(
        error,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        undefined,
        undefined,
        error
      );
    }

    return new AppError(
      'An unexpected error occurred',
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      undefined,
      { originalError: error },
      ERROR_MESSAGES.unknown
    );
  }

  /**
   * Determine error type from error object
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('network') || message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    if (name.includes('auth') || message.includes('auth') || message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }

    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION;
    }

    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }

    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER;
    }

    return ErrorType.CLIENT;
  }

  /**
   * Determine error severity
   */
  private determineErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('critical') || message.includes('critical')) {
      return ErrorSeverity.CRITICAL;
    }

    if (name.includes('auth') || message.includes('auth')) {
      return ErrorSeverity.HIGH;
    }

    if (name.includes('network') || message.includes('network')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: Error): string {
    const type = this.determineErrorType(error);
    const message = error.message.toLowerCase();

    switch (type) {
      case ErrorType.NETWORK:
        return ERROR_MESSAGES.network;
      case ErrorType.AUTHENTICATION:
        return ERROR_MESSAGES.auth;
      case ErrorType.AUTHORIZATION:
        return ERROR_MESSAGES.forbidden;
      case ErrorType.NOT_FOUND:
        return ERROR_MESSAGES.notFound;
      case ErrorType.SERVER:
        return ERROR_MESSAGES.serverError;
      case ErrorType.VALIDATION:
        return ERROR_MESSAGES.validation;
      default:
        return ERROR_MESSAGES.unknown;
    }
  }

  /**
   * Enrich error context with additional information
   */
  private enrichContext(context: ErrorContext): ErrorContext {
    return {
      ...context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Log error to console (development) or external service (production)
   */
  private logError(error: AppError, context: ErrorContext): void {
    if (isDevelopment) {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.error('Type:', error.type);
      console.error('Severity:', error.severity);
      console.error('Context:', context);
      console.error('Stack:', error.stack);
      console.groupEnd();
    } else {
      // In production, you might want to send to external logging service
      console.error('Error:', error.message, context);
    }
  }

  /**
   * Report error to external service (e.g., Sentry, LogRocket)
   */
  private reportError(error: AppError, context: ErrorContext): void {
    // Example: Send to Sentry
    // Sentry.captureException(error, { extra: context });
    
    // Example: Send to custom analytics
    // analytics.track('error', {
    //   error_type: error.type,
    //   error_severity: error.severity,
    //   error_message: error.message,
    //   ...context
    // });
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): Array<{ error: AppError; context: ErrorContext }> {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Create specific error types
   */
  static createNetworkError(message: string = ERROR_MESSAGES.network): AppError {
    return new AppError(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, undefined, undefined, message);
  }

  static createAuthError(message: string = ERROR_MESSAGES.auth): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, undefined, undefined, message);
  }

  static createValidationError(message: string = ERROR_MESSAGES.validation): AppError {
    return new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, undefined, undefined, message);
  }

  static createNotFoundError(message: string = ERROR_MESSAGES.notFound): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, ErrorSeverity.MEDIUM, undefined, undefined, message);
  }

  static createServerError(message: string = ERROR_MESSAGES.serverError): AppError {
    return new AppError(message, ErrorType.SERVER, ErrorSeverity.HIGH, undefined, undefined, message);
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    component: 'Global',
    action: 'Unhandled Error',
  });
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    component: 'Global',
    action: 'Unhandled Promise Rejection',
  });
});

// Export convenience functions
export const handleError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleError(error, context);

export const createError = {
  network: ErrorHandler.createNetworkError,
  auth: ErrorHandler.createAuthError,
  validation: ErrorHandler.createValidationError,
  notFound: ErrorHandler.createNotFoundError,
  server: ErrorHandler.createServerError,
};

// Export types
export type { ErrorContext };

