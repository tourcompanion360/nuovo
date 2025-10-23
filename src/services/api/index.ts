/**
 * API Service Layer
 * Centralized API client with error handling, retries, and interceptors
 */

import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG, ERROR_MESSAGES } from '@/config';
import type { Database } from '@/integrations/supabase/types';

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry configuration
interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: number;
}

// API Client class
class ApiClient {
  private retryConfig: RetryConfig = {
    attempts: API_CONFIG.retryAttempts,
    delay: API_CONFIG.retryDelay,
    backoff: 2,
  };

  /**
   * Execute a Supabase query with retry logic and error handling
   */
  async execute<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    const config = { ...this.retryConfig, ...retryConfig };
    let lastError: any;

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        const result = await operation();
        
        if (result.error) {
          throw new ApiError(
            result.error.message || ERROR_MESSAGES.serverError,
            result.error.status,
            result.error.code
          );
        }

        return {
          data: result.data,
          error: null,
          success: true,
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          break;
        }

        // Wait before retrying
        if (attempt < config.attempts) {
          await this.delay(config.delay * Math.pow(config.backoff, attempt - 1));
        }
      }
    }

    return {
      data: null,
      error: this.formatError(lastError),
      success: false,
    };
  }

  /**
   * Execute multiple operations in parallel
   */
  async executeAll<T>(
    operations: Array<() => Promise<{ data: T | null; error: any }>>
  ): Promise<ApiResponse<T[]>> {
    try {
      const results = await Promise.allSettled(
        operations.map(op => this.execute(op))
      );

      const data: T[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          if (result.value.data) {
            data[index] = result.value.data;
          }
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error;
          errors.push(`Operation ${index + 1}: ${error}`);
        }
      });

      return {
        data: data.length > 0 ? data : null,
        error: errors.length > 0 ? errors.join('; ') : null,
        success: errors.length === 0,
      };
    } catch (error) {
      return {
        data: null,
        error: this.formatError(error),
        success: false,
      };
    }
  }

  /**
   * Check if error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    if (error instanceof ApiError) {
      // Don't retry client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        return true;
      }
    }
    return false;
  }

  /**
   * Format error message
   */
  private formatError(error: any): string {
    if (error instanceof ApiError) {
      return error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return ERROR_MESSAGES.unknown;
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  /**
   * Execute a single operation
   */
  execute: <T>(operation: () => Promise<{ data: T | null; error: any }>) =>
    apiClient.execute(operation),

  /**
   * Execute multiple operations
   */
  executeAll: <T>(operations: Array<() => Promise<{ data: T | null; error: any }>>) =>
    apiClient.executeAll(operations),

  /**
   * Get Supabase client
   */
  getClient: () => supabase,
};

// Export types
export type { ApiResponse, ApiError };

