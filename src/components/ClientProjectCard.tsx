import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Bot,
  Activity,
  ExternalLink,
  Settings,
  MoreHorizontal,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  Share2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ClientProjectCardProps {
  project: {
    id: string;
    client: {
      name: string;
      email: string;
      company: string;
      avatar?: string;
    };
    project: {
      title: string;
      description: string;
      type: string;
      category: string;
      status: 'active' | 'inactive' | 'setup' | 'completed';
    };
    chatbot?: {
      name: string;
      isActive: boolean;
      conversations: number;
      satisfaction: number;
    };
    analytics: {
      totalViews: number;
      uniqueVisitors: number;
      avgSessionDuration: string;
      conversionRate: number;
      lastActivity: string;
    };
    createdAt: string;
    lastActivity: string;
  };
  onViewDetails: (project: any) => void;
  onManageProject: (project: any) => void;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
  onStatusChange?: (projectId: string, newStatus: string) => void;
  onSharePortal?: (project: any) => void;
}

const ClientProjectCard: React.FC<ClientProjectCardProps> = ({
  project,
  onViewDetails,
  onManageProject,
  onEditProject,
  onDeleteProject,
  onStatusChange,
  onSharePortal
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'setup':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'inactive':
        return 'Inactive';
      case 'setup':
        return 'Setup';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'inactive':
        return <AlertCircle className="h-3 w-3" />;
      case 'setup':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <Star className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="card-header-safe">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary-foreground">
                {project.client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg name-display-safe group-hover:text-primary transition-colors">
                {project.project.title}
              </CardTitle>
              <CardDescription className="company-display-safe">
                {project.client.name} • {project.client.company}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getStatusColor(project.project.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(project.project.status)}
                {getStatusLabel(project.project.status)}
              </div>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {project.project.status !== 'active' && onStatusChange && (
                  <DropdownMenuItem onClick={() => onStatusChange(project.id, 'active')}>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                {project.project.status === 'active' && onStatusChange && (
                  <DropdownMenuItem onClick={() => onStatusChange(project.id, 'inactive')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                )}
                {project.project.status !== 'completed' && onStatusChange && (
                  <DropdownMenuItem onClick={() => onStatusChange(project.id, 'completed')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {project.project.status !== 'setup' && onStatusChange && (
                  <DropdownMenuItem onClick={() => onStatusChange(project.id, 'setup')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Back to Setup
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.project.description || `A ${project.project.type.replace('_', ' ')} project for ${project.client.company}`}
        </p>
        
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Views</span>
            </div>
            <div className="text-lg font-semibold">{project.analytics.totalViews}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Visitors</span>
            </div>
            <div className="text-lg font-semibold">{project.analytics.uniqueVisitors}</div>
          </div>
        </div>
        
        {/* Conversion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-medium">{project.analytics.conversionRate}%</span>
          </div>
          <Progress value={project.analytics.conversionRate} className="h-2" />
        </div>
        
        {/* Chatbot Status */}
        {project.chatbots && project.chatbots.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{project.chatbots[0].name}</div>
                <div className="text-xs text-muted-foreground">
                  {project.chatbots[0].statistics?.total_conversations || 0} conversations
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-medium">
                {project.chatbots[0].statistics?.satisfaction_rate || 0}/5
              </span>
            </div>
          </div>
        )}
        
        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Last activity: {new Date(project.lastActivity).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{project.analytics.avgSessionDuration}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(project);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {onSharePortal && (
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSharePortal(project);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onManageProject(project);
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
            {onEditProject && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDeleteProject && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProjectCard;

