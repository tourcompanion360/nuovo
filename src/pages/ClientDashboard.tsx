import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ClientAvatar from '@/components/ui/ClientAvatar';
import { formatProjectType, formatProjectStatus } from '@/utils/formatDisplayText';
import { FirstTimeVisitorOnboarding } from '@/components/FirstTimeVisitorOnboarding';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import {
  Eye,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  Timer,
  TrendingUp,
  FileText,
  Video,
  File,
  Download,
  ExternalLink,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Upload,
  FileUp
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  created_at: string;
  updated_at: string;
  end_clients: {
    id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    website?: string;
  };
}

interface Chatbot {
  id: string;
  name: string;
  status: string;
  welcome_message: string;
  language: string;
}

interface Analytics {
  id: string;
  metric_type: string;
  metric_value: number;
  date: string;
  views?: number;
  unique_visitors?: number;
  avg_time_spent?: number;
  interactions?: number;
}

interface Asset {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

interface Request {
  id: string;
  title: string;
  description: string;
  request_type: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ClientDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  
  console.log('🚀 [ClientDashboard] Component loaded with projectId:', projectId);
  
  // State
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [endClient, setEndClient] = useState<any>(null);
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'content_change' as const,
    priority: 'medium' as const
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState(false);

  // Use unified analytics hook for consistent data (must be called before any conditional logic)
  const unifiedAnalytics = useUnifiedAnalytics({ 
    projectId: projectId,
    endClientId: endClient?.id 
  });

  const loadData = async () => {
    try {
      setLoading(true);

      if (!projectId) {
        toast({
          title: 'Project not found',
          description: 'No project ID provided.',
          variant: 'destructive',
        });
        return;
      }

      console.log('🔍 [ClientDashboard] Loading data for project:', projectId);
      console.log('🔍 [ClientDashboard] Starting data fetch...');

      // First validate the project exists and is active
      // TODO: SECURITY - Add user ownership verification as defense in depth
      // Currently relies only on Supabase RLS - consider adding frontend validation
      const { data: projectData, error: projectErr } = await supabase
        .from('projects')
        .select(`
          *,
          end_clients (
            id,
            name,
            email,
            company,
            phone,
            website
          )
        `)
        .eq('id', projectId)
        .eq('status', 'active')  // Only allow active projects
        .single();

      if (projectErr) {
        console.error('Project error:', projectErr);
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not accessible or has been deactivated.',
          variant: 'destructive',
        });
        return;
      }

      if (!projectData) {
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not accessible or has been deactivated.',
          variant: 'destructive',
        });
        return;
      }

      // Additional validation: Check if project has valid client data
      if (!projectData.end_clients) {
        setAccessDenied(true);
        toast({
          title: 'Access Denied',
          description: 'This project is not properly configured.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Project data loaded:', projectData);
      setProject(projectData);
      setEndClient(projectData.end_clients);

      // OPTIMIZED: Get all related data in parallel (analytics handled by useUnifiedAnalytics hook)
      const [
        { data: chatbotData, error: chatbotErr },
        { data: assetsData, error: assetsErr },
        { data: requestsData, error: requestsErr }
      ] = await Promise.all([
        // Get chatbot
        supabase
          .from('chatbots')
          .select('*')
          .eq('project_id', projectId)
          .single(),
        
        // Get assets
        supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        
        // Get requests
        supabase
          .from('requests')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
      ]);

      // Set data (handle errors gracefully)
      if (chatbotErr) {
        console.log('No chatbot found:', chatbotErr.message);
      } else {
        setChatbot(chatbotData);
      }

      // Analytics are now handled by useUnifiedAnalytics hook
      setAnalytics([]);

      if (assetsErr) {
        console.log('No assets found:', assetsErr.message);
        setAssets([]);
      } else {
        setAssets(assetsData || []);
      }

      if (requestsErr) {
        console.log('No requests found:', requestsErr.message);
        setRequests([]);
      } else {
        setRequests(requestsData || []);
      }

    } catch (error: unknown) {
      console.error('❌ [ClientDashboard] Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data.';
      
      // Show user-friendly error
      toast({
        title: '⚠️ Error loading data',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * SECURITY: This function only submits to database and reloads data
   * NO redirects to main dashboard or external URLs allowed
   */
  const submitRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!endClient) {
      toast({
        title: 'Error',
        description: 'Client information not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingRequest(true);

      console.log('Submitting request for project:', projectId, 'client:', endClient.id);

      const { error } = await supabase
        .from('requests')
        .insert({
          project_id: projectId,
          end_client_id: endClient.id,
          title: newRequest.title,
          description: newRequest.description,
          request_type: newRequest.type,
          priority: newRequest.priority,
          status: 'open'
        });

      if (error) {
        console.error('Request submission error:', error);
        throw error;
      }

      toast({
        title: 'Request submitted',
        description: 'Your request has been sent successfully.',
      });

      setNewRequest({
        title: '',
        description: '',
        type: 'content_change',
        priority: 'medium'
      });

      // Reload requests
      loadData();

    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      toast({
        title: 'Failed to submit',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('application/pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    loadData();
    
    // Check if this is a first-time visitor
    const hasVisitedBefore = localStorage.getItem(`first-visit-completed-${projectId}`);
    console.log(`First visit check for project ${projectId}:`, hasVisitedBefore ? 'Already visited' : 'First time');
    if (!hasVisitedBefore) {
      setShowFirstTimeOnboarding(true);
    }
  }, [projectId]);


  // Dynamic manifest and meta tag injection for PWA
  useEffect(() => {
    if (project && endClient && projectId) {
      // Update manifest link to use dynamic manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        manifestLink.href = `/api/manifest?projectId=${projectId}`;
      }
      
      // Update page title
      document.title = `${project.title} - ${endClient.company}`;
      
      // Update meta tags for better PWA experience
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Update various meta tags
      updateMetaTag('description', `Dashboard for ${endClient.company} - ${project.title}`);
      updateMetaTag('apple-mobile-web-app-title', project.title);
      updateMetaTag('application-name', project.title);
      
      // Update Open Graph tags
      const updateOGTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateOGTag('og:title', `${project.title} - ${endClient.company}`);
      updateOGTag('og:description', `Dashboard for ${endClient.company} - ${project.title}`);
      updateOGTag('og:url', window.location.href);
      
      // Update Twitter meta tags
      const updateTwitterTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = `twitter:${name}`;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateTwitterTag('title', `${project.title} - ${endClient.company}`);
      updateTwitterTag('description', `Dashboard for ${endClient.company} - ${project.title}`);
      
      console.log('Dynamic manifest and meta tags updated for:', project.title);
    }
  }, [project, endClient, projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * SECURITY: Never redirect clients to main dashboard (/)
   * Clients should only see project manager contact message
   * NO window.location.href redirects allowed here
   */
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This project is not accessible or has been deactivated. Please contact your project manager for assistance.</p>
          <div className="text-sm text-gray-500">
            <p>If you need assistance, please contact your project manager directly.</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * SECURITY: Never redirect clients to main dashboard (/)
   * Clients should only see project manager contact message
   * NO window.location.href redirects allowed here
   */
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">This project does not exist or has been removed.</p>
          <div className="text-sm text-gray-500">
            <p>If you need assistance, please contact your project manager directly.</p>
          </div>
        </div>
      </div>
    );
  }


  // Extract metrics from unified analytics
  const totalViews = unifiedAnalytics.totalViews;
  const totalVisitors = unifiedAnalytics.totalVisitors;
  const avgTimeSpent = unifiedAnalytics.avgEngagementTime;
  const totalLeads = unifiedAnalytics.totalLeads;
  const conversionRate = unifiedAnalytics.conversionRate;
  const avgSatisfaction = unifiedAnalytics.avgSatisfaction;
  const totalInteractions = 0; // Not tracked in current system

  const handleOnboardingComplete = () => {
    setShowFirstTimeOnboarding(false);
    // Ensure localStorage flag is set (backup in case component didn't set it)
    localStorage.setItem(`first-visit-completed-${projectId}`, 'true');
    console.log(`Onboarding completed for project ${projectId} - will not show again`);
    toast({
      title: 'Welcome!',
      description: 'You\'re all set to explore your dashboard.',
      variant: 'default',
    });
  };

  const handleOnboardingSkip = () => {
    setShowFirstTimeOnboarding(false);
    // Ensure localStorage flag is set (backup in case component didn't set it)
    localStorage.setItem(`first-visit-completed-${projectId}`, 'true');
    console.log(`Onboarding skipped for project ${projectId} - will not show again`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA', color: '#1A1A1A' }}>
      {/* First Time Visitor Onboarding */}
      {showFirstTimeOnboarding && endClient && (
        <FirstTimeVisitorOnboarding
          projectId={projectId!}
          clientName={endClient.name}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <div className="w-64 flex flex-col" style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <h1 className="break-words leading-tight" style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.2px', color: '#1A1A1A' }}>
                  {project.title}
                </h1>
                <p className="mt-1" style={{ fontSize: '14px', color: '#6B7280' }}>Client Portal</p>
              </div>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <div className="flex items-center space-x-3">
              <ClientAvatar 
                name={endClient?.name || 'Client'} 
                size="md" 
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{endClient?.name || 'Client'}</p>
                <p className="truncate" style={{ fontSize: '12px', color: '#6B7280' }}>{endClient?.email || 'client@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'media', name: 'Media', icon: ImageIcon },
                { id: 'requests', name: 'Requests', icon: MessageSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === tab.id ? '#4169E1' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#6B7280',
                    borderRadius: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.color = '#1A1A1A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  <tab.icon className="h-5 w-5" />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <h1 className="break-words leading-tight" style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>
                    {project.title}
                  </h1>
                  <p className="mt-1" style={{ fontSize: '12px', color: '#6B7280' }}>Client Portal</p>
                </div>
              </div>
              <ClientAvatar 
                name={endClient?.name || 'Client'} 
                size="sm" 
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="pb-24 pt-20">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>

        {/* Mobile Bottom Navigation - Fixed */}
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ 
          backgroundColor: '#FFFFFF', 
          borderTop: '1px solid #E5E7EB',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          height: '80px'
        }}>
          <div className="flex justify-around items-center" style={{ padding: '0 24px', height: '100%' }}>
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'media', name: 'Media', icon: ImageIcon },
              { id: 'requests', name: 'Requests', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center transition-all duration-200"
                style={{
                  color: activeTab === tab.id ? '#4169E1' : '#9CA3AF',
                  backgroundColor: activeTab === tab.id ? '#EBF2FF' : 'transparent',
                  borderRadius: '12px',
                  padding: '8px 16px'
                }}
              >
                <tab.icon className="h-6 w-6 mb-1" />
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function renderTabContent() {
    return (
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div style={{
              background: 'linear-gradient(135deg, #87CEEB 0%, #4169E1 100%)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(65, 105, 225, 0.2)',
              color: '#FFFFFF',
              marginBottom: '16px'
            }}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <h2 className="mb-2" style={{ fontSize: '24px', fontWeight: 600, lineHeight: '32px', letterSpacing: '-0.3px' }}>
                    Welcome back, {endClient?.name}!
                  </h2>
                  <p className="mb-4" style={{ fontSize: '16px', opacity: 0.9 }}>Here's your latest project overview and performance metrics.</p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span style={{ fontSize: '14px' }}>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span style={{ fontSize: '14px' }}>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Eye className="h-10 w-10" style={{ color: '#FFFFFF' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4169E1' }}>
                    <Eye className="h-5 w-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>Total Views</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{totalViews}</p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#40E0D0' }}>
                    <Users className="h-5 w-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>Visitors</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{totalVisitors}</p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B59B6' }}>
                    <Timer className="h-5 w-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>Avg. Time</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{Math.round(avgTimeSpent)}s</p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
                    <TrendingUp className="h-5 w-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>Interactions</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{totalInteractions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="pb-3">
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>Project Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>Description</p>
                    <div className="rounded-lg p-3" style={{ backgroundColor: '#F8F9FA', border: 'none' }}>
                      <p className="leading-relaxed break-words overflow-wrap-anywhere" style={{ fontSize: '14px', color: '#1A1A1A' }}>
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>Type</p>
                    <span className="px-3 py-1 rounded-lg" style={{ backgroundColor: '#4169E1', color: '#FFFFFF', fontSize: '12px', fontWeight: 500 }}>
                      {formatProjectType(project.project_type) || 'Virtual Tour'}
                    </span>
                  </div>
                  <div>
                    <p className="mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>Status</p>
                    <span 
                      className="px-3 py-1 rounded-lg"
                      style={{ 
                        backgroundColor: project.status === 'active' ? '#10B981' : '#6B7280',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {formatProjectStatus(project.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px'
              }}>
                <div className="pb-3">
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('requests')} 
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: '#4169E1',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2E4A9F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4169E1';
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Request
                  </button>
                  <button 
                    onClick={() => setActiveTab('media')} 
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#4169E1',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: '2px solid #4169E1'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EBF2FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    View Media
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')} 
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: '#4169E1',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2E4A9F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4169E1';
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {unifiedAnalytics.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : unifiedAnalytics.error ? (
              <div className="text-center py-12 text-red-500">
                <p>Error loading analytics: {unifiedAnalytics.error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Real-time performance metrics and insights for your virtual tour
                  </p>
                </div>
                
                {/* Main Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Views Card */}
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-blue-700">Total Views</CardTitle>
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{totalViews}</div>
                      <p className="text-xs text-blue-500 font-medium">Page impressions</p>
                    </CardContent>
                  </Card>

                  {/* Visitors Card */}
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-green-700">Unique Visitors</CardTitle>
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-1">{totalVisitors}</div>
                      <p className="text-xs text-green-500 font-medium">Individual users</p>
                    </CardContent>
                  </Card>

                  {/* Average Time Card */}
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-purple-700">Avg. Session</CardTitle>
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-1">{avgTimeSpent}s</div>
                      <p className="text-xs text-purple-500 font-medium">Time per visit</p>
                    </CardContent>
                  </Card>

                  {/* Leads Card */}
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-orange-700">Leads</CardTitle>
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600 mb-1">{totalLeads}</div>
                      <p className="text-xs text-orange-500 font-medium">Generated leads</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{avgSatisfaction}/5</div>
                        <p className="text-sm text-gray-600">Avg. Satisfaction</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">Active</div>
                        <p className="text-sm text-gray-600">Tracking Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '16px'
            }}>
              <div className="pb-3">
                <h3 style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.2px', color: '#1A1A1A' }}>
                  Media Library
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>View and download media assets for your virtual tour</p>
              </div>
              <div>
                {assets.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                    <h3 className="mb-2" style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>No media files yet</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>Media assets for your virtual tour will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                      <div key={asset.id} style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div className="p-3">
                          <div className="flex items-center gap-3 mb-2">
                            {asset.file_type === 'url' ? (
                              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center shadow-md">
                                <Globe className="h-4 w-4 text-white" />
                              </div>
                            ) : asset.file_type.startsWith('image/') ? (
                              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center shadow-md">
                                <ImageIcon className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center shadow-md">
                                {getFileIcon(asset.file_type)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="truncate" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{asset.original_filename}</h4>
                              <p className="text-xs" style={{ color: '#6B7280' }}>
                                {asset.file_type === 'url' ? 'Link' : asset.file_type.split('/')[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 pb-3">
                          <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
                            {new Date(asset.created_at).toLocaleDateString()}
                          </p>
                          {asset.file_type === 'url' ? (
                            <Button 
                              size="sm" 
                              className="w-full"
                              style={{
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                              onClick={() => window.open(asset.file_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Media
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              style={{
                                backgroundColor: '#4169E1',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                              onClick={() => window.open(asset.file_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Media
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Submit New Request */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '16px'
            }}>
              <div className="pb-3">
                <h3 style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.2px', color: '#1A1A1A' }}>
                  Submit Request
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>Request changes or ask questions about your virtual tour</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Title</label>
                  <Input
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="Brief description of your request"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#1A1A1A',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label className="mb-2 block" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Description</label>
                  <Textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Detailed description of what you need"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#1A1A1A',
                      fontSize: '14px'
                    }}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Type</label>
                    <Select value={newRequest.type} onValueChange={(value: string) => setNewRequest({ ...newRequest, type: value })}>
                      <SelectTrigger style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        color: '#1A1A1A',
                        fontSize: '14px'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB' }}>
                        <SelectItem value="content_change" style={{ color: '#1A1A1A' }}>Content Change</SelectItem>
                        <SelectItem value="hotspot_update" style={{ color: '#1A1A1A' }}>Hotspot Update</SelectItem>
                        <SelectItem value="design_modification" style={{ color: '#1A1A1A' }}>Design Modification</SelectItem>
                        <SelectItem value="new_feature" style={{ color: '#1A1A1A' }}>New Feature</SelectItem>
                        <SelectItem value="bug_fix" style={{ color: '#1A1A1A' }}>Bug Fix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Priority</label>
                    <Select value={newRequest.priority} onValueChange={(value: string) => setNewRequest({ ...newRequest, priority: value })}>
                      <SelectTrigger style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        color: '#1A1A1A',
                        fontSize: '14px'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB' }}>
                        <SelectItem value="low" style={{ color: '#1A1A1A' }}>Low</SelectItem>
                        <SelectItem value="medium" style={{ color: '#1A1A1A' }}>Medium</SelectItem>
                        <SelectItem value="high" style={{ color: '#1A1A1A' }}>High</SelectItem>
                        <SelectItem value="urgent" style={{ color: '#1A1A1A' }}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={submitRequest} 
                  disabled={submittingRequest}
                  className="w-full"
                  style={{
                    backgroundColor: '#4169E1',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {submittingRequest ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>

            {/* Existing Requests */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '16px'
            }}>
              <div className="pb-3">
                <h3 style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', letterSpacing: '-0.2px', color: '#1A1A1A' }}>
                  Your Requests
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>Track the status of your submitted requests</p>
              </div>
              <div>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                    <h3 className="mb-2" style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A' }}>No requests yet</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>Submit your first request using the form above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} style={{
                        backgroundColor: '#F8F9FA',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        padding: '16px'
                      }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A' }}>{request.title}</h4>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 500,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: request.priority === 'urgent' ? '#FEE2E2' :
                                               request.priority === 'high' ? '#FED7AA' :
                                               request.priority === 'medium' ? '#DBEAFE' : '#F3F4F6',
                                color: request.priority === 'urgent' ? '#DC2626' :
                                       request.priority === 'high' ? '#EA580C' :
                                       request.priority === 'medium' ? '#2563EB' : '#6B7280'
                              }}>
                                {request.priority}
                              </span>
                            </div>
                            <p className="mb-3 leading-relaxed" style={{ fontSize: '14px', color: '#4B5563' }}>{request.description}</p>
                            <div className="flex items-center space-x-4" style={{ fontSize: '12px', color: '#6B7280' }}>
                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{request.request_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {getStatusIcon(request.status)}
                            <span className="capitalize" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default ClientDashboard;
