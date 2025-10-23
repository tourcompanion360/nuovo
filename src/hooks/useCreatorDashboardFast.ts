/**
 * Fast Creator Dashboard Hook
 * Optimized for speed with minimal database queries and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  enhanceProjectWithMockData, 
  enhanceClientWithMockData
} from '@/utils/mockData';

interface Creator {
  id: string;
  agency_name: string;
  contact_email: string;
  user_id: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  creator_id: string;
  projects?: Project[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  views: number;
  end_client_id: string;
  created_at: string;
  chatbots?: Chatbot[];
}

interface Chatbot {
  id: string;
  name: string;
  status: string;
  project_id: string;
  statistics?: any;
}

interface Analytics {
  id: string;
  project_id: string;
  metric_type: string;
  metric_value: number;
  created_at: string;
}

interface DashboardData {
  creator: Creator | null;
  clients: Client[];
  projects: Project[];
  chatbots: Chatbot[];
  analytics: Analytics[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Cache to store data and avoid unnecessary queries
let dataCache: {
  data: DashboardData | null;
  timestamp: number;
  userId: string | null;
} = {
  data: null,
  timestamp: 0,
  userId: null
};

const CACHE_DURATION = 30000; // 30 seconds cache

export const useCreatorDashboardFast = (userId: string) => {
  const [data, setData] = useState<DashboardData>({
    creator: null,
    clients: [],
    projects: [],
    chatbots: [],
    analytics: [],
    isLoading: true,
    error: null,
    refreshData: () => {},
  });

  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      console.error('❌ [Fast Dashboard] No userId provided');
      console.log('🔍 [Fast Dashboard] userId value:', userId);
      setData(prev => ({ ...prev, isLoading: false, error: 'Authentication required. Please log in.' }));
      return;
    }

    console.log('🔍 [Fast Dashboard] Starting fetch for userId:', userId);

    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && 
        dataCache.data && 
        dataCache.userId === userId && 
        (now - dataCache.timestamp) < CACHE_DURATION) {
      console.log('🚀 [Fast Dashboard] Using cached data');
      setData(dataCache.data);
      return;
    }

    try {
      console.log('🚀 [Fast Dashboard] Fetching fresh data...');
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Use simple, reliable step-by-step queries to avoid nested query issues
      console.log('🔄 [Fast Dashboard] Using reliable simple queries...');
      
      // Step 1: Get creator profile
      console.log('🔍 [Fast Dashboard] Querying creators with userId:', userId);
      console.log('🔍 [Fast Dashboard] userId type:', typeof userId);
      console.log('🔍 [Fast Dashboard] userId length:', userId.length);
      
      // Check if we're in dev mode and try to bypass RLS
      const isDev = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true';
      console.log('🔍 [Fast Dashboard] Dev mode:', isDev);
      
      // Check current auth state
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 [Fast Dashboard] Current auth user:', currentUser?.id);
      console.log('🔍 [Fast Dashboard] Auth error:', authError);
      console.log('🔍 [Fast Dashboard] Querying for userId:', userId);
      console.log('🔍 [Fast Dashboard] Auth match:', currentUser?.id === userId);
      
      if (authError) {
        console.error('❌ [Fast Dashboard] Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!currentUser) {
        console.error('❌ [Fast Dashboard] No authenticated user found');
        throw new Error('No authenticated user found. Please log in again.');
      }
      
      if (currentUser.id !== userId) {
        console.error('❌ [Fast Dashboard] User ID mismatch:', { current: currentUser.id, requested: userId });
        throw new Error('User ID mismatch. Please log in again.');
      }
      
      let creators, creatorError;
      
      if (isDev) {
        // In dev mode, try to use a more permissive query
        console.log('🔧 [Fast Dashboard] Using dev mode query...');
        const result = await supabase
          .from('creators')
          .select('id, agency_name, contact_email, user_id')
          .eq('user_id', userId)
          .limit(1);
        creators = result.data;
        creatorError = result.error;
      } else {
        // Normal query for production
        const result = await supabase
          .from('creators')
          .select('id, agency_name, contact_email, user_id')
          .eq('user_id', userId)
          .limit(1);
        creators = result.data;
        creatorError = result.error;
      }

      if (creatorError) {
        console.error('❌ [Fast Dashboard] Creator fetch error:', creatorError);
        console.error('❌ [Fast Dashboard] Error details:', {
          message: creatorError.message,
          details: creatorError.details,
          hint: creatorError.hint,
          code: creatorError.code,
          queriedUserId: userId,
          currentUser: currentUser?.id,
          authMatch: currentUser?.id === userId
        });
        
        // Provide more specific error messages
        if (creatorError.code === 'PGRST116') {
          throw new Error('Creator profile not found. Please contact support to set up your account.');
        } else if (creatorError.message.includes('permission denied')) {
          throw new Error('Permission denied. Please log in again.');
        } else {
          throw new Error(`Failed to fetch creator: ${creatorError.message}`);
        }
      }

      console.log('🔍 [Fast Dashboard] Query result:', creators);

      // Debug: Let's also check what creators exist in the database
      const { data: allCreators } = await supabase
        .from('creators')
        .select('id, user_id, agency_name')
        .limit(5);
      console.log('🔍 [Fast Dashboard] All creators in DB (first 5):', allCreators);

      if (!creators || creators.length === 0) {
        console.error('❌ [Fast Dashboard] No creator found for userId:', userId);
        console.error('❌ [Fast Dashboard] Available creators:', allCreators);
        throw new Error(`Creator profile not found for user ID: ${userId.substring(0, 8)}...`);
      }

      const creator = creators[0]; // Take the first result

      console.log('✅ [Fast Dashboard] Creator fetched:', creator.agency_name);

      // Step 2: Get clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('end_clients')
        .select('*')
        .eq('creator_id', creator.id);

      if (clientsError) {
        console.error('❌ [Fast Dashboard] Clients fetch error:', clientsError);
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }

      const clients = clientsData || [];
      console.log('✅ [Fast Dashboard] Clients fetched:', clients.length);

      // Step 3: Get projects
      let projects: any[] = [];
      if (clients.length > 0) {
        const clientIds = clients.map(c => c.id);
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('end_client_id', clientIds);

        if (projectsError) {
          console.error('❌ [Fast Dashboard] Projects fetch error:', projectsError);
          throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }

        projects = projectsData || [];
        console.log('✅ [Fast Dashboard] Projects fetched:', projects.length);
      }

      const creatorWithData = creator;
      
      // Get chatbots and analytics in parallel (only if we have projects)
      let chatbots: Chatbot[] = [];
      let analytics: Analytics[] = [];
      
      if (projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        
        // Parallel queries for chatbots and analytics
        const [chatbotsResult, analyticsResult, importedResult] = await Promise.allSettled([
          supabase
            .from('chatbots')
            .select('*')
            .in('project_id', projectIds),
          supabase
            .from('analytics')
            .select('*')
            .in('project_id', projectIds),
          supabase
            .from('imported_analytics')
            .select('*')
            .in('project_id', projectIds)
        ]);

        // Handle chatbots result
        if (chatbotsResult.status === 'fulfilled' && !chatbotsResult.value.error) {
          chatbots = chatbotsResult.value.data || [];
        } else {
          console.warn('⚠️ [Fast Dashboard] Chatbots fetch failed:', chatbotsResult.status === 'rejected' ? chatbotsResult.reason : chatbotsResult.value.error);
        }

        // Handle analytics result
        const allAnalytics = [];
        
        if (analyticsResult.status === 'fulfilled' && !analyticsResult.value.error) {
          allAnalytics.push(...(analyticsResult.value.data || []));
        } else {
          console.warn('⚠️ [Fast Dashboard] Analytics fetch failed:', analyticsResult.status === 'rejected' ? analyticsResult.reason : analyticsResult.value.error);
        }
        
        // Handle imported analytics result
        if (importedResult.status === 'fulfilled' && !importedResult.value.error) {
          const importedData = importedResult.value.data || [];
          // Convert imported analytics to same format
          importedData.forEach(item => {
            // Add page views
            if (item.page_views > 0) {
              allAnalytics.push({
                id: `${item.id}_pv`,
                metric_type: 'view',
                metric_value: item.page_views,
                date: item.date,
                project_id: item.project_id,
                end_client_id: item.end_client_id
              });
            }
            // Add unique visitors
            if (item.visitors > 0) {
              allAnalytics.push({
                id: `${item.id}_uv`,
                metric_type: 'unique_visitor',
                metric_value: item.visitors,
                date: item.date,
                project_id: item.project_id,
                end_client_id: item.end_client_id
              });
            }
            // Add time spent
            if (item.avg_time > 0) {
              allAnalytics.push({
                id: `${item.id}_time`,
                metric_type: 'time_spent',
                metric_value: item.avg_time,
                date: item.date,
                project_id: item.project_id,
                end_client_id: item.end_client_id
              });
            }
          });
        } else {
          console.warn('⚠️ [Fast Dashboard] Imported analytics fetch failed:', importedResult.status === 'rejected' ? importedResult.reason : importedResult.value.error);
        }
        
        analytics = allAnalytics;
      }

      // Combine the data with mock enhancements
      const clientsWithProjects = clients.map(client => {
        const enhancedClient = enhanceClientWithMockData({
          ...client,
          projects: (client.projects || []).map(project => ({
            ...project,
            chatbots: chatbots.filter(cb => cb.project_id === project.id)
          }))
        });
        return enhancedClient;
      });

      const finalData = {
        creator: {
          id: creatorWithData.id,
          agency_name: creatorWithData.agency_name,
          contact_email: creatorWithData.contact_email,
          user_id: creatorWithData.user_id,
        },
        clients: clientsWithProjects,
        projects: projects,
        chatbots: chatbots,
        analytics: analytics,
        isLoading: false,
        error: null,
        refreshData: () => {},
      };

      console.log('✅ [Fast Dashboard] Data fetch complete:', {
        creator: finalData.creator.agency_name,
        clientsCount: finalData.clients.length,
        projectsCount: finalData.projects.length,
        chatbotsCount: finalData.chatbots.length,
        analyticsCount: finalData.analytics.length
      });

      // Update cache
      dataCache = {
        data: finalData,
        timestamp: now,
        userId: userId
      };

      setData(finalData);

    } catch (error) {
      console.error('🚨 [Fast Dashboard] Error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific Supabase errors
        if (error.message.includes('Cannot coerce the result to a single JSON object')) {
          errorMessage = 'Database query returned multiple results. Please contact support.';
        } else if (error.message.includes('Failed to fetch creator')) {
          errorMessage = 'Unable to load your profile. Please try refreshing the page.';
        } else if (error.message.includes('Creator profile not found')) {
          errorMessage = 'Your profile was not found. Please contact support.';
        }
      }
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [userId]);

  const debouncedRefresh = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[Fast Dashboard] Real-time update triggered');
      fetchData(true); // Force refresh
    }, 1000); // 1 second debounce
  }, [fetchData]);

  // Create refresh function
  const refreshData = useCallback(() => {
    console.log('🔄 [Fast Dashboard] Manual refresh triggered');
    fetchData(true); // Force refresh, bypass cache
  }, [fetchData]);

  useEffect(() => {
    console.log('🚀 [Fast Dashboard] Hook initialized with userId:', userId);
    if (userId) {
      fetchData();
    } else {
      console.log('⚠️ [Fast Dashboard] No userId, skipping fetch');
    }
  }, [fetchData, userId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userId || !data.creator) return;

    console.log('[Fast Dashboard] Setting up real-time subscriptions');

    const channel = supabase
      .channel('fast-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[Fast Dashboard] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'imported_analytics',
        },
        (payload) => {
          console.log('[Fast Dashboard] Imported analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[Fast Dashboard] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'end_clients',
        },
        (payload) => {
          console.log('[Fast Dashboard] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[Fast Dashboard] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[Fast Dashboard] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [userId, data.creator, debouncedRefresh]);

  // Update the data with the refresh function
  const dataWithRefresh = {
    ...data,
    refreshData
  };

  return dataWithRefresh;
};
