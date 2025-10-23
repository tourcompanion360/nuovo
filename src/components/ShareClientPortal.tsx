import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Mail, Share2, Eye } from 'lucide-react';

interface ShareClientPortalProps {
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientEmail: string;
}

const ShareClientPortal: React.FC<ShareClientPortalProps> = ({
  projectId,
  projectTitle,
  clientName,
  clientEmail
}) => {
  const { toast } = useToast();
  const [portalUrl, setPortalUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Generate the portal URL
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/client/${projectId}`;
    setPortalUrl(url);
  }, [projectId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setIsCopied(true);
      toast({
        title: "URL Copied!",
        description: "Client portal URL has been copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const openPortal = () => {
    window.open(portalUrl, '_blank');
  };

  const sendEmail = () => {
    const subject = `Your Virtual Tour Portal - ${projectTitle}`;
    const body = `Hi ${clientName},

Your virtual tour portal is ready! Click the link below to access your project dashboard:

${portalUrl}

In your portal, you can:
• View your project details and analytics
• Download shared media files
• Submit requests for changes
• Chat with your AI assistant

If you have any questions, please don't hesitate to contact us.

Best regards,
Your Tour Creator Team`;

    const mailtoUrl = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Client Portal
        </CardTitle>
        <CardDescription>
          Share the client portal with {clientName} so they can access their project dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{projectTitle}</h3>
            <Badge variant="outline">Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Client: {clientName} ({clientEmail})
          </p>
        </div>

        {/* Portal URL */}
        <div className="space-y-2">
          <Label>Client Portal URL</Label>
          <div className="flex items-center gap-2">
            <Input
              value={portalUrl}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {isCopied ? (
                "Copied!"
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this URL with your client. They can access their portal directly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={openPortal}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Portal
          </Button>
          
          <Button
            variant="outline"
            onClick={sendEmail}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
          
          <Button
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy URL
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to Share:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Copy the URL above</li>
            <li>Send it to your client via email, WhatsApp, or any messaging app</li>
            <li>Your client clicks the link to access their portal</li>
            <li>They can view their project, analytics, and submit requests</li>
          </ol>
        </div>

        {/* What Client Sees */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            What Your Client Will See:
          </h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
            <li>Project overview with details and stats</li>
            <li>Analytics dashboard with performance metrics</li>
            <li>Media library to download shared files</li>
            <li>Request form to ask for changes</li>
            <li>Chatbot interface for questions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareClientPortal;
