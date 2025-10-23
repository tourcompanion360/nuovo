import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Trash2, 
  Loader2
} from 'lucide-react';

interface ResetAnalyticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  clientName: string;
  isResetting: boolean;
}

const ResetAnalyticsDialog: React.FC<ResetAnalyticsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  isResetting
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Reset error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Reset Analytics Data
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all analytics data for <strong>{clientName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Warning: This action cannot be undone!</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All imported analytics data will be permanently deleted</li>
                <li>All charts and visualizations will be cleared</li>
                <li>Analytics cards will reset to zero</li>
                <li>This action affects only {clientName}'s data</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trash2 className="h-4 w-4" />
              <span>This will delete all analytics records associated with this client from the database.</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isResetting}
            className="flex items-center gap-2"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Reset Analytics
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetAnalyticsDialog;


