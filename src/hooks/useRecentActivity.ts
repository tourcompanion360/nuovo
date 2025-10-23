import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityItem, ActivityType, ActivityFilters, ActivityStats } from '@/types/activity';

interface UseRecentActivityOptions {
  clientId?: string;
  projectId?: string;
  creatorId?: string;
  limit?: number;
  filters?: ActivityFilters;
}

export const useRecentActivity = (options: UseRecentActivityOptions = {}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { clientId, projectId, creatorId, limit = 50, filters } = options;
  
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const allActivities: ActivityItem[] = [];

      // Only fetch data from the last 48 hours to show truly recent activity
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoISO = twoDaysAgo.toISOString();

      // Fetch projects data (only recent ones)
      const projectsQuery = supabase
        .from('projects')
        .select(`
          *,
          end_clients!inner(
            id,
            name,
            company,
            creator_id
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (clientId) {
        projectsQuery.eq('end_client_id', clientId);
      }
      if (projectId) {
        projectsQuery.eq('id', projectId);
      }
      if (creatorId) {
        projectsQuery.eq('end_clients.creator_id', creatorId);
      }

      const { data: projects, error: projectsError } = await projectsQuery;

      if (projectsError) throw projectsError;

      // Fetch chatbots data (only recent ones)
      const chatbotsQuery = supabase
        .from('chatbots')
        .select(`
          *,
          projects!inner(
            id,
            title,
            end_client_id,
            end_clients!inner(
              id,
              name,
              company,
              creator_id
            )
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (projectId) {
        chatbotsQuery.eq('project_id', projectId);
      } else if (clientId) {
        chatbotsQuery.eq('projects.end_client_id', clientId);
      } else if (creatorId) {
        chatbotsQuery.eq('projects.end_clients.creator_id', creatorId);
      }

      const { data: chatbots, error: chatbotsError } = await chatbotsQuery;

      if (chatbotsError) throw chatbotsError;

      // Fetch leads data (only recent ones)
      const leadsQuery = supabase
        .from('leads')
        .select(`
          *,
          chatbots!inner(
            id,
            name,
            projects!inner(
              id,
              title,
              end_client_id,
              end_clients!inner(
                id,
                name,
                company,
                creator_id
              )
            )
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (projectId) {
        leadsQuery.eq('chatbots.project_id', projectId);
      } else if (clientId) {
        leadsQuery.eq('chatbots.projects.end_client_id', clientId);
      } else if (creatorId) {
        leadsQuery.eq('chatbots.projects.end_clients.creator_id', creatorId);
      }

      const { data: leads, error: leadsError } = await leadsQuery;

      if (leadsError) throw leadsError;

      // Fetch requests data (only recent ones)
      const requestsQuery = supabase
        .from('requests')
        .select(`
          *,
          projects!inner(
            id,
            title,
            end_client_id,
            end_clients!inner(
              id,
              name,
              company,
              creator_id
            )
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (projectId) {
        requestsQuery.eq('project_id', projectId);
      } else if (clientId) {
        requestsQuery.eq('end_client_id', clientId);
      } else if (creatorId) {
        requestsQuery.eq('projects.end_clients.creator_id', creatorId);
      }

      const { data: requests, error: requestsError } = await requestsQuery;

      if (requestsError) throw requestsError;

      // Fetch analytics data (only recent ones)
      const analyticsQuery = supabase
        .from('analytics')
        .select(`
          *,
          projects!inner(
            id,
            title,
            end_client_id,
            end_clients!inner(
              id,
              name,
              company,
              creator_id
            )
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (projectId) {
        analyticsQuery.eq('project_id', projectId);
      } else if (clientId) {
        analyticsQuery.eq('projects.end_client_id', clientId);
      } else if (creatorId) {
        analyticsQuery.eq('projects.end_clients.creator_id', creatorId);
      }

      // Also fetch imported analytics
      const importedAnalyticsQuery = supabase
        .from('imported_analytics')
        .select(`
          *,
          projects!inner(
            id,
            title,
            end_client_id,
            end_clients!inner(
              id,
              name,
              company,
              creator_id
            )
          )
        `)
        .gte('created_at', twoDaysAgoISO)
        .order('created_at', { ascending: false });

      if (projectId) {
        importedAnalyticsQuery.eq('project_id', projectId);
      } else if (clientId) {
        importedAnalyticsQuery.eq('projects.end_client_id', clientId);
      } else if (creatorId) {
        importedAnalyticsQuery.eq('projects.end_clients.creator_id', creatorId);
      }

      const [analyticsResult, importedResult] = await Promise.all([
        analyticsQuery,
        importedAnalyticsQuery
      ]);

      if (analyticsResult.error) throw analyticsResult.error;
      if (importedResult.error) throw importedResult.error;

      const analytics = analyticsResult.data || [];
      const importedAnalytics = importedResult.data || [];

      // Convert imported analytics to the same format as regular analytics
      const convertedImportedAnalytics = importedAnalytics.flatMap(item => {
        const converted = [];
        
        if (item.pv > 0) {
          converted.push({
            id: `${item.id}_pv`,
            metric_type: 'view',
            metric_value: item.pv,
            date: item.date,
            created_at: item.created_at,
            project_id: item.project_id,
            projects: item.projects
          });
        }
        
        if (item.uv > 0) {
          converted.push({
            id: `${item.id}_uv`,
            metric_type: 'unique_visitor',
            metric_value: item.uv,
            date: item.date,
            created_at: item.created_at,
            project_id: item.project_id,
            projects: item.projects
          });
        }
        
        if (item.avg_duration > 0) {
          converted.push({
            id: `${item.id}_time`,
            metric_type: 'time_spent',
            metric_value: item.avg_duration,
            date: item.date,
            created_at: item.created_at,
            project_id: item.project_id,
            projects: item.projects
          });
        }
        
        return converted;
      });

      // Combine both analytics arrays
      const allAnalytics = [...analytics, ...convertedImportedAnalytics];

      // Convert projects to activities
      projects?.forEach(project => {
        allActivities.push({
          id: `project-${project.id}`,
          type: 'project_created',
          title: `Project "${project.title}" created`,
          description: `New project created for ${project.end_clients.name}`,
          timestamp: project.created_at,
          metadata: {
            projectId: project.id,
            projectTitle: project.title,
            clientId: project.end_client_id,
            clientName: project.end_clients.name,
            status: project.status
          },
          icon: {
            component: 'Plus',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
          },
          priority: 'medium'
        });

        if (project.updated_at !== project.created_at) {
          allActivities.push({
            id: `project-updated-${project.id}`,
            type: 'project_updated',
            title: `Project "${project.title}" updated`,
            description: `Project status changed to ${project.status}`,
            timestamp: project.updated_at,
            metadata: {
              projectId: project.id,
              projectTitle: project.title,
              clientId: project.end_client_id,
              clientName: project.end_clients.name,
              status: project.status
            },
            icon: {
              component: 'Edit',
              color: 'text-blue-600 dark:text-blue-400',
              bgColor: 'bg-blue-100 dark:bg-blue-900/20'
            },
            priority: 'low'
          });
        }
      });

      // Convert chatbots to activities
      chatbots?.forEach(chatbot => {
        allActivities.push({
          id: `chatbot-${chatbot.id}`,
          type: 'chatbot_created',
          title: `Chatbot "${chatbot.name}" created`,
          description: `AI assistant created for project "${chatbot.projects.title}"`,
          timestamp: chatbot.created_at,
          metadata: {
            projectId: chatbot.project_id,
            projectTitle: chatbot.projects.title,
            clientId: chatbot.projects.end_client_id,
            clientName: chatbot.projects.end_clients.name,
            status: chatbot.status
          },
          icon: {
            component: 'Bot',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
          },
          priority: 'medium'
        });

        if (chatbot.updated_at !== chatbot.created_at) {
          allActivities.push({
            id: `chatbot-updated-${chatbot.id}`,
            type: 'chatbot_updated',
            title: `Chatbot "${chatbot.name}" updated`,
            description: `Chatbot status changed to ${chatbot.status}`,
            timestamp: chatbot.updated_at,
            metadata: {
              projectId: chatbot.project_id,
              projectTitle: chatbot.projects.title,
              clientId: chatbot.projects.end_client_id,
              clientName: chatbot.projects.end_clients.name,
              status: chatbot.status
            },
            icon: {
              component: 'Settings',
              color: 'text-blue-600 dark:text-blue-400',
              bgColor: 'bg-blue-100 dark:bg-blue-900/20'
            },
            priority: 'low'
          });
        }
      });

      // Convert leads to activities
      leads?.forEach(lead => {
        allActivities.push({
          id: `lead-${lead.id}`,
          type: 'lead_captured',
          title: `New lead captured`,
          description: `${lead.visitor_name || 'Anonymous visitor'} from "${lead.chatbots.projects.title}"`,
          timestamp: lead.created_at,
          metadata: {
            projectId: lead.chatbots.project_id,
            projectTitle: lead.chatbots.projects.title,
            clientId: lead.chatbots.projects.end_client_id,
            clientName: lead.chatbots.projects.end_clients.name,
            leadName: lead.visitor_name,
            leadEmail: lead.visitor_email,
            leadScore: lead.lead_score
          },
          icon: {
            component: 'UserPlus',
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
          },
          priority: 'high'
        });
      });

      // Convert requests to activities
      requests?.forEach(request => {
        allActivities.push({
          id: `request-${request.id}`,
          type: 'request_submitted',
          title: `New request: "${request.title}"`,
          description: `Request submitted for project "${request.projects.title}"`,
          timestamp: request.created_at,
          metadata: {
            projectId: request.project_id,
            projectTitle: request.projects.title,
            clientId: request.end_client_id,
            clientName: request.projects.end_clients.name,
            requestType: request.request_type,
            priority: request.priority,
            status: request.status
          },
          icon: {
            component: 'MessageSquare',
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
          },
          priority: request.priority === 'urgent' ? 'high' : request.priority === 'high' ? 'medium' : 'low'
        });

        if (request.updated_at !== request.created_at) {
          allActivities.push({
            id: `request-updated-${request.id}`,
            type: 'request_updated',
            title: `Request updated: "${request.title}"`,
            description: `Request status changed to ${request.status}`,
            timestamp: request.updated_at,
            metadata: {
              projectId: request.project_id,
              projectTitle: request.projects.title,
              clientId: request.end_client_id,
              clientName: request.projects.end_clients.name,
              requestType: request.request_type,
              priority: request.priority,
              status: request.status
            },
            icon: {
              component: 'Edit',
              color: 'text-blue-600 dark:text-blue-400',
              bgColor: 'bg-blue-100 dark:bg-blue-900/20'
            },
            priority: 'low'
          });
        }
      });

      // Convert analytics to activities (show all analytics for now to demonstrate real data)
      const significantAnalytics = allAnalytics || [];

      significantAnalytics.forEach(analytics => {
        let title = '';
        let description = '';
        let icon = { component: 'BarChart3', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };

        if (analytics.metric_type === 'view') {
          title = `${analytics.metric_value} views on "${analytics.projects.title}"`;
          description = `Project received traffic`;
          icon = { component: 'Eye', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
        } else if (analytics.metric_type === 'unique_visitor') {
          title = `${analytics.metric_value} unique visitors on "${analytics.projects.title}"`;
          description = `Project attracted new visitors`;
          icon = { component: 'Users', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' };
        } else if (analytics.metric_type === 'lead_generated') {
          title = `${analytics.metric_value} leads generated from "${analytics.projects.title}"`;
          description = `New leads captured through chatbot`;
          icon = { component: 'UserPlus', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/20' };
        } else if (analytics.metric_type === 'chatbot_interaction') {
          title = `${analytics.metric_value} chatbot interactions on "${analytics.projects.title}"`;
          description = `Visitors engaged with the chatbot`;
          icon = { component: 'MessageSquare', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
        } else if (analytics.metric_type === 'time_spent') {
          title = `${analytics.metric_value} minutes spent on "${analytics.projects.title}"`;
          description = `Average time visitors spent on project`;
          icon = { component: 'Clock', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
        } else if (analytics.metric_type === 'hotspot_click') {
          title = `${analytics.metric_value} hotspot clicks on "${analytics.projects.title}"`;
          description = `Visitors interacted with hotspots`;
          icon = { component: 'Award', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' };
        }

        allActivities.push({
          id: `analytics-${analytics.id}`,
          type: 'analytics_interaction',
          title,
          description,
          timestamp: analytics.created_at,
          metadata: {
            projectId: analytics.project_id,
            projectTitle: analytics.projects.title,
            clientId: analytics.projects.end_client_id,
            clientName: analytics.projects.end_clients.name,
            metricType: analytics.metric_type,
            metricValue: analytics.metric_value
          },
          icon,
          priority: 'medium'
        });
      });

      // Sort by timestamp (most recent first)
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply filters
      let filteredActivities = allActivities;

      if (filters?.types && filters.types.length > 0) {
        filteredActivities = filteredActivities.filter(activity => 
          filters.types!.includes(activity.type)
        );
      }

      if (filters?.priority && filters.priority.length > 0) {
        filteredActivities = filteredActivities.filter(activity => 
          filters.priority!.includes(activity.priority)
        );
      }

      if (filters?.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filteredActivities = filteredActivities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= startDate && activityDate <= endDate;
        });
      }

      // Apply limit
      filteredActivities = filteredActivities.slice(0, limit);

      setActivities(filteredActivities);

    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const debouncedRefresh = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[RecentActivity] Real-time update triggered');
      fetchActivities();
    }, 1000); // 1 second debounce
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [clientId, projectId, creatorId, limit, JSON.stringify(filters)]);

  // Real-time subscriptions
  useEffect(() => {
    if (!clientId && !projectId && !creatorId) return;

    console.log('[RecentActivity] Setting up real-time subscriptions');

    const channel = supabase
      .channel('recent-activity-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[RecentActivity] Analytics change detected:', payload);
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
          console.log('[RecentActivity] Imported analytics change detected:', payload);
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
          console.log('[RecentActivity] Project change detected:', payload);
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
          console.log('[RecentActivity] Chatbot change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[RecentActivity] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[RecentActivity] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [clientId, projectId, creatorId, debouncedRefresh]);

  const stats: ActivityStats = useMemo(() => {
    const total = activities.length;
    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<ActivityType, number>);

    const byPriority = activities.reduce((acc, activity) => {
      acc[activity.priority] = (acc[activity.priority] || 0) + 1;
      return acc;
    }, {} as Record<'low' | 'medium' | 'high', number>);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentCount = activities.filter(activity => 
      new Date(activity.timestamp) > oneDayAgo
    ).length;

    return {
      total,
      byType,
      byPriority,
      recentCount
    };
  }, [activities]);

  const refresh = () => {
    fetchActivities();
  };

  return {
    activities,
    loading,
    error,
    stats,
    refresh
  };
};
