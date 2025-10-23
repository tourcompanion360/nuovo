import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EndClient, Project, Chatbot, Lead, Analytics, Request } from '@/integrations/supabase/types';

interface ClientPortalData {
  client: EndClient | null;
  projects: Project[];
  chatbots: Chatbot[];
  leads: Lead[];
  analytics: Analytics[];
  requests: Request[];
  stats: {
    totalProjects: number;
    totalChatbots: number;
    totalLeads: number;
    totalViews: number;
    activeProjects: number;
    pendingRequests: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useClientPortal = (clientId: string | null) => {
  const [data, setData] = useState<ClientPortalData>({
    client: null,
    projects: [],
    chatbots: [],
    leads: [],
    analytics: [],
    requests: [],
    stats: {
      totalProjects: 0,
      totalChatbots: 0,
      totalLeads: 0,
      totalViews: 0,
      activeProjects: 0,
      pendingRequests: 0,
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!clientId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchClientData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Get client profile
        const { data: client, error: clientError } = await supabase
          .from('end_clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (clientError) {
          throw new Error(`Failed to fetch client: ${clientError.message}`);
        }

        if (!client) {
          throw new Error('Client profile not found');
        }

        // Fetch all related data in parallel
        const [
          { data: projects, error: projectsError },
          { data: chatbots, error: chatbotsError },
          { data: leads, error: leadsError },
          { data: analytics, error: analyticsError },
          { data: requests, error: requestsError },
        ] = await Promise.all([
          // Client's projects
          supabase
            .from('projects')
            .select(`
              *,
              chatbots(*)
            `)
            .eq('end_client_id', clientId)
            .order('created_at', { ascending: false }),

          // Client's chatbots
          supabase
            .from('chatbots')
            .select(`
              *,
              projects!inner(
                id,
                title,
                end_client_id
              )
            `)
            .eq('projects.end_client_id', clientId)
            .order('created_at', { ascending: false }),

          // Client's leads
          supabase
            .from('leads')
            .select(`
              *,
              chatbots!inner(
                id,
                name,
                projects!inner(
                  id,
                  title,
                  end_client_id
                )
              )
            `)
            .eq('chatbots.projects.end_client_id', clientId)
            .order('created_at', { ascending: false }),

          // Client's analytics
          supabase
            .from('analytics')
            .select(`
              *,
              projects!inner(
                id,
                title,
                end_client_id
              )
            `)
            .eq('projects.end_client_id', clientId)
            .order('date', { ascending: false }),

          // Client's requests
          supabase
            .from('requests')
            .select('*')
            .eq('end_client_id', clientId)
            .order('created_at', { ascending: false }),
        ]);

        // Check for errors
        if (projectsError) throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        if (chatbotsError) throw new Error(`Failed to fetch chatbots: ${chatbotsError.message}`);
        if (leadsError) throw new Error(`Failed to fetch leads: ${leadsError.message}`);
        if (analyticsError) throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
        if (requestsError) throw new Error(`Failed to fetch requests: ${requestsError.message}`);

        // Calculate statistics
        const totalViews = analytics
          ?.filter(a => a.metric_type === 'view')
          .reduce((sum, a) => sum + a.metric_value, 0) || 0;

        const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
        const pendingRequests = requests?.filter(r => r.status === 'open' || r.status === 'in_progress').length || 0;

        setData({
          client,
          projects: projects || [],
          chatbots: chatbots || [],
          leads: leads || [],
          analytics: analytics || [],
          requests: requests || [],
          stats: {
            totalProjects: projects?.length || 0,
            totalChatbots: chatbots?.length || 0,
            totalLeads: leads?.length || 0,
            totalViews,
            activeProjects,
            pendingRequests,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching client portal data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    };

    fetchClientData();
  }, [clientId]);

  // Helper functions
  const getChatbotsForProject = (projectId: string) => {
    return data.chatbots.filter(cb => cb.project_id === projectId);
  };

  const getLeadsForChatbot = (chatbotId: string) => {
    return data.leads.filter(l => l.chatbot_id === chatbotId);
  };

  const getRecentLeads = (limit: number = 10) => {
    return data.leads.slice(0, limit);
  };

  const getAnalyticsForProject = (projectId: string) => {
    return data.analytics.filter(a => a.project_id === projectId);
  };

  const getTopQuestions = () => {
    const questionCounts: { [key: string]: number } = {};
    
    data.leads.forEach(lead => {
      const question = lead.question_asked.toLowerCase().trim();
      questionCounts[question] = (questionCounts[question] || 0) + 1;
    });

    return Object.entries(questionCounts)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const createRequest = async (requestData: {
    project_id: string;
    title: string;
    description: string;
    request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (!clientId) throw new Error('Client ID is required');

    const { data: newRequest, error } = await supabase
      .from('requests')
      .insert({
        ...requestData,
        end_client_id: clientId,
        priority: requestData.priority || 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create request: ${error.message}`);
    }

    // Refresh data
    setData(prev => ({
      ...prev,
      requests: [newRequest, ...prev.requests],
      stats: {
        ...prev.stats,
        pendingRequests: prev.stats.pendingRequests + 1,
      },
    }));

    return newRequest;
  };

  const refreshData = async () => {
    if (clientId) {
      // Re-trigger the useEffect
      setData(prev => ({ ...prev, isLoading: true }));
    }
  };

  return {
    ...data,
    getChatbotsForProject,
    getLeadsForChatbot,
    getRecentLeads,
    getAnalyticsForProject,
    getTopQuestions,
    createRequest,
    refreshData,
  };
};







