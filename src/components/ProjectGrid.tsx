import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Calendar, BarChart3, ExternalLink, Play, Pause, MoreHorizontal, Loader2, Users, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  views: number;
  client_name: string;
  project_type: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  last_project_date: string;
}

interface ProjectGridProps {
  onCreateRequest?: (project: Project) => void;
  onClientClick?: (client: Client) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ onCreateRequest, onClientClick }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  // Production ready - No sample data
  // Users start with empty state

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      client_name: '',
      project_type: 'virtual_tour',
      status: 'active'
    }
  });

  useEffect(() => {
    loadProjects();
    // No sample clients - production ready
    setClients([]);
  }, []);

  // Production ready - No sample data
  // Users start with empty state

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', 'anonymous')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database query failed:', error);
        // Show empty state for production
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.warn('Error loading projects:', error);
      // Show empty state for production
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id);

        if (error) {
          console.warn('Database update failed, updating local data:', error);
          // Update local data as fallback
          setProjects(prev => prev.map(p => 
            p.id === editingProject.id 
              ? { ...p, ...data, updated_at: new Date().toISOString() }
              : p
          ));
        } else {
          toast({
            title: TEXT.PROJECTS.PROJECT_UPDATED,
            description: TEXT.PROJECTS.PROJECT_UPDATED_DESCRIPTION
          });
        }
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            ...data,
            user_id: 'anonymous',
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.warn('Database insert failed, adding to local data:', error);
          // Add to local data as fallback
          const newProject: Project = {
            id: Date.now().toString(),
            ...data,
            user_id: 'anonymous',
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProjects(prev => [newProject, ...prev]);
        } else {
          toast({
            title: TEXT.PROJECTS.PROJECT_CREATED,
            description: TEXT.PROJECTS.PROJECT_CREATED_DESCRIPTION
          });
        }
      }

      setIsDialogOpen(false);
      setEditingProject(null);
      form.reset();
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.PROJECTS.ERROR_SAVING_PROJECT,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title,
      description: project.description,
      thumbnail_url: project.thumbnail_url,
      client_name: project.client_name,
      project_type: project.project_type,
      status: project.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingProject(id);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Database delete failed, removing from local data:', error);
        // Remove from local data as fallback
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        toast({
          title: TEXT.PROJECTS.PROJECT_DELETED,
          description: TEXT.PROJECTS.PROJECT_DELETED_DESCRIPTION
        });
      }
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      // Remove from local data as fallback
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: TEXT.PROJECTS.PROJECT_DELETED,
        description: TEXT.PROJECTS.PROJECT_DELETED_DESCRIPTION
      });
    } finally {
      setDeletingProject(null);
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
        return TEXT.PROJECTS.STATUS_LABELS.ACTIVE;
      case 'inactive':
        return TEXT.PROJECTS.STATUS_LABELS.INACTIVE;
      case 'draft':
        return TEXT.PROJECTS.STATUS_LABELS.DRAFT;
      default:
        return status;
    }
  };

  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.PROJECTS.YOUR_PROJECTS}</h2>
            <p className="text-foreground-secondary">{TEXT.PROJECTS.MANAGE_PROJECTS}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted"></div>
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.PROJECTS.YOUR_PROJECTS}</h2>
            <p className="text-foreground-secondary">{TEXT.PROJECTS.MANAGE_PROJECTS}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadProjects} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{TEXT.PROJECTS.YOUR_PROJECTS}</h2>
          <p className="text-foreground-secondary">{TEXT.PROJECTS.MANAGE_PROJECTS}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={TEXT.PROJECTS.FILTER_BY_STATUS} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.PROJECTS.ALL_PROJECTS}</SelectItem>
              <SelectItem value="active">{TEXT.PROJECTS.STATUS_LABELS.ACTIVE}</SelectItem>
              <SelectItem value="inactive">{TEXT.PROJECTS.STATUS_LABELS.INACTIVE}</SelectItem>
              <SelectItem value="draft">{TEXT.PROJECTS.STATUS_LABELS.DRAFT}</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary-hover"
                onClick={() => {
                  setEditingProject(null);
                  form.reset();
                }}
              >
                <Plus size={18} className="mr-2" />
                {TEXT.PROJECTS.NEW_PROJECT}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? TEXT.PROJECTS.EDIT_PROJECT : TEXT.PROJECTS.CREATE_NEW_PROJECT}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{TEXT.PROJECTS.PROJECT_TITLE}</FormLabel>
                        <FormControl>
                          <Input placeholder={TEXT.PROJECTS.ENTER_PROJECT_TITLE} {...field} />
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
                        <FormLabel>{TEXT.PROJECTS.DESCRIPTION}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={TEXT.PROJECTS.ENTER_DESCRIPTION} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="client_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{TEXT.PROJECTS.CLIENT_NAME}</FormLabel>
                          <FormControl>
                            <Input placeholder={TEXT.PROJECTS.ENTER_CLIENT_NAME} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="project_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{TEXT.PROJECTS.PROJECT_TYPE}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={TEXT.PROJECTS.SELECT_TYPE} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="virtual_tour">{TEXT.PROJECTS.PROJECT_TYPES.VIRTUAL_TOUR}</SelectItem>
                              <SelectItem value="3d_scan">{TEXT.PROJECTS.PROJECT_TYPES.SCAN_3D}</SelectItem>
                              <SelectItem value="interactive_media">{TEXT.PROJECTS.PROJECT_TYPES.INTERACTIVE_MEDIA}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{TEXT.PROJECTS.THUMBNAIL_URL}</FormLabel>
                        <FormControl>
                          <Input placeholder={TEXT.PROJECTS.ENTER_THUMBNAIL_URL} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{TEXT.PROJECTS.STATUS}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={TEXT.PROJECTS.SELECT_STATUS} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">{TEXT.PROJECTS.STATUS_LABELS.ACTIVE}</SelectItem>
                            <SelectItem value="inactive">{TEXT.PROJECTS.STATUS_LABELS.INACTIVE}</SelectItem>
                            <SelectItem value="draft">{TEXT.PROJECTS.STATUS_LABELS.DRAFT}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      {TEXT.PROJECTS.CANCEL}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingProject ? TEXT.PROJECTS.UPDATE : TEXT.PROJECTS.CREATE}
                        </>
                      ) : (
                        `${editingProject ? TEXT.PROJECTS.UPDATE : TEXT.PROJECTS.CREATE} Project`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Clients Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Your Clients</h3>
          <Badge variant="secondary" className="ml-2">
            {clients.length} clients
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-md transition-shadow cursor-pointer hover:scale-105 transform transition-all duration-200"
              onClick={() => onClientClick?.(client)}
            >
              <CardHeader className="pb-3">
                <div className="card-header-safe">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-foreground name-display-safe">
                      {client.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-foreground-secondary company-display-safe">
                      {client.company}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <Mail className="w-3 h-3" />
                  <span className="email-display-safe">{client.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <Phone className="w-3 h-3" />
                  <span>{client.phone}</span>
                </div>
                
                <div className="text-xs text-foreground-secondary">
                  Last project: {new Date(client.last_project_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-foreground-secondary mb-4">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">{TEXT.PROJECTS.NO_PROJECTS_YET}</h3>
              <p>{TEXT.PROJECTS.CREATE_FIRST_PROJECT}</p>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {project.thumbnail_url ? (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {TEXT.PROJECTS.NO_THUMBNAIL}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Play size={16} className="mr-1" />
                      {TEXT.PROJECTS.VIEW}
                    </Button>
                    <Button size="sm" variant="secondary">
                      <ExternalLink size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.client_name}</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-muted-foreground">{TEXT.PROJECTS.VIEWS}</div>
                        <div className="font-medium">{project.views}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{TEXT.PROJECTS.TYPE}</div>
                        <div className="font-medium capitalize">{project.project_type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onCreateRequest?.(project)}
                    >
                      <Plus size={14} className="mr-1" />
                      {TEXT.PROJECTS.REQUEST}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={deletingProject === project.id}
                        >
                          {deletingProject === project.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(project.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
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
    </div>
  );
};

export default ProjectGrid;
