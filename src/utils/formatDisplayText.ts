/**
 * Utility functions to convert database field names to user-friendly display text
 */

/**
 * Convert snake_case or camelCase text to Title Case
 */
export const formatDisplayText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
    .replace(/_/g, ' ') // underscore to space
    .replace(/\b\w/g, l => l.toUpperCase()) // capitalize first letter of each word
    .trim();
};

/**
 * Format project type for display
 */
export const formatProjectType = (projectType: string): string => {
  const typeMap: Record<string, string> = {
    'virtual_tour': 'Virtual Tour',
    '3d_showcase': '3D Showcase',
    'interactive_map': 'Interactive Map',
    'real_estate': 'Real Estate',
    'hospitality': 'Hospitality',
    'retail': 'Retail',
    'corporate': 'Corporate',
    'education': 'Education',
    'healthcare': 'Healthcare',
    'other': 'Other'
  };
  
  return typeMap[projectType] || formatDisplayText(projectType);
};

/**
 * Format project status for display
 */
export const formatProjectStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'archived': 'Archived',
    'setup': 'Setup',
    'pending': 'Pending',
    'completed': 'Completed'
  };
  
  return statusMap[status] || formatDisplayText(status);
};

/**
 * Format client status for display
 */
export const formatClientStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'suspended': 'Suspended'
  };
  
  return statusMap[status] || formatDisplayText(status);
};

/**
 * Format chatbot status for display
 */
export const formatChatbotStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'training': 'Training',
    'error': 'Error'
  };
  
  return statusMap[status] || formatDisplayText(status);
};

/**
 * Format request status for display
 */
export const formatRequestStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'on_hold': 'On Hold'
  };
  
  return statusMap[status] || formatDisplayText(status);
};

/**
 * Format request type for display
 */
export const formatRequestType = (requestType: string): string => {
  const typeMap: Record<string, string> = {
    'content_change': 'Content Change',
    'design_update': 'Design Update',
    'feature_request': 'Feature Request',
    'bug_report': 'Bug Report',
    'general_inquiry': 'General Inquiry',
    'technical_support': 'Technical Support'
  };
  
  return typeMap[requestType] || formatDisplayText(requestType);
};

/**
 * Format priority for display
 */
export const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  
  return priorityMap[priority] || formatDisplayText(priority);
};

/**
 * Format file type for display
 */
export const formatFileType = (fileType: string): string => {
  const typeMap: Record<string, string> = {
    'image': 'Image',
    'video': 'Video',
    'document': 'Document',
    'audio': 'Audio',
    'link': 'Link'
  };
  
  return typeMap[fileType] || formatDisplayText(fileType);
};

/**
 * Format metric type for display
 */
export const formatMetricType = (metricType: string): string => {
  const typeMap: Record<string, string> = {
    'view': 'View',
    'unique_visitor': 'Unique Visitor',
    'conversion': 'Conversion',
    'satisfaction': 'Satisfaction',
    'time_spent': 'Time Spent',
    'session_duration': 'Session Duration',
    'bounce_rate': 'Bounce Rate',
    'interaction': 'Interaction'
  };
  
  return typeMap[metricType] || formatDisplayText(metricType);
};

/**
 * Format any database field name to user-friendly text
 */
export const formatFieldName = (fieldName: string): string => {
  const fieldMap: Record<string, string> = {
    'project_type': 'Project Type',
    'end_client_id': 'Client ID',
    'created_at': 'Created',
    'updated_at': 'Updated',
    'user_id': 'User ID',
    'agency_name': 'Agency Name',
    'contact_email': 'Contact Email',
    'full_name': 'Full Name',
    'company_name': 'Company Name',
    'phone_number': 'Phone Number',
    'website_url': 'Website URL',
    'tour_url': 'Tour URL',
    'thumbnail_url': 'Thumbnail URL',
    'logo_url': 'Logo URL',
    'avatar_url': 'Avatar URL',
    'brand_logo_url': 'Brand Logo URL',
    'welcome_message': 'Welcome Message',
    'fallback_message': 'Fallback Message',
    'primary_color': 'Primary Color',
    'widget_style': 'Widget Style',
    'response_style': 'Response Style',
    'max_questions': 'Max Questions',
    'conversation_limit': 'Conversation Limit',
    'knowledge_base_text': 'Knowledge Base Text',
    'knowledge_base_files': 'Knowledge Base Files',
    'total_conversations': 'Total Conversations',
    'satisfaction_rate': 'Satisfaction Rate',
    'response_time': 'Response Time',
    'success_rate': 'Success Rate',
    'lead_score': 'Lead Score',
    'question_asked': 'Question Asked',
    'visitor_name': 'Visitor Name',
    'request_type': 'Request Type',
    'priority_level': 'Priority Level',
    'chatbot_name': 'Chatbot Name',
    'chatbot_purpose': 'Chatbot Purpose',
    'original_filename': 'Original Filename',
    'file_size': 'File Size',
    'file_type': 'File Type',
    'file_url': 'File URL',
    'metric_value': 'Metric Value',
    'metric_type': 'Metric Type'
  };
  
  return fieldMap[fieldName] || formatDisplayText(fieldName);
};


