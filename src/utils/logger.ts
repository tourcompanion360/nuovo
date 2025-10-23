/**
 * Enterprise-grade logging utility
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return logEntry;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, error);

    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[90m', // Gray
      };
      const reset = '\x1b[0m';
      
      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, {
        context,
        error: error ? { name: error.name, message: error.message } : undefined,
      });
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(logEntry));
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction && level === LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }
  }

  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // Example: Send to external logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (error) {
      // Don't log logging errors to avoid infinite loops
      console.error('Failed to send log to external service:', error);
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Convenience methods for common scenarios
  userAction(action: string, userId: string, metadata?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      metadata,
    });
  }

  apiCall(method: string, endpoint: string, statusCode: number, duration?: number): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${endpoint} - ${statusCode}`, {
      action: 'api_call',
      metadata: { method, endpoint, statusCode, duration },
    });
  }

  performance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      action: 'performance',
      metadata: { operation, duration, ...metadata },
    });
  }

  security(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, {
      userId,
      action: 'security',
      metadata,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (message: string, context?: LogContext, error?: Error) => 
  logger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);

export const logUserAction = (action: string, userId: string, metadata?: Record<string, unknown>) => 
  logger.userAction(action, userId, metadata);

export const logApiCall = (method: string, endpoint: string, statusCode: number, duration?: number) => 
  logger.apiCall(method, endpoint, statusCode, duration);

export const logPerformance = (operation: string, duration: number, metadata?: Record<string, unknown>) => 
  logger.performance(operation, duration, metadata);

export const logSecurity = (event: string, userId?: string, metadata?: Record<string, unknown>) => 
  logger.security(event, userId, metadata);


