import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, FileText, Download, Video, File, FileImage, ExternalLink, Music, FileAudio, FileVideo, FileImage as FileImageIcon, FileVideo2, FileAudio2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientPortalMediaProps {
  projectId: string;
}

const ClientPortalMedia: React.FC<ClientPortalMediaProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    loadMedia();
  }, [projectId]);

  const getMediaIcon = (fileType: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    const lowerFileType = fileType.toLowerCase();
    
    // Debug: log what we're getting
    console.log('Media Icon Debug:', { fileType, title, lowerFileType, lowerTitle });
    
    // Check for audio files
    if (lowerFileType === 'audio' || lowerTitle.includes('audio') || lowerTitle.includes('music') || lowerTitle.includes('sound') || lowerTitle.includes('.mp3') || lowerTitle.includes('.wav') || lowerTitle.includes('.m4a')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
          <Music className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    // Check for video files
    if (lowerFileType === 'video' || lowerTitle.includes('video') || lowerTitle.includes('movie') || lowerTitle.includes('clip') || lowerTitle.includes('.mp4') || lowerTitle.includes('.avi') || lowerTitle.includes('.mov')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
          <FileVideo2 className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    // Check for image files
    if (lowerFileType === 'image' || lowerTitle.includes('image') || lowerTitle.includes('photo') || lowerTitle.includes('picture') || lowerTitle.includes('.jpg') || lowerTitle.includes('.png') || lowerTitle.includes('.gif')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
          <FileImageIcon className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    // Check for document files
    if (lowerFileType === 'document' || lowerTitle.includes('document') || lowerTitle.includes('pdf') || lowerTitle.includes('file') || lowerTitle.includes('.pdf') || lowerTitle.includes('.doc') || lowerTitle.includes('.txt')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    // Check for links/URLs
    if (lowerFileType === 'link' || lowerFileType === 'url' || lowerTitle.includes('link') || lowerTitle.includes('url') || lowerTitle.includes('http')) {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <ExternalLink className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    // Default fallback - show a link icon since most media are links now
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
        <ExternalLink className="h-6 w-6 text-white" />
      </div>
    );
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

  const loadMedia = async () => {
    try {
      setLoading(true);

      // Get assets for this project (RLS will automatically filter by project_id)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No media files yet</h3>
            <p className="text-muted-foreground">
              Media assets for your virtual tour will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>
            View and access media links shared by your agency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {media.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const fileType = item.file_type || '';
                      const title = item.title || item.original_filename || '';
                      const lowerTitle = title.toLowerCase();
                      const lowerFileType = fileType.toLowerCase();
                      
                      // Audio files - Blue with music note
                      if (lowerFileType === 'audio' || lowerTitle.includes('audio') || lowerTitle.includes('music') || lowerTitle.includes('sound')) {
                        return (
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-md">
                            <div className="text-white text-sm font-bold">♪</div>
                          </div>
                        );
                      }
                      
                      // Video files - Red with play button
                      if (lowerFileType === 'video' || lowerTitle.includes('video') || lowerTitle.includes('movie') || lowerTitle.includes('clip')) {
                        return (
                          <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-md">
                            <div className="text-white text-sm font-bold">▶</div>
                          </div>
                        );
                      }
                      
                      // Image files - Green with image symbol
                      if (lowerFileType === 'image' || lowerTitle.includes('image') || lowerTitle.includes('photo') || lowerTitle.includes('picture')) {
                        return (
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-md">
                            <div className="text-white text-sm font-bold">🖼</div>
                          </div>
                        );
                      }
                      
                      // Document files - Orange with document symbol
                      if (lowerFileType === 'document' || lowerTitle.includes('document') || lowerTitle.includes('pdf') || lowerTitle.includes('file')) {
                        return (
                          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center shadow-md">
                            <div className="text-white text-sm font-bold">📄</div>
                          </div>
                        );
                      }
                      
                      // Default: Link/URL - Purple with link symbol
                      return (
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-md">
                          <div className="text-white text-sm font-bold">🔗</div>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.title || item.original_filename}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {getMediaTypeLabel(item.file_type || '', item.title || item.original_filename || '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs"
                    asChild
                  >
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Media
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPortalMedia;



