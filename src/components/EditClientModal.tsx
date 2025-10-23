import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizePersonName, sanitizeEmail, sanitizeCompanyName } from '@/utils/inputValidation';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    website?: string;
  } | null;
  onClientUpdated: () => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onClientUpdated
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: ''
  });

  // Update form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        company: client.company || '',
        phone: client.phone || '',
        website: client.website || ''
      });
    }
  }, [client]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditClientModal: handleSubmit called');
    console.log('Client data:', client);
    console.log('Form data:', formData);
    
    if (!client) {
      console.error('No client data provided');
      toast({
        title: 'Error',
        description: 'Client information not found.',
        variant: 'destructive',
      });
      return;
    }

    if (!client.id) {
      console.error('Client ID is missing:', client);
      toast({
        title: 'Error',
        description: 'Client ID is missing. Cannot update.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      toast({
        title: 'Required fields missing',
        description: 'Name, email, and company are required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Sanitize input data - but don't be too aggressive
      const sanitizedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company.trim(),
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating client with ID:', client.id);
      console.log('Sanitized data:', sanitizedData);

      // Update client in database
      const { data, error } = await supabase
        .from('end_clients')
        .update(sanitizedData)
        .eq('id', client.id)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Error updating client:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide more specific error messages
        let errorMessage = 'Unable to update client data. Please try again.';
        if (error.message.includes('permission denied')) {
          errorMessage = 'Permission denied. You can only update your own clients.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Email already exists. Please use a different email address.';
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Invalid data format. Please check your input.';
        } else if (error.message.includes('JWT')) {
          errorMessage = 'Authentication error. Please refresh the page and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!data || data.length === 0) {
        throw new Error('No client was updated. The client may not exist or you may not have permission to update it.');
      }

      console.log('Client updated successfully:', data[0]);

      toast({
        title: 'Client updated',
        description: `${sanitizedData.name}'s data has been updated successfully.`,
      });

      // Refresh data in parent component
      onClientUpdated();
      
      // Close modal
      onClose();

    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Unable to update client data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;

    try {
      setIsDeleting(true);

      // First, delete all projects associated with this client
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('end_client_id', client.id);

      if (projectsError) {
        console.error('Error deleting client projects:', projectsError);
        // Continue with client deletion even if projects fail
      }

      // Then delete the client
      const { error: clientError } = await supabase
        .from('end_clients')
        .delete()
        .eq('id', client.id);

      if (clientError) throw clientError;

      toast({
        title: 'Client deleted',
        description: 'The client and all associated projects have been permanently removed.',
        variant: 'default'
      });

      onClientUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Delete failed',
        description: 'We could not delete this client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Modify client information. Changes will be reflected across all sections of the app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Client name"
              required
              disabled={isSubmitting}
              className="input-safe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              required
              disabled={isSubmitting}
              className="input-safe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Company name"
              required
              disabled={isSubmitting}
              className="input-safe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 123 456 7890"
              disabled={isSubmitting}
              className="input-safe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.com"
              disabled={isSubmitting}
              className="input-long-text"
            />
          </div>

          <DialogFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Client
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{client?.name}"? 
                    <br /><br />
                    <strong>This action cannot be undone.</strong> This will permanently remove:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>The client and all their information</li>
                      <li>All associated projects</li>
                      <li>Associated chatbots and analytics</li>
                      <li>All related data and files</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteClient}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Client
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Client'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;
