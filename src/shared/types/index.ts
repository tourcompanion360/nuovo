/**
 * Shared Types
 * Common TypeScript type definitions used across frontend and backend
 */

// Base API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Creator {
  id: string;
  userId: string;
  agencyName: string;
  agencyLogo?: string;
  contactEmail: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  subscriptionPlan: 'basic' | 'pro';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EndClient {
  id: string;
  creatorId: string;
  name: string;
  email: string;
  company: string;
  website?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  loginCredentials?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  endClientId: string;
  title: string;
  description?: string;
  projectType: 'virtual_tour' | '3d_showcase' | 'interactive_map';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  thumbnailUrl?: string;
  tourUrl?: string;
  settings?: Record<string, unknown>;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Chatbot types
export interface Chatbot {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  language: string;
  welcomeMessage: string;
  fallbackMessage: string;
  primaryColor: string;
  widgetStyle: string;
  position: string;
  avatarUrl?: string;
  brandLogoUrl?: string;
  responseStyle: string;
  maxQuestions: number;
  conversationLimit: number;
  knowledgeBaseText?: string;
  knowledgeBaseFiles?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'draft';
  statistics?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface Analytics {
  id: string;
  projectId: string;
  date: string;
  metricType: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated';
  metricValue: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Lead types
export interface Lead {
  id: string;
  chatbotId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  company?: string;
  questionAsked: string;
  chatbotResponse?: string;
  leadScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface Request {
  id: string;
  projectId: string;
  endClientId: string;
  title: string;
  description: string;
  requestType: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  attachments?: Record<string, unknown>;
  creatorNotes?: string;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Asset types
export interface Asset {
  id: string;
  creatorId: string;
  projectId?: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Authentication types
export interface AuthSession {
  user: User;
  creator?: Creator;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  agencyName: string;
  contactEmail: string;
  phone?: string;
  website?: string;
}

// Dashboard types
export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalChatbots: number;
  totalLeads: number;
  totalViews: number;
  activeProjects: number;
}

export interface CreatorDashboardData {
  creator: Creator | null;
  clients: EndClient[];
  projects: Project[];
  chatbots: Chatbot[];
  leads: Lead[];
  analytics: Analytics[];
  requests: Request[];
  assets: Asset[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface AppError {
  message: string;
  code: string;
  statusCode?: number;
  field?: string;
  details?: Record<string, unknown>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
}

// Settings types
export interface UserSettings {
  theme: Theme;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    analytics: boolean;
    marketing: boolean;
  };
}

// Export all types
export type {
  ApiResponse,
  User,
  Creator,
  EndClient,
  Project,
  Chatbot,
  Analytics,
  Lead,
  Request,
  Asset,
  AuthSession,
  LoginCredentials,
  RegisterData,
  DashboardStats,
  CreatorDashboardData,
  FormState,
  PaginationParams,
  PaginatedResponse,
  AppError,
  Notification,
  Theme,
  UserSettings,
};

