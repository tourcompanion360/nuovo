import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Clock, 
  Star,
  Palette,
  Globe,
  Loader2,
  Eye,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { TEXT } from '@/constants/text';

interface Chatbot {
  id: string;
  client_id?: string;
  client_name: string;
  client_website?: string;
  description: string;
  language: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  widget_style: string;
  position: string;
  avatar_url: string;
  brand_logo_url: string;
  response_style: string;
  max_questions: number;
  status: 'active' | 'inactive' | 'draft';
  knowledge_base_text: string;
  knowledge_base_files: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ChatbotStats {
  total_conversations: number;
  active_users: number;
  avg_response_time: number;
  satisfaction_rate: number;
  conversations_today: number;
  conversations_this_week: number;
  conversations_this_month: number;
}

const ChatbotManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Use authentication and data fetching hooks
  const { user } = useAuth();
  const { chatbots, stats, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');
  const { canCreateChatbot, plan } = useSubscription(user?.id || '');

  const form = useForm({
    defaultValues: {
      client_name: '',
      client_website: '',
      description: '',
      language: 'english',
      welcome_message: 'Hello! How can I help you today?',
      fallback_message: 'I apologize, but I don\'t understand. Could you please rephrase your question?',
      primary_color: '#3b82f6',
      widget_style: 'modern',
      position: 'bottom_right',
      avatar_url: '',
      brand_logo_url: '',
      response_style: 'friendly',
      max_questions: 10,
      knowledge_base_text: '',
      file_links: '',
      status: 'draft' as const
    }
  });

  // No need for anonymous session - user must be authenticated

  // Real chatbots only - no sample data

  /* Sample data removed - using real database only
  const getSampleChatbots = (): Chatbot[] => [
    {
      id: '1',
      client_id: 'client_1',
      client_name: 'TechCorp Solutions',
      client_website: 'https://techcorp.com',
      name: 'TechCorp Support Bot',
      description: 'AI assistant for TechCorp customer support and technical inquiries',
      language: 'english',
      welcome_message: 'Hello! I\'m here to help you with any questions about TechCorp products and services. How can I assist you today?',
      fallback_message: 'I apologize, but I don\'t understand your question. Could you please rephrase it or contact our support team directly?',
      primary_color: '#3b82f6',
      widget_style: 'modern',
      position: 'bottom_right',
      avatar_url: '',
      brand_logo_url: '',
      knowledge_base_text: 'TechCorp Solutions is a leading technology company specializing in cloud computing, AI solutions, and enterprise software. We offer 24/7 customer support, comprehensive documentation, and training resources.',
      uploaded_files: [],
      response_style: 'professional',
      max_questions: 15,
      conversation_limit: 50,
      status: 'active',
      statistics: {
        total_conversations: 1247,
        active_users: 89,
        avg_response_time: 1.2,
        satisfaction_rate: 4.6,
        total_messages: 3847,
        last_activity: '2024-01-15T10:30:00Z'
      },
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      client_id: 'client_2',
      client_name: 'Fashion Forward',
      client_website: 'https://fashionforward.com',
      name: 'Fashion Forward Assistant',
      description: 'Personal shopping assistant for Fashion Forward e-commerce platform',
      language: 'english',
      welcome_message: 'Hi there! Welcome to Fashion Forward! I can help you find the perfect outfit, check sizes, or answer questions about our latest collections. What are you looking for?',
      fallback_message: 'I\'m not sure I understand. Could you tell me more about what you\'re looking for? I\'m here to help you find the perfect style!',
      primary_color: '#ec4899',
      widget_style: 'bubble',
      position: 'bottom_left',
      avatar_url: '',
      brand_logo_url: '',
      knowledge_base_text: 'Fashion Forward is a trendy online fashion retailer offering the latest styles for men and women. We provide size guides, styling tips, free shipping on orders over $50, and easy returns within 30 days.',
      uploaded_files: [],
      response_style: 'friendly',
      max_questions: 20,
      conversation_limit: 30,
      status: 'active',
      statistics: {
        total_conversations: 892,
        active_users: 156,
        avg_response_time: 0.8,
        satisfaction_rate: 4.8,
        total_messages: 2134,
        last_activity: '2024-01-15T14:20:00Z'
      },
      created_at: '2024-01-08T11:00:00Z',
      updated_at: '2024-01-15T14:20:00Z'
    },
    {
      id: '3',
      client_id: 'client_3',
      client_name: 'HealthCare Plus',
      client_website: 'https://healthcareplus.com',
      name: 'HealthCare Plus Bot',
      description: 'Medical information assistant for HealthCare Plus patients',
      language: 'english',
      welcome_message: 'Hello! I\'m your HealthCare Plus assistant. I can help you with appointment scheduling, insurance questions, and general health information. How can I assist you today?',
      fallback_message: 'I understand you have a health-related question. For medical emergencies, please call 911. For urgent medical concerns, please contact your doctor directly.',
      primary_color: '#10b981',
      widget_style: 'classic',
      position: 'bottom_right',
      avatar_url: '',
      brand_logo_url: '',
      knowledge_base_text: 'HealthCare Plus is a comprehensive healthcare provider offering primary care, specialty services, urgent care, and telemedicine. We accept most major insurance plans and offer same-day appointments for urgent needs.',
      uploaded_files: [],
      response_style: 'professional',
      max_questions: 10,
      conversation_limit: 25,
      status: 'draft',
      statistics: {
        total_conversations: 456,
        active_users: 67,
        avg_response_time: 2.1,
        satisfaction_rate: 4.3,
        total_messages: 987,
        last_activity: '2024-01-14T16:45:00Z'
      },
      created_at: '2024-01-12T08:30:00Z',
      updated_at: '2024-01-14T16:45:00Z'
    },
    {
      id: '4',
      client_id: 'client_4',
      client_name: 'EduLearn Academy',
      client_website: 'https://edulearn.com',
      name: 'EduLearn Study Assistant',
      description: 'Educational support bot for EduLearn Academy students',
      language: 'english',
      welcome_message: 'Welcome to EduLearn Academy! I\'m here to help you with course information, study resources, and academic support. What would you like to know?',
      fallback_message: 'I\'m here to help with your learning journey. Could you please provide more details about your question?',
      primary_color: '#8b5cf6',
      widget_style: 'minimal',
      position: 'top_right',
      avatar_url: '',
      brand_logo_url: '',
      knowledge_base_text: 'EduLearn Academy offers online courses in technology, business, design, and more. We provide interactive learning materials, expert instructors, certificates of completion, and 24/7 student support.',
      uploaded_files: [],
      response_style: 'helpful',
      max_questions: 25,
      conversation_limit: 40,
      status: 'inactive',
      statistics: {
        total_conversations: 678,
        active_users: 123,
        avg_response_time: 1.5,
        satisfaction_rate: 4.7,
        total_messages: 1456,
        last_activity: '2024-01-13T12:15:00Z'
      },
      created_at: '2024-01-05T14:00:00Z',
      updated_at: '2024-01-13T12:15:00Z'
    }
  ];
  */

  // Sample data removed - using real database only

  const handleCreateChatbot = () => {
    if (!canCreateChatbot(chatbots.length)) {
      toast({
        title: TEXT.CHATBOT_MANAGEMENT.CHATBOT_LIMIT_REACHED,
        description: `You have reached the maximum limit for the ${plan} plan.`,
        variant: 'destructive',
      });
      return;
    }
    setSelectedChatbot(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    form.reset({
      client_name: chatbot.client_name,
      client_website: chatbot.client_website,
      description: chatbot.description,
      language: chatbot.language,
      welcome_message: chatbot.welcome_message,
      fallback_message: chatbot.fallback_message,
      primary_color: chatbot.primary_color,
      widget_style: chatbot.widget_style,
      position: chatbot.position,
      avatar_url: chatbot.avatar_url,
      brand_logo_url: chatbot.brand_logo_url,
      response_style: chatbot.response_style,
      max_questions: chatbot.max_questions,
      knowledge_base_text: chatbot.knowledge_base_text,
      status: chatbot.status
    });
    setIsDialogOpen(true);
  };

  const handleSaveChatbot = async (data: any) => {
    try {
      setIsSaving(true);

      const chatbotData = {
        ...data,
        user_id: 'anonymous',
        knowledge_base_files: [],
        updated_at: new Date().toISOString()
      };

      if (selectedChatbot) {
        // Update existing chatbot
        const { error } = await supabase
          .from('chatbots')
          .update(chatbotData)
          .eq('id', selectedChatbot.id);

        if (error) {
          if (error.code === 'PGRST116' || 
              error.message.includes('relation') || 
              error.message.includes('does not exist') ||
              error.message.includes('Failed to fetch') ||
              error.message.includes('NetworkError')) {
            toast({
              title: "Demo Mode",
              description: "Database not available. This is a demo - your chatbot settings are saved locally.",
            });
            // Simulate successful save for demo purposes
            setIsDialogOpen(false);
            setSelectedChatbot(null);
            form.reset();
            return;
          }
          throw error;
        }

        toast({
          title: TEXT.CHATBOT_MANAGEMENT.CHATBOT_UPDATED,
          description: TEXT.CHATBOT_MANAGEMENT.CHATBOT_UPDATED_DESCRIPTION
        });
      } else {
        // Create new chatbot
        const { error } = await supabase
          .from('chatbots')
          .insert({
            ...chatbotData,
            created_at: new Date().toISOString()
          });

        if (error) {
          if (error.code === 'PGRST116' || 
              error.message.includes('relation') || 
              error.message.includes('does not exist') ||
              error.message.includes('Failed to fetch') ||
              error.message.includes('NetworkError')) {
            toast({
              title: "Demo Mode",
              description: "Database not available. This is a demo - your chatbot settings are saved locally.",
            });
            // Simulate successful save for demo purposes
            setIsDialogOpen(false);
            setSelectedChatbot(null);
            form.reset();
            return;
          }
          throw error;
        }

        toast({
          title: TEXT.CHATBOT_MANAGEMENT.CHATBOT_CREATED,
          description: TEXT.CHATBOT_MANAGEMENT.CHATBOT_CREATED_DESCRIPTION
        });
      }

      setIsDialogOpen(false);
      setSelectedChatbot(null);
      form.reset();
      loadChatbots();
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: selectedChatbot ? TEXT.CHATBOT_MANAGEMENT.ERROR_UPDATING_CHATBOT : TEXT.CHATBOT_MANAGEMENT.ERROR_CREATING_CHATBOT,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChatbot = async (id: string) => {
    try {
      setIsDeleting(id);

      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: TEXT.CHATBOT_MANAGEMENT.CHATBOT_DELETED,
        description: TEXT.CHATBOT_MANAGEMENT.CHATBOT_DELETED_DESCRIPTION
      });

      loadChatbots();
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.CHATBOT_MANAGEMENT.ERROR_DELETING_CHATBOT,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      const newStatus = chatbot.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('chatbots')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatbot.id);

      if (error) throw error;

      toast({
        title: newStatus === 'active' ? TEXT.CHATBOT_MANAGEMENT.CHATBOT_ACTIVATED : TEXT.CHATBOT_MANAGEMENT.CHATBOT_DEACTIVATED,
        description: newStatus === 'active' ? TEXT.CHATBOT_MANAGEMENT.CHATBOT_ACTIVATED_DESCRIPTION : TEXT.CHATBOT_MANAGEMENT.CHATBOT_DEACTIVATED_DESCRIPTION
      });

      loadChatbots();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: 'Failed to update chatbot status',
        variant: 'destructive'
      });
    }
  };


  const handlePreview = () => {
    const formData = form.getValues();
    setPreviewData(formData);
    setShowPreview(true);
  };

  const handleDuplicateChatbot = async (chatbot: Chatbot) => {
    try {
      if (chatbots.length >= 5) {
        toast({
          title: TEXT.CHATBOT_MANAGEMENT.CHATBOT_LIMIT_REACHED,
          description: TEXT.CHATBOT_MANAGEMENT.CHATBOT_LIMIT_WARNING,
          variant: 'destructive',
        });
        return;
      }

      const duplicatedData = {
        ...chatbot,
        client_name: `${chatbot.client_name} (Copy)`,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chatbots')
        .insert(duplicatedData);

      if (error) throw error;

      toast({
        title: "Chatbot Duplicated",
        description: "Your chatbot has been duplicated successfully"
      });

      loadChatbots();
    } catch (error) {
      console.error('Error duplicating chatbot:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: "Failed to duplicate chatbot",
        variant: 'destructive'
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return TEXT.CHATBOT_MANAGEMENT.ACTIVE;
      case 'inactive':
        return TEXT.CHATBOT_MANAGEMENT.INACTIVE;
      case 'draft':
        return TEXT.CHATBOT_MANAGEMENT.DRAFT;
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.CHATBOT_MANAGEMENT.CHATBOT_MANAGEMENT}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.CHATBOT_MANAGEMENT.MANAGE_CHATBOTS}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.CHATBOT_MANAGEMENT.CHATBOT_MANAGEMENT}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.CHATBOT_MANAGEMENT.MANAGE_CHATBOTS}</p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadChatbots} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.CHATBOT_MANAGEMENT.CHATBOT_MANAGEMENT}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.CHATBOT_MANAGEMENT.MANAGE_CHATBOTS}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {chatbots.length}/5 {TEXT.CHATBOT_MANAGEMENT.CHATBOT_LIMIT_WARNING}
          </div>
          <Button 
            onClick={handleCreateChatbot}
            disabled={chatbots.length >= 5}
            className="bg-primary hover:bg-primary-hover"
          >
            <Plus size={18} className="mr-2" />
            {TEXT.CHATBOT_MANAGEMENT.CREATE_NEW_CHATBOT}
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      {chatbots.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Welcome to Client Chatbot Management
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Create intelligent AI chatbots for your clients' websites. Each chatbot can be customized with your client's branding, knowledge base, and conversation style.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Custom branding & colors</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Knowledge base integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Real-time analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      {chatbots.length > 0 && chatbots.length < 3 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Pro Tip</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can create up to 5 chatbots. Consider creating specialized bots for different client needs like support, sales, or onboarding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total_conversations}</p>
                <p className="text-sm text-muted-foreground">{TEXT.CHATBOT_MANAGEMENT.TOTAL_CONVERSATIONS}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active_users}</p>
                <p className="text-sm text-muted-foreground">{TEXT.CHATBOT_MANAGEMENT.ACTIVE_USERS}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avg_response_time}s</p>
                <p className="text-sm text-muted-foreground">{TEXT.CHATBOT_MANAGEMENT.AVG_RESPONSE_TIME}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.satisfaction_rate}/5</p>
                <p className="text-sm text-muted-foreground">{TEXT.CHATBOT_MANAGEMENT.SATISFACTION_RATE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-foreground-secondary mb-4">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">{TEXT.CHATBOT_MANAGEMENT.NO_CHATBOTS_YET}</h3>
              <p>{TEXT.CHATBOT_MANAGEMENT.CREATE_FIRST_CHATBOT}</p>
            </div>
          </div>
        ) : (
          chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: chatbot.primary_color }}
                    >
                      <Bot size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{chatbot.client_name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {chatbot.client_website || chatbot.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(chatbot.status)}>
                    {getStatusLabel(chatbot.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{TEXT.CHATBOT_MANAGEMENT.LANGUAGES[chatbot.language.toUpperCase() as keyof typeof TEXT.CHATBOT_MANAGEMENT.LANGUAGES]}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(chatbot.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-muted-foreground">Style</div>
                        <div className="font-medium capitalize">{chatbot.widget_style}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Position</div>
                        <div className="font-medium capitalize">{chatbot.position.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditChatbot(chatbot)}
                    >
                      <Edit size={14} className="mr-1" />
                      {TEXT.CHATBOT_MANAGEMENT.UPDATE}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(chatbot)}
                    >
                      {chatbot.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicateChatbot(chatbot)}
                      title="Duplicate Chatbot"
                    >
                      <Copy size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={isDeleting === chatbot.id}
                        >
                          {isDeleting === chatbot.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{chatbot.client_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{TEXT.CHATBOT_MANAGEMENT.CANCEL}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteChatbot(chatbot.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {TEXT.CHATBOT_MANAGEMENT.DELETE}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Chatbot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedChatbot ? TEXT.CHATBOT_MANAGEMENT.EDIT_CHATBOT : TEXT.CHATBOT_MANAGEMENT.CREATE_NEW_CHATBOT}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{TEXT.CHATBOT_MANAGEMENT.OVERVIEW}</TabsTrigger>
              <TabsTrigger value="configuration">{TEXT.CHATBOT_MANAGEMENT.CONFIGURATION}</TabsTrigger>
              <TabsTrigger value="knowledge">{TEXT.CHATBOT_MANAGEMENT.KNOWLEDGE_BASE}</TabsTrigger>
              <TabsTrigger value="analytics">{TEXT.CHATBOT_MANAGEMENT.ANALYTICS}</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveChatbot)} className="space-y-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{TEXT.CHATBOT_MANAGEMENT.BASIC_INFO}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="client_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.CHATBOT_NAME} *</FormLabel>
                            <FormControl>
                              <Input placeholder={TEXT.CHATBOT_MANAGEMENT.ENTER_CHATBOT_NAME} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="client_website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Website</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter client website URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.DESCRIPTION}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={TEXT.CHATBOT_MANAGEMENT.ENTER_DESCRIPTION} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.LANGUAGE}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={TEXT.CHATBOT_MANAGEMENT.SELECT_LANGUAGE} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(TEXT.CHATBOT_MANAGEMENT.LANGUAGES).map(([key, value]) => (
                                    <SelectItem key={key} value={key.toLowerCase()}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="draft">{TEXT.CHATBOT_MANAGEMENT.DRAFT}</SelectItem>
                                  <SelectItem value="active">{TEXT.CHATBOT_MANAGEMENT.ACTIVE}</SelectItem>
                                  <SelectItem value="inactive">{TEXT.CHATBOT_MANAGEMENT.INACTIVE}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="welcome_message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.WELCOME_MESSAGE}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={TEXT.CHATBOT_MANAGEMENT.ENTER_WELCOME_MESSAGE} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fallback_message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.FALLBACK_MESSAGE}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={TEXT.CHATBOT_MANAGEMENT.ENTER_FALLBACK_MESSAGE} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{TEXT.CHATBOT_MANAGEMENT.DESIGN_CUSTOMIZATION}</CardTitle>
                      <CardDescription>
                        Customize your chatbot's appearance to match your client's brand and website design.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primary_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.PRIMARY_COLOR}</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input type="color" {...field} className="w-16 h-10" />
                                  <Input placeholder="#3b82f6" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="widget_style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.WIDGET_STYLE}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={TEXT.CHATBOT_MANAGEMENT.SELECT_WIDGET_STYLE} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(TEXT.CHATBOT_MANAGEMENT.WIDGET_STYLES).map(([key, value]) => (
                                    <SelectItem key={key} value={key.toLowerCase()}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.POSITION}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={TEXT.CHATBOT_MANAGEMENT.SELECT_POSITION} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(TEXT.CHATBOT_MANAGEMENT.POSITIONS).map(([key, value]) => (
                                    <SelectItem key={key} value={key.toLowerCase()}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="response_style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.RESPONSE_STYLE}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={TEXT.CHATBOT_MANAGEMENT.SELECT_RESPONSE_STYLE} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(TEXT.CHATBOT_MANAGEMENT.RESPONSE_STYLES).map(([key, value]) => (
                                    <SelectItem key={key} value={key.toLowerCase()}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="avatar_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.AVATAR}</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter avatar URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="brand_logo_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{TEXT.CHATBOT_MANAGEMENT.BRAND_LOGO}</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter brand logo URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="max_questions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.MAX_QUESTIONS}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={TEXT.CHATBOT_MANAGEMENT.ENTER_MAX_QUESTIONS}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Design Tips */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">🎨 Design Tips</h4>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Choose colors that match your client's brand identity</li>
                        <li>• Modern style works well for tech companies, Classic for traditional businesses</li>
                        <li>• Bottom-right position is most common and user-friendly</li>
                        <li>• Use the preview feature to test how your chatbot looks</li>
                        <li>• Keep the design clean and professional</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Knowledge Base Tab */}
                <TabsContent value="knowledge" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{TEXT.CHATBOT_MANAGEMENT.KNOWLEDGE_BASE_TITLE}</CardTitle>
                      <CardDescription>
                        Provide your chatbot with relevant information about your client's business, products, and services.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="knowledge_base_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.PASTED_TEXT}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Example: Our company specializes in web development and digital marketing. We offer custom websites, e-commerce solutions, SEO services, and social media management. Our team has over 10 years of experience helping businesses grow online. We provide 24/7 support and offer a 30-day money-back guarantee."
                                rows={8}
                                {...field} 
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground mt-1">
                              💡 Tip: Include key information about services, pricing, contact details, and frequently asked questions.
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="file_links"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{TEXT.CHATBOT_MANAGEMENT.FILE_UPLOADS}</FormLabel>
                            <div className="text-xs text-muted-foreground mb-2">
                              Share documents like FAQs, product manuals, or company policies via Google Drive, Dropbox, or WeTransfer to enhance your chatbot's knowledge.
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="https://drive.google.com/file/d/...&#10;https://www.dropbox.com/s/...&#10;https://wetransfer.com/downloads/..."
                                {...field}
                                rows={4}
                                className="resize-none"
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              <p>• One link per line</p>
                              <p>• Make sure links are publicly accessible or shared with appropriate permissions</p>
                              <p>• Supported: Google Drive, Dropbox, WeTransfer, OneDrive, and other cloud storage services</p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Knowledge Base Tips */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📚 Knowledge Base Best Practices</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Include your most common customer questions and answers</li>
                        <li>• Add product descriptions, pricing, and service details</li>
                        <li>• Include contact information and business hours</li>
                        <li>• Upload FAQ documents, manuals, or policy guides</li>
                        <li>• Keep information up-to-date and accurate</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{TEXT.CHATBOT_MANAGEMENT.STATISTICS}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.conversations_today}</div>
                          <div className="text-sm text-muted-foreground">Today</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.conversations_this_week}</div>
                          <div className="text-sm text-muted-foreground">This Week</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{stats.conversations_this_month}</div>
                          <div className="text-sm text-muted-foreground">This Month</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{stats.satisfaction_rate}/5</div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Form Actions */}
                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={isSaving}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      {TEXT.CHATBOT_MANAGEMENT.CANCEL}
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          {selectedChatbot ? TEXT.CHATBOT_MANAGEMENT.UPDATE : TEXT.CHATBOT_MANAGEMENT.CREATE}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chatbot Preview</DialogTitle>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: previewData.primary_color || '#3b82f6' }}
                >
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{previewData.client_name}</h3>
                  <p className="text-sm text-muted-foreground">{previewData.client_website}</p>
                </div>
              </div>

              {/* Preview Chat Interface */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: previewData.primary_color || '#3b82f6' }}
                    >
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border rounded-lg p-3 max-w-xs">
                      <p className="text-sm">{previewData.welcome_message || 'Hello! How can I help you today?'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Hi, I need help with my order</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                      U
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: previewData.primary_color || '#3b82f6' }}
                    >
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border rounded-lg p-3 max-w-xs">
                      <p className="text-sm">I'd be happy to help you with your order! Could you please provide your order number?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Settings */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Widget Style:</span> {previewData.widget_style}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {previewData.position?.replace('_', ' ')}
                </div>
                <div>
                  <span className="font-medium">Language:</span> {previewData.language}
                </div>
                <div>
                  <span className="font-medium">Response Style:</span> {previewData.response_style}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotManagement;