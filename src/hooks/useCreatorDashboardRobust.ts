/**
 * Robust Creator Dashboard Hook
 * Uses safe database utilities to prevent query failures
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface CreatorDashboardStats {
  totalViews: number;
  totalLeads: number;
  totalRequests: number;
  totalProjects: number;
  totalClients: number;
}

export function useCreatorDashboard(userId: string | null) {
  const [data, setData] = useState<CreatorDashboardData>({
    creator: null,
    clients: [],
    projects: [],
    chatbots: [],
    leads: [],
    analytics: [],
    requests: [],
    assets: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [stats, setStats] = useState<CreatorDashboardStats>({
    totalViews: 0,
    totalLeads: 0,
    totalRequests: 0,
    totalProjects: 0,
    totalClients: 0,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchCreatorData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // STEP 1: Get creator profile safely
        const creatorResult = await safeSingleQuery<Creator>(
          'creators',
          '*',
          { user_id: userId },
          { fallbackToEmpty: false, retryAttempts: 2 }
        );

        if (!creatorResult.success || !creatorResult.data) {
          throw new Error(creatorResult.error || 'Creator profile not found');
        }

        const creator = creatorResult.data;

        // STEP 2: Get all related data in parallel with safe queries
        const [
          clientsResult,
          projectsResult,
          chatbotsResult,
          analyticsResult,
          requestsResult,
          leadsResult,
          assetsResult
        ] = await Promise.all([
          // Clients
          safeMultiQuery<EndClient>(
            'end_clients',
            '*',
            { creator_id: creator.id },
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Projects - need to get through end_clients relationship
          safeQuery(
            () => supabase
              .from('projects')
              .select(`
                *,
                end_clients!inner(
                  id,
                  creator_id
                )
              `)
              .eq('end_clients.creator_id', creator.id),
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Chatbots - need to get through projects relationship
          safeQuery(
            () => supabase
              .from('chatbots')
              .select(`
                *,
                projects!inner(
                  id,
                  end_clients!inner(
                    id,
                    creator_id
                  )
                )
              `)
              .eq('projects.end_clients.creator_id', creator.id),
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Analytics - need to get through projects relationship
          safeQuery(
            () => supabase
              .from('analytics')
              .select(`
                *,
                projects!inner(
                  id,
                  end_clients!inner(
                    id,
                    creator_id
                  )
                )
              `)
              .eq('projects.end_clients.creator_id', creator.id),
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Requests - need to get through projects relationship
          safeQuery(
            () => supabase
              .from('requests')
              .select(`
                *,
                projects!inner(
                  id,
                  end_clients!inner(
                    id,
                    creator_id
                  )
                )
              `)
              .eq('projects.end_clients.creator_id', creator.id),
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Leads - need to get through chatbots relationship
          safeQuery(
            () => supabase
              .from('leads')
              .select(`
                *,
                chatbots!inner(
                  id,
                  projects!inner(
                    id,
                    end_clients!inner(
                      id,
                      creator_id
                    )
                  )
                )
              `)
              .eq('chatbots.projects.end_clients.creator_id', creator.id),
            { fallbackToEmpty: true, retryAttempts: 1 }
          ),

          // Assets
          safeMultiQuery<Asset>(
            'assets',
            '*',
            { creator_id: creator.id },
            { fallbackToEmpty: true, retryAttempts: 1 }
          )
        ]);

        // STEP 3: Extract data with fallbacks
        const clients = clientsResult.success ? (clientsResult.data || []) : [];
        const projects = projectsResult.success ? (projectsResult.data || []) : [];
        const chatbots = chatbotsResult.success ? (chatbotsResult.data || []) : [];
        const analytics = analyticsResult.success ? (analyticsResult.data || []) : [];
        const requests = requestsResult.success ? (requestsResult.data || []) : [];
        const leads = leadsResult.success ? (leadsResult.data || []) : [];
        const assets = assetsResult.success ? (assetsResult.data || []) : [];

        // STEP 4: Log any non-critical errors (but don't fail)
        const errors = [
          { name: 'clients', result: clientsResult },
          { name: 'projects', result: projectsResult },
          { name: 'chatbots', result: chatbotsResult },
          { name: 'analytics', result: analyticsResult },
          { name: 'requests', result: requestsResult },
          { name: 'leads', result: leadsResult },
          { name: 'assets', result: assetsResult }
        ].filter(({ result }) => !result.success);

        if (errors.length > 0) {
          console.warn('Some data failed to load (using empty arrays):', 
            errors.map(({ name, result }) => `${name}: ${result.error}`).join(', ')
          );
        }

        // STEP 5: Calculate statistics
        const totalViews = analytics
          .filter(a => a.metric_type === 'view')
          .reduce((sum, a) => sum + a.metric_value, 0);

        const newStats: CreatorDashboardStats = {
          totalViews,
          totalLeads: leads.length,
          totalRequests: requests.length,
          totalProjects: projects.length,
          totalClients: clients.length,
        };

        // STEP 6: Update state
        setData({
          creator,
          clients,
          projects,
          chatbots,
          leads,
          analytics,
          requests,
          assets,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });

        setStats(newStats);

      } catch (error: any) {
        console.error('Error fetching creator data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load dashboard data',
        }));
      }
    };

    // Debounce the fetch to prevent rapid successive calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchCreatorData();
    }, 100);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [userId]);

  const refreshData = useCallback(async () => {
    console.log('[useCreatorDashboardRobust] refreshData called for userId:', userId);
    if (userId) {
      const fetchCreatorData = async () => {
        try {
          console.log('[useCreatorDashboardRobust] Starting refresh...');
          setData(prev => ({ ...prev, isLoading: true, error: null }));

          // Same logic as above but for refresh
          const creatorResult = await safeSingleQuery<Creator>(
            'creators',
            '*',
            { user_id: userId },
            { fallbackToEmpty: false, retryAttempts: 1 }
          );

          if (!creatorResult.success || !creatorResult.data) {
            throw new Error(creatorResult.error || 'Creator profile not found');
          }

          const creator = creatorResult.data;

          // Get all data in parallel
          const [
            clientsResult,
            projectsResult,
            chatbotsResult,
            analyticsResult,
            requestsResult,
            leadsResult,
            assetsResult
          ] = await Promise.all([
            safeMultiQuery<EndClient>('end_clients', '*', { creator_id: creator.id }, { fallbackToEmpty: true }),
            safeQuery(
              () => supabase
                .from('projects')
                .select(`
                  *,
                  end_clients!inner(
                    id,
                    creator_id
                  )
                `)
                .eq('end_clients.creator_id', creator.id),
              { fallbackToEmpty: true }
            ),
            safeQuery(
              () => supabase
                .from('chatbots')
                .select(`
                  *,
                  projects!inner(
                    id,
                    end_clients!inner(
                      id,
                      creator_id
                    )
                  )
                `)
                .eq('projects.end_clients.creator_id', creator.id),
              { fallbackToEmpty: true }
            ),
            safeQuery(
              () => supabase
                .from('analytics')
                .select(`
                  *,
                  projects!inner(
                    id,
                    end_clients!inner(
                      id,
                      creator_id
                    )
                  )
                `)
                .eq('projects.end_clients.creator_id', creator.id),
              { fallbackToEmpty: true }
            ),
            safeQuery(
              () => supabase
                .from('requests')
                .select(`
                  *,
                  projects!inner(
                    id,
                    end_clients!inner(
                      id,
                      creator_id
                    )
                  )
                `)
                .eq('projects.end_clients.creator_id', creator.id),
              { fallbackToEmpty: true }
            ),
            safeQuery(
              () => supabase
                .from('leads')
                .select(`
                  *,
                  chatbots!inner(
                    id,
                    projects!inner(
                      id,
                      end_clients!inner(
                        id,
                        creator_id
                      )
                    )
                  )
                `)
                .eq('chatbots.projects.end_clients.creator_id', creator.id),
              { fallbackToEmpty: true }
            ),
            safeMultiQuery<Asset>('assets', '*', { creator_id: creator.id }, { fallbackToEmpty: true })
          ]);

          // Extract data with fallbacks
          const clients = clientsResult.success ? (clientsResult.data || []) : [];
          const projects = projectsResult.success ? (projectsResult.data || []) : [];
          const chatbots = chatbotsResult.success ? (chatbotsResult.data || []) : [];
          const analytics = analyticsResult.success ? (analyticsResult.data || []) : [];
          const requests = requestsResult.success ? (requestsResult.data || []) : [];
          const leads = leadsResult.success ? (leadsResult.data || []) : [];
          const assets = assetsResult.success ? (assetsResult.data || []) : [];

          // Calculate statistics
          const totalViews = analytics
            .filter(a => a.metric_type === 'view')
            .reduce((sum, a) => sum + a.metric_value, 0);

          const newStats: CreatorDashboardStats = {
            totalViews,
            totalLeads: leads.length,
            totalRequests: requests.length,
            totalProjects: projects.length,
            totalClients: clients.length,
          };

          setData({
            creator,
            clients,
            projects,
            chatbots,
            leads,
            analytics,
            requests,
            assets,
            isLoading: false,
            error: null,
            lastUpdated: new Date(),
          });

          setStats(newStats);

        } catch (error: any) {
          console.error('Error refreshing creator data:', error);
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to refresh dashboard data',
          }));
        }
      };

      await fetchCreatorData();
    }
  }, [userId]);

  return {
    ...data,
    stats,
    refreshData,
  };
}
