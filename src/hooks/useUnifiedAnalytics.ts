import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UnifiedAnalyticsData {
  totalViews: number;
  totalVisitors: number;
  avgEngagementTime: number;
  totalLeads: number;
  conversionRate: number;
  avgSatisfaction: number;
  lastActivity: string | null;
  loading: boolean;
  error: string | null;
}

interface UseUnifiedAnalyticsOptions {
  projectId?: string;
  endClientId?: string;
  creatorId?: string;
}

export const useUnifiedAnalytics = (options: UseUnifiedAnalyticsOptions): UnifiedAnalyticsData => {
  const [data, setData] = useState<UnifiedAnalyticsData>({
    totalViews: 0,
    totalVisitors: 0,
    avgEngagementTime: 0,
    totalLeads: 0,
    conversionRate: 0,
    avgSatisfaction: 0,
    lastActivity: null,
    loading: true,
    error: null
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      console.log('🔄 [useUnifiedAnalytics] Fetching data for:', options);

      // Build query conditions
      const conditions: any = {};
      if (options.projectId) conditions.project_id = options.projectId;
      if (options.endClientId) conditions.end_client_id = options.endClientId;
      if (options.creatorId) conditions.creator_id = options.creatorId;

      // Fetch from both tables
      const [analyticsResult, importedResult] = await Promise.all([
        supabase
          .from('analytics')
          .select('*')
          .match(conditions),
        supabase
          .from('imported_analytics')
          .select('*')
          .match(conditions)
      ]);

      if (analyticsResult.error) {
        console.error('❌ [useUnifiedAnalytics] Analytics error:', analyticsResult.error);
        throw analyticsResult.error;
      }

      if (importedResult.error) {
        console.error('❌ [useUnifiedAnalytics] Imported analytics error:', importedResult.error);
        throw importedResult.error;
      }

      // Process analytics data
      const processedAnalytics: any[] = [];
      
      // Add regular analytics
      if (analyticsResult.data) {
        processedAnalytics.push(...analyticsResult.data);
      }

      // Convert imported analytics to same format
      if (importedResult.data) {
        importedResult.data.forEach(item => {
          // Add page views
          if (item.page_views > 0) {
            processedAnalytics.push({
              id: `${item.id}_pv`,
              metric_type: 'view',
              metric_value: item.page_views,
              date: item.date,
              project_id: item.project_id,
              end_client_id: item.end_client_id,
              created_at: item.created_at
            });
          }
          // Add unique visitors
          if (item.visitors > 0) {
            processedAnalytics.push({
              id: `${item.id}_uv`,
              metric_type: 'unique_visitor',
              metric_value: item.visitors,
              date: item.date,
              project_id: item.project_id,
              end_client_id: item.end_client_id,
              created_at: item.created_at
            });
          }
          // Add time spent
          if (item.avg_time > 0) {
            processedAnalytics.push({
              id: `${item.id}_time`,
              metric_type: 'time_spent',
              metric_value: item.avg_time,
              date: item.date,
              project_id: item.project_id,
              end_client_id: item.end_client_id,
              created_at: item.created_at
            });
          }
        });
      }

      // Calculate unified metrics
      const totalViews = processedAnalytics
        .filter(item => item.metric_type === 'view')
        .reduce((sum, item) => sum + item.metric_value, 0);

      const totalVisitors = processedAnalytics
        .filter(item => item.metric_type === 'unique_visitor')
        .reduce((sum, item) => sum + item.metric_value, 0);

      const timeSpentData = processedAnalytics.filter(item => item.metric_type === 'time_spent');
      const avgEngagementTime = timeSpentData.length > 0
        ? timeSpentData.reduce((sum, item) => sum + item.metric_value, 0) / timeSpentData.length
        : 0;

      const totalLeads = processedAnalytics
        .filter(item => item.metric_type === 'lead_generated')
        .reduce((sum, item) => sum + item.metric_value, 0);

      const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      const satisfactionData = processedAnalytics.filter(item => item.metric_type === 'satisfaction');
      const avgSatisfaction = satisfactionData.length > 0
        ? satisfactionData.reduce((sum, item) => sum + item.metric_value, 0) / satisfactionData.length
        : 0;

      const lastActivity = processedAnalytics.length > 0
        ? processedAnalytics.reduce((latest, item) => 
            new Date(item.created_at) > new Date(latest.created_at) ? item : latest
          ).created_at
        : null;

      const result = {
        totalViews,
        totalVisitors,
        avgEngagementTime: Math.round(avgEngagementTime),
        totalLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
        lastActivity,
        loading: false,
        error: null
      };

      console.log('✅ [useUnifiedAnalytics] Calculated unified metrics:', result);

      setData(result);

    } catch (error) {
      console.error('💥 [useUnifiedAnalytics] Error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [options.projectId, options.endClientId, options.creatorId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!options.projectId && !options.endClientId && !options.creatorId) return;

    // Clean up existing channel
    if (channel) {
      supabase.removeChannel(channel);
    }

    // Create new channel for real-time updates
    const newChannel = supabase
      .channel('unified-analytics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analytics' },
        (payload) => {
          console.log('🔄 [useUnifiedAnalytics] Analytics change detected:', payload);
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'imported_analytics' },
        (payload) => {
          console.log('🔄 [useUnifiedAnalytics] Imported analytics change detected:', payload);
          fetchAnalytics();
        }
      )
      .subscribe();

    setChannel(newChannel);

    // Initial fetch
    fetchAnalytics();

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [fetchAnalytics]);

  return data;
};

