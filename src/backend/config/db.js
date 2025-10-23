/**
 * Database Configuration
 * Centralized database connection and configuration management
 */

import { createClient } from '@supabase/supabase-js';
import { dbConfig, isDevelopment } from './env.js';

// Create Supabase client with service role key for backend operations
export const supabaseAdmin = createClient(
  dbConfig.supabaseUrl,
  dbConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'tourcompanion-backend',
      },
    },
  }
);

// Create regular Supabase client for user operations
export const supabase = createClient(
  dbConfig.supabaseUrl,
  process.env.VITE_SUPABASE_ANON_KEY || 'fallback-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Database connection health check
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('creators')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    if (isDevelopment) {
      console.log('✅ Database connection successful');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Database transaction helper
export const withTransaction = async (callback) => {
  // Note: Supabase doesn't support traditional transactions
  // This is a placeholder for future database migration
  try {
    return await callback(supabaseAdmin);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

// Database query helper with retry logic
export const queryWithRetry = async (queryFn, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn(supabaseAdmin);
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (isDevelopment) {
        console.warn(`Database query attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
  }
  
  throw lastError;
};

// Export database utilities
export const db = {
  admin: supabaseAdmin,
  client: supabase,
  checkConnection: checkDatabaseConnection,
  withTransaction,
  queryWithRetry,
};

// Log database configuration in development
if (isDevelopment) {
  console.log('🔗 Database Configuration:', {
    supabaseUrl: dbConfig.supabaseUrl,
    hasServiceRoleKey: !!dbConfig.serviceRoleKey,
    hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
  });
}

