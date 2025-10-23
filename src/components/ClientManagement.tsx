import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import RecentActivity from '@/components/RecentActivity';
import { supabase } from '@/integrations/supabase/client';
import ClientAvatar from '@/components/ui/ClientAvatar';
import { 
  Search, 
  Plus, 
  Eye, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Globe,
  Bot,
  MessageSquare,
  Star,
  Settings,
  ExternalLink,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  website?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  subscription: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  last_activity: string;
  projects: number;
  analytics?: {
    totalViews: number;
    uniqueVisitors: number;
    avgEngagementTime: string;
    totalLeadsGenerated: number;
    conversionRate: number;
    avgSatisfaction: number;
  };
  recentActivity?: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

interface ClientManagementProps {
  onClientSelect?: (client: Client) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ onClientSelect }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { clients: realClients, projects, analytics, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');
  
  // Imported analytics are now handled by the useCreatorDashboard hook
  
  // Debug logging
  console.log('[ClientManagement] Dashboard data:', {
    clientsCount: realClients?.length || 0,
    projectsCount: projects?.length || 0,
    analyticsCount: analytics?.length || 0,
    isLoading,
    error
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use real activity data for the selected client
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities } = useRecentActivity({
    clientId: selectedClient?.id,
    limit: 10
  });

  // Production ready - No sample data
  // Users start with empty state

  // Transform real data to match the expected format
  const clients = realClients || [];

  // Calculate analytics for each client from the combined analytics data
  const clientsWithAnalytics = clients.map(client => {
    // Get all projects for this client
    const clientProjects = projects?.filter(project => project.end_client_id === client.id) || [];
    const projectIds = clientProjects.map(p => p.id);
    
    // Get analytics for this client's projects (already combined by useCreatorDashboard hook)
    const clientAnalytics = analytics?.filter(a => projectIds.includes(a.project_id)) || [];
    
    // Debug logging
    console.log(`[ClientManagement] Client: ${client.name}`, {
      projectIds,
      clientAnalytics: clientAnalytics.length,
      totalAnalytics: analytics?.length || 0
    });
    
    // Calculate metrics from combined analytics (regular + imported)
    const totalViews = clientAnalytics
      .filter(a => a.metric_type === 'view')
      .reduce((sum, a) => sum + a.metric_value, 0);
    
    const uniqueVisitors = clientAnalytics
      .filter(a => a.metric_type === 'unique_visitor')
      .reduce((sum, a) => sum + a.metric_value, 0);
    
    const timeSpentData = clientAnalytics
      .filter(a => a.metric_type === 'time_spent');
    
    const avgEngagementTime = timeSpentData.length > 0
      ? `${Math.floor(timeSpentData.reduce((sum, a) => sum + a.metric_value, 0) / timeSpentData.length / 60)}m ${Math.floor((timeSpentData.reduce((sum, a) => sum + a.metric_value, 0) / timeSpentData.length) % 60)}s`
      : '0m 0s';
    
    const totalLeadsGenerated = clientAnalytics
      .filter(a => a.metric_type === 'lead_generated')
      .reduce((sum, a) => sum + a.metric_value, 0);
    
    const conversionRate = totalViews > 0 
      ? Math.round((totalLeadsGenerated / totalViews) * 100 * 100) / 100
      : 0;
    
    const satisfactionData = clientAnalytics
      .filter(a => a.metric_type === 'satisfaction');
    
    const avgSatisfaction = satisfactionData.length > 0 
      ? satisfactionData.reduce((sum, a) => sum + a.metric_value, 0) / satisfactionData.length
      : 0;
    
    return {
      ...client,
      analytics: {
        totalViews,
        uniqueVisitors,
        avgEngagementTime,
        totalLeadsGenerated,
        conversionRate,
        avgSatisfaction
      }
    };
  });

  // Filter clients to only show those with at least one active project
  const clientsWithProjects = clientsWithAnalytics.filter(client => {
    const hasProjects = projects?.some(project => project.end_client_id === client.id);
    return hasProjects;
  });

  // Set up real-time subscriptions for clients
  useEffect(() => {
    if (!user?.id) return;

    console.log('[ClientManagement] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`client-management-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'end_clients',
        },
        (payload) => {
          console.log('[ClientManagement] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[ClientManagement] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          console.log('[ClientManagement] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'imported_analytics',
        },
        (payload) => {
          console.log('[ClientManagement] Imported analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[ClientManagement] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[ClientManagement] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [user?.id]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[ClientManagement] Triggering debounced refresh');
      refreshData();
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const filteredClients = clientsWithProjects.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesSubscription = subscriptionFilter === 'all' || client.subscription === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    onClientSelect?.(client);
  };

  const totalViews = clientsWithProjects.reduce((sum, client) => sum + (client.analytics?.totalViews || 0), 0);
  const totalClients = clientsWithProjects.length;
  const activeClients = clientsWithProjects.filter(client => client.status === 'active').length;
  const avgSatisfaction = clientsWithProjects.length > 0 
    ? clientsWithProjects.reduce((sum, client) => sum + (client.analytics?.satisfaction || 0), 0) / clientsWithProjects.length 
    : 0;

  if (selectedClient) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Client Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2"
            >
              ← Back to Clients
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {selectedClient.name}
              </h1>
              <p className="text-foreground-secondary text-sm sm:text-base">
                {selectedClient.company} • {selectedClient.subscription} subscription
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(selectedClient.status)}>
              {selectedClient.status}
            </Badge>
            <Badge className={getSubscriptionColor(selectedClient.subscription)}>
              {selectedClient.subscription}
            </Badge>
          </div>
        </div>

        {/* Client Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(selectedClient.analytics?.totalViews || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total views for this client
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(selectedClient.analytics?.uniqueVisitors || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Unique visitors for this client
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClient.analytics?.avgEngagementTime || '0m 0s'}</div>
              <p className="text-xs text-muted-foreground">
                Average engagement time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(selectedClient.analytics?.totalLeadsGenerated || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total leads generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClient.analytics?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Conversion rate for this client
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedClient.analytics?.avgSatisfaction || 0}/5</div>
              <p className="text-xs text-muted-foreground">
                Based on chatbot feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Client Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-muted-foreground">{selectedClient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <p className="text-sm text-muted-foreground">
                      <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedClient.website}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conversion Rate</span>
                      <span>{selectedClient.analytics?.conversionRate || 0}%</span>
                    </div>
                    <Progress value={selectedClient.analytics?.conversionRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Leads Generated</span>
                      <span>{selectedClient.analytics?.totalLeadsGenerated || 0}</span>
                    </div>
                    <Progress value={selectedClient.analytics?.totalViews && selectedClient.analytics?.totalLeadsGenerated ? (selectedClient.analytics.totalLeadsGenerated / selectedClient.analytics.totalViews) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg. Satisfaction</span>
                      <span>{selectedClient.analytics?.avgSatisfaction || 0}/5</span>
                    </div>
                    <Progress value={selectedClient.analytics?.avgSatisfaction ? (selectedClient.analytics.avgSatisfaction / 5) * 100 : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="font-semibold">{(selectedClient.analytics?.totalViews || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unique Visitors</span>
                    <span className="font-semibold">{(selectedClient.analytics?.uniqueVisitors || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Engagement Time</span>
                    <span className="font-semibold">{selectedClient.analytics?.avgEngagementTime || '0m 0s'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Leads Generated</span>
                    <span className="font-semibold">{(selectedClient.analytics?.totalLeadsGenerated || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-semibold">{selectedClient.analytics?.conversionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Satisfaction</span>
                    <span className="font-semibold">{selectedClient.analytics?.avgSatisfaction || 0}/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Projects</CardTitle>
                <CardDescription>{selectedClient.projects} active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Project management interface would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
              onRefresh={refreshActivities}
              title={`Recent Activity - ${selectedClient.name}`}
              description={`Latest updates and interactions for ${selectedClient.name}`}
              showStats={true}
              maxItems={15}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Client configuration and settings would go here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Client Management</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">
            Manage all your clients and view their detailed analytics
          </p>
        </div>
        
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.reduce((sum, client) => sum + (client.analytics?.uniqueVisitors || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Unique visitors across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0m 0s</div>
            <p className="text-xs text-muted-foreground">
              Average engagement time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.reduce((sum, client) => sum + (client.analytics?.totalLeadsGenerated || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total leads generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews > 0 ? ((clients.reduce((sum, client) => sum + (client.analytics?.totalLeadsGenerated || 0), 0) / totalViews) * 100).toFixed(1) : '0.0'}%</div>
            <p className="text-xs text-muted-foreground">
              Global conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Based on chatbot feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="card-header-safe">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ClientAvatar 
                      name={client.name} 
                      size="sm" 
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg name-display-safe group-hover:text-primary transition-colors">
                        {client.name}
                      </CardTitle>
                      <CardDescription className="company-display-safe">
                        {client.company}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Analytics Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>Views</span>
                    </div>
                    <div className="text-sm font-semibold">{(client.analytics?.totalViews || 0).toLocaleString()}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Visitors</span>
                    </div>
                    <div className="text-sm font-semibold">{(client.analytics?.uniqueVisitors || 0).toLocaleString()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Engagement</span>
                    </div>
                    <div className="text-sm font-semibold">{client.analytics?.avgEngagementTime || '0m 0s'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Leads</span>
                    </div>
                    <div className="text-sm font-semibold">{client.analytics?.totalLeadsGenerated || 0}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>Conversion</span>
                    </div>
                    <div className="text-sm font-semibold">{client.analytics?.conversionRate || 0}%</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>Satisfaction</span>
                    </div>
                    <div className="text-sm font-semibold">{client.analytics?.avgSatisfaction || 0}/5</div>
                  </div>
                </div>
                
                {/* Last Activity */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last activity: {new Date(client.last_activity).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{client.analytics?.satisfaction || 0}/5</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleClientSelect(client)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || subscriptionFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No clients have been added yet'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientManagement;
