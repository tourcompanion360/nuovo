/**
 * Mock Data System for Screenshots
 * Adds realistic fake numbers to existing data for demonstration purposes
 * Easy to toggle on/off
 */

// Toggle this to enable/disable mock data
export const ENABLE_MOCK_DATA = false; // Set to false to disable mock data

// Mock analytics data
export const generateMockAnalytics = (projectId: string, clientId: string) => {
  if (!ENABLE_MOCK_DATA) return [];
  
  const baseViews = Math.floor(Math.random() * 500) + 100; // 100-600 views
  const conversionRate = Math.random() * 0.15 + 0.02; // 2-17% conversion rate
  const satisfaction = Math.random() * 1.5 + 3.5; // 3.5-5.0 satisfaction
  
  return [
    {
      id: `mock_analytics_${projectId}_1`,
      project_id: projectId,
      metric_type: 'view',
      metric_value: baseViews,
      created_at: new Date().toISOString(),
    },
    {
      id: `mock_analytics_${projectId}_2`,
      project_id: projectId,
      metric_type: 'unique_visitor',
      metric_value: Math.floor(baseViews * 0.7), // 70% unique visitors
      created_at: new Date().toISOString(),
    },
    {
      id: `mock_analytics_${projectId}_3`,
      project_id: projectId,
      metric_type: 'conversion',
      metric_value: Math.floor(baseViews * conversionRate),
      created_at: new Date().toISOString(),
    },
    {
      id: `mock_analytics_${projectId}_4`,
      project_id: projectId,
      metric_type: 'satisfaction',
      metric_value: satisfaction,
      created_at: new Date().toISOString(),
    },
    {
      id: `mock_analytics_${projectId}_5`,
      project_id: projectId,
      metric_type: 'time_spent',
      metric_value: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      created_at: new Date().toISOString(),
    },
  ];
};

// Mock chatbot data
export const generateMockChatbots = (projectId: string) => {
  if (!ENABLE_MOCK_DATA) return [];
  
  const chatbotCount = Math.floor(Math.random() * 3) + 1; // 1-3 chatbots per project
  const chatbots = [];
  
  for (let i = 0; i < chatbotCount; i++) {
    const conversations = Math.floor(Math.random() * 200) + 50; // 50-250 conversations
    const satisfaction = Math.random() * 1.5 + 3.5; // 3.5-5.0 satisfaction
    
    chatbots.push({
      id: `mock_chatbot_${projectId}_${i}`,
      project_id: projectId,
      name: `Chatbot ${i + 1}`,
      status: 'active',
      statistics: {
        total_conversations: conversations,
        satisfaction_rate: satisfaction,
        response_time: Math.floor(Math.random() * 30) + 5, // 5-35 seconds
        success_rate: Math.random() * 0.3 + 0.7, // 70-100% success rate
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return chatbots;
};

// Mock project data with enhanced statistics
export const enhanceProjectWithMockData = (project: any) => {
  if (!ENABLE_MOCK_DATA) return project;
  
  const mockAnalytics = generateMockAnalytics(project.id, project.end_client_id);
  const mockChatbots = generateMockChatbots(project.id);
  
  // Calculate totals from mock analytics
  const totalViews = mockAnalytics.find(a => a.metric_type === 'view')?.metric_value || 0;
  const uniqueVisitors = mockAnalytics.find(a => a.metric_type === 'unique_visitor')?.metric_value || 0;
  const conversions = mockAnalytics.find(a => a.metric_type === 'conversion')?.metric_value || 0;
  const avgSatisfaction = mockAnalytics.find(a => a.metric_type === 'satisfaction')?.metric_value || 0;
  const conversionRate = totalViews > 0 ? (conversions / totalViews) * 100 : 0;
  
  return {
    ...project,
    views: totalViews,
    mockAnalytics,
    chatbots: mockChatbots,
    mockStats: {
      totalViews,
      uniqueVisitors,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      activeChatbots: mockChatbots.length,
      totalConversations: mockChatbots.reduce((sum, cb) => sum + (cb.statistics?.total_conversations || 0), 0),
      avgSatisfactionRate: mockChatbots.length > 0 
        ? Math.round((mockChatbots.reduce((sum, cb) => sum + (cb.statistics?.satisfaction_rate || 0), 0) / mockChatbots.length) * 10) / 10
        : 0,
    }
  };
};

// Mock dashboard statistics
export const generateMockDashboardStats = (projects: any[], clients: any[]) => {
  if (!ENABLE_MOCK_DATA) return {
    totalProjects: projects.length,
    totalViews: 0,
    activeChatbots: 0,
    avgSatisfaction: 0,
    totalClients: clients.length,
    totalConversations: 0,
    conversionRate: 0,
  };
  
  let totalViews = 0;
  let totalConversations = 0;
  let totalSatisfaction = 0;
  let totalChatbots = 0;
  let totalConversions = 0;
  
  projects.forEach(project => {
    const enhanced = enhanceProjectWithMockData(project);
    totalViews += enhanced.mockStats?.totalViews || 0;
    totalConversations += enhanced.mockStats?.totalConversations || 0;
    totalSatisfaction += enhanced.mockStats?.avgSatisfaction || 0;
    totalChatbots += enhanced.mockStats?.activeChatbots || 0;
    totalConversions += enhanced.mockStats?.conversions || 0;
  });
  
  const avgSatisfaction = projects.length > 0 ? totalSatisfaction / projects.length : 0;
  const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
  
  return {
    totalProjects: projects.length,
    totalViews,
    activeChatbots: totalChatbots,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    totalClients: clients.length,
    totalConversations,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
};

// Mock client data with enhanced statistics
export const enhanceClientWithMockData = (client: any) => {
  if (!ENABLE_MOCK_DATA) return client;
  
  const mockProjects = client.projects?.map((project: any) => enhanceProjectWithMockData(project)) || [];
  
  // Calculate client totals
  const totalViews = mockProjects.reduce((sum: number, p: any) => sum + (p.mockStats?.totalViews || 0), 0);
  const totalConversations = mockProjects.reduce((sum: number, p: any) => sum + (p.mockStats?.totalConversations || 0), 0);
  const totalChatbots = mockProjects.reduce((sum: number, p: any) => sum + (p.mockStats?.activeChatbots || 0), 0);
  const avgSatisfaction = mockProjects.length > 0 
    ? mockProjects.reduce((sum: number, p: any) => sum + (p.mockStats?.avgSatisfaction || 0), 0) / mockProjects.length
    : 0;
  
  return {
    ...client,
    projects: mockProjects,
    mockStats: {
      totalViews,
      totalConversations,
      activeChatbots: totalChatbots,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      projectCount: mockProjects.length,
    }
  };
};

// Console log for debugging
if (ENABLE_MOCK_DATA) {
  console.log('🎭 Mock data system is ENABLED - Perfect for screenshots!');
  console.log('📊 To disable mock data, set ENABLE_MOCK_DATA = false in src/utils/mockData.ts');
} else {
  console.log('📊 Mock data system is DISABLED - Using real data only');
}
