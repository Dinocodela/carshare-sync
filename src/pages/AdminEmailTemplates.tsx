import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { TemplateBuilder } from "@/components/email/TemplateBuilder";
import { TemplatePreview } from "@/components/email/TemplatePreview";

export default function AdminEmailTemplates() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject_template: "",
    preview_text: "",
    html_content: { sections: [] as Array<{ type: string; content: Record<string, any> }> },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["newsletter-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("newsletter_templates").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-templates"] });
      toast.success("Template created successfully");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from("newsletter_templates").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-templates"] });
      toast.success("Template updated successfully");
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      subject_template: "",
      preview_text: "",
      html_content: { sections: [] },
    });
    setSelectedTemplate(null);
  };

  const handleCreate = () => {
    if (!formData.name || !formData.subject_template || formData.html_content.sections.length === 0) {
      toast.error("Please fill in all required fields and add at least one section");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      subject_template: template.subject_template,
      preview_text: template.preview_text || "",
      html_content: template.html_content,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedTemplate) return;
    updateMutation.mutate({ id: selectedTemplate.id, data: formData });
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Email Templates</h1>
              <p className="text-muted-foreground">Create and manage email templates with drag-and-drop builder</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>
                    Build your email template using drag-and-drop sections
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="builder" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="builder" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div>
                        <Label>Template Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="My Template"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Template description"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Subject Template * (supports {{variables}})</Label>
                        <Input
                          value={formData.subject_template}
                          onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                          placeholder="Welcome {{first_name}}!"
                        />
                      </div>
                      <div>
                        <Label>Preview Text</Label>
                        <Input
                          value={formData.preview_text}
                          onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                          placeholder="Text shown in email preview"
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Label className="text-base">Template Sections *</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Build your email by adding and arranging sections below
                      </p>
                      <TemplateBuilder
                        sections={formData.html_content.sections}
                        onChange={(sections) => setFormData({ ...formData, html_content: { sections } })}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <TemplatePreview
                      sections={formData.html_content.sections}
                      variables={{ first_name: "John", email: "john@example.com", title: "Sample Title", subtitle: "Sample Subtitle", body: "Sample body text" }}
                    />
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading templates...</div>
          ) : templates?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No templates yet</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates?.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      {template.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                      )}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <strong>Subject:</strong> {template.subject_template}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Sections:</strong> {template.html_content?.sections?.length || 0}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(template)} className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(template)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this template?")) {
                            deleteMutation.mutate(template.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Email Template</DialogTitle>
                <DialogDescription>Update your email template</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="builder" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="builder" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="My Template"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Template description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Subject Template * (supports {{variables}})</Label>
                      <Input
                        value={formData.subject_template}
                        onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                        placeholder="Welcome {{first_name}}!"
                      />
                    </div>
                    <div>
                      <Label>Preview Text</Label>
                      <Input
                        value={formData.preview_text}
                        onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                        placeholder="Text shown in email preview"
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-base">Template Sections *</Label>
                    <TemplateBuilder
                      sections={formData.html_content.sections}
                      onChange={(sections) => setFormData({ ...formData, html_content: { sections } })}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <TemplatePreview
                    sections={formData.html_content.sections}
                    variables={{ first_name: "John", email: "john@example.com" }}
                  />
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                <DialogDescription>Template Preview</DialogDescription>
              </DialogHeader>
              <TemplatePreview
                sections={(selectedTemplate?.html_content as any)?.sections || []}
                variables={{ first_name: "John", email: "john@example.com", title: "Sample Title", subtitle: "Sample Subtitle", body: "Sample content" }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}