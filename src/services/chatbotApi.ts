import { supabase } from '@/integrations/supabase/client';
import { 
  Chatbot, 
  ChatbotCreateRequest, 
  ChatbotUpdateRequest, 
  ChatbotApiResponse, 
  ChatbotListResponse,
  ChatbotChartData,
  ChatbotFilters,
  ChatbotSortOptions
} from '@/types/chatbot';

class ChatbotApiService {
  private readonly tableName = 'chatbots';
  private readonly maxChatbots = 5;

  // Get all chatbots for the current user
  async getChatbots(filters?: ChatbotFilters, sort?: ChatbotSortOptions): Promise<ChatbotListResponse> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', 'anonymous');

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }
      if (filters?.widget_style) {
        query = query.eq('widget_style', filters.widget_style);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        chatbots: data || [],
        total: data?.length || 0,
        limit: this.maxChatbots,
        has_more: (data?.length || 0) >= this.maxChatbots,
      };
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      throw new Error('Failed to fetch chatbots');
    }
  }

  // Get a single chatbot by ID
  async getChatbot(id: string): Promise<Chatbot> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', 'anonymous')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Chatbot not found');

      return data;
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      throw new Error('Failed to fetch chatbot');
    }
  }

  // Create a new chatbot
  async createChatbot(chatbotData: ChatbotCreateRequest): Promise<Chatbot> {
    try {
      // Check chatbot limit
      const { data: existingChatbots } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('user_id', 'anonymous');

      if (existingChatbots && existingChatbots.length >= this.maxChatbots) {
        throw new Error('Maximum chatbot limit reached');
      }

      const chatbotPayload = {
        ...chatbotData,
        user_id: 'anonymous',
        uploaded_files: [],
        statistics: {
          total_conversations: 0,
          active_users: 0,
          avg_response_time: 0,
          satisfaction_rate: 0,
          total_messages: 0,
          last_activity: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([chatbotPayload])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw new Error('Failed to create chatbot');
    }
  }

  // Update an existing chatbot
  async updateChatbot(id: string, updates: Partial<ChatbotCreateRequest>): Promise<Chatbot> {
    try {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', 'anonymous')
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Chatbot not found');

      return data;
    } catch (error) {
      console.error('Error updating chatbot:', error);
      throw new Error('Failed to update chatbot');
    }
  }

  // Delete a chatbot
  async deleteChatbot(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', 'anonymous');

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      throw new Error('Failed to delete chatbot');
    }
  }

  // Duplicate a chatbot
  async duplicateChatbot(id: string): Promise<Chatbot> {
    try {
      const originalChatbot = await this.getChatbot(id);
      
      const duplicatedData: ChatbotCreateRequest = {
        name: `${originalChatbot.name} (Copy)`,
        description: originalChatbot.description,
        language: originalChatbot.language,
        welcome_message: originalChatbot.welcome_message,
        fallback_message: originalChatbot.fallback_message,
        primary_color: originalChatbot.primary_color,
        widget_style: originalChatbot.widget_style,
        position: originalChatbot.position,
        avatar_url: originalChatbot.avatar_url,
        brand_logo_url: originalChatbot.brand_logo_url,
        knowledge_base_text: originalChatbot.knowledge_base_text,
        response_style: originalChatbot.response_style,
        max_questions: originalChatbot.max_questions,
        conversation_limit: originalChatbot.conversation_limit,
        status: 'draft',
      };

      return await this.createChatbot(duplicatedData);
    } catch (error) {
      console.error('Error duplicating chatbot:', error);
      throw new Error('Failed to duplicate chatbot');
    }
  }

  // Get chatbot statistics
  async getChatbotStatistics(id: string, startDate?: string, endDate?: string): Promise<ChatbotChartData[]> {
    try {
      // This would typically fetch from a separate statistics table
      // For now, we'll return mock data
      const mockData: ChatbotChartData[] = [
        {
          date: '2024-01-01',
          conversations: 25,
          users: 15,
          response_time: 2.5,
          satisfaction: 85,
        },
        {
          date: '2024-01-02',
          conversations: 30,
          users: 20,
          response_time: 2.1,
          satisfaction: 88,
        },
        {
          date: '2024-01-03',
          conversations: 35,
          users: 25,
          response_time: 1.9,
          satisfaction: 92,
        },
      ];

      return mockData;
    } catch (error) {
      console.error('Error fetching chatbot statistics:', error);
      throw new Error('Failed to fetch chatbot statistics');
    }
  }

  // Upload files for knowledge base
  async uploadFiles(files: File[]): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('chatbot-files')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('chatbot-files')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  }

  // Check if user can create more chatbots
  async canCreateMoreChatbots(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('user_id', 'anonymous');

      if (error) throw error;

      return (data?.length || 0) < this.maxChatbots;
    } catch (error) {
      console.error('Error checking chatbot limit:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatbotApiService = new ChatbotApiService();








