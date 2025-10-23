/**
 * Backend Environment Configuration
 * Centralized environment variable management for backend services
 */

import { z } from 'zod';

// Environment schema for backend validation
const backendEnvSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().url('Invalid database URL'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Server Configuration
  PORT: z.string().transform(val => parseInt(val, 10)).default('3001'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  HOST: z.string().default('localhost'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // API Configuration
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(val => parseInt(val, 10)).default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // External Services
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),
  STRIPE_PRICE_ID_BASIC: z.string().min(1, 'Stripe Basic price ID is required'),
  STRIPE_PRICE_ID_PRO: z.string().min(1, 'Stripe Pro price ID is required'),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
const parseBackendEnv = () => {
  try {
    return backendEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Backend environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const backendEnv = parseBackendEnv();

// Environment-specific configurations
export const isDevelopment = backendEnv.NODE_ENV === 'development';
export const isProduction = backendEnv.NODE_ENV === 'production';
export const isStaging = backendEnv.NODE_ENV === 'staging';

// Server configuration
export const serverConfig = {
  port: backendEnv.PORT,
  host: backendEnv.HOST,
  nodeEnv: backendEnv.NODE_ENV,
  apiPrefix: backendEnv.API_PREFIX,
  corsOrigin: backendEnv.CORS_ORIGIN,
};

// Database configuration
export const dbConfig = {
  url: backendEnv.DATABASE_URL,
  supabaseUrl: backendEnv.SUPABASE_URL,
  serviceRoleKey: backendEnv.SUPABASE_SERVICE_ROLE_KEY,
};

// Authentication configuration
export const authConfig = {
  jwtSecret: backendEnv.JWT_SECRET,
  jwtExpiresIn: backendEnv.JWT_EXPIRES_IN,
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: backendEnv.RATE_LIMIT_WINDOW_MS,
  maxRequests: backendEnv.RATE_LIMIT_MAX_REQUESTS,
};

// File upload configuration
export const uploadConfig = {
  maxFileSize: backendEnv.MAX_FILE_SIZE,
  uploadDir: backendEnv.UPLOAD_DIR,
};

// External services configuration
export const externalServices = {
  stripe: {
    secretKey: backendEnv.STRIPE_SECRET_KEY,
    webhookSecret: backendEnv.STRIPE_WEBHOOK_SECRET,
    priceIdBasic: backendEnv.STRIPE_PRICE_ID_BASIC,
    priceIdPro: backendEnv.STRIPE_PRICE_ID_PRO,
  },
  sendgrid: {
    apiKey: backendEnv.SENDGRID_API_KEY,
  },
  sentry: {
    dsn: backendEnv.SENTRY_DSN,
  },
};

// Logging configuration
export const loggingConfig = {
  level: backendEnv.LOG_LEVEL,
};

// Validate required environment variables on module load
if (isProduction) {
  if (!backendEnv.JWT_SECRET || backendEnv.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  
  if (!backendEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production');
  }
}

// Log configuration info in development
if (isDevelopment) {
  console.log('🔧 Backend Environment Configuration:', {
    nodeEnv: backendEnv.NODE_ENV,
    port: backendEnv.PORT,
    host: backendEnv.HOST,
    apiPrefix: backendEnv.API_PREFIX,
    corsOrigin: backendEnv.CORS_ORIGIN,
  });
}

