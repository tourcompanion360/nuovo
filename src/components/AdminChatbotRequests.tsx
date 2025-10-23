import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Building, 
  Globe, 
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatbotRequest {
  id: string;
  project_id: string;
  end_client_id: string;
  
  // Required fields from base schema
  title: string;
  description: string;
  request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  
  // Chatbot-specific fields
  chatbot_name?: string;
  chatbot_purpose?: string;
  target_audience?: string;
  language?: string;
  website_url?: string;
  existing_content?: string;
  specific_questions?: string;
  business_info?: string;
  tone?: string;
  response_style?: string;
  special_instructions?: string;
  
  // Additional fields
  preferred_contact_method?: string;
  timeline?: string;
  additional_notes?: string;
  file_links?: string;
  chatbot_link?: string;
  
  // Metadata
  uploaded_files?: any[];
  admin_notes?: string;
  estimated_completion_date?: string;
  chatbot_url?: string;
  
  // Deletion tracking:
  deleted_by_creator?: boolean;
  deleted_by_admin?: boolean;
  creator_deleted_at?: string;
  admin_deleted_at?: string;
  deletion_reason?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  projects?: { 
    title: string; 
    end_clients: { 
      name: string; 
      email: string;
      company?: string;
      creators: {
        agency_name: string;
        contact_email: string;
      }
    } 
  };
}

const AdminChatbotRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChatbotRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [chatbotUrl, setChatbotUrl] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [hardDeletingId, setHardDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get all chatbot requests with project and client info
      const { data, error } = await supabase
        .from('chatbot_requests')
        .select(`
          *,
          projects:project_id (
            id,
            title,
            end_clients:end_client_id (
              id,
              name,
              email,
              company,
              creators:creator_id (
                id,
                agency_name,
                contact_email
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const updateRequest = async (requestId: string, updates: any) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('chatbot_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Updated',
        description: 'The chatbot request has been updated successfully'
      });

      loadRequests();
    } catch (error: unknown) {
      console.error('Error updating request:', error);
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleHardDelete = async (requestId: string) => {
    try {
      setHardDeletingId(requestId);
      
      const { error } = await supabase.rpc('hard_delete_chatbot_request', {
        request_id: requestId
      });

      if (error) throw error;

      toast({
        title: 'Request Permanently Deleted',
        description: 'The chatbot request has been permanently removed from the system.',
      });

      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error hard deleting request:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to permanently delete the request.',
        variant: 'destructive'
      });
    } finally {
      setHardDeletingId(null);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div>
        <h1 className="text-2xl font-bold">Chatbot Requests</h1>
        <p className="text-muted-foreground">
          Manage custom chatbot creation requests from tour creators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Requests ({requests.length})</CardTitle>
              <CardDescription>
                Click on a request to view details and manage it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {requests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{request.chatbot_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.projects.title} • {request.projects.end_clients.name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            {request.deleted_by_creator && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                Deleted by Creator
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {request.projects.end_clients.creators.agency_name}
                          </div>
                          {request.uploaded_files && request.uploaded_files.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {request.uploaded_files.length} files
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
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

                {/* Client Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Client Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{selectedRequest.projects.end_clients.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{selectedRequest.projects.end_clients.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{selectedRequest.projects.end_clients.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{selectedRequest.projects.end_clients.creators.agency_name}</span>
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
                      {selectedRequest.uploaded_files.map((file: any, index: number) => (
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
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Admin Actions</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(value) => updateRequest(selectedRequest.id, { status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add notes about this request..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateRequest(selectedRequest.id, { admin_notes: adminNotes })}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Notes'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chatbotUrl">Chatbot URL</Label>
                    <Input
                      id="chatbotUrl"
                      placeholder="https://your-chatbot-url.com"
                      value={chatbotUrl}
                      onChange={(e) => setChatbotUrl(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateRequest(selectedRequest.id, { chatbot_url: chatbotUrl })}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save URL'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDate">Estimated Completion</Label>
                    <Input
                      id="estimatedDate"
                      type="date"
                      value={estimatedDate}
                      onChange={(e) => setEstimatedDate(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateRequest(selectedRequest.id, { 
                        estimated_completion_date: estimatedDate ? new Date(estimatedDate).toISOString() : null 
                      })}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Date'}
                    </Button>
                  </div>

                  {/* Hard Delete Section */}
                  <div className="space-y-2 border-t pt-4">
                    <Label className="text-red-600">Danger Zone</Label>
                    <div className="space-y-2">
                      {selectedRequest.deleted_by_creator && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              Deleted by Creator
                            </span>
                          </div>
                          <p className="text-sm text-orange-700">
                            This request was deleted by the creator on{' '}
                            {selectedRequest.creator_deleted_at && 
                              format(new Date(selectedRequest.creator_deleted_at), 'MMM d, yyyy HH:mm')
                            }
                          </p>
                          {selectedRequest.deletion_reason && (
                            <p className="text-sm text-orange-600 mt-1">
                              Reason: {selectedRequest.deletion_reason}
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleHardDelete(selectedRequest.id)}
                        disabled={hardDeletingId === selectedRequest.id}
                        className="w-full"
                      >
                        {hardDeletingId === selectedRequest.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Permanently Delete Request
                      </Button>
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

export default AdminChatbotRequests;





