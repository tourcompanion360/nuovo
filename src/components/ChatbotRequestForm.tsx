import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  sanitizeTextInput, 
  sanitizeTitle,
  sanitizeDescription,
  sanitizeUrl 
} from '@/utils/inputValidation';
import { 
  Bot, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ChatbotRequestFormProps {
  projectId: string;
  projectTitle: string;
  clientName: string;
  onRequestSubmitted?: () => void;
}


const ChatbotRequestForm: React.FC<ChatbotRequestFormProps> = ({
  projectId,
  projectTitle,
  clientName,
  onRequestSubmitted
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    chatbotName: '',
    chatbotPurpose: '',
    targetAudience: '',
    language: 'en',
    
    // Content & Knowledge
    websiteUrl: '',
    existingContent: '',
    specificQuestions: '',
    businessInfo: '',
    fileLinks: '',
    
    // Behavior & Style
    tone: 'professional',
    responseStyle: 'helpful',
    specialInstructions: '',
    
    // Contact & Timeline
    priority: 'medium',
    preferredContactMethod: 'email',
    timeline: '',
    additionalNotes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = async () => {
    if (!formData.chatbotName || !formData.chatbotPurpose) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the chatbot name and purpose',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get project details including end_client_id
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, end_client_id')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      // Sanitize form data to prevent UI issues
      const sanitizedData = {
        chatbotName: sanitizeTitle(formData.chatbotName),
        chatbotPurpose: sanitizeDescription(formData.chatbotPurpose),
        chatbotPersonality: sanitizeTextInput(formData.chatbotPersonality || ''),
        chatbotLanguage: formData.chatbotLanguage,
        chatbotTone: formData.chatbotTone,
        websiteUrl: sanitizeUrl(formData.websiteUrl || ''),
        existingContent: sanitizeDescription(formData.existingContent || ''),
        specificRequirements: sanitizeDescription(formData.specificRequirements || ''),
        targetAudience: sanitizeTextInput(formData.targetAudience || ''),
        integrationRequirements: sanitizeTextInput(formData.integrationRequirements || ''),
        priority: formData.priority
      };

      // Create chatbot request record
      const { data, error } = await supabase
        .from('chatbot_requests')
        .insert({
          // Required fields from schema
          project_id: projectId,
          end_client_id: project.end_client_id,
          title: sanitizedData.chatbotName || 'New Chatbot Request',
          description: sanitizedData.chatbotPurpose || '',
          request_type: 'new_feature',
          
          // Chatbot-specific fields
          chatbot_name: sanitizedData.chatbotName,
          chatbot_purpose: sanitizedData.chatbotPurpose,
          target_audience: sanitizedData.targetAudience,
          language: sanitizedData.chatbotLanguage,
          website_url: sanitizedData.websiteUrl,
          existing_content: sanitizedData.existingContent,
          specific_questions: sanitizedData.specificRequirements,
          business_info: sanitizedData.chatbotPersonality,
          tone: sanitizedData.chatbotTone,
          response_style: sanitizedData.chatbotTone,
          special_instructions: sanitizedData.integrationRequirements,
          
          // Additional fields
          priority: sanitizedData.priority,
          preferred_contact_method: formData.preferredContactMethod,
          timeline: formData.timeline,
          additional_notes: formData.additionalNotes,
          file_links: formData.fileLinks,
          
          // Status
          status: 'pending'
          
          // Let database handle timestamps
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Request Submitted Successfully',
        description: 'Your chatbot request has been sent. We\'ll review it and get back to you soon!'
      });

      // Reset form
      setFormData({
        chatbotName: '',
        chatbotPurpose: '',
        targetAudience: '',
        language: 'en',
        websiteUrl: '',
        existingContent: '',
        specificQuestions: '',
        businessInfo: '',
        fileLinks: '',
        tone: 'professional',
        responseStyle: 'helpful',
        specialInstructions: '',
        priority: 'medium',
        preferredContactMethod: 'email',
        timeline: '',
        additionalNotes: ''
      });

      onRequestSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit chatbot request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chatbot Creation Request
        </CardTitle>
        <CardDescription>
          Submit your requirements and files for custom chatbot creation for <strong>{projectTitle}</strong> (Client: {clientName})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chatbotName">Chatbot Name *</Label>
              <Input
                id="chatbotName"
                placeholder="e.g., Property Assistant, Tour Guide Bot"
                value={formData.chatbotName}
                onChange={(e) => handleInputChange('chatbotName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatbotPurpose">Chatbot Purpose *</Label>
            <Textarea
              id="chatbotPurpose"
              placeholder="Describe what the chatbot should help visitors with (e.g., answer property questions, provide tour information, collect leads)"
              value={formData.chatbotPurpose}
              onChange={(e) => handleInputChange('chatbotPurpose', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Property buyers, Tour visitors, Potential customers"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>
        </div>

        {/* Content & Knowledge */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content & Knowledge Base</h3>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
        <Input
          id="websiteUrl"
          placeholder="https://your-website.com"
          value={formData.websiteUrl}
          onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
          className="input-safe"
        />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingContent">Existing Content/Information</Label>
            <Textarea
              id="existingContent"
              placeholder="Paste any existing content, FAQs, property details, or information the chatbot should know"
              value={formData.existingContent}
              onChange={(e) => handleInputChange('existingContent', e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specificQuestions">Specific Questions to Handle</Label>
            <Textarea
              id="specificQuestions"
              placeholder="List common questions visitors ask (e.g., What are the property dimensions? How much does it cost? What are the amenities?)"
              value={formData.specificQuestions}
              onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessInfo">Business Information</Label>
            <Textarea
              id="businessInfo"
              placeholder="Company details, contact information, services offered, etc."
              value={formData.businessInfo}
              onChange={(e) => handleInputChange('businessInfo', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* File Sharing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Share Files</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="file-links">Cloud Storage Links</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Paste links from Google Drive, Dropbox, WeTransfer, or other cloud storage services
              </p>
              <Textarea
                id="file-links"
                placeholder="https://drive.google.com/file/d/...&#10;https://www.dropbox.com/s/...&#10;https://wetransfer.com/downloads/..."
                value={formData.fileLinks}
                onChange={(e) => setFormData(prev => ({ ...prev, fileLinks: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <p>• One link per line</p>
              <p>• Make sure links are publicly accessible or shared with appropriate permissions</p>
              <p>• Supported: Google Drive, Dropbox, WeTransfer, OneDrive, and other cloud storage services</p>
            </div>
          </div>
        </div>

        {/* Behavior & Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Behavior & Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select value={formData.responseStyle} onValueChange={(value) => handleInputChange('responseStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Helpful & Informative</SelectItem>
                  <SelectItem value="concise">Concise & Direct</SelectItem>
                  <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any specific behavior, responses, or features you want the chatbot to have"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Contact & Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact & Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="dashboard">Dashboard Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              placeholder="e.g., Within 1 week, ASAP, No rush"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any other information or special requirements"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p>Your request will be reviewed and you'll be contacted with updates.</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.chatbotName || !formData.chatbotPurpose}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotRequestForm;


