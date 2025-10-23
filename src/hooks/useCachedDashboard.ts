import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryClient';

interface DashboardData {
  creator: any;
  clients: any[];
  projects: any[];
  analytics: any[];
  supportRequests: any[];
  chatbotRequests: any[];
  leads: any[];
  assets: any[];
}

// Optimized dashboard data fetching with intelligent caching
export const useCachedDashboard = (userId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_DATA,
    queryFn: async (): Promise<DashboardData> => {
      console.log('🚀 [Cached Dashboard] Fetching fresh data...');
      
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

      // Fetch additional data in parallel (these are less critical, so we can cache them longer)
      const [supportRequestsResult, chatbotRequestsResult, leadsResult, assetsResult] = await Promise.all([
        // Support requests (cache for 10 minutes)
        supabase
          .from('support_requests')
          .select('*')
          .eq('creator_id', creatorWithData.id)
          .order('created_at', { ascending: false }),
        
        // Chatbot requests (cache for 10 minutes)
        supabase
          .from('chatbot_requests')
          .select('*')
          .eq('project_id', projects.map(p => p.id))
          .order('created_at', { ascending: false }),
        
        // Leads (cache for 5 minutes)
        supabase
          .from('leads')
          .select('*')
          .in('chatbot_id', chatbots.map(c => c.id))
          .order('created_at', { ascending: false }),
        
        // Assets (cache for 15 minutes - rarely change)
        supabase
          .from('assets')
          .select('*')
          .eq('creator_id', creatorWithData.id)
          .order('created_at', { ascending: false })
      ]);

      const dashboardData: DashboardData = {
        creator: creatorWithData,
        clients,
        projects,
        analytics,
        supportRequests: supportRequestsResult.data || [],
        chatbotRequests: chatbotRequestsResult.data || [],
        leads: leadsResult.data || [],
        assets: assetsResult.data || [],
      };

      // Cache individual pieces for more granular updates
      queryClient.setQueryData(QUERY_KEYS.CLIENTS, clients);
      queryClient.setQueryData(QUERY_KEYS.PROJECTS, projects);
      queryClient.setQueryData(QUERY_KEYS.SUPPORT_REQUESTS, dashboardData.supportRequests);
      queryClient.setQueryData(QUERY_KEYS.CHATBOT_REQUESTS, dashboardData.chatbotRequests);

      console.log('✅ [Cached Dashboard] Data fetched and cached successfully');
      return dashboardData;
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
};

// Hook for invalidating specific cache entries
export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateClients = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLIENTS });
  };

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
  };

  const invalidateSupportRequests = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_REQUESTS });
  };

  const invalidateChatbotRequests = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATBOT_REQUESTS });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  return {
    invalidateClients,
    invalidateProjects,
    invalidateSupportRequests,
    invalidateChatbotRequests,
    invalidateAll,
  };
};
