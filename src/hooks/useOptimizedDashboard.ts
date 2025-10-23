import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryClient';
import { useDatabaseCache } from './useDatabaseCache';
import { useLocalStorageCache } from './useLocalStorageCache';

interface OptimizedDashboardData {
  creator: any;
  clients: any[];
  projects: any[];
  analytics: any[];
  supportRequests: any[];
  chatbotRequests: any[];
  leads: any[];
  assets: any[];
  totalViews: number;
  totalLeads: number;
  totalProjects: number;
  totalClients: number;
}

// Optimized dashboard hook with multiple caching layers
export const useOptimizedDashboard = (userId: string) => {
  const queryClient = useQueryClient();
  const { getCachedQuery } = useDatabaseCache();
  const [userPreferences] = useLocalStorageCache('user-preferences', {
    dashboard: {
      itemsPerPage: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  });

  // Main dashboard query with intelligent caching
  const dashboardQuery = useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD_DATA, userId],
    queryFn: async (): Promise<OptimizedDashboardData> => {
      console.log('🚀 [Optimized Dashboard] Fetching data with caching...');
      
      // Use database cache for the main query
      return getCachedQuery(
        'dashboard',
        async () => {
          // Single optimized query to get creator + clients + projects
          const { data: creatorWithData, error: creatorError } = await supabase
            .from('creators')
            .select(`
              *,
              end_clients(
                *,
                projects(
                  *,
                  chatbots(*),
                  analytics(*),
                  requests(*)
                )
              )
            `)
            .eq('user_id', userId)
            .single();

          if (creatorError) {
            console.error('Error fetching creator data:', creatorError);
            throw creatorError;
          }

          // Flatten the nested data structure
          const clients = creatorWithData.end_clients || [];
          const projects = clients.flatMap((client: any) => client.projects || []);
          const chatbots = projects.flatMap((project: any) => project.chatbots || []);
          const analytics = projects.flatMap((project: any) => project.analytics || []);
          const requests = projects.flatMap((project: any) => project.requests || []);

          // Calculate totals
          const totalViews = analytics.reduce((sum: number, item: any) => sum + (item.metric_value || 0), 0);
          const totalLeads = chatbots.reduce((sum: number, chatbot: any) => sum + (chatbot.statistics?.total_conversations || 0), 0);
          const totalProjects = projects.length;
          const totalClients = clients.length;

          // Fetch additional data in parallel with individual caching
          const [supportRequestsResult, chatbotRequestsResult, leadsResult, assetsResult] = await Promise.all([
            // Support requests (cached separately)
            getCachedQuery(
              'support_requests',
              async () => {
                const { data, error } = await supabase
                  .from('support_requests')
                  .select('*')
                  .eq('creator_id', creatorWithData.id)
                  .order('created_at', { ascending: false });
                if (error) throw error;
                return data;
              },
              { creator_id: creatorWithData.id },
              3 * 60 * 1000 // 3 minutes
            ),
            
            // Chatbot requests (cached separately)
            getCachedQuery(
              'chatbot_requests',
              async () => {
                const { data, error } = await supabase
                  .from('chatbot_requests')
                  .select('*')
                  .in('project_id', projects.map(p => p.id))
                  .order('created_at', { ascending: false });
                if (error) throw error;
                return data;
              },
              { project_ids: projects.map(p => p.id) },
              5 * 60 * 1000 // 5 minutes
            ),
            
            // Leads (cached separately)
            getCachedQuery(
              'leads',
              async () => {
                const { data, error } = await supabase
                  .from('leads')
                  .select('*')
                  .in('chatbot_id', chatbots.map(c => c.id))
                  .order('created_at', { ascending: false });
                if (error) throw error;
                return data;
              },
              { chatbot_ids: chatbots.map(c => c.id) },
              2 * 60 * 1000 // 2 minutes
            ),
            
            // Assets (cached separately - rarely change)
            getCachedQuery(
              'assets',
              async () => {
                const { data, error } = await supabase
                  .from('assets')
                  .select('*')
                  .eq('creator_id', creatorWithData.id)
                  .order('created_at', { ascending: false });
                if (error) throw error;
                return data;
              },
              { creator_id: creatorWithData.id },
              15 * 60 * 1000 // 15 minutes
            )
          ]);

          const dashboardData: OptimizedDashboardData = {
            creator: creatorWithData,
            clients,
            projects,
            analytics,
            supportRequests: supportRequestsResult || [],
            chatbotRequests: chatbotRequestsResult || [],
            leads: leadsResult || [],
            assets: assetsResult || [],
            totalViews,
            totalLeads,
            totalProjects,
            totalClients,
          };

          // Cache individual pieces for granular updates
          queryClient.setQueryData(QUERY_KEYS.CLIENTS, clients);
          queryClient.setQueryData(QUERY_KEYS.PROJECTS, projects);
          queryClient.setQueryData(QUERY_KEYS.SUPPORT_REQUESTS, dashboardData.supportRequests);
          queryClient.setQueryData(QUERY_KEYS.CHATBOT_REQUESTS, dashboardData.chatbotRequests);

          console.log('✅ [Optimized Dashboard] Data fetched and cached successfully');
          return dashboardData;
        },
        { user_id: userId },
        5 * 60 * 1000 // 5 minutes cache for main dashboard
      );
    },
    // Cache dashboard data for 5 minutes (B2B data doesn't change frequently)
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Enable background refetch every 2 minutes
    refetchInterval: 2 * 60 * 1000,
    // Don't refetch on window focus (B2B users switch tabs frequently)
    refetchOnWindowFocus: false,
    // Enable retry on failure
    retry: 2,
  });

  // Mutation for updating dashboard data
  const updateDashboardMutation = useMutation({
    mutationFn: async (updates: Partial<OptimizedDashboardData>) => {
      // Update the cache optimistically
      if (dashboardQuery.data) {
        queryClient.setQueryData(
          [...QUERY_KEYS.DASHBOARD_DATA, userId],
          { ...dashboardQuery.data, ...updates }
        );
      }
    },
    onSuccess: () => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_DATA });
    },
  });

  // Refresh function for manual updates
  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.DASHBOARD_DATA, userId] });
  };

  // Prefetch related data for better UX
  const prefetchRelatedData = () => {
    if (dashboardQuery.data) {
      // Prefetch client details
      dashboardQuery.data.clients.forEach(client => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.CLIENT_DETAILS(client.id),
          queryFn: () => Promise.resolve(client),
          staleTime: 5 * 60 * 1000,
        });
      });

      // Prefetch project details
      dashboardQuery.data.projects.forEach(project => {
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.PROJECT_DETAILS(project.id),
          queryFn: () => Promise.resolve(project),
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  };

  return {
    // Data
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    
    // Actions
    refreshDashboard,
    updateDashboard: updateDashboardMutation.mutate,
    prefetchRelatedData,
    
    // Status
    isRefetching: dashboardQuery.isRefetching,
    isStale: dashboardQuery.isStale,
    
    // Cache info
    dataUpdatedAt: dashboardQuery.dataUpdatedAt,
    errorUpdatedAt: dashboardQuery.errorUpdatedAt,
  };
};
