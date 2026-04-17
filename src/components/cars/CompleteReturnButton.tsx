import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

interface CompleteReturnButtonProps {
  carId: string;
  carName: string;
  afterSuccess?: () => void;
  fullWidth?: boolean;
}

export function CompleteReturnButton({ 
  carId, 
  carName,
  afterSuccess,
  fullWidth = true 
}: CompleteReturnButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCompleteReturn = async () => {
    setLoading(true);
    try {
      // Update car status to available and clear host_id
      const { error } = await supabase
        .from('cars')
        .update({ 
          status: 'available',
          host_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', carId);

      if (error) throw error;

      toast({
        title: "Return Completed",
        description: `${carName} is now available for hosting again.`,
      });

      afterSuccess?.();
    } catch (error) {
      console.error('Error completing return:', error);
      toast({
        title: "Error",
        description: "Failed to complete return. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="default" 
          className={fullWidth ? "w-full" : ""}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Return
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Return Yourself?</AlertDialogTitle>
          <AlertDialogDescription>
            Since your host hasn't confirmed the return yet, you can complete it yourself. 
            This will mark <strong>{carName}</strong> as available and allow you to request hosting again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCompleteReturn}>
            Complete Return
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
