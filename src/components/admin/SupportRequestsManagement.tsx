import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

interface SupportRequest {
  id: string;
  user_id: string;
  creator_id: string;
  subject: string;
  message: string;
  request_type: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_response?: string;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_email?: string;
  agency_name?: string;
}

const SupportRequestsManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSupportRequests();
  }, []);

  const loadSupportRequests = async () => {
    try {
      setLoading(true);
      
      // Use the RPC function to get all support requests
      const { data, error } = await supabase.rpc('get_all_support_requests');

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading support requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support requests',
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
        .from('support_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Updated',
        description: 'Support request has been updated successfully.',
      });

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updates } : req
      ));

      // Update selected request
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
      }

      // Clear form
      setAdminResponse('');
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error updating support request:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update the request.',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Filter requests by status
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

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
        <h2 className="text-xl font-semibold">Support Requests</h2>
        <p className="text-muted-foreground">
          Manage support requests from tour creators
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Open</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'open').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
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
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'resolved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Support Requests ({filteredRequests.length})</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No support requests found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === 'all' 
                      ? 'No support requests have been submitted yet.'
                      : `No requests with status "${statusFilter}" found.`
                    }
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
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
                          <h3 className="font-semibold">{request.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.agency_name} • {request.creator_email}
                          </p>
                        </div>
                        {/* REMOVED: Priority and Status badges */}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {request.message.length > 50 
                            ? `${request.message.substring(0, 50)}...` 
                            : request.message
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Details */}
        {selectedRequest ? (
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request Info */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.subject}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedRequest.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select 
                      value={selectedRequest.status} 
                      onValueChange={(value) => updateRequest(selectedRequest.id, { status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select 
                      value={selectedRequest.priority} 
                      onValueChange={(value) => updateRequest(selectedRequest.id, { priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold">Creator Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{selectedRequest.agency_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedRequest.creator_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted {format(new Date(selectedRequest.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Admin Response */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="adminResponse">Admin Response</Label>
                <Textarea
                  id="adminResponse"
                  placeholder="Type your response to the creator..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => updateRequest(selectedRequest.id, { 
                    admin_response: adminResponse,
                    status: 'resolved'
                  })}
                  disabled={updating || !adminResponse.trim()}
                >
                  {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send Response'}
                </Button>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add internal notes about this request..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRequest(selectedRequest.id, { admin_notes: adminNotes })}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Notes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a request to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportRequestsManagement;