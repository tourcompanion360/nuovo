export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string
          project_id: string
          date: string
          metric_type: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated'
          metric_value: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          metric_type: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated'
          metric_value?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          metric_type?: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated'
          metric_value?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: {
          id: string
          creator_id: string
          project_id: string | null
          filename: string
          original_filename: string
          file_type: string
          file_size: number
          file_url: string
          thumbnail_url: string | null
          tags: string[]
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          project_id?: string | null
          filename: string
          original_filename: string
          file_type: string
          file_size: number
          file_url: string
          thumbnail_url?: string | null
          tags?: string[]
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          project_id?: string | null
          filename?: string
          original_filename?: string
          file_type?: string
          file_size?: number
          file_url?: string
          thumbnail_url?: string | null
          tags?: string[]
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      chatbots: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          language: string
          welcome_message: string
          fallback_message: string
          primary_color: string
          widget_style: string
          position: string
          avatar_url: string | null
          brand_logo_url: string | null
          response_style: string
          max_questions: number
          conversation_limit: number
          knowledge_base_text: string | null
          knowledge_base_files: Json
          status: 'active' | 'inactive' | 'draft'
          statistics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          language?: string
          welcome_message?: string
          fallback_message?: string
          primary_color?: string
          widget_style?: string
          position?: string
          avatar_url?: string | null
          brand_logo_url?: string | null
          response_style?: string
          max_questions?: number
          conversation_limit?: number
          knowledge_base_text?: string | null
          knowledge_base_files?: Json
          status?: 'active' | 'inactive' | 'draft'
          statistics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          language?: string
          welcome_message?: string
          fallback_message?: string
          primary_color?: string
          widget_style?: string
          position?: string
          avatar_url?: string | null
          brand_logo_url?: string | null
          response_style?: string
          max_questions?: number
          conversation_limit?: number
          knowledge_base_text?: string | null
          knowledge_base_files?: Json
          status?: 'active' | 'inactive' | 'draft'
          statistics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      creators: {
        Row: {
          id: string
          user_id: string
          agency_name: string
          agency_logo: string | null
          contact_email: string
          phone: string | null
          website: string | null
          address: string | null
          description: string | null
          subscription_plan: 'basic' | 'pro'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_name: string
          agency_logo?: string | null
          contact_email: string
          phone?: string | null
          website?: string | null
          address?: string | null
          description?: string | null
          subscription_plan?: 'basic' | 'pro'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agency_name?: string
          agency_logo?: string | null
          contact_email?: string
          phone?: string | null
          website?: string | null
          address?: string | null
          description?: string | null
          subscription_plan?: 'basic' | 'pro'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      end_clients: {
        Row: {
          id: string
          creator_id: string
          name: string
          email: string
          company: string
          website: string | null
          phone: string | null
          avatar: string | null
          status: 'active' | 'inactive' | 'pending'
          login_credentials: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          email: string
          company: string
          website?: string | null
          phone?: string | null
          avatar?: string | null
          status?: 'active' | 'inactive' | 'pending'
          login_credentials?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          email?: string
          company?: string
          website?: string | null
          phone?: string | null
          avatar?: string | null
          status?: 'active' | 'inactive' | 'pending'
          login_credentials?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "end_clients_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          }
        ]
      }
      end_client_users: {
        Row: {
          id: string
          auth_user_id: string
          end_client_id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          end_client_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          end_client_id?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "end_client_users_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "end_client_users_end_client_id_fkey"
            columns: ["end_client_id"]
            isOneToOne: false
            referencedRelation: "end_clients"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          chatbot_id: string
          visitor_name: string | null
          visitor_email: string | null
          visitor_phone: string | null
          company: string | null
          question_asked: string
          chatbot_response: string | null
          lead_score: number
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          visitor_name?: string | null
          visitor_email?: string | null
          visitor_phone?: string | null
          company?: string | null
          question_asked: string
          chatbot_response?: string | null
          lead_score?: number
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          visitor_name?: string | null
          visitor_email?: string | null
          visitor_phone?: string | null
          company?: string | null
          question_asked?: string
          chatbot_response?: string | null
          lead_score?: number
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          end_client_id: string
          title: string
          description: string | null
          project_type: 'virtual_tour' | '3d_showcase' | 'interactive_map'
          status: 'active' | 'inactive' | 'draft' | 'archived'
          thumbnail_url: string | null
          tour_url: string | null
          settings: Json
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          end_client_id: string
          title: string
          description?: string | null
          project_type?: 'virtual_tour' | '3d_showcase' | 'interactive_map'
          status?: 'active' | 'inactive' | 'draft' | 'archived'
          thumbnail_url?: string | null
          tour_url?: string | null
          settings?: Json
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          end_client_id?: string
          title?: string
          description?: string | null
          project_type?: 'virtual_tour' | '3d_showcase' | 'interactive_map'
          status?: 'active' | 'inactive' | 'draft' | 'archived'
          thumbnail_url?: string | null
          tour_url?: string | null
          settings?: Json
          views?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_end_client_id_fkey"
            columns: ["end_client_id"]
            isOneToOne: false
            referencedRelation: "end_clients"
            referencedColumns: ["id"]
          }
        ]
      }
      requests: {
        Row: {
          id: string
          project_id: string
          end_client_id: string
          title: string
          description: string
          request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          attachments: Json
          creator_notes: string | null
          client_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          end_client_id: string
          title: string
          description: string
          request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          attachments?: Json
          creator_notes?: string | null
          client_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          end_client_id?: string
          title?: string
          description?: string
          request_type?: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          attachments?: Json
          creator_notes?: string | null
          client_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_end_client_id_fkey"
            columns: ["end_client_id"]
            isOneToOne: false
            referencedRelation: "end_clients"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          project_id: string
          project_title: string
          end_client_id: string
          client_name: string
          creator_id: string
          agency_name: string
          total_views: number
          total_leads: number
          avg_engagement: number
          last_activity: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_client_stats: {
        Args: {
          client_id: string
        }
        Returns: Json
      }
      get_creator_stats: {
        Args: {
          creator_user_id: string
        }
        Returns: Json
      }
      refresh_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_analytics: {
        Args: {
          project_uuid: string
          metric_type_param: string
          metric_value_param?: number
          metadata_param?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Type helpers for the new schema
export type Creator = Tables<'creators'>
export type EndClient = Tables<'end_clients'>
export type Project = Tables<'projects'>
export type Chatbot = Tables<'chatbots'>
export type Lead = Tables<'leads'>
export type Analytics = Tables<'analytics'>
export type Request = Tables<'requests'>
export type Asset = Tables<'assets'>

export type CreatorInsert = TablesInsert<'creators'>
export type EndClientInsert = TablesInsert<'end_clients'>
export type ProjectInsert = TablesInsert<'projects'>
export type ChatbotInsert = TablesInsert<'chatbots'>
export type LeadInsert = TablesInsert<'leads'>
export type AnalyticsInsert = TablesInsert<'analytics'>
export type RequestInsert = TablesInsert<'requests'>
export type AssetInsert = TablesInsert<'assets'>

export type CreatorUpdate = TablesUpdate<'creators'>
export type EndClientUpdate = TablesUpdate<'end_clients'>
export type ProjectUpdate = TablesUpdate<'projects'>
export type ChatbotUpdate = TablesUpdate<'chatbots'>
export type LeadUpdate = TablesUpdate<'leads'>
export type AnalyticsUpdate = TablesUpdate<'analytics'>
export type RequestUpdate = TablesUpdate<'requests'>
export type AssetUpdate = TablesUpdate<'assets'>