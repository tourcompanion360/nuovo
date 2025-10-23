import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Plus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ClientPortalRequestsProps {
  projectId: string;
  endClientId: string;
}

const ClientPortalRequests: React.FC<ClientPortalRequestsProps> = ({ projectId, endClientId }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    request_type: 'content_change' as const,
    priority: 'medium' as const,
  });
  const [fileLinks, setFileLinks] = useState('');
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRequests();
  }, [projectId]);

  // Set up real-time subscriptions for requests
  useEffect(() => {
    if (!projectId) return;

    console.log('[ClientPortalRequests] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`client-portal-requests-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[ClientPortalRequests] Request change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[ClientPortalRequests] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[ClientPortalRequests] Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [projectId]);

  const debouncedRefresh = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[ClientPortalRequests] Triggering debounced refresh');
      loadRequests();
    }, 1000);
  };

  const loadRequests = async () => {
    try {
      setLoading(true);

      // Get requests for this project (RLS will automatically filter by end_client_id)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('requests').insert({
        project_id: projectId,
        end_client_id: endClientId,
        title: newRequest.title,
        description: newRequest.description,
        request_type: newRequest.request_type,
        priority: newRequest.priority,
        status: 'open',
        file_links: fileLinks,
      });

      if (error) throw error;

      toast({
        title: 'Request submitted',
        description: 'Your request has been sent to the creator.',
      });

      setNewRequest({
        title: '',
        description: '',
        request_type: 'content_change',
        priority: 'medium',
      });
      setFileLinks('');
      setShowNewRequest(false);
      loadRequests();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Failed to submit',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Requests</CardTitle>
              <CardDescription>
                Submit change requests or view existing ones
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewRequest(!showNewRequest)}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showNewRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your request"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about what you'd like changed"
                    rows={4}
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Request Type</Label>
                    <Select
                      value={newRequest.request_type}
                      onValueChange={(value: any) => setNewRequest({ ...newRequest, request_type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content_change">Content Change</SelectItem>
                        <SelectItem value="hotspot_update">Hotspot Update</SelectItem>
                        <SelectItem value="design_modification">Design Modification</SelectItem>
                        <SelectItem value="new_feature">New Feature</SelectItem>
                        <SelectItem value="bug_fix">Bug Fix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newRequest.priority}
                      onValueChange={(value: any) => setNewRequest({ ...newRequest, priority: value })}
                    >
                      <SelectTrigger id="priority">
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-links">Share Files (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Paste links from Google Drive, Dropbox, WeTransfer, or other cloud storage services
                    </p>
                    <Textarea
                      id="file-links"
                      placeholder="https://drive.google.com/file/d/...&#10;https://www.dropbox.com/s/...&#10;https://wetransfer.com/downloads/..."
                      value={fileLinks}
                      onChange={(e) => setFileLinks(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p>• One link per line</p>
                      <p>• Make sure links are publicly accessible or shared with appropriate permissions</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitRequest} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{request.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {request.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {request.request_type.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    {request.creator_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-1">Creator's Response:</p>
                        <p className="text-sm text-muted-foreground">{request.creator_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !showNewRequest && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No requests yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a request to communicate changes or updates with your creator.
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPortalRequests;



