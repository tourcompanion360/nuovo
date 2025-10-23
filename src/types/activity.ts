export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    clientId?: string;
    clientName?: string;
    value?: number;
    status?: string;
    [key: string]: unknown;
  };
  icon: ActivityIcon;
  priority: 'low' | 'medium' | 'high';
}

export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'project_published'
  | 'project_archived'
  | 'chatbot_created'
  | 'chatbot_updated'
  | 'chatbot_activated'
  | 'chatbot_deactivated'
  | 'lead_captured'
  | 'lead_contacted'
  | 'lead_converted'
  | 'request_submitted'
  | 'request_updated'
  | 'request_completed'
  | 'analytics_view'
  | 'analytics_interaction'
  | 'analytics_milestone'
  | 'asset_shared'
  | 'client_invited'
  | 'client_activated'
  | 'client_deactivated';

export interface ActivityIcon {
  component: string;
  color: string;
  bgColor: string;
}

export interface ActivityFilters {
  types?: ActivityType[];
  dateRange?: {
    start: string;
    end: string;
  };
  projectId?: string;
  clientId?: string;
  priority?: ('low' | 'medium' | 'high')[];
}

export interface ActivityStats {
  total: number;
  byType: Record<ActivityType, number>;
  byPriority: Record<'low' | 'medium' | 'high', number>;
  recentCount: number; // Last 24 hours
}



