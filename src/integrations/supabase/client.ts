// Supabase client configuration with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug configuration in development
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Configuration:', {
    url: SUPABASE_URL,
    keyPrefix: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'missing',
    source: 'ENVIRONMENT_VARIABLES',
    note: 'Using environment variables from .env.local',
    envUrl: import.meta.env.VITE_SUPABASE_URL,
    envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
  });
}

// Validate required environment variables with fallback
let supabaseClient: any;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required Supabase environment variables.');
  console.error('🔧 Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.');
  console.error('📖 See DEPLOYMENT_ENVIRONMENT_SETUP.md for instructions.');
  
  // Use fallback values for deployment
  const fallbackUrl = 'https://yrvicwapjsevyilxdzsm.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c';
  
  console.warn('⚠️ Using fallback Supabase configuration for deployment.');
  
  // Use fallback values
  const SUPABASE_URL_FINAL = SUPABASE_URL || fallbackUrl;
  const SUPABASE_ANON_KEY_FINAL = SUPABASE_ANON_KEY || fallbackKey;
  
  // Create client with fallback values
  supabaseClient = createClient<Database>(
    SUPABASE_URL_FINAL,
    SUPABASE_ANON_KEY_FINAL,
    {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'X-Client-Info': `tourcompanion-${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
        },
      },
    }
  );
} else {
  // Create Supabase client with validated configuration
  supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'X-Client-Info': `tourcompanion-${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
        },
      },
    }
  );
}

// Export the client
export const supabase = supabaseClient;


// Log connection info in development (URL sanitized for security)
if (import.meta.env.DEV) {
  console.log('🔗 Supabase client initialized:', {
    url: SUPABASE_URL ? '***configured***' : '***missing***',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  });
  
  // Test connection and refresh schema cache
  console.log('🔍 Testing Supabase connection...');
  console.log('🔍 Project URL:', SUPABASE_URL);
  console.log('🔍 Key prefix:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'missing');
  console.log('🔍 Using environment variables from .env.local');
  
  supabase.from('creators').select('count').limit(1).then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      console.error('Error code:', error.code);
      console.error('Error hint:', error.hint);
      
      // Try to refresh schema cache by running a simple query
      supabase.rpc('version').then(({ error: rpcError }) => {
        if (rpcError) {
          console.error('❌ Schema cache refresh failed:', rpcError.message);
          console.error('This suggests a fundamental connection issue');
        } else {
          console.log('✅ Schema cache refreshed, retrying creators table...');
          // Retry the creators table query
          supabase.from('creators').select('count').limit(1).then(({ error: retryError }) => {
            if (retryError) {
              console.error('❌ Creators table still not accessible:', retryError.message);
            } else {
              console.log('✅ Creators table now accessible after cache refresh');
            }
          });
        }
      });
    } else {
      console.log('✅ Supabase connection test successful');
      console.log('✅ Creators table is accessible');
    }
  }).catch((err) => {
    console.error('❌ Supabase connection test error:', err);
  });
}

// Export for easy importing
// Usage: import { supabase } from "@/integrations/supabase/client";