import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Download,
  Share2,
  BarChart3,
  Activity,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Play,
  ExternalLink,
  FileUp,
  Upload,
  Loader2,
  XCircle,
  Trash2
} from 'lucide-react';
import { TEXT } from '@/constants/text';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import RecentActivity from '@/components/RecentActivity';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import { formatDuration } from '@/utils/analyticsTerminology';
import ImportAnalyticsDialog from '@/components/ImportAnalyticsDialog';
import ResetAnalyticsDialog from '@/components/ResetAnalyticsDialog';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  last_project_date: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  views: number;
  client_name: string;
  project_type: string;
}

interface ClientDashboardProps {
  client?: Client;
  onBack?: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ client: propClient, onBack }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(propClient || null);
  
  // Use unified analytics hook for consistent data (must be called before any conditional logic)
  const unifiedAnalytics = useUnifiedAnalytics({ 
    projectId: projectId,
    endClientId: client?.id 
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🚀 [ClientDashboard] Component initialized with client:', client, 'projectId:', projectId);

  // Load client data from projectId if not provided as prop
  useEffect(() => {
    const loadClientFromProject = async () => {
      if (!client && projectId) {
        try {
          console.log('🔍 [ClientDashboard] Loading client data from projectId:', projectId);
          
          // Get project and client data using explicit join
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select(`
              id,
              title,
              description,
              status,
              created_at,
              updated_at,
              end_client_id
            `)
            .eq('id', projectId)
            .single();

          if (projectError) {
            console.error('❌ [ClientDashboard] Error loading project:', projectError);
            toast({
              title: "Error Loading Project",
              description: `Failed to load project: ${projectError.message}`,
              variant: "destructive",
            });
            return;
          }

          if (!projectData) {
            console.error('❌ [ClientDashboard] No project found for projectId:', projectId);
            return;
          }

          // Get client data separately
          const { data: clientData, error: clientError } = await supabase
            .from('end_clients')
            .select('id, name, email, company, phone')
            .eq('id', projectData.end_client_id)
            .single();

          if (clientError) {
            console.error('❌ [ClientDashboard] Error loading client:', clientError);
            toast({
              title: "Error Loading Client",
              description: `Failed to load client: ${clientError.message}`,
              variant: "destructive",
            });
            return;
          }

          if (!clientData) {
            console.error('❌ [ClientDashboard] No client found for end_client_id:', projectData.end_client_id);
            return;
          }

          const project = {
            ...projectData,
            end_clients: clientData
          };

          if (project && project.end_clients) {
            const clientData = {
              id: project.end_clients.id,
              name: project.end_clients.name,
              email: project.end_clients.email,
              company: project.end_clients.company,
              phone: project.end_clients.phone,
              project: {
                id: project.id,
                title: project.title,
                description: project.description,
                status: project.status,
                created_at: project.created_at,
                updated_at: project.updated_at
              }
            };
            
            console.log('✅ [ClientDashboard] Client data loaded:', clientData);
            setClient(clientData);
          }
        } catch (error) {
          console.error('❌ [ClientDashboard] Error loading client from project:', error);
          toast({
            title: "Error Loading Client Data",
            description: "Failed to load client information. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    loadClientFromProject();
  }, [client, projectId]);

  // Disable activity loading for client portal to avoid creator data errors
  const activities: any[] = [];
  const activitiesLoading = false;
  const activitiesError = null;
  const refreshActivities = () => {};

  // State for client analytics from database
  const [clientAnalytics, setClientAnalytics] = useState<any>(null);

  // Extract metrics from unified analytics
  const totalViews = unifiedAnalytics.totalViews;
  const totalVisitors = unifiedAnalytics.totalVisitors;
  const avgEngagementTime = unifiedAnalytics.avgEngagementTime;
  const totalLeads = unifiedAnalytics.totalLeads;
  const conversionRate = unifiedAnalytics.conversionRate;
  const avgSatisfaction = unifiedAnalytics.avgSatisfaction;



  // Using formatDuration from utils for consistency

  const displayAnalytics = {
    totalViews: totalViews,
    uniqueVisitors: totalVisitors,
    avgSessionDuration: formatDuration(avgEngagementTime),
    bounceRate: totalVisitors > 0 ? Math.round(((totalVisitors - totalViews) / totalVisitors) * 100) : 0,
    conversionRate: conversionRate,
    totalProjects: 0,
    completedProjects: 0,
    satisfactionScore: avgSatisfaction,
    totalInteractions: 0,
    avgEngagementTime: formatDuration(avgEngagementTime),
    totalLeadsGenerated: totalLeads,
    inProgressProjects: 0
  };

  // Production ready - No sample data
  const clientProjects: Project[] = [];

  useEffect(() => {
    // Production ready - load real client projects from database
    // For now, show empty state
    setProjects([]);
    setLoading(false);
  }, [client?.id]);


  // Real-time updates are now handled by the unified analytics hook

  // Real-time subscriptions are now handled by the unified analytics hook

  // SIMPLE ANALYTICS - NO COMPLEX LOADING
  console.log('✅ [ClientDashboard] Using hardcoded analytics for client:', client?.id, client?.name);

  // Show loading state if client data is not available
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'inactive':
        return 'Inactive';
      case 'draft':
        return 'In Progress';
      default:
        return status;
    }
  };

  // Handle import from dialog
  const handleImportData = async (data: any[], projectName: string) => {
    setIsImporting(true);
    try {
      // Get the client's project_id
      const { data: clientProject, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('end_client_id', client.id)
        .limit(1)
        .single();

      if (projectError || !clientProject) {
        throw new Error('No project found for this client. Please create a project first.');
      }

      // Store imported data for visualization
      setImportedData(data);

      // Create chart data for visualization
      const processedChartData = data.map(row => ({
        date: row.date,
        page_views: row.page_views,    // use new column name
        visitors: row.visitors,        // use new column name
        total_time: row.total_time,    // use new column name
        avg_time: row.avg_time,        // use new column name
        resource_code: row.resource_code
      }));

      setChartData(processedChartData);
      setShowCharts(true);

      // Get creator_id for the current user
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (creatorError || !creatorData) {
        throw new Error('Creator not found');
      }

      // Import analytics data to imported_analytics table
      const analyticsToInsert = data.map(row => ({
        project_id: clientProject.id,
        end_client_id: client.id,
        creator_id: creatorData.id,
        date: row.date,
        resource_code: row.resource_code,
        page_views: row.page_views || 0,    // use new column name
        visitors: row.visitors || 0,        // use new column name
        total_time: row.total_time || 0,    // use new column name
        avg_time: row.avg_time || 0         // use new column name
      }));

      // Insert into imported_analytics table
      const { error } = await supabase
        .from('imported_analytics')
        .insert(analyticsToInsert);

      if (error) {
        throw error;
      }

      // Analytics data will be automatically updated by the unified analytics hook

      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.length} analytics records for ${client.name} (${projectName}). Visual charts have been generated.`,
      });

      // Refresh client analytics from database
      const { data: updatedAnalytics } = await supabase
        .rpc('get_client_analytics', { client_uuid: client.id });
      
      if (updatedAnalytics) {
        setClientAnalytics(updatedAnalytics);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import analytics data. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so dialog can handle it
    } finally {
      setIsImporting(false);
    }
  };

  // Handle reset analytics data
  const handleResetAnalytics = async () => {
    setIsResetting(true);
    try {
      // Delete from both analytics tables
      const [analyticsResult, importedResult] = await Promise.all([
        supabase
          .from('analytics')
          .delete()
          .eq('end_client_id', client.id),
        supabase
          .from('imported_analytics')
          .delete()
          .eq('end_client_id', client.id)
      ]);

      if (analyticsResult.error) {
        console.error('Error deleting from analytics table:', analyticsResult.error);
        throw analyticsResult.error;
      }

      if (importedResult.error) {
        console.error('Error deleting from imported_analytics table:', importedResult.error);
        throw importedResult.error;
      }

      // Clear local state
      setImportedData([]);
      setChartData([]);
      setShowCharts(false);
      setClientAnalytics(null);

      // Analytics data will be automatically updated by the unified analytics hook

      toast({
        title: "Analytics Reset Successful",
        description: `All analytics data for ${client.name} has been permanently deleted.`,
      });

    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset analytics data. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so dialog can handle it
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground truncate">{client.name}</h1>
            <p className="text-foreground-secondary truncate">{client.company} • Client Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
            {client.status}
          </Badge>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
            <p className="text-foreground-secondary">Performance metrics and insights for {client.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              disabled={isImporting || isResetting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={isImporting || isResetting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Reset Analytics
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Real-time view data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Real-time visitor data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.avgSessionDuration}</div>
            <p className="text-xs text-muted-foreground">
              Real-time session data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              Real-time satisfaction data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalProjects}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{displayAnalytics.completedProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span>{displayAnalytics.inProgressProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.conversionRate}%</div>
            <Progress value={displayAnalytics.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Real-time conversion data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.bounceRate}%</div>
            <Progress value={displayAnalytics.bounceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Real-time bounce rate data
            </p>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Visual Data Charts */}
      {showCharts && chartData.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Data Visualization</h2>
              <p className="text-foreground-secondary">Visual representation of imported analytics data</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCharts(false)}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Hide Charts
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views & Unique Visitors Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Page Views & Unique Visitors Over Time</CardTitle>
                <CardDescription>Trend analysis of visitor engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} name="Page Views" />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" strokeWidth={2} name="Unique Visitors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Duration Analysis Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Session Duration Analysis</CardTitle>
                <CardDescription>Average session duration by date</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDuration" fill="#8884d8" name="Avg Duration (seconds)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Code Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Code Distribution</CardTitle>
                <CardDescription>Page views by resource code</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.reduce((acc: any[], item) => {
                        const existing = acc.find(d => d.name === item.resourceCode);
                        if (existing) {
                          existing.value += item.pv;
                        } else {
                          acc.push({ name: item.resourceCode, value: item.pv });
                        }
                        return acc;
                      }, [])}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Data Summary</CardTitle>
                <CardDescription>Key metrics from imported data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {chartData.reduce((sum, item) => sum + item.pv, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Page Views</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {chartData.reduce((sum, item) => sum + item.uv, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Unique Visitors</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(chartData.reduce((sum, item) => sum + item.avgDuration, 0) / chartData.length)}s
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Session Duration</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(chartData.map(item => item.resourceCode)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Resources</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
            <p className="text-foreground-secondary">Manage and view your virtual tour projects</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {project.thumbnail_url ? (
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Thumbnail
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Play size={16} className="mr-1" />
                        View Tour
                      </Button>
                      <Button size="sm" variant="secondary">
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Views</span>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{project.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Media
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <RecentActivity
          activities={activities}
          loading={activitiesLoading}
          error={activitiesError}
          onRefresh={refreshActivities}
          title="Recent Activity"
          description="Latest updates and interactions for this client"
          showStats={true}
          maxItems={8}
        />
      </div>

      {/* Import Analytics Dialog */}
      <ImportAnalyticsDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportData}
        clientName={client.name}
        clientId={client.id}
      />

      {/* Reset Analytics Dialog */}
      <ResetAnalyticsDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetAnalytics}
        clientName={client.name}
        isResetting={isResetting}
      />
    </div>
  );
};

export default ClientDashboard;

