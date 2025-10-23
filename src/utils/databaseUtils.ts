/**
 * Database Utility Functions
 * Provides safe, robust database operations with built-in error handling
 */

import { supabase } from '../integrations/supabase/client';

export interface SafeQueryResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SafeQueryOptions {
  fallbackToEmpty?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

/**
 * Safe database query wrapper with comprehensive error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  const {
    fallbackToEmpty = true,
    retryAttempts = 2,
    timeout = 10000
  } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
      });

      // Race between query and timeout
      const result = await Promise.race([queryFn(), timeoutPromise]);

      if (result.error) {
        lastError = result.error;
        
        // Check for specific recoverable errors
        if (isRecoverableError(result.error)) {
          if (attempt < retryAttempts) {
            console.warn(`Query attempt ${attempt + 1} failed, retrying...`, result.error);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
        }
        
        // If fallback is enabled and it's a data-related error, return empty result
        if (fallbackToEmpty && isDataError(result.error)) {
          console.warn('Query failed, returning empty result:', result.error.message);
          return {
            data: null,
            error: null,
            success: true
          };
        }
        
        return {
          data: null,
          error: result.error.message || 'Database query failed',
          success: false
        };
      }

      return {
        data: result.data,
        error: null,
        success: true
      };

    } catch (error: any) {
      lastError = error;
      
      if (attempt < retryAttempts) {
        console.warn(`Query attempt ${attempt + 1} threw error, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  return {
    data: null,
    error: lastError?.message || 'Query failed after all retry attempts',
    success: false
  };
}

/**
 * Safe query for single records with fallback
 */
export async function safeSingleQuery<T>(
  table: string,
  select: string,
  filter: Record<string, any>,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  return safeQuery(
    () => supabase.from(table).select(select).match(filter).single(),
    options
  );
}

/**
 * Safe query for multiple records with fallback
 */
export async function safeMultiQuery<T>(
  table: string,
  select: string,
  filter: Record<string, any> = {},
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T[]>> {
  return safeQuery(
    () => supabase.from(table).select(select).match(filter),
    { ...options, fallbackToEmpty: true }
  );
}

/**
 * Safe query with joins that handles missing related data
 */
export async function safeJoinQuery<T>(
  table: string,
  select: string,
  filter: Record<string, any>,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  return safeQuery(
    () => supabase.from(table).select(select).match(filter).single(),
    { ...options, fallbackToEmpty: true }
  );
}

/**
 * Check if an error is recoverable (network, temporary issues)
 */
function isRecoverableError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  // Network-related errors
  if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    return true;
  }
  
  // Temporary server errors
  if (code === '500' || code === '502' || code === '503' || code === '504') {
    return true;
  }
  
  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }
  
  return false;
}

/**
 * Check if an error is data-related (missing records, etc.)
 */
function isDataError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  // Missing records
  if (message.includes('no rows') || message.includes('not found') || message.includes('does not exist')) {
    return true;
  }
  
  // Permission errors (but not auth errors)
  if (code === '42501' && !message.includes('authentication')) {
    return true;
  }
  
  // Constraint violations that might be expected
  if (message.includes('foreign key') || message.includes('constraint')) {
    return true;
  }
  
  return false;
}

/**
 * Safe insert operation
 */
export async function safeInsert<T>(
  table: string,
  data: any,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  return safeQuery(
    () => supabase.from(table).insert(data).select().single(),
    options
  );
}

/**
 * Safe update operation
 */
export async function safeUpdate<T>(
  table: string,
  data: any,
  filter: Record<string, any>,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  return safeQuery(
    () => supabase.from(table).update(data).match(filter).select().single(),
    options
  );
}

/**
 * Safe delete operation
 */
export async function safeDelete<T>(
  table: string,
  filter: Record<string, any>,
  options: SafeQueryOptions = {}
): Promise<SafeQueryResult<T>> {
  return safeQuery(
    () => supabase.from(table).delete().match(filter).select().single(),
    options
  );
}

/**
 * Batch operations with individual error handling
 */
export async function safeBatchOperations<T>(
  operations: Array<() => Promise<{ data: T | null; error: any }>>,
  options: SafeQueryOptions = {}
): Promise<Array<SafeQueryResult<T>>> {
  const results = await Promise.allSettled(
    operations.map(op => safeQuery(op, options))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' 
      ? result.value 
      : { data: null, error: result.reason?.message || 'Operation failed', success: false }
  );
}


