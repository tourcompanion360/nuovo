import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatProjectType } from '@/utils/formatDisplayText';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, MessageSquare, TrendingUp, Image, FileText, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientPortalAnalytics from '@/components/client-portal/ClientPortalAnalytics';
import ClientPortalMedia from '@/components/client-portal/ClientPortalMedia';
import ClientPortalRequests from '@/components/client-portal/ClientPortalRequests';
import ClientPortalChatbot from '@/components/client-portal/ClientPortalChatbot';

const TestClientPortal = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [endClient, setEndClient] = useState<any>(null);
  const [chatbot, setChatbot] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!projectId) {
        toast({
          title: 'Project not found',
          description: 'No project ID provided.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Get project data directly (bypassing authentication for test)
      const { data: projectData, error: projectErr } = await supabase
        .from('projects')
        .select(`
          *,
          end_clients (
            id,
            name,
            email,
            company,
            phone,
            website
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectErr || !projectData) {
        toast({
          title: 'Project not found',
          description: 'This project does not exist.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setProject(projectData);
      setEndClient(projectData.end_clients);

      // Get chatbot for this project
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
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!project || !endClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">This project does not exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              <p className="text-muted-foreground">
                Welcome, {endClient.name} • {endClient.company}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="analytics">
            <ClientPortalAnalytics projectId={projectId!} />
          </TabsContent>

          <TabsContent value="media">
            <ClientPortalMedia projectId={projectId!} />
          </TabsContent>

          <TabsContent value="requests">
            <ClientPortalRequests projectId={projectId!} />
          </TabsContent>

          <TabsContent value="chatbot">
            <ClientPortalChatbot projectId={projectId!} chatbot={chatbot} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestClientPortal;