import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Star, Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface TemplateGalleryProps {
  onImport?: (template: any) => void;
}

export const TemplateGallery = ({ onImport }: TemplateGalleryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates", selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("email_template_gallery")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("use_count", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handlePreview = (template: any) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleImport = async (template: any) => {
    try {
      // Increment use count
      await supabase
        .from("email_template_gallery")
        .update({ use_count: (template.use_count || 0) + 1 })
        .eq("id", template.id);

      if (onImport) {
        onImport(template);
      }

      toast.success("Template imported successfully");
      setPreviewOpen(false);
    } catch (error: any) {
      toast.error(`Failed to import template: ${error.message}`);
    }
  };

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "saas", label: "SaaS" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "service", label: "Services" },
    { value: "general", label: "General" },
    { value: "onboarding", label: "Onboarding" },
    { value: "promotional", label: "Promotional" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Template Gallery</h2>
        <p className="text-muted-foreground">
          Browse professionally designed templates and customize them for your needs
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                    {template.is_featured && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="text-center p-6">
                      <div className="text-4xl mb-2">✉️</div>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleImport(template)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
              <DialogDescription>
                {previewTemplate.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Subject Line:</h4>
                <p className="text-sm bg-muted p-3 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Preview:</h4>
                <div className="border rounded-lg overflow-auto max-h-[500px] bg-muted/20 p-4">
                  <div
                    className="max-w-[600px] mx-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Badge>{previewTemplate.industry}</Badge>
                  {previewTemplate.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleImport(previewTemplate)}>
                    <Download className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
