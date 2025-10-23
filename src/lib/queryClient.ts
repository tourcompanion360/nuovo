import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized caching for B2B dashboard
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (B2B data doesn't change frequently)
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus for B2B (users often switch tabs)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (B2B users have stable connections)
      refetchOnReconnect: false,
      // Background refetch every 2 minutes for critical data
      refetchInterval: 2 * 60 * 1000, // 2 minutes
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Cache keys for consistent query management
export const QUERY_KEYS = {
  // User data
  USER_PROFILE: ['user', 'profile'] as const,
  USER_SETTINGS: ['user', 'settings'] as const,
  
  // Dashboard data
  DASHBOARD_DATA: ['dashboard'] as const,
  DASHBOARD_OVERVIEW: ['dashboard', 'overview'] as const,
  DASHBOARD_ANALYTICS: ['dashboard', 'analytics'] as const,
  
  // Clients
  CLIENTS: ['clients'] as const,
  CLIENT_DETAILS: (clientId: string) => ['clients', clientId] as const,
  CLIENT_PROJECTS: (clientId: string) => ['clients', clientId, 'projects'] as const,
  
  // Projects
  PROJECTS: ['projects'] as const,
  PROJECT_DETAILS: (projectId: string) => ['projects', projectId] as const,
  PROJECT_ANALYTICS: (projectId: string) => ['projects', projectId, 'analytics'] as const,
  
  // Support requests
  SUPPORT_REQUESTS: ['support-requests'] as const,
  SUPPORT_REQUEST_DETAILS: (requestId: string) => ['support-requests', requestId] as const,
  
  // Chatbot requests
  CHATBOT_REQUESTS: ['chatbot-requests'] as const,
  CHATBOT_REQUEST_DETAILS: (requestId: string) => ['chatbot-requests', requestId] as const,
  
  // Media library
  MEDIA_LIBRARY: ['media'] as const,
  MEDIA_FILES: (category?: string) => ['media', category || 'all'] as const,
  
  // Analytics
  ANALYTICS_SUMMARY: ['analytics', 'summary'] as const,
  ANALYTICS_DETAILED: (projectId: string, dateRange: string) => 
    ['analytics', 'detailed', projectId, dateRange] as const,
} as const;