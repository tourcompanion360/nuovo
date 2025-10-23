import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  views: number;
  end_client_id: string;
  created_at: string;
}

interface DashboardData {
  creator: Creator | null;
  clients: Client[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useCreatorDashboardSimple = (userId: string): DashboardData => {
  const [data, setData] = useState<DashboardData>({
    creator: null,
    clients: [],
    projects: [],
    isLoading: true,
    error: null,
    refreshData: () => {},
  });

  const fetchData = useCallback(async () => {
    if (!userId) {
      console.log('⚠️ [Simple Dashboard] No userId provided');
      setData(prev => ({ ...prev, isLoading: false, error: 'No user ID provided' }));
      return;
    }

    console.log('🔍 [Simple Dashboard] Starting fetch for userId:', userId);

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Step 1: Get creator profile
      console.log('📋 [Simple Dashboard] Fetching creator...');
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id, agency_name, contact_email, user_id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (creatorError) {
        console.error('❌ [Simple Dashboard] Creator fetch error:', creatorError);
        throw new Error(`Failed to fetch creator: ${creatorError.message}`);
      }

      if (!creator) {
        throw new Error('Creator profile not found');
      }

      console.log('✅ [Simple Dashboard] Creator fetched:', creator.agency_name);

      // Step 2: Get clients
      console.log('👥 [Simple Dashboard] Fetching clients...');
      const { data: clients, error: clientsError } = await supabase
        .from('end_clients')
        .select('*')
        .eq('creator_id', creator.id);

      if (clientsError) {
        console.error('❌ [Simple Dashboard] Clients fetch error:', clientsError);
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }

      console.log('✅ [Simple Dashboard] Clients fetched:', clients?.length || 0);

      // Step 3: Get projects
      console.log('📁 [Simple Dashboard] Fetching projects...');
      let projects: Project[] = [];
      if (clients && clients.length > 0) {
        const clientIds = clients.map(c => c.id);
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('end_client_id', clientIds);

        if (projectsError) {
          console.error('❌ [Simple Dashboard] Projects fetch error:', projectsError);
          throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }

        projects = projectsData || [];
        console.log('✅ [Simple Dashboard] Projects fetched:', projects.length);
      }

      const finalData: DashboardData = {
        creator,
        clients: clients || [],
        projects,
        isLoading: false,
        error: null,
        refreshData: () => {},
      };

      console.log('✅ [Simple Dashboard] Data fetch complete:', {
        creator: finalData.creator.agency_name,
        clientsCount: finalData.clients.length,
        projectsCount: finalData.projects.length
      });

      setData(finalData);

    } catch (error) {
      console.error('🚨 [Simple Dashboard] Error:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [userId]);

  const refreshData = useCallback(() => {
    console.log('🔄 [Simple Dashboard] Manual refresh triggered');
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    refreshData,
  };
};