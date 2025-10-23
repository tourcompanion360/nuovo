import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Creator {
  id: string;
  user_id: string;
  agency_name: string;
  agency_logo?: string;
  contact_email: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  subscription_plan: 'basic' | 'pro';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

interface EndClient {
  id: string;
  creator_id: string;
  name: string;
  email: string;
  company: string;
  website?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  login_credentials?: any;
  created_at: string;
  updated_at: string;
  projects?: Project[];
}

interface Project {
  id: string;
  end_client_id: string;
  title: string;
  description?: string;
  project_type: 'virtual_tour' | '3d_showcase' | 'interactive_map';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  thumbnail_url?: string;
  tour_url?: string;
  settings?: any;
  views: number;
  created_at: string;
  updated_at: string;
  chatbots?: Chatbot[];
  analytics?: Analytics[];
  requests?: Request[];
}

interface Chatbot {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  language: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_style: string;
  position: string;
  avatar_url?: string;
  brand_logo_url?: string;
  response_style: string;
  max_questions: number;
  conversation_limit?: number;
  knowledge_base_text?: string;
  knowledge_base_files?: any;
  status: 'active' | 'inactive' | 'draft';
  statistics?: any;
  created_at: string;
  updated_at: string;
}

interface Analytics {
  id: string;
  project_id: string;
  date: string;
  metric_type: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated';
  metric_value: number;
  metadata?: any;
  created_at: string;
}

interface Request {
  id: string;
  project_id: string;
  end_client_id: string;
  title: string;
  description: string;
  request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  attachments?: any;
  creator_notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  chatbot_id: string;
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  company?: string;
  question_asked: string;
  chatbot_response?: string;
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  chatbots?: {
    id: string;
    name: string;
    projects?: {
      id: string;
      title: string;
      end_clients?: {
        id: string;
        creator_id: string;
      };
    };
  };
}

interface Asset {
  id: string;
  creator_id: string;
  project_id?: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  tags: string[];
  metadata?: any;
  created_at: string;
}

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

export function useCreatorDashboardOptimized(userId: string | null) {
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchCreatorData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // OPTIMIZED: Single query to get creator with all related data
        const { data: creatorWithData, error: creatorDataError } = await supabase
          .from('creators')
          .select(`
            *,
            end_clients(
              id,
              name,
              email,
              company,
              website,
              phone,
              avatar,
              status,
              created_at,
              updated_at,
              projects(
                id,
                title,
                description,
                project_type,
                status,
                thumbnail_url,
                tour_url,
                settings,
                views,
                created_at,
                updated_at,
                chatbots(
                  id,
                  name,
                  description,
                  language,
                  welcome_message,
                  fallback_message,
                  primary_color,
                  widget_style,
                  position,
                  avatar_url,
                  brand_logo_url,
                  response_style,
                  max_questions,
                  conversation_limit,
                  knowledge_base_text,
                  knowledge_base_files,
                  status,
                  statistics,
                  created_at,
                  updated_at
                ),
                analytics(
                  id,
                  date,
                  metric_type,
                  metric_value,
                  metadata,
                  created_at
                ),
                requests(
                  id,
                  title,
                  description,
                  request_type,
                  priority,
                  status,
                  attachments,
                  creator_notes,
                  client_notes,
                  created_at,
                  updated_at
                )
              )
            ),
            assets(
              id,
              filename,
              original_filename,
              file_type,
              file_size,
              file_url,
              thumbnail_url,
              tags,
              metadata,
              created_at
            )
          `)
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (creatorDataError) {
          console.error('❌ Creator data fetch error:', creatorDataError);
          throw new Error(`Failed to fetch creator data: ${creatorDataError.message}`);
        }

        if (!creatorWithData) {
          throw new Error('Creator profile not found');
        }

        // Get leads separately (they need chatbot relationship)
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select(`
            *,
            chatbots!inner(
              id,
              name,
              projects!inner(
                id,
                title,
                end_clients!inner(
                  id,
                  creator_id
                )
              )
            )
          `)
          .eq('chatbots.projects.end_clients.creator_id', creatorWithData.id)
          .order('created_at', { ascending: false });

        if (leadsError) {
          console.warn('Failed to fetch leads:', leadsError.message);
        }

        // Extract and flatten data from the optimized query
        const clients = creatorWithData.end_clients || [];
        const projects = clients.flatMap(client => client.projects || []);
        const chatbots = projects.flatMap(project => project.chatbots || []);
        const analytics = projects.flatMap(project => project.analytics || []);
        const requests = projects.flatMap(project => project.requests || []);
        const assets = creatorWithData.assets || [];

        console.log('🔍 Dashboard data extraction:', {
          creator: creatorWithData.agency_name,
          clientsCount: clients.length,
          projectsCount: projects.length,
          chatbotsCount: chatbots.length,
          analyticsCount: analytics.length,
          clients: clients.map(c => ({ id: c.id, name: c.name, projects: c.projects?.length || 0 }))
        });

        // Calculate statistics
        const totalViews = analytics
          ?.filter(a => a.metric_type === 'view')
          .reduce((sum, a) => sum + a.metric_value, 0) || 0;

        const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

        setData({
          creator: creatorWithData,
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

        // Set up real-time subscription for updates
        setupRealtimeSubscription(creatorWithData.id);

      } catch (error) {
        console.error('Error fetching creator data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data',
        }));
      }
    };

    const setupRealtimeSubscription = (creatorId: string) => {
      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Create new subscription for real-time updates
      channelRef.current = supabase
        .channel(`creator-dashboard-${creatorId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `end_clients.creator_id=eq.${creatorId}`,
          },
          () => {
            // Debounce refresh to avoid too many updates
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              fetchCreatorData();
            }, 1000);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads',
          },
          () => {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              fetchCreatorData();
            }, 1000);
          }
        )
        .subscribe();
    };

    fetchCreatorData();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [userId]);

  const refreshData = () => {
    if (userId) {
      fetchCreatorData();
    }
  };

  return {
    ...data,
    refreshData,
  };
}
