import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Step {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  delay_hours: number;
  subject: string;
  html_content: string;
}

interface WelcomeStepsEditorProps {
  sequenceId: string;
}

export const WelcomeStepsEditor = ({ sequenceId }: WelcomeStepsEditorProps) => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  // Fetch steps
  const { data: steps, isLoading } = useQuery({
    queryKey: ["welcome-steps", sequenceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("welcome_email_steps")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("step_order", { ascending: true });

      if (error) throw error;
      return data as Step[];
    },
    enabled: !!sequenceId,
  });

  // Create/Update step mutation
  const saveStep = useMutation({
    mutationFn: async (data: {
      step_order: number;
      delay_days: number;
      delay_hours: number;
      subject: string;
      html_content: string;
    }) => {
      if (editingStep) {
        const { error } = await supabase
          .from("welcome_email_steps")
          .update(data)
          .eq("id", editingStep.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("welcome_email_steps")
          .insert([{ ...data, sequence_id: sequenceId }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welcome-steps", sequenceId] });
      toast.success(editingStep ? "Step updated" : "Step created");
      setCreateDialogOpen(false);
      setEditingStep(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to save step: ${error.message}`);
    },
  });

  // Delete step mutation
  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("welcome_email_steps")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welcome-steps", sequenceId] });
      toast.success("Step deleted");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete step: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveStep.mutate({
      step_order: parseInt(formData.get("step_order") as string),
      delay_days: parseInt(formData.get("delay_days") as string),
      delay_hours: parseInt(formData.get("delay_hours") as string),
      subject: formData.get("subject") as string,
      html_content: formData.get("html_content") as string,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Steps</h3>
        <Button
          onClick={() => {
            setEditingStep(null);
            setCreateDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading steps...</p>
      ) : steps && steps.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>{step.step_order}</TableCell>
                <TableCell className="font-medium">{step.subject}</TableCell>
                <TableCell>
                  {step.delay_days > 0 && `${step.delay_days}d `}
                  {step.delay_hours > 0 && `${step.delay_hours}h`}
                  {step.delay_days === 0 && step.delay_hours === 0 && "Immediate"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStep(step);
                        setCreateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStep.mutate(step.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No steps added yet. Click "Add Step" to create your first email.
        </p>
      )}

      {/* Create/Edit Step Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingStep ? "Edit Step" : "Create Step"}
              </DialogTitle>
              <DialogDescription>
                Configure an email in your welcome sequence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="step_order">Step Order</Label>
                  <Input
                    id="step_order"
                    name="step_order"
                    type="number"
                    min="1"
                    defaultValue={editingStep?.step_order || (steps?.length || 0) + 1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="delay_days">Delay (Days)</Label>
                  <Input
                    id="delay_days"
                    name="delay_days"
                    type="number"
                    min="0"
                    defaultValue={editingStep?.delay_days || 0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="delay_hours">Delay (Hours)</Label>
                  <Input
                    id="delay_hours"
                    name="delay_hours"
                    type="number"
                    min="0"
                    max="23"
                    defaultValue={editingStep?.delay_hours || 0}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingStep?.subject || ""}
                  placeholder="Welcome to Teslys!"
                  required
                />
              </div>
              <div>
                <Label htmlFor="html_content">HTML Content</Label>
                <Textarea
                  id="html_content"
                  name="html_content"
                  defaultValue={editingStep?.html_content || ""}
                  placeholder="<h1>Welcome {{first_name}}!</h1>"
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available variables: {"{"}{"{"} first_name{"}"}{"}"}, {"{"}{"{"} last_name{"}"}{"}"}, {"{"}{"{"} email {"}"}{"}"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setEditingStep(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingStep ? "Update" : "Create"} Step
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
