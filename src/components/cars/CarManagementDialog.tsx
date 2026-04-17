import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Car, Settings, RefreshCw } from 'lucide-react';

interface CarManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carInfo: {
    year: number;
    make: string;
    model: string;
    status: string;
  };
  onCarUpdated?: () => void;
}

const CAR_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'hosted', label: 'Hosted' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'unavailable', label: 'Unavailable' },
];

export function CarManagementDialog({ 
  open, 
  onOpenChange, 
  carId, 
  carInfo,
  onCarUpdated 
}: CarManagementDialogProps) {
  const [status, setStatus] = useState(carInfo.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    if (!carId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', carId);

      if (error) throw error;

      toast({
        title: "Car Status Updated",
        description: `${carInfo.year} ${carInfo.make} ${carInfo.model} status changed to ${status}`,
      });

      onCarUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating car status:', error);
      toast({
        title: "Error",
        description: "Failed to update car status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(carInfo.status);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Manage Car</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Car Info */}
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <Car className="h-6 w-6 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">
                {carInfo.year} {carInfo.make} {carInfo.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                Current Status: <span className="capitalize">{carInfo.status}</span>
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-3">
            <Label htmlFor="status">Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CAR_STATUSES.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={loading || status === carInfo.status}
            >
              {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}