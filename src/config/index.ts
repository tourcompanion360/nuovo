/**
 * Centralized configuration export
 * Main entry point for all configuration values
 */

export { env, isDevelopment, isProduction, isStaging, features, apiConfig, devConfig } from './env';
export {
  APP_INFO,
  API_CONFIG,
  DB_CONFIG,
  AUTH_CONFIG,
  UI_CONFIG,
  FEATURES,
  ROUTES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  ANALYTICS_EVENTS,
  NOTIFICATION_TYPES,
  PROJECT_TYPES,
  REQUEST_TYPES,
  PRIORITY_LEVELS,
  STATUS_TYPES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  CHATBOT_CONFIG,
  FILE_UPLOAD_CONFIG,
  PERFORMANCE_CONFIG,
} from './constants';

// Re-export types
export type { Environment } from './env';

// Configuration object for easy access
export const config = {
  app: {
    name: APP_INFO.name,
    version: APP_INFO.version,
    environment: env.VITE_APP_ENVIRONMENT,
    isDevelopment,
    isProduction,
    isStaging,
  },
  api: {
    ...API_CONFIG,
    timeout: apiConfig.timeout,
    maxFileSize: apiConfig.maxFileSize,
  },
  database: DB_CONFIG,
  auth: AUTH_CONFIG,
  ui: UI_CONFIG,
  features,
  routes: ROUTES,
  storage: STORAGE_KEYS,
  errors: ERROR_MESSAGES,
  success: SUCCESS_MESSAGES,
  validation: VALIDATION_RULES,
  analytics: ANALYTICS_EVENTS,
  notifications: NOTIFICATION_TYPES,
  projects: PROJECT_TYPES,
  requests: REQUEST_TYPES,
  priority: PRIORITY_LEVELS,
  status: STATUS_TYPES,
  subscription: {
    plans: SUBSCRIPTION_PLANS,
    status: SUBSCRIPTION_STATUS,
  },
  chatbot: CHATBOT_CONFIG,
  fileUpload: FILE_UPLOAD_CONFIG,
  performance: PERFORMANCE_CONFIG,
} as const;

// Default export for convenience
export default config;

