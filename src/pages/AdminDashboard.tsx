import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SupportRequestsManagement from '@/components/admin/SupportRequestsManagement';
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
  Search,
  Filter,
  ShieldX
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [chatbotUrl, setChatbotUrl] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_user_admin_status', {
          user_id: user.id
        });

        if (error) {
          console.error('Error verifying admin access:', error);
          setAdminCheckError('Failed to verify admin access');
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
          if (data === true) {
            loadRequests();
          }
        }
      } catch (error) {
        console.error('Error in admin verification:', error);
        setAdminCheckError('Failed to verify admin access');
        setIsAdmin(false);
      }
    };

    verifyAdminAccess();
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Get all chatbot requests with project and client info
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
                agency_name,
                contact_email
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
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
    } catch (error: any) {
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

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.chatbot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projects.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projects.end_clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projects.end_clients.creators.agency_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Show loading while checking admin status
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error if admin check failed
  if (adminCheckError) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 pt-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold text-destructive">Access Verification Failed</h3>
            <p className="text-muted-foreground">
              Unable to verify your admin status. Please try again or contact support.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 pt-6">
            <ShieldX className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold text-destructive">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. 
              Only administrators can view this area.
            </p>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage chatbot requests and support tickets from tour creators
        </p>
      </div>

      <Tabs defaultValue="chatbot-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chatbot-requests">Chatbot Requests</TabsTrigger>
          <TabsTrigger value="support-requests">Support Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot-requests" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Chatbot Requests</h2>
            <p className="text-muted-foreground">
              Manage all chatbot creation requests from tour creators
            </p>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
                  <CardDescription>
                    Click on a request to view details and manage it
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes(request.admin_notes || '');
                        setChatbotUrl(request.chatbot_url || '');
                        setEstimatedDate(
                          request.estimated_completion_date 
                            ? format(new Date(request.estimated_completion_date), 'yyyy-MM-dd')
                            : ''
                        );
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{request.chatbot_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.projects.title} • {request.projects.end_clients.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.projects.end_clients.creators.agency_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
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
        </TabsContent>

        <TabsContent value="support-requests" className="space-y-6">
          <SupportRequestsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;





