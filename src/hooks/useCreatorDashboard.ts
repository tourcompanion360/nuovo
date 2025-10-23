import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Creator, EndClient, Project, Chatbot, Lead, Analytics, Request, Asset } from '@/integrations/supabase/types';
import { safeQuery, safeSingleQuery, safeMultiQuery, SafeQueryResult } from '../utils/databaseUtils';

interface CreatorDashboardData {
  creator: Creator | null;
  clients: EndClient[];
  projects: Project[];
  chatbots: Chatbot[];
  leads: Lead[];
  analytics: Analytics[];
  requests: Request[];
  assets: Asset[];
  stats: {
    totalClients: number;
    totalProjects: number;
    totalChatbots: number;
    totalLeads: number;
    totalViews: number;
    activeProjects: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useCreatorDashboard = (userId: string | null) => {
  const [data, setData] = useState<CreatorDashboardData>({
    creator: null,
    clients: [],
    projects: [],
    chatbots: [],
    leads: [],
    analytics: [],
    requests: [],
    assets: [],
    stats: {
      totalClients: 0,
      totalProjects: 0,
      totalChatbots: 0,
      totalLeads: 0,
      totalViews: 0,
      activeProjects: 0,
    },
    isLoading: true,
    error: null,
  });

  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchCreatorData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Get creator with basic data first
        const { data: creator, error: creatorError } = await supabase
          .from('creators')
          .select(`
            *,
            end_clients(
              *,
              projects(
                *,
                chatbots(*),
                requests(*)
              )
            )
          `)
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (creatorError) {
          throw new Error(`Failed to fetch creator: ${creatorError.message}`);
        }

        if (!creator) {
          throw new Error('Creator profile not found');
        }

        // Extract data from the optimized query
        const clients = creator.end_clients || [];
        const projects = clients.flatMap(client => client.projects || []);
        const chatbots = projects.flatMap(project => project.chatbots || []);
        const requests = projects.flatMap(project => project.requests || []);
        const projectIds = projects.map(p => p.id);

        // Load analytics from both tables
        const [analyticsResult, importedResult] = await Promise.all([
          supabase
            .from('analytics')
            .select('*')
            .in('project_id', projectIds),
          supabase
            .from('imported_analytics')
            .select('*')
            .in('project_id', projectIds)
        ]);

        // Combine analytics from both tables
        const allAnalytics = [];
        
        // Add original analytics data
        if (analyticsResult.data) {
          allAnalytics.push(...analyticsResult.data);
        }
        
        // Add imported analytics data (convert to same format)
        if (importedResult.data) {
          importedResult.data.forEach(item => {
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
        }

        const analytics = allAnalytics;

        // OPTIMIZED: Only fetch leads and assets (not included in main query)
        const [
          { data: leads, error: leadsError },
          { data: assets, error: assetsError },
        ] = await Promise.all([
          // Leads - query by chatbot IDs (only if there are projects)
          projectIds.length > 0
            ? supabase.from('leads').select(`
                *,
                chatbots(
                  projects(
                    end_clients(creator_id)
                  )
                )
              `).eq('chatbots.projects.end_clients.creator_id', creator.id).order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null }),

          // Assets - query by creator ID
          supabase
            .from('assets')
            .select('*')
            .eq('creator_id', creator.id)
            .order('created_at', { ascending: false }),
        ]);

        // Check for errors
        if (leadsError) throw new Error(`Failed to fetch leads: ${leadsError.message}`);
        if (assetsError) throw new Error(`Failed to fetch assets: ${assetsError.message}`);

        // Calculate statistics
        const totalViews = analytics
          ?.filter(a => a.metric_type === 'view')
          .reduce((sum, a) => sum + a.metric_value, 0) || 0;

        const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

        setData({
          creator,
          clients: clients || [],
          projects: projects || [],
          chatbots: chatbots || [],
          leads: leads || [],
          analytics: analytics || [],
          requests: requests || [],
          assets: assets || [],
          stats: {
            totalClients: clients?.length || 0,
            totalProjects: projects?.length || 0,
            totalChatbots: chatbots?.length || 0,
            totalLeads: leads?.length || 0,
            totalViews,
            activeProjects,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching creator dashboard data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    };

    fetchCreatorData();
  }, [userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId || !data.creator) return;

    console.log('[CreatorDashboard] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`creator-dashboard-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          console.log('[CreatorDashboard] Request change detected:', payload);
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
          console.log('[CreatorDashboard] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
        },
        (payload) => {
          console.log('[CreatorDashboard] Asset change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[CreatorDashboard] Analytics change detected:', payload);
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
          console.log('[CreatorDashboard] Imported analytics change detected:', payload);
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
          console.log('[CreatorDashboard] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
        },
        (payload) => {
          console.log('[CreatorDashboard] Chatbot change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[CreatorDashboard] Analytics change detected:', payload);
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
          console.log('[CreatorDashboard] Imported analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[CreatorDashboard] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[CreatorDashboard] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [userId, data.creator]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[CreatorDashboard] Triggering debounced refresh');
      fetchCreatorData();
    }, 1000);
  };

  // Helper functions
  const getProjectsForClient = (clientId: string) => {
    return data.projects.filter(p => p.end_client_id === clientId);
  };

  const getChatbotsForProject = (projectId: string) => {
    return data.chatbots.filter(cb => cb.project_id === projectId);
  };

  const getLeadsForChatbot = (chatbotId: string) => {
    return data.leads.filter(l => l.chatbot_id === chatbotId);
  };

  const getRecentLeads = (limit: number = 10) => {
    return data.leads.slice(0, limit);
  };

  const getPendingRequests = () => {
    return data.requests.filter(r => r.status === 'open' || r.status === 'in_progress');
  };

  const refreshData = async () => {
    if (!userId) return;
    
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Get creator profile
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creatorError || !creator) {
        throw new Error('Failed to fetch creator');
      }

      // Fetch end clients first
      const { data: clients, error: clientsError } = await supabase
        .from('end_clients')
        .select('*')
        .eq('creator_id', creator.id)
        .order('created_at', { ascending: false });

      const clientIds = clients?.map(c => c.id) || [];

      // Fetch projects for the clients
      const { data: projects, error: projectsError } = clientIds.length > 0
        ? await supabase
            .from('projects')
            .select('*')
            .in('end_client_id', clientIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null };

      const projectIds = projects?.map(p => p.id) || [];

      // Fetch all related data in parallel
      const [
        { data: chatbots },
        { data: analytics },
        { data: requests },
        { data: assets },
      ] = await Promise.all([
        projectIds.length > 0
          ? supabase.from('chatbots').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        projectIds.length > 0
          ? supabase.from('analytics').select('*').in('project_id', projectIds).order('date', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        projectIds.length > 0
          ? supabase.from('requests').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase.from('assets').select('*').eq('creator_id', creator.id).order('created_at', { ascending: false }),
      ]);

      // Calculate statistics
      const totalViews = analytics
        ?.filter(a => a.metric_type === 'view')
        .reduce((sum, a) => sum + a.metric_value, 0) || 0;

      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

      setData({
        creator,
        clients: clients || [],
        projects: projects || [],
        chatbots: chatbots || [],
        leads: [],
        analytics: analytics || [],
        requests: requests || [],
        assets: assets || [],
        stats: {
          totalClients: clients?.length || 0,
          totalProjects: projects?.length || 0,
          totalChatbots: chatbots?.length || 0,
          totalLeads: 0,
          totalViews,
          activeProjects,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
      }));
    }
  };

  return {
    ...data,
    getProjectsForClient,
    getChatbotsForProject,
    getLeadsForChatbot,
    getRecentLeads,
    getPendingRequests,
    refreshData,
  };
};
