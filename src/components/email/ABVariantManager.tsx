import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface ABVariantManagerProps {
  testId: string;
  baseSubject: string;
  baseContent: string;
}

export const ABVariantManager = ({ testId, baseSubject, baseContent }: ABVariantManagerProps) => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createVariant = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("email_ab_variants").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-variants", testId] });
      toast.success("Variant created");
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create variant: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createVariant.mutate({
      test_id: testId,
      name: formData.get("name"),
      is_control: formData.get("is_control") === "on",
      subject: formData.get("subject"),
      html_content: formData.get("html_content"),
      send_delay_hours: parseInt(formData.get("send_delay_hours") as string) || 0,
      traffic_allocation: parseInt(formData.get("traffic_allocation") as string),
    });
  };

  return (
    <div>
      <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Variant
      </Button>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Variant</DialogTitle>
              <DialogDescription>
                Create a variation of the email to test
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="name">Variant Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Variant A"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_control" name="is_control" />
                <Label htmlFor="is_control">Set as Control Group</Label>
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={baseSubject}
                  required
                />
              </div>
              <div>
                <Label htmlFor="html_content">Email Content (HTML)</Label>
                <Textarea
                  id="html_content"
                  name="html_content"
                  defaultValue={baseContent}
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="send_delay_hours">Send Delay (hours)</Label>
                  <Input
                    id="send_delay_hours"
                    name="send_delay_hours"
                    type="number"
                    min="0"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <Label htmlFor="traffic_allocation">Traffic Allocation (%)</Label>
                  <Input
                    id="traffic_allocation"
                    name="traffic_allocation"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="50"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Variant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
