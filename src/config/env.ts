/**
 * Environment variable configuration and validation
 * Centralizes all environment variable access with proper validation
 */

import { z } from 'zod';

// Environment variable schema for validation
const envSchema = z.object({
  // Supabase Configuration
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Stripe Configuration
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  
  // Application Configuration
  VITE_APP_NAME: z.string().default('TourCompanion'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_PWA: z.string().transform(val => val === 'true').default('true'),
  
  // API Configuration
  VITE_API_TIMEOUT: z.string().transform(val => parseInt(val, 10)).default('30000'),
  VITE_MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).default('10485760'), // 10MB
  
  // Development Configuration
  VITE_DEV_SERVER_PORT: z.string().transform(val => parseInt(val, 10)).default('5173'),
  VITE_DEV_SERVER_HOST: z.string().default('localhost'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('⚠️ Environment validation failed, using fallback values:', error.errors);
      
      // Return fallback values instead of throwing error
      return {
        VITE_SUPABASE_URL: "https://yrvicwapjsevyilxdzsm.supabase.co",
        VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c",
        VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_your_stripe_publishable_key_here",
        VITE_APP_NAME: "TourCompanion",
        VITE_APP_VERSION: "1.0.0",
        VITE_APP_ENVIRONMENT: "development" as const,
        VITE_ENABLE_ANALYTICS: false,
        VITE_ENABLE_DEBUG: true,
        VITE_ENABLE_PWA: true,
        VITE_API_TIMEOUT: 30000,
        VITE_MAX_FILE_SIZE: 10485760,
        VITE_DEV_SERVER_PORT: 5173,
        VITE_DEV_SERVER_HOST: "localhost",
      };
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variables
export type Environment = z.infer<typeof envSchema>;

// Environment-specific configurations
export const isDevelopment = env.VITE_APP_ENVIRONMENT === 'development';
export const isProduction = env.VITE_APP_ENVIRONMENT === 'production';
export const isStaging = env.VITE_APP_ENVIRONMENT === 'staging';

// Feature flags
export const features = {
  analytics: env.VITE_ENABLE_ANALYTICS,
  debug: env.VITE_ENABLE_DEBUG,
  pwa: env.VITE_ENABLE_PWA,
} as const;

// API configuration
export const apiConfig = {
  timeout: env.VITE_API_TIMEOUT,
  maxFileSize: env.VITE_MAX_FILE_SIZE,
} as const;

// Development configuration
export const devConfig = {
  serverPort: env.VITE_DEV_SERVER_PORT,
  serverHost: env.VITE_DEV_SERVER_HOST,
} as const;

// Validate required environment variables on module load
if (isProduction) {
  // Additional production validations
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing required Supabase configuration for production');
  }
}

// Log environment info in development
if (isDevelopment && features.debug) {
  console.log('🔧 Environment Configuration:', {
    appName: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
    environment: env.VITE_APP_ENVIRONMENT,
    features,
    apiConfig,
  });
}
