import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ClientAvatar from '@/components/ui/ClientAvatar';
import { useToast } from '@/hooks/use-toast';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Upload,
  Link,
  Image,
  FileText,
  Video,
  Music,
  Send,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  Edit,
  Mail,
  Folder,
  ExternalLink,
  Loader2,
  FileVideo2,
  FileImage as FileImageIcon,
  FileAudio2
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function MediaLibrary() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'media' | 'clients'>('media');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form state for new media
  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    type: 'link' as 'link',
    url: '',
    file: null as File | null
  });
  
  // Use authentication and data fetching hooks
  const { user } = useAuth();
  const { clients, projects, assets, isLoading, refreshData, error } = useCreatorDashboard(user?.id || '');
  const { toast } = useToast();
  
  // Real-time subscription setup
  const channelRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getMediaIcon = (fileType: string, title: string) => {
    // Check file type first
    if (fileType === 'audio' || title.toLowerCase().includes('audio')) {
      return <Music className="h-6 w-6 text-blue-500" />;
    }
    if (fileType === 'video' || title.toLowerCase().includes('video')) {
      return <FileVideo2 className="h-6 w-6 text-red-500" />;
    }
    if (fileType === 'image' || title.toLowerCase().includes('image') || title.toLowerCase().includes('photo')) {
      return <FileImageIcon className="h-6 w-6 text-green-500" />;
    }
    if (fileType === 'document' || title.toLowerCase().includes('document') || title.toLowerCase().includes('pdf')) {
      return <FileText className="h-6 w-6 text-orange-500" />;
    }
    if (fileType === 'link') {
      return <ExternalLink className="h-6 w-6 text-purple-500" />;
    }
    
    // Default fallback
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const getMediaTypeLabel = (fileType: string, title: string) => {
    if (fileType === 'audio' || title.toLowerCase().includes('audio')) {
      return 'Audio';
    }
    if (fileType === 'video' || title.toLowerCase().includes('video')) {
      return 'Video';
    }
    if (fileType === 'image' || title.toLowerCase().includes('image') || title.toLowerCase().includes('photo')) {
      return 'Image';
    }
    if (fileType === 'document' || title.toLowerCase().includes('document') || title.toLowerCase().includes('pdf')) {
      return 'Document';
    }
    if (fileType === 'link') {
      return 'Link';
    }
    
    return 'File';
  };

  // Set up real-time subscriptions for assets
  useEffect(() => {
    if (!user?.id) return;

    console.log('[MediaLibrary] Setting up real-time subscriptions');

    const channel = supabase
      .channel(`media-library-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
        },
        (payload) => {
          console.log('[MediaLibrary] Asset change detected:', payload);
          debouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('[MediaLibrary] Project change detected:', payload);
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
          console.log('[MediaLibrary] Client change detected:', payload);
          debouncedRefresh();
        }
      )
      .subscribe((status) => {
        console.log('[MediaLibrary] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('[MediaLibrary] Cleaning up real-time subscriptions');
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
      console.log('[MediaLibrary] Triggering debounced refresh');
      refreshData();
    }, 1000);
  };
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [isDeleteAssetDialogOpen, setIsDeleteAssetDialogOpen] = useState(false);

  const handleDeleteAsset = (assetId: string) => {
    setAssetToDelete(assetId);
    setIsDeleteAssetDialogOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetToDelete);

      if (error) throw error;

      toast({ title: 'Media deleted', description: 'The item was removed from your library.' });
      await refreshData();
    } catch (err) {
      console.error('Error deleting asset:', err);
      toast({ title: 'Delete failed', description: 'Could not delete the media.', variant: 'destructive' });
    } finally {
      setAssetToDelete(null);
      setIsDeleteAssetDialogOpen(false);
    }
  };

  const cancelDeleteAsset = () => {
    setAssetToDelete(null);
    setIsDeleteAssetDialogOpen(false);
  };

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading media library...</p>
        </div>
      </div>
    );
  }

  // Safety check for assets
  const safeAssets = assets || [];
  const safeClients = clients || [];
  
  // Count only clients that have projects (not just client records)
  const clientsWithProjects = safeClients.filter(client => {
    // Check if this client has any projects
    return projects && projects.some(project => project.end_client_id === client.id);
  });

  // Get assets for the selected client (when in client view)
  const getAssetsForClient = (clientId: string) => {
    if (!projects || !safeAssets) return [];
    
    // Find the project for this client
    const clientProject = projects.find(project => project.end_client_id === clientId);
    if (!clientProject) return [];
    
    // Return assets for this project
    return safeAssets.filter(asset => asset.project_id === clientProject.id);
  };

  // Get total media count for a specific client
  const getMediaCountForClient = (clientId: string) => {
    return getAssetsForClient(clientId).length;
  };

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSendMedia = async () => {
    if (!newMedia.title.trim() || !newMedia.url.trim()) {
      toast({
        title: "Error",
        description: "Title and Link URL are required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(newMedia.url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive"
      });
      return;
    }

    if (selectedClients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one client",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get the current user's creator ID
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (creatorError || !creator) {
        throw new Error('Creator profile not found');
      }

      // Get projects for selected clients
      const { data: clientProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, end_client_id')
        .in('end_client_id', selectedClients);

      if (projectsError) {
        throw new Error('Failed to fetch client projects');
      }

      if (!clientProjects || clientProjects.length === 0) {
        throw new Error('No projects found for selected clients');
      }

      // Create media assets for each client's project
      const mediaInserts = clientProjects.map(project => ({
        creator_id: creator.id,
        project_id: project.id,
        filename: newMedia.title,
        original_filename: newMedia.title,
        file_type: newMedia.type === 'link' ? 'text/url' : `application/${newMedia.type}`,
        file_size: 0, // For links, size is 0
        file_url: newMedia.url,
        thumbnail_url: newMedia.type === 'image' ? newMedia.url : null,
        tags: [],
        metadata: {
          description: newMedia.description,
          type: newMedia.type,
          sent_to_clients: selectedClients.length
        }
      }));

      // Insert media assets into database
      const { error: insertError } = await supabase
        .from('assets')
        .insert(mediaInserts);

      if (insertError) {
        throw new Error(`Failed to save media: ${insertError.message}`);
      }

      toast({
        title: "Success",
        description: `Media sent to ${selectedClients.length} client(s) successfully!`,
      });
      
      setIsUploadDialogOpen(false);
      setNewMedia({ title: '', description: '', type: 'link', url: '', file: null });
      setSelectedClients([]);
      
      // Refresh the data to show the new media
      await refreshData();
      
    } catch (error: unknown) {
      console.error('Error sending media:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send media";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setViewMode('clients');
  };

  const handleBackToMedia = () => {
    setSelectedClient(null);
    setViewMode('media');
  };

  const getFileIcon = (fileType: string, title: string = '') => {
    const lowerTitle = title.toLowerCase();
    const lowerFileType = fileType.toLowerCase();
    
    // Check for audio files
    if (lowerFileType === 'audio' || lowerTitle.includes('audio') || lowerTitle.includes('music') || lowerTitle.includes('sound') || lowerTitle.includes('.mp3') || lowerTitle.includes('.wav') || lowerTitle.includes('.m4a')) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-md">
          <Music className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    // Check for video files
    if (lowerFileType === 'video' || lowerTitle.includes('video') || lowerTitle.includes('movie') || lowerTitle.includes('clip') || lowerTitle.includes('.mp4') || lowerTitle.includes('.avi') || lowerTitle.includes('.mov')) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center shadow-md">
          <FileVideo2 className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    // Check for image files
    if (lowerFileType === 'image' || lowerTitle.includes('image') || lowerTitle.includes('photo') || lowerTitle.includes('picture') || lowerTitle.includes('.jpg') || lowerTitle.includes('.png') || lowerTitle.includes('.gif')) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center shadow-md">
          <FileImageIcon className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    // Check for document files
    if (lowerFileType === 'document' || lowerTitle.includes('document') || lowerTitle.includes('pdf') || lowerTitle.includes('file') || lowerTitle.includes('.pdf') || lowerTitle.includes('.doc') || lowerTitle.includes('.txt')) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center shadow-md">
          <FileText className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    // Check for links/URLs
    if (lowerFileType === 'link' || lowerFileType === 'url' || lowerTitle.includes('link') || lowerTitle.includes('url') || lowerTitle.includes('http')) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shadow-md">
          <ExternalLink className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    // Legacy support for old file type formats
    if (fileType.startsWith('image/')) return (
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center shadow-md">
        <FileImageIcon className="h-4 w-4 text-white" />
      </div>
    );
    if (fileType.startsWith('video/')) return (
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center shadow-md">
        <FileVideo2 className="h-4 w-4 text-white" />
      </div>
    );
    if (fileType.startsWith('audio/')) return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-md">
        <Music className="h-4 w-4 text-white" />
      </div>
    );
    
    // Default fallback - show a link icon since most media are links now
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shadow-md">
        <ExternalLink className="h-4 w-4 text-white" />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {viewMode === 'clients' && selectedClient && (
            <Button
              variant="outline"
              onClick={handleBackToMedia}
              className="flex items-center gap-2"
            >
              ← Back to Media Library
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {viewMode === 'clients' && selectedClient 
                ? `${selectedClient.name} - Media Dashboard` 
                : 'Media Library'
              }
            </h1>
            <p className="text-foreground-secondary text-sm sm:text-base">
              {viewMode === 'clients' && selectedClient
                ? `View all media shared with ${selectedClient.name} and their end user dashboard`
                : 'Manage and distribute media content to your clients'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!selectedClient && (
            <>
              <Button
                variant={viewMode === 'media' ? 'default' : 'outline'}
                onClick={() => setViewMode('media')}
                size="sm"
              >
                Media View
              </Button>
              <Button
                variant={viewMode === 'clients' ? 'default' : 'outline'}
                onClick={() => setViewMode('clients')}
                size="sm"
              >
                Clients View
              </Button>
            </>
          )}
          <Button 
            className="bg-primary hover:bg-primary-hover"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Link className="h-4 w-4 mr-2" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Media items in library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsWithProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Content based on view mode */}
      {viewMode === 'media' ? (
        /* Media Grid */
        safeAssets.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Media Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first media item to share with clients
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Link className="h-4 w-4 mr-2" />
                Share Your First Link
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
{(() => {
                          const fileType = asset.file_type || '';
                          const title = asset.title || asset.original_filename || asset.filename || '';
                          const lowerTitle = title.toLowerCase();
                          const lowerFileType = fileType.toLowerCase();
                          
                          // Audio files - Blue with music note
                          if (lowerFileType === 'audio' || lowerTitle.includes('audio') || lowerTitle.includes('music') || lowerTitle.includes('sound')) {
                            return (
                              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">♪</div>
                              </div>
                            );
                          }
                          
                          // Video files - Red with play button
                          if (lowerFileType === 'video' || lowerTitle.includes('video') || lowerTitle.includes('movie') || lowerTitle.includes('clip')) {
                            return (
                              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">▶</div>
                              </div>
                            );
                          }
                          
                          // Image files - Green with image symbol
                          if (lowerFileType === 'image' || lowerTitle.includes('image') || lowerTitle.includes('photo') || lowerTitle.includes('picture')) {
                            return (
                              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">🖼</div>
                              </div>
                            );
                          }
                          
                          // Document files - Orange with document symbol
                          if (lowerFileType === 'document' || lowerTitle.includes('document') || lowerTitle.includes('pdf') || lowerTitle.includes('file')) {
                            return (
                              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">📄</div>
                              </div>
                            );
                          }
                          
                          // Default: Link/URL - Purple with link symbol
                          return (
                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-md">
                              <div className="text-white text-lg font-bold">🔗</div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {asset.original_filename || asset.filename}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getMediaTypeLabel(asset.file_type || '', asset.title || asset.original_filename || asset.filename || '')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((asset.file_size || 0) / 1024)}KB
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploaded {new Date(asset.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>0 views</span>
                      </div>
                    </div>
                    
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteAsset(asset.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : viewMode === 'clients' && selectedClient ? (
        /* Client Detail View */
        <div className="space-y-6">
          {/* Client Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                  <CardDescription className="text-lg">{selectedClient.company}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedClient.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{selectedClient.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Client's Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Media Shared with {selectedClient.name} 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({getMediaCountForClient(selectedClient.id)} items)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAssetsForClient(selectedClient.id).map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
  {(() => {
                          const fileType = asset.file_type || '';
                          const title = asset.title || asset.original_filename || asset.filename || '';
                          const lowerTitle = title.toLowerCase();
                          const lowerFileType = fileType.toLowerCase();
                          
                          // Audio files - Blue with music note
                          if (lowerFileType === 'audio' || lowerTitle.includes('audio') || lowerTitle.includes('music') || lowerTitle.includes('sound')) {
                            return (
                              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">♪</div>
                              </div>
                            );
                          }
                          
                          // Video files - Red with play button
                          if (lowerFileType === 'video' || lowerTitle.includes('video') || lowerTitle.includes('movie') || lowerTitle.includes('clip')) {
                            return (
                              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">▶</div>
                              </div>
                            );
                          }
                          
                          // Image files - Green with image symbol
                          if (lowerFileType === 'image' || lowerTitle.includes('image') || lowerTitle.includes('photo') || lowerTitle.includes('picture')) {
                            return (
                              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">🖼</div>
                              </div>
                            );
                          }
                          
                          // Document files - Orange with document symbol
                          if (lowerFileType === 'document' || lowerTitle.includes('document') || lowerTitle.includes('pdf') || lowerTitle.includes('file')) {
                            return (
                              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center shadow-md">
                                <div className="text-white text-lg font-bold">📄</div>
                              </div>
                            );
                          }
                          
                          // Default: Link/URL - Purple with link symbol
                          return (
                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-md">
                              <div className="text-white text-lg font-bold">🔗</div>
                            </div>
                          );
                        })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {asset.original_filename || asset.filename}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {getMediaTypeLabel(asset.file_type || '', asset.title || asset.original_filename || asset.filename || '')}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Shared {new Date(asset.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>0 views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a href={asset.file_url || asset.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Media
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Clients List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientsWithProjects.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleClientClick(client)}
            >
              <CardHeader>
                <div className="card-header-safe">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <ClientAvatar 
                      name={client.name} 
                      size="md" 
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg name-display-safe">{client.name}</CardTitle>
                      <CardDescription className="company-display-safe">{client.company}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="email-display-safe">{client.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Media shared:</span>
                    <span className="font-medium">{getMediaCountForClient(client.id)} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Media Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newMedia.title}
                onChange={(e) => setNewMedia(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter media title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMedia.description}
                onChange={(e) => setNewMedia(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter media description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="url">Link URL *</Label>
              <Input
                id="url"
                value={newMedia.url}
                onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/media-file"
                required
                type="url"
              />
            </div>

            <div>
              <Label>Send to Clients</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {clientsWithProjects.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <Label htmlFor={client.id} className="text-sm">
                      {client.name} ({client.company})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMedia} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Share Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Asset Confirmation Dialog */}
      <AlertDialog open={isDeleteAssetDialogOpen} onOpenChange={setIsDeleteAssetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media from your library? 
              <br /><br />
              <strong>This action cannot be undone.</strong> The media file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteAsset}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAsset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Media
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}