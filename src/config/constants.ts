/**
 * Application constants and configuration values
 * Centralizes all application-wide constants
 */

// Application Information
export const APP_INFO = {
  name: 'TourCompanion',
  version: '1.0.0',
  description: 'Virtual Tour Management SaaS Platform',
  author: 'TourCompanion Team',
  website: 'https://tourcompanion.com',
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFilesPerUpload: 10,
} as const;

// Database Configuration
export const DB_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  queryTimeout: 30000,
  realtimeTimeout: 10000,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 5 * 60 * 1000, // 5 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
} as const;

// UI Configuration
export const UI_CONFIG = {
  animationDuration: 300,
  toastDuration: 5000,
  debounceDelay: 500,
  infiniteScrollThreshold: 100,
  itemsPerPage: 20,
  maxItemsPerPage: 100,
} as const;

// Feature Flags
export const FEATURES = {
  analytics: true,
  realtime: true,
  fileUpload: true,
  chatbot: true,
  notifications: true,
  darkMode: true,
  pwa: true,
} as const;

// Route Configuration
export const ROUTES = {
  home: '/',
  auth: '/auth',
  dashboard: '/',
  admin: '/admin',
  client: '/client/:projectId',
  testClient: '/test-client/:projectId',
  testPortal: '/test-portal',
  notFound: '*',
} as const;

// Base URL for the application
export const BASE_URL = '';

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'tourcompanion-theme',
  language: 'tourcompanion-language',
  userPreferences: 'tourcompanion-user-preferences',
  lastVisited: 'tourcompanion-last-visited',
  onboarding: 'tourcompanion-onboarding-completed',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied. You do not have permission to access this resource.',
  notFound: 'The requested resource was not found.',
  serverError: 'An internal server error occurred. Please try again later.',
  validation: 'Please check your input and try again.',
  fileUpload: 'File upload failed. Please try again.',
  auth: 'Authentication failed. Please sign in again.',
  timeout: 'Request timed out. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  saved: 'Changes saved successfully.',
  created: 'Item created successfully.',
  updated: 'Item updated successfully.',
  deleted: 'Item deleted successfully.',
  uploaded: 'File uploaded successfully.',
  signedIn: 'Signed in successfully.',
  signedOut: 'Signed out successfully.',
  emailSent: 'Email sent successfully.',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address.',
  },
  password: {
    minLength: 6,
    message: 'Password must be at least 6 characters long.',
  },
  phone: {
    pattern: /^[+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number.',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://.',
  },
  agencyName: {
    minLength: 2,
    maxLength: 100,
    message: 'Agency name must be between 2 and 100 characters.',
  },
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  userSignUp: 'user_sign_up',
  userSignIn: 'user_sign_in',
  userSignOut: 'user_sign_out',
  projectCreated: 'project_created',
  projectUpdated: 'project_updated',
  projectDeleted: 'project_deleted',
  clientCreated: 'client_created',
  chatbotCreated: 'chatbot_created',
  fileUploaded: 'file_uploaded',
  error: 'error',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

// Project Types
export const PROJECT_TYPES = {
  virtualTour: 'virtual_tour',
  showcase3D: '3d_showcase',
  interactiveMap: 'interactive_map',
} as const;

// Request Types
export const REQUEST_TYPES = {
  hotspotUpdate: 'hotspot_update',
  contentChange: 'content_change',
  designModification: 'design_modification',
  newFeature: 'new_feature',
  bugFix: 'bug_fix',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

// Status Types
export const STATUS_TYPES = {
  active: 'active',
  inactive: 'inactive',
  draft: 'draft',
  archived: 'archived',
  pending: 'pending',
  open: 'open',
  inProgress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: 'basic',
  pro: 'pro',
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  active: 'active',
  inactive: 'inactive',
  cancelled: 'cancelled',
} as const;

// Chatbot Configuration
export const CHATBOT_CONFIG = {
  maxQuestions: 50,
  conversationLimit: 100,
  responseTimeout: 30000,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it', 'es', 'fr', 'de'],
} as const;

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles: 10,
  chunkSize: 1024 * 1024, // 1MB chunks
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  imageQuality: 0.8,
  thumbnailSize: 300,
  lazyLoadThreshold: 100,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

