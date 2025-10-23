import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export const useRealtime = () => {
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);

  // Subscribe to leads table changes
  const subscribeToLeads = (
    callback: (payload: Record<string, unknown>) => void,
    filter?: { chatbot_id?: string; project_id?: string; end_client_id?: string }
  ) => {
    const channelName = 'leads';
    let filterString = '';

    if (filter) {
      if (filter.chatbot_id) {
        filterString = `chatbot_id=eq.${filter.chatbot_id}`;
      } else if (filter.project_id) {
        filterString = `project_id=eq.${filter.project_id}`;
      } else if (filter.end_client_id) {
        filterString = `end_client_id=eq.${filter.end_client_id}`;
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: filterString,
        },
        callback
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    const subscription: RealtimeSubscription = { channel, unsubscribe };
    subscriptionsRef.current.push(subscription);

    return subscription;
  };

  // Subscribe to analytics table changes
  const subscribeToAnalytics = (
    callback: (payload: Record<string, unknown>) => void,
    filter?: { project_id?: string; end_client_id?: string }
  ) => {
    const channelName = 'analytics';
    let filterString = '';

    if (filter) {
      if (filter.project_id) {
        filterString = `project_id=eq.${filter.project_id}`;
      } else if (filter.end_client_id) {
        filterString = `end_client_id=eq.${filter.end_client_id}`;
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
          filter: filterString,
        },
        callback
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    const subscription: RealtimeSubscription = { channel, unsubscribe };
    subscriptionsRef.current.push(subscription);

    return subscription;
  };

  // Subscribe to requests table changes
  const subscribeToRequests = (
    callback: (payload: Record<string, unknown>) => void,
    filter?: { end_client_id?: string; project_id?: string }
  ) => {
    const channelName = 'requests';
    let filterString = '';

    if (filter) {
      if (filter.end_client_id) {
        filterString = `end_client_id=eq.${filter.end_client_id}`;
      } else if (filter.project_id) {
        filterString = `project_id=eq.${filter.project_id}`;
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: filterString,
        },
        callback
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    const subscription: RealtimeSubscription = { channel, unsubscribe };
    subscriptionsRef.current.push(subscription);

    return subscription;
  };

  // Subscribe to projects table changes
  const subscribeToProjects = (
    callback: (payload: Record<string, unknown>) => void,
    filter?: { end_client_id?: string; creator_id?: string }
  ) => {
    const channelName = 'projects';
    let filterString = '';

    if (filter) {
      if (filter.end_client_id) {
        filterString = `end_client_id=eq.${filter.end_client_id}`;
      } else if (filter.creator_id) {
        filterString = `creator_id=eq.${filter.creator_id}`;
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: filterString,
        },
        callback
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    const subscription: RealtimeSubscription = { channel, unsubscribe };
    subscriptionsRef.current.push(subscription);

    return subscription;
  };

  // Subscribe to chatbots table changes
  const subscribeToChatbots = (
    callback: (payload: Record<string, unknown>) => void,
    filter?: { project_id?: string; end_client_id?: string }
  ) => {
    const channelName = 'chatbots';
    let filterString = '';

    if (filter) {
      if (filter.project_id) {
        filterString = `project_id=eq.${filter.project_id}`;
      } else if (filter.end_client_id) {
        filterString = `end_client_id=eq.${filter.end_client_id}`;
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
          filter: filterString,
        },
        callback
      )
      .subscribe();

    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };

    const subscription: RealtimeSubscription = { channel, unsubscribe };
    subscriptionsRef.current.push(subscription);

    return subscription;
  };

  // Track analytics event
  const trackAnalytics = async (
    projectId: string,
    metricType: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated',
    metricValue: number = 1,
    metadata: any = {}
  ) => {
    try {
      const { data, error } = await supabase.rpc('track_analytics', {
        project_uuid: projectId,
        metric_type_param: metricType,
        metric_value_param: metricValue,
        metadata_param: metadata,
      });

      if (error) {
        console.error('Error tracking analytics:', error);
      }

      return data;
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };

  // Cleanup all subscriptions
  const cleanup = () => {
    subscriptionsRef.current.forEach(({ unsubscribe }) => {
      unsubscribe();
    });
    subscriptionsRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    subscribeToLeads,
    subscribeToAnalytics,
    subscribeToRequests,
    subscribeToProjects,
    subscribeToChatbots,
    trackAnalytics,
    cleanup,
  };
};







