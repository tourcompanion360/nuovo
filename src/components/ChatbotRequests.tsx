import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bot, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  MessageSquare,
  Settings,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import ChatbotRequestForm from './ChatbotRequestForm';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';

const ChatbotRequests = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedProjectForNewRequest, setSelectedProjectForNewRequest] = useState<any>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  // const [activeTab, setActiveTab] = useState<'existing' | 'requests'>('existing');
  
  // Get projects and chatbots for the creator
  const { projects: rawProjects, clients, chatbots } = useCreatorDashboard(user?.id || '');
  
  // Transform projects to include client data
  const projects = rawProjects.map(project => {
    const client = clients?.find(c => c.id === project.end_client_id);
    return {
      id: project.id,
      project: {
        title: project.title || 'Untitled Project',
        description: project.description || '',
        type: project.project_type || 'virtual_tour',
        status: project.status || 'setup',
        created_at: project.created_at || new Date().toISOString(),
        updated_at: project.updated_at || new Date().toISOString()
      },
      client: {
        name: client?.name || 'Unknown Client',
        email: client?.email || '',
        company: client?.company || 'Unknown Company',
        phone: client?.phone || '',
        website: client?.website || ''
      },
      end_clients: client // Keep the original client data for compatibility
    };
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get chatbot requests for this creator's projects
      // TODO: SECURITY - Add frontend authorization check as defense in depth
      // Currently relies only on Supabase RLS - consider adding user validation
      const { data, error } = await supabase
        .from('chatbot_requests')
        .select(`
          *,
          projects!inner(
            id,
            title,
            end_clients!inner(
              id,
              name,
              email,
              company,
              creators!inner(
                id,
                user_id
              )
            )
          )
        `)
        .eq('projects.end_clients.creators.user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: unknown) {
      console.error('Error loading requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chatbot requests';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequestSubmitted = () => {
    setIsNewRequestOpen(false);
    setSelectedProjectForNewRequest(null);
    setShowProjectSelector(false);
    loadRequests(); // Reload the requests list
    toast({
      title: 'Request Submitted',
      description: 'Your chatbot request has been submitted successfully.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_review':
        return <Eye className="h-4 w-4" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chatbots</h1>
          <p className="text-muted-foreground">
            Request custom chatbots for your projects
          </p>
        </div>
        <Button onClick={() => setShowProjectSelector(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chatbot Requests Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Submit your first chatbot request to get started with custom chatbots for your projects.
            </p>
            <Button onClick={() => setShowProjectSelector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Requests ({requests.length})</CardTitle>
                <CardDescription>
                  Track the status of your chatbot requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{request.chatbot_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.projects?.title || 'Unknown Project'} • {request.projects?.end_clients?.name || 'Unknown Client'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.chatbot_purpose}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(request.created_at), 'MMM d, yyyy')}
                            </div>
                            {request.uploaded_files && request.uploaded_files.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {request.uploaded_files.length} files
                              </div>
                            )}
                            {request.priority && (
                              <Badge variant="outline" className="text-xs">
                                {request.priority} priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Details */}
          <div>
            {selectedRequest ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Status</h3>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Chatbot Name:</span>
                        <p>{selectedRequest.chatbot_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Purpose:</span>
                        <p>{selectedRequest.chatbot_purpose}</p>
                      </div>
                      <div>
                        <span className="font-medium">Target Audience:</span>
                        <p>{selectedRequest.target_audience || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Language:</span>
                        <p>{selectedRequest.language}</p>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Project Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Project:</span>
                        <p>{selectedRequest.projects?.title || 'Unknown Project'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Client:</span>
                        <p>{selectedRequest.projects?.end_clients?.name || 'Unknown Client'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Company:</span>
                        <p>{selectedRequest.projects?.end_clients?.company || 'Unknown Company'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  {selectedRequest.existing_content && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Existing Content</h3>
                      <div className="text-sm bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                        {selectedRequest.existing_content}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {selectedRequest.uploaded_files && selectedRequest.uploaded_files.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Shared Files</h3>
                      <div className="space-y-2">
                        {selectedRequest.uploaded_files.map((file: Record<string, unknown>, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedRequest.admin_notes && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Admin Notes</h3>
                      <div className="text-sm bg-muted p-3 rounded-lg">
                        {selectedRequest.admin_notes}
                      </div>
                    </div>
                  )}

                  {/* Chatbot URL */}
                  {selectedRequest.chatbot_url && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Chatbot URL</h3>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(selectedRequest.chatbot_url, '_blank')}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Open Chatbot
                      </Button>
                    </div>
                  )}

                  {/* Timeline */}
                  {selectedRequest.estimated_completion_date && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Estimated Completion</h3>
                      <div className="text-sm">
                        {format(new Date(selectedRequest.estimated_completion_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a request to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Project for Chatbot Request</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProjectSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedProjectForNewRequest(project);
                      setShowProjectSelector(false);
                      setIsNewRequestOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{project.project.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.client.name} • {project.client.company}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {isNewRequestOpen && selectedProjectForNewRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Request Custom Chatbot</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsNewRequestOpen(false);
                    setSelectedProjectForNewRequest(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatbotRequestForm
                projectId={selectedProjectForNewRequest.id}
                projectTitle={selectedProjectForNewRequest.project.title}
                clientName={selectedProjectForNewRequest.client.name}
                onRequestSubmitted={handleNewRequestSubmitted}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotRequests;
