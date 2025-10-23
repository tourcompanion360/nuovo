// TypeScript interfaces for chatbot management system

export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_style: 'modern' | 'classic' | 'minimal' | 'bubble' | 'card';
  position: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';
  avatar_url?: string;
  brand_logo_url?: string;
  knowledge_base_text?: string;
  uploaded_files: string[];
  response_style: 'friendly' | 'professional' | 'casual' | 'formal' | 'helpful';
  max_questions: number;
  conversation_limit: number;
  status: 'active' | 'inactive' | 'draft';
  statistics: ChatbotStatistics;
  created_at: string;
  updated_at: string;
}

export interface ChatbotStatistics {
  total_conversations: number;
  active_users: number;
  avg_response_time: number; // in seconds
  satisfaction_rate: number; // percentage
  total_messages: number;
  last_activity: string;
}

export interface ChatbotFormData {
  name: string;
  description: string;
  language: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_style: 'modern' | 'classic' | 'minimal' | 'bubble' | 'card';
  position: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';
  avatar_url?: string;
  brand_logo_url?: string;
  knowledge_base_text?: string;
  uploaded_files: File[];
  response_style: 'friendly' | 'professional' | 'casual' | 'formal' | 'helpful';
  max_questions: number;
  conversation_limit: number;
  status: 'active' | 'inactive' | 'draft';
}

export interface ChatbotCreateRequest {
  name: string;
  description: string;
  language: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_style: string;
  position: string;
  avatar_url?: string;
  brand_logo_url?: string;
  knowledge_base_text?: string;
  response_style: string;
  max_questions: number;
  conversation_limit: number;
  status: string;
}

export interface ChatbotUpdateRequest extends Partial<ChatbotCreateRequest> {
  id: string;
}

export interface ChatbotApiResponse {
  success: boolean;
  data?: Chatbot | Chatbot[];
  error?: string;
  message?: string;
}

export interface ChatbotListResponse {
  chatbots: Chatbot[];
  total: number;
  limit: number;
  has_more: boolean;
}

// Form validation types
export interface ChatbotValidationErrors {
  name?: string;
  description?: string;
  welcome_message?: string;
  fallback_message?: string;
  primary_color?: string;
  max_questions?: string;
  conversation_limit?: string;
}

// File upload types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

// Statistics chart data
export interface ChatbotChartData {
  date: string;
  conversations: number;
  users: number;
  response_time: number;
  satisfaction: number;
}

// Filter and search types
export interface ChatbotFilters {
  status?: 'active' | 'inactive' | 'draft';
  language?: string;
  widget_style?: string;
  search?: string;
}

export interface ChatbotSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'total_conversations';
  direction: 'asc' | 'desc';
}








