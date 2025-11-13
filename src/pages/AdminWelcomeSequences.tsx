import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { WelcomeStepsEditor } from "@/components/email/WelcomeStepsEditor";

interface Sequence {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  target_role: string;
  created_at: string;
  steps?: Step[];
}

interface Step {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  delay_hours: number;
  subject: string;
  html_content: string;
}

const AdminWelcomeSequences = () => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSequenceId, setEditSequenceId] = useState<string | null>(null);
  const [stepsDialogOpen, setStepsDialogOpen] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);

  // Fetch sequences
  const { data: sequences, isLoading } = useQuery({
    queryKey: ["welcome-sequences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("welcome_email_sequences")
        .select(`
          *,
          steps:welcome_email_steps(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Sequence[];
    },
  });

  // Create sequence mutation
  const createSequence = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      target_role: string;
    }) => {
      const { error } = await supabase
        .from("welcome_email_sequences")
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welcome-sequences"] });
      toast.success("Sequence created successfully");
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create sequence: ${error.message}`);
    },
  });

  // Toggle active mutation
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("welcome_email_sequences")
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welcome-sequences"] });
      toast.success("Sequence status updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update sequence: ${error.message}`);
    },
  });

  // Delete sequence mutation
  const deleteSequence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("welcome_email_sequences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["welcome-sequences"] });
      toast.success("Sequence deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete sequence: ${error.message}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSequence.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      target_role: formData.get("target_role") as string,
    });
  };

  return (
    <DashboardLayout>
      <SEO
        title="Welcome Email Sequences - Admin"
        description="Manage automated welcome email sequences"
      />
      <PageContainer>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome Email Sequences</h1>
              <p className="text-muted-foreground mt-2">
                Create automated drip campaigns for new users
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Sequence
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Sequences</CardTitle>
              <CardDescription>
                Manage your automated welcome email sequences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : sequences && sequences.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target Role</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences.map((sequence) => (
                      <TableRow key={sequence.id}>
                        <TableCell className="font-medium">
                          {sequence.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sequence.target_role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sequence.steps?.length || 0} emails
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sequence.is_active ? "default" : "secondary"}
                          >
                            {sequence.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSequenceId(sequence.id);
                                setStepsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleActive.mutate({
                                  id: sequence.id,
                                  is_active: sequence.is_active,
                                })
                              }
                            >
                              {sequence.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSequence.mutate(sequence.id)}
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
                <p className="text-center py-8 text-muted-foreground">
                  No sequences created yet. Click "Create Sequence" to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Sequence Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create Welcome Sequence</DialogTitle>
                <DialogDescription>
                  Create a new automated email sequence for new users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="New User Welcome"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe this sequence..."
                  />
                </div>
                <div>
                  <Label htmlFor="target_role">Target Role</Label>
                  <Select name="target_role" defaultValue="both" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="client">Clients Only</SelectItem>
                      <SelectItem value="host">Hosts Only</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Steps Dialog */}
        <Dialog open={stepsDialogOpen} onOpenChange={setStepsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Email Steps</DialogTitle>
              <DialogDescription>
                Add and edit emails in this sequence
              </DialogDescription>
            </DialogHeader>
            {selectedSequenceId && (
              <WelcomeStepsEditor sequenceId={selectedSequenceId} />
            )}
          </DialogContent>
        </Dialog>
      </PageContainer>
    </DashboardLayout>
  );
};

export default AdminWelcomeSequences;
