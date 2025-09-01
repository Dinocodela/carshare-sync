// src/components/cars/CancelReturnButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function CancelReturnButton({
  carId,
  afterSuccess,
  fullWidth = true,
}: {
  carId: string;
  afterSuccess?: () => void;
  fullWidth?: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "cancel-return-request",
        {
          body: { carId },
        }
      );
      if (error || data?.error) {
        throw new Error(
          error?.message || data?.error || "Failed to cancel request"
        );
      }
      toast({
        title: "Return request cancelled",
        description: "We’ve notified the host.",
        variant: "default",
      });
      afterSuccess?.();
    } catch (e: any) {
      toast({
        title: "Couldn’t cancel return",
        description: e?.message ?? "Please try again.",
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
          variant="destructive"
          size="sm"
          className={fullWidth ? "w-full" : ""}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Cancel Return Request
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel return request?</AlertDialogTitle>
          <AlertDialogDescription>
            This will revert your car back to “Hosted”. Your host will be
            notified that you’re no longer requesting a return.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Request</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
