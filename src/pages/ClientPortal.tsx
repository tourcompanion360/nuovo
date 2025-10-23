import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, MessageSquare, TrendingUp, Image, FileText, Settings, LogOut, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientPortalAnalytics from '@/components/client-portal/ClientPortalAnalytics';
import ClientPortalMedia from '@/components/client-portal/ClientPortalMedia';
import ClientPortalRequests from '@/components/client-portal/ClientPortalRequests';
import ClientPortalChatbot from '@/components/client-portal/ClientPortalChatbot';
import { useClientPortalRealtime } from '@/hooks/useClientPortalRealtime';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { formatProjectType } from '@/utils/formatDisplayText';
import RecentActivity from '@/components/RecentActivity';
import { clientPortalRateLimiter, generateRateLimitKey } from '@/utils/rateLimiter';

const ClientPortal = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [endClient, setEndClient] = useState<any>(null);
  const [chatbot, setChatbot] = useState<any>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetTime: number } | null>(null);

  // Use real activity data for this project
  const { activities, loading: activitiesLoading, error: activitiesError, refresh: refreshActivities } = useRecentActivity({
    projectId: projectId || undefined,
    limit: 10
  });

  const loadData = async () => {
    try {
      setLoading(true);

      // Check rate limit before making requests
      const rateLimitKey = generateRateLimitKey();
      const rateLimitResult = clientPortalRateLimiter.isAllowed(rateLimitKey);
      
      if (!rateLimitResult.allowed) {
        setRateLimitExceeded(true);
        setRateLimitInfo({
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        });
        setLoading(false);
        return;
      }

      setRateLimitInfo({
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      });

      // Get current user
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to access your portal.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Get end_client_id for this user using RLS
      const { data: mapping, error: mappingErr } = await supabase
        .from('end_client_users')
        .select('end_client_id, email')
        .eq('auth_user_id', user.id)
        .single();

      if (mappingErr || !mapping) {
        toast({
          title: 'Access denied',
          description: 'You do not have access to this portal.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Get project with RLS filtering (RLS will automatically filter by end_client_id)
      const { data: projectData, error: projectErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectErr || !projectData) {
        toast({
          title: 'Project not found',
          description: 'This project does not exist or you do not have access.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setProject(projectData);

      // Get end client info using RLS
      const { data: clientData } = await supabase
        .from('end_clients')
        .select('*')
        .eq('id', mapping.end_client_id)
        .single();

      setEndClient(clientData);

      // Get chatbot for this project using RLS
      const { data: chatbotData } = await supabase
        .from('chatbots')
        .select('*')
        .eq('project_id', projectId)
        .single();

      setChatbot(chatbotData);

    } catch (error: any) {
      console.error('Error loading portal data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portal data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Real-time sync
  useClientPortalRealtime(projectId || '', loadData);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (rateLimitExceeded) {
    const resetTime = new Date(rateLimitInfo?.resetTime || Date.now() + 60000);
    const timeUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Rate Limit Exceeded</CardTitle>
            <CardDescription>
              Too many requests. Please wait before trying again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>You can try again in:</p>
              <p className="font-mono text-lg font-semibold text-primary">
                {Math.floor(timeUntilReset / 60)}:{(timeUntilReset % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The project you're looking for doesn't exist or you don't have access.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              <p className="text-sm text-muted-foreground">
                {endClient?.company} • Client Portal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="media">
              <Image className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="chatbot">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="requests">
              <FileText className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>View your virtual tour details and quick stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <Badge variant="outline">{formatProjectType(project.project_type)}</Badge>
                </div>
                {project.tour_url && (
                  <div>
                    <h3 className="font-semibold mb-2">Virtual Tour</h3>
                    <Button asChild>
                      <a href={project.tour_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        View Tour
                      </a>
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{project.views || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Chatbot Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={chatbot?.status === 'active' ? 'default' : 'secondary'}>
                        {chatbot?.status || 'Not configured'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <RecentActivity
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
              onRefresh={refreshActivities}
              title="Recent Activity"
              description="Latest updates and interactions for this project"
              showStats={true}
              maxItems={6}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <ClientPortalAnalytics projectId={projectId!} />
          </TabsContent>

          <TabsContent value="media">
            <ClientPortalMedia projectId={projectId!} />
          </TabsContent>

          <TabsContent value="chatbot">
            <ClientPortalChatbot chatbot={chatbot} projectId={projectId!} />
          </TabsContent>

          <TabsContent value="requests">
            <ClientPortalRequests projectId={projectId!} endClientId={endClient?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientPortal;



