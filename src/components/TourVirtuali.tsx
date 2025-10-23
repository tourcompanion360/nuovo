import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ClientProjectCard from '@/components/ClientProjectCard';
import NewProjectModal from '@/components/NewProjectModal';
import ChatbotRequestForm from '@/components/ChatbotRequestForm';
import { useCreatorDashboardFast } from '@/hooks/useCreatorDashboardFast';
import { useCreatorDashboardSimple } from '@/hooks/useCreatorDashboardSimple';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isDevMode } from '@/config/dev-mode';
import ShareClientPortal from './ShareClientPortal';
import EditClientModal from './EditClientModal';
import { 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  Bot,
  Eye,
  MessageSquare,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react';
import { OptimizedLoading, ProjectCardSkeleton, ClientListSkeleton } from '@/components/LoadingStates';
import { TEXT } from '@/constants/text';
import { formatProjectType, formatProjectStatus } from '@/utils/formatDisplayText';

interface TourVirtualiProps {
  onPageChange?: (page: string) => void;
  onCreateRequest?: (requestData: any) => void;
  onClientClick?: (client: any) => void;
}

const TourVirtuali = ({
  onPageChange,
  onCreateRequest,
  onClientClick
}: TourVirtualiProps) => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [selectedProjectForSharing, setSelectedProjectForSharing] = useState<any>(null);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Use authentication and data fetching hooks
  const { user, loading: authLoading } = useAuth();
  
  // Debug logging
  console.log('🔍 [TourVirtuali] User from useAuth:', user);
  console.log('🔍 [TourVirtuali] User ID:', user?.id);
  
  const { clients, projects, chatbots, analytics, isLoading, error, refreshData } = useCreatorDashboardFast(user?.id || '');
  
  // Debug logging for dashboard data
  console.log('🔍 [TourVirtuali] Dashboard data:', { 
    hasUser: !!user, 
    userId: user?.id, 
    authLoading,
    isLoading, 
    error,
    clientsCount: clients?.length || 0,
    projectsCount: projects?.length || 0
  });
  
  // Manual refresh function
  const handleRefresh = () => {
    console.log('[TourVirtuali] Manual refresh triggered');
    refreshData();
  };
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Transform database data to match the expected format
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  // Production ready - No demo data
  // Users start with a clean slate


  // Transform database data to match the expected format
  useEffect(() => {
    try {
      console.log('[TourVirtuali] Data transformation - isLoading:', isLoading, 'projects:', projects?.length, 'clients:', clients?.length);
      console.log('[TourVirtuali] Projects data:', projects);
      console.log('[TourVirtuali] Clients data:', clients);
      if (!isLoading) {
        // Use the projects directly from the simple hook
        const allProjects = projects || [];
        console.log('[TourVirtuali] Projects from simple hook:', allProjects);
        
        if (allProjects && allProjects.length > 0) {
          // Use real database data
          const transformedProjects = allProjects.map(project => {
            const client = clients?.find(c => c.id === project.end_client_id);
            const projectChatbots = chatbots?.filter(cb => cb.project_id === project.id) || [];
            const projectAnalytics = analytics?.filter(a => a.project_id === project.id) || [];
            
            // Skip projects without valid client data
            if (!client || !client.id) {
              console.warn('Project has no valid client:', project.id, client);
              return null;
            }
            
            // Calculate real analytics from database data
            const totalViews = projectAnalytics
              .filter(a => a.metric_type === 'view')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const uniqueVisitors = projectAnalytics
              .filter(a => a.metric_type === 'unique_visitor')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const totalTimeSpent = projectAnalytics
              .filter(a => a.metric_type === 'time_spent')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const avgSessionDuration = totalTimeSpent > 0 ? totalTimeSpent : 0;
            
            const conversions = projectAnalytics
              .filter(a => a.metric_type === 'lead_generated')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const conversionRate = totalViews > 0 ? (conversions / totalViews) * 100 : 0;
            
            // Get the primary chatbot for this project
            const primaryChatbot = projectChatbots[0];
            
            return {
              id: project.id,
              client: {
                id: client?.id || '',
                name: client?.name || 'Unknown Client',
                email: client?.email || '',
                company: client?.company || 'Unknown Company',
                avatar: '',
                phone: client?.phone || '',
                website: client?.website || ''
              },
              project: {
                title: project.title || 'Untitled Project',
                description: project.description || `A ${formatProjectType(project.project_type) || 'Virtual Tour'} project`,
                type: formatProjectType(project.project_type) || 'Virtual Tour',
                category: project.category || 'other',
                status: formatProjectStatus(project.status) || 'Setup',
                thumbnail_url: project.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
                created_at: project.created_at || new Date().toISOString(),
                updated_at: project.updated_at || new Date().toISOString()
              },
              chatbot: primaryChatbot ? {
                name: primaryChatbot.name || 'Assistant',
                isActive: primaryChatbot.is_active || false,
                conversations: primaryChatbot.statistics?.total_conversations || 0, // Use real data
                satisfaction: primaryChatbot.statistics?.satisfaction_rate || 0, // Use real data
                language: primaryChatbot.language || 'en',
                welcomeMessage: primaryChatbot.welcome_message || 'Hello! How can I help you today?',
                fallbackMessage: primaryChatbot.fallback_message || 'I apologize, but I need more information to help you.'
              } : null,
              analytics: {
                totalViews: totalViews || 0,
                uniqueVisitors: uniqueVisitors || 0,
                avgSessionDuration: isNaN(avgSessionDuration) ? '0m 0s' : `${Math.floor(avgSessionDuration / 60)}m ${Math.floor(avgSessionDuration % 60)}s`,
                conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 100) / 100,
                lastActivity: project.updated_at || new Date().toISOString(),
                pageViews: totalViews * 1.8, // Estimate
                bounceRate: 0, // Production ready - no random data
                avgPagesPerSession: 0 // Production ready - no random data
              },
              createdAt: project.created_at || new Date().toISOString(),
              lastActivity: project.updated_at || new Date().toISOString()
            };
          }).filter(project => project !== null); // Remove null projects
          
          setClientProjects(transformedProjects);
        } else {
          // Show empty state for new users - production ready
          setClientProjects([]);
        }
      }
    } catch (error) {
      console.error('Error transforming project data:', error);
      // Show empty state on error - production ready
      setClientProjects([]);
    }
  }, [isLoading, clients, projects, chatbots, analytics]);

  // Set up real-time subscriptions for projects
  useEffect(() => {
    if (!user?.id) return;

    console.log('[TourVirtuali] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`tour-virtuali-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[TourVirtuali] Project change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'end_clients',
        },
        (payload) => {
          console.log('[TourVirtuali] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
        },
        (payload) => {
          console.log('[TourVirtuali] Chatbot change detected:', payload);
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
          console.log('[TourVirtuali] Analytics change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[TourVirtuali] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[TourVirtuali] Cleaning up real-time subscriptions');
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
      console.log('[TourVirtuali] Triggering debounced refresh');
      refreshData();
    }, 1000);
  };

  const handleCreateRequest = (project: any) => {
    if (onCreateRequest) {
      onCreateRequest({
        title: `Request for ${project.title}`,
        description: `I would like to request modifications for the project: ${project.title}`,
        type: 'MODIFY',
        priority: 'normal',
        clientName: project.client_name,
        hotspotData: {
          name: project.title,
          position: 'Main area',
          type: 'Information'
        }
      });
    }
  };

  const handleNewProjectCreated = async (newProject: any) => {
    console.log('[TourVirtuali] New project created:', newProject);
    // Close modal first
    setIsNewProjectModalOpen(false);

    // Refresh data immediately to show new project
    console.log('[TourVirtuali] Refreshing data to show new project...');
    refreshData();
  };

  const handleSharePortal = (project: any) => {
    setSelectedProjectForSharing(project);
  };

  const handleViewDetails = (project: any) => {
    // Navigate to client dashboard
    onClientClick?.(project.client);
  };

  const handleManageProject = (project: any) => {
    // Navigate to project management
    console.log('Manage project:', project);
  };

  const handleEditProject = (project: any) => {
    // Open edit client modal
    console.log('Edit client for project:', project);
    console.log('Project client data:', project.client);
    console.log('Client ID:', project.client?.id);
    console.log('Client name:', project.client?.name);
    
    if (!project.client || !project.client.id) {
      console.error('Invalid client data:', project.client);
      toast({
        title: 'Error',
        description: 'Invalid client data. Cannot edit.',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedClientForEdit(project.client);
    setIsEditClientModalOpen(true);
  };

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
    setSelectedClientForEdit(null);
  };

  const handleClientUpdated = async () => {
    // Refresh data to reflect changes
    await refreshData();
  };


  const { toast } = useToast();

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state with helpful message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 mb-4">⚠️ Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          {isDevMode() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-left text-sm">
              <p className="font-semibold mb-2">Dev Mode Debug Info:</p>
              <p className="text-xs">User ID: {user?.id || 'No user'}</p>
              <p className="text-xs mt-2">This might be caused by:</p>
              <ul className="text-xs list-disc ml-4 mt-1">
                <li>Missing creator record in database</li>
                <li>Database connection issue</li>
                <li>Invalid authentication state</li>
              </ul>
            </div>
          )}
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingProjectId(projectToDelete.id);
      console.log('🗑️ Deleting project:', projectToDelete.id);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Project deleted successfully from database');

      toast({
        title: 'Project deleted',
        description: 'The project and its related data were removed successfully.'
      });

      // Close the dialog immediately
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
      
      // Refresh the data to update the UI immediately
      console.log('🔄 Refreshing data to update UI...');
      refreshData();

    } catch (err) {
      console.error('❌ Error deleting project:', err);
      toast({
        title: 'Delete failed',
        description: 'We could not delete this project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingProjectId(null);
    }
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setClientProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, project: { ...p.project, status: newStatus } }
        : p
    ));
    console.log(`Status changed to ${newStatus} for project ${projectId}`);
  };

  const filteredProjects = clientProjects.filter(project => {
    const matchesSearch = (project.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.project?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate real dashboard statistics from actual data
  const totalViews = clientProjects.reduce((sum, project) => sum + (project.analytics?.totalViews || 0), 0);
  const totalVisitors = clientProjects.reduce((sum, project) => sum + (project.analytics?.uniqueVisitors || 0), 0);
  const activeProjects = clientProjects.filter(project => project.project?.status === 'active').length;
  const totalChatbots = clientProjects.filter(project => project.chatbot).length;
  const totalConversations = clientProjects.reduce((sum, project) => sum + (project.chatbot?.conversations || 0), 0);
  const avgSatisfaction = clientProjects.length > 0 
    ? clientProjects.reduce((sum, project) => sum + (project.chatbot?.satisfaction || 0), 0) / clientProjects.length 
    : 0;
  const conversionRate = totalViews > 0 
    ? clientProjects.reduce((sum, project) => sum + (project.analytics?.conversionRate || 0), 0) / clientProjects.length 
    : 0;

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading data</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Client Projects Hub</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">
            Manage all your client projects and track their performance
          </p>
        </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <Activity className="h-4 w-4 mr-2" />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
                            </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors.toLocaleString()} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{totalChatbots}</div>
            <p className="text-xs text-muted-foreground">
              {totalConversations.toLocaleString()} conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients, or companies..."
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
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="setup">Setup</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Projects Grid */}
      {isLoading ? (
        <OptimizedLoading type="dashboard" message="Loading your projects and clients..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleViewDetails}
              onManageProject={handleManageProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onStatusChange={handleStatusChange}
              onSharePortal={handleSharePortal}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No projects found'
                  : 'Welcome to your Client Projects Hub'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters to find projects'
                  : 'Start building your virtual tour business by creating your first client project. You can manage projects, track analytics, and set up chatbots all from here.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <div className="space-y-2">
                  <Button onClick={() => setIsNewProjectModalOpen(true)} className="mr-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Need help getting started? Check out our documentation or contact support.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />

      {/* Share Client Portal Modal */}
      {selectedProjectForSharing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Share Client Portal</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectForSharing(null)}
                >
                  ×
                </Button>
              </div>
              <ShareClientPortal
                projectId={selectedProjectForSharing.id}
                projectTitle={selectedProjectForSharing.project.title}
                clientName={selectedProjectForSharing.client.name}
                clientEmail={selectedProjectForSharing.client.email}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditClientModalOpen}
        onClose={handleCloseEditClientModal}
        client={selectedClientForEdit}
        onClientUpdated={handleClientUpdated}
      />

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.project?.title || 'Untitled'}" for {projectToDelete?.client?.name || 'this client'}? 
              <br /><br />
              <strong>This action cannot be undone.</strong> This will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The project and all its data</li>
                <li>Associated chatbots</li>
                <li>Analytics and reports</li>
                <li>Client requests</li>
                <li>Uploaded assets</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteProject}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingProjectId !== null}
            >
              {deletingProjectId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default TourVirtuali;
