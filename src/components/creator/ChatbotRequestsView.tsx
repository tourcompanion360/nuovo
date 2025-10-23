import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bot, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  MessageSquare,
  X,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import ChatbotRequestForm from '@/components/ChatbotRequestForm';

interface CreatorChatbotRequest {
  id: string;
  chatbot_name: string;
  chatbot_purpose: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  chatbot_link?: string;
  chatbot_url?: string;
  estimated_completion_date?: string;
  project_title: string;
  client_name: string;
  target_audience?: string;
  language?: string;
  tone?: string;
  response_style?: string;
  preferred_contact_method?: string;
  timeline?: string;
  additional_notes?: string;
}

const ChatbotRequestsView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CreatorChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
      loadProjects();
    }
  }, [user?.id]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get current creator ID
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (creatorError || !creator) {
        console.error('Creator not found:', creatorError);
        return;
      }

      // Get all chatbot requests for this creator (excluding soft-deleted ones)
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
              creator_id
            )
          )
        `)
        .eq('projects.end_clients.creator_id', creator.id)
        .eq('deleted_by_creator', false) // Only show non-deleted requests
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedRequests: CreatorChatbotRequest[] = (data || []).map(request => ({
        id: request.id,
        chatbot_name: request.chatbot_name,
        chatbot_purpose: request.chatbot_purpose,
        status: request.status,
        priority: request.priority,
        created_at: request.created_at,
        updated_at: request.updated_at,
        admin_notes: request.admin_notes,
        chatbot_link: request.chatbot_link,
        chatbot_url: request.chatbot_url,
        estimated_completion_date: request.estimated_completion_date,
        project_title: request.projects.title,
        client_name: request.projects.end_clients.name,
        target_audience: request.target_audience,
        language: request.language,
        tone: request.tone,
        response_style: request.response_style,
        preferred_contact_method: request.preferred_contact_method,
        timeline: request.timeline,
        additional_notes: request.additional_notes
      }));

      setRequests(transformedRequests);
    } catch (error: unknown) {
      console.error('Error loading requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chatbot requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // Get current creator ID
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (creatorError || !creator) {
        console.error('Creator not found:', creatorError);
        return;
      }

      // Get all projects for this creator
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          end_clients!inner(
            id,
            name,
            creator_id
          )
        `)
        .eq('end_clients.creator_id', creator.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: unknown) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      setDeletingRequestId(requestId);
      
      const { error } = await supabase.rpc('soft_delete_chatbot_request', {
        request_id: requestId,
        deletion_reason: 'Deleted by creator'
      });

      if (error) throw error;

      toast({
        title: 'Request Deleted',
        description: 'Your chatbot request has been deleted successfully.',
      });

      // Refresh the list to remove the deleted request
      await loadRequests();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete the request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingRequestId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.chatbot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.project_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your chatbot requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Chatbot Requests</h2>
          <p className="text-muted-foreground">
            Track and manage your chatbot development requests
          </p>
        </div>
        <Button onClick={() => setShowProjectSelector(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by chatbot name, client, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No chatbot requests found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t submitted any chatbot requests yet.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowProjectSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.chatbot_name}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status.replace('_', ' ')}
                        </div>
                      </Badge>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{request.chatbot_purpose}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{request.project_title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{request.client_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      {request.language && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{request.language.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    {request.admin_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Admin Notes</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                      </div>
                    )}

                    {/* Chatbot Link */}
                    {request.chatbot_link && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Your Chatbot is Ready!</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(request.chatbot_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Chatbot
                        </Button>
                      </div>
                    )}

                    {/* Estimated Completion */}
                    {request.estimated_completion_date && request.status !== 'completed' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Estimated completion: {format(new Date(request.estimated_completion_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                        disabled={deletingRequestId === request.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingRequestId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Request
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
              
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to create a project first before submitting a chatbot request.
                  </p>
                  <Button onClick={() => setShowProjectSelector(false)}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground mb-4">
                    Choose a project to create a chatbot request for:
                  </p>
                  {projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setShowProjectSelector(false);
                        setShowNewRequestForm(true);
                        // Store selected project for the form
                        setSelectedProject(project);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.end_clients.name}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestForm && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Submit New Chatbot Request</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewRequestForm(false);
                    setSelectedProject(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatbotRequestForm
                projectId={selectedProject.id}
                projectTitle={selectedProject.title}
                clientName={selectedProject.end_clients.name}
                onRequestSubmitted={() => {
                  setShowNewRequestForm(false);
                  setSelectedProject(null);
                  loadRequests(); // Refresh the list
                  toast({
                    title: 'Request Submitted',
                    description: 'Your chatbot request has been submitted successfully!',
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotRequestsView;
