import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Trophy, X, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ABVariantManager } from "./ABVariantManager";

interface ABTestManagerProps {
  stepId: string;
}

export const ABTestManager = ({ stepId }: ABTestManagerProps) => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [variantsDialogOpen, setVariantsDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Fetch tests for this step
  const { data: tests } = useQuery({
    queryKey: ["ab-tests", stepId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_ab_tests")
        .select("*")
        .eq("step_id", stepId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch step info for base content
  const { data: step } = useQuery({
    queryKey: ["step", stepId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("welcome_email_steps")
        .select("*")
        .eq("id", stepId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch variants for selected test
  const { data: variants } = useQuery({
    queryKey: ["ab-variants", selectedTestId],
    queryFn: async () => {
      if (!selectedTestId) return [];
      const { data, error } = await supabase
        .from("email_ab_variants")
        .select("*")
        .eq("test_id", selectedTestId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTestId,
  });

  // Create test mutation
  const createTest = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("email_ab_tests")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-tests", stepId] });
      toast.success("A/B test created");
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create test: ${error.message}`);
    },
  });

  // Start test mutation
  const startTest = useMutation({
    mutationFn: async (testId: string) => {
      const { error } = await supabase
        .from("email_ab_tests")
        .update({ status: "active", started_at: new Date().toISOString() })
        .eq("id", testId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-tests", stepId] });
      toast.success("A/B test started");
    },
  });

  // Cancel test mutation
  const cancelTest = useMutation({
    mutationFn: async (testId: string) => {
      const { error } = await supabase
        .from("email_ab_tests")
        .update({ status: "cancelled" })
        .eq("id", testId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-tests", stepId] });
      toast.success("A/B test cancelled");
    },
  });

  // Select winner mutation
  const selectWinner = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase.rpc("auto_select_winner", {
        p_test_id: testId,
      });
      
      if (error) throw error;
      return data as any;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["ab-tests", stepId] });
      if (result?.success) {
        toast.success(`Winner selected: ${result.winner_name}`);
      } else {
        toast.error(result?.error || "Failed to select winner");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTest.mutate({
      step_id: stepId,
      name: formData.get("name"),
      description: formData.get("description"),
      test_type: formData.get("test_type"),
      traffic_split: parseInt(formData.get("traffic_split") as string),
      min_sample_size: parseInt(formData.get("min_sample_size") as string),
      confidence_level: parseFloat(formData.get("confidence_level") as string),
      winner_metric: formData.get("winner_metric"),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">A/B Tests</h4>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {tests && tests.length > 0 ? (
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{test.name}</h5>
                    {getStatusBadge(test.status)}
                  </div>
                  {test.description && (
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {test.status === "draft" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTestId(test.id);
                      setVariantsDialogOpen(true);
                    }}
                  >
                    Manage Variants
                  </Button>
                )}
                {test.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => startTest.mutate(test.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                )}
                {test.status === "active" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setResultsDialogOpen(true);
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => selectWinner.mutate(test.id)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Select Winner
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelTest.mutate(test.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {test.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTestId(test.id);
                      setResultsDialogOpen(true);
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No A/B tests yet. Create one to optimize your emails.
        </p>
      )}

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>
                Set up a test to optimize your welcome email performance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Test Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Subject Line Test"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Testing different subject lines..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="test_type">Test Type</Label>
                <Select name="test_type" defaultValue="subject">
                  <SelectTrigger id="test_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject">Subject Line</SelectItem>
                    <SelectItem value="content">Email Content</SelectItem>
                    <SelectItem value="send_time">Send Time</SelectItem>
                    <SelectItem value="full">Full Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="traffic_split">Traffic Split (%)</Label>
                  <Input
                    id="traffic_split"
                    name="traffic_split"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="min_sample_size">Min Sample Size</Label>
                  <Input
                    id="min_sample_size"
                    name="min_sample_size"
                    type="number"
                    min="50"
                    defaultValue="100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confidence_level">Confidence Level (%)</Label>
                  <Input
                    id="confidence_level"
                    name="confidence_level"
                    type="number"
                    min="80"
                    max="99.9"
                    step="0.1"
                    defaultValue="95"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="winner_metric">Success Metric</Label>
                  <Select name="winner_metric" defaultValue="combined">
                    <SelectTrigger id="winner_metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_rate">Open Rate</SelectItem>
                      <SelectItem value="click_rate">Click Rate</SelectItem>
                      <SelectItem value="combined">Combined Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Test</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Variants Dialog */}
      {selectedTestId && (
        <>
          <Dialog open={variantsDialogOpen} onOpenChange={setVariantsDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Manage Test Variants</DialogTitle>
                <DialogDescription>
                  Create different versions to test
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {variants && variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((variant: any) => (
                      <Card key={variant.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-medium">{variant.name}</h6>
                              {variant.is_control && <Badge variant="secondary">Control</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Subject: {variant.subject}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Traffic: {variant.traffic_allocation}%
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <ABVariantManager 
                      testId={selectedTestId} 
                      baseSubject={step?.subject || ""}
                      baseContent={step?.html_content || ""}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">
                      No variants yet. Add variants to start testing.
                    </p>
                    <ABVariantManager 
                      testId={selectedTestId} 
                      baseSubject={step?.subject || ""}
                      baseContent={step?.html_content || ""}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Results Dialog */}
          <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>A/B Test Results</DialogTitle>
                <DialogDescription>
                  Performance comparison of variants
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {variants && variants.length > 0 ? (
                  <div className="space-y-4">
                    {variants.map((variant: any) => (
                      <Card key={variant.id} className="p-4">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h6 className="font-medium">{variant.name}</h6>
                              {variant.is_control && <Badge variant="secondary">Control</Badge>}
                            </div>
                            <span className="text-sm font-mono">
                              Score: {variant.combined_score?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {variant.sends_count} sends
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Open Rate</span>
                              <span className="font-medium">{variant.open_rate?.toFixed(1) || "0.0"}%</span>
                            </div>
                            <Progress value={variant.open_rate || 0} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Click Rate</span>
                              <span className="font-medium">{variant.click_rate?.toFixed(1) || "0.0"}%</span>
                            </div>
                            <Progress value={variant.click_rate || 0} className="h-2" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No data yet
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
