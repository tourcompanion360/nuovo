/**
 * Database Service Layer
 * Centralized database operations with proper error handling and type safety
 */

import { supabase } from '@/integrations/supabase/client';
import { api } from '../api';
import type { 
  Creator, 
  EndClient, 
  Project, 
  Chatbot, 
  Lead, 
  Analytics, 
  Request, 
  Asset,
  CreatorInsert,
  EndClientInsert,
  ProjectInsert,
  ChatbotInsert,
  LeadInsert,
  AnalyticsInsert,
  RequestInsert,
  AssetInsert,
  CreatorUpdate,
  EndClientUpdate,
  ProjectUpdate,
  ChatbotUpdate,
  LeadUpdate,
  AnalyticsUpdate,
  RequestUpdate,
  AssetUpdate,
} from '@/integrations/supabase/types';

// Database service class
class DatabaseService {
  // =============================================================================
  // CREATORS
  // =============================================================================
  
  async getCreator(userId: string) {
    return api.execute(() =>
      supabase
        .from('creators')
        .select('*')
        .eq('user_id', userId)
        .single()
    );
  }

  async createCreator(data: CreatorInsert) {
    return api.execute(() =>
      supabase
        .from('creators')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateCreator(id: string, data: CreatorUpdate) {
    return api.execute(() =>
      supabase
        .from('creators')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  // =============================================================================
  // END CLIENTS
  // =============================================================================
  
  async getClients(creatorId: string) {
    return api.execute(() =>
      supabase
        .from('end_clients')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
    );
  }

  async getClient(id: string) {
    return api.execute(() =>
      supabase
        .from('end_clients')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createClient(data: EndClientInsert) {
    return api.execute(() =>
      supabase
        .from('end_clients')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateClient(id: string, data: EndClientUpdate) {
    return api.execute(() =>
      supabase
        .from('end_clients')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteClient(id: string) {
    return api.execute(() =>
      supabase
        .from('end_clients')
        .delete()
        .eq('id', id)
    );
  }

  // =============================================================================
  // PROJECTS
  // =============================================================================
  
  async getProjects(clientId: string) {
    return api.execute(() =>
      supabase
        .from('projects')
        .select('*')
        .eq('end_client_id', clientId)
        .order('created_at', { ascending: false })
    );
  }

  async getProject(id: string) {
    return api.execute(() =>
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createProject(data: ProjectInsert) {
    return api.execute(() =>
      supabase
        .from('projects')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateProject(id: string, data: ProjectUpdate) {
    return api.execute(() =>
      supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteProject(id: string) {
    return api.execute(() =>
      supabase
        .from('projects')
        .delete()
        .eq('id', id)
    );
  }

  // =============================================================================
  // CHATBOTS
  // =============================================================================
  
  async getChatbots(projectId: string) {
    return api.execute(() =>
      supabase
        .from('chatbots')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
    );
  }

  async getChatbot(id: string) {
    return api.execute(() =>
      supabase
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createChatbot(data: ChatbotInsert) {
    return api.execute(() =>
      supabase
        .from('chatbots')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateChatbot(id: string, data: ChatbotUpdate) {
    return api.execute(() =>
      supabase
        .from('chatbots')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteChatbot(id: string) {
    return api.execute(() =>
      supabase
        .from('chatbots')
        .delete()
        .eq('id', id)
    );
  }

  // =============================================================================
  // LEADS
  // =============================================================================
  
  async getLeads(chatbotId: string) {
    return api.execute(() =>
      supabase
        .from('leads')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })
    );
  }

  async getLead(id: string) {
    return api.execute(() =>
      supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createLead(data: LeadInsert) {
    return api.execute(() =>
      supabase
        .from('leads')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateLead(id: string, data: LeadUpdate) {
    return api.execute(() =>
      supabase
        .from('leads')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  // =============================================================================
  // ANALYTICS
  // =============================================================================
  
  async getAnalytics(projectId: string) {
    return api.execute(() =>
      supabase
        .from('analytics')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })
    );
  }

  async createAnalytics(data: AnalyticsInsert) {
    return api.execute(() =>
      supabase
        .from('analytics')
        .insert(data)
        .select()
        .single()
    );
  }

  async trackAnalytics(projectId: string, metricType: string, value: number, metadata?: any) {
    return api.execute(() =>
      supabase.rpc('track_analytics', {
        project_uuid: projectId,
        metric_type_param: metricType,
        metric_value_param: value,
        metadata_param: metadata,
      })
    );
  }

  // =============================================================================
  // REQUESTS
  // =============================================================================
  
  async getRequests(projectId: string) {
    return api.execute(() =>
      supabase
        .from('requests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
    );
  }

  async getRequest(id: string) {
    return api.execute(() =>
      supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createRequest(data: RequestInsert) {
    return api.execute(() =>
      supabase
        .from('requests')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateRequest(id: string, data: RequestUpdate) {
    return api.execute(() =>
      supabase
        .from('requests')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteRequest(id: string) {
    return api.execute(() =>
      supabase
        .from('requests')
        .delete()
        .eq('id', id)
    );
  }

  // =============================================================================
  // ASSETS
  // =============================================================================
  
  async getAssets(creatorId: string) {
    return api.execute(() =>
      supabase
        .from('assets')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
    );
  }

  async getAsset(id: string) {
    return api.execute(() =>
      supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async createAsset(data: AssetInsert) {
    return api.execute(() =>
      supabase
        .from('assets')
        .insert(data)
        .select()
        .single()
    );
  }

  async updateAsset(id: string, data: AssetUpdate) {
    return api.execute(() =>
      supabase
        .from('assets')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async deleteAsset(id: string) {
    return api.execute(() =>
      supabase
        .from('assets')
        .delete()
        .eq('id', id)
    );
  }

  // =============================================================================
  // COMPLEX QUERIES
  // =============================================================================
  
  async getCreatorWithAllData(userId: string) {
    return api.execute(() =>
      supabase
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
        .single()
    );
  }

  async getAnalyticsSummary(creatorId: string) {
    return api.execute(() =>
      supabase
        .from('analytics_summary')
        .select('*')
        .eq('creator_id', creatorId)
    );
  }

  async getClientStats(clientId: string) {
    return api.execute(() =>
      supabase.rpc('get_client_stats', { client_id: clientId })
    );
  }

  async getCreatorStats(userId: string) {
    return api.execute(() =>
      supabase.rpc('get_creator_stats', { creator_user_id: userId })
    );
  }
}

// Create singleton instance
export const db = new DatabaseService();

// Export types
export type {
  Creator,
  EndClient,
  Project,
  Chatbot,
  Lead,
  Analytics,
  Request,
  Asset,
  CreatorInsert,
  EndClientInsert,
  ProjectInsert,
  ChatbotInsert,
  LeadInsert,
  AnalyticsInsert,
  RequestInsert,
  AssetInsert,
  CreatorUpdate,
  EndClientUpdate,
  ProjectUpdate,
  ChatbotUpdate,
  LeadUpdate,
  AnalyticsUpdate,
  RequestUpdate,
  AssetUpdate,
};

