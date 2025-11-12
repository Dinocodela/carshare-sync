import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TemplateSectionProps {
  section: {
    type: string;
    content: Record<string, any>;
  };
  index: number;
  onUpdate: (index: number, content: Record<string, any>) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const TemplateSection = ({
  section,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: TemplateSectionProps) => {
  const updateContent = (key: string, value: any) => {
    onUpdate(index, { ...section.content, [key]: value });
  };

  const renderSectionEditor = () => {
    switch (section.type) {
      case "header":
        return (
          <div className="space-y-3">
            <div>
              <Label>Logo Text</Label>
              <Input
                value={section.content.logo || ""}
                onChange={(e) => updateContent("logo", e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label>Background Color</Label>
              <Input
                type="color"
                value={section.content.backgroundColor || "#0EA5E9"}
                onChange={(e) => updateContent("backgroundColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "hero":
        return (
          <div className="space-y-3">
            <div>
              <Label>Title (supports {`{{variables}}`})</Label>
              <Input
                value={section.content.title || ""}
                onChange={(e) => updateContent("title", e.target.value)}
                placeholder={`{{title}}`}
              />
            </div>
            <div>
              <Label>Subtitle (supports {`{{variables}}`})</Label>
              <Input
                value={section.content.subtitle || ""}
                onChange={(e) => updateContent("subtitle", e.target.value)}
                placeholder={`{{subtitle}}`}
              />
            </div>
            <div>
              <Label>Background Color</Label>
              <Input
                type="color"
                value={section.content.backgroundColor || "#F0F9FF"}
                onChange={(e) => updateContent("backgroundColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div>
            <Label>Body Text (supports {`{{variables}}`})</Label>
            <Textarea
              value={section.content.body || ""}
              onChange={(e) => updateContent("body", e.target.value)}
              placeholder={`Enter text content. Use {{variable_name}} for personalization.`}
              rows={4}
            />
          </div>
        );

      case "button":
        return (
          <div className="space-y-3">
            <div>
              <Label>Button Text</Label>
              <Input
                value={section.content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                placeholder="Click Here"
              />
            </div>
            <div>
              <Label>Button URL (supports {`{{variables}}`})</Label>
              <Input
                value={section.content.url || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder={`https://example.com or {{custom_url}}`}
              />
            </div>
            <div>
              <Label>Button Color</Label>
              <Input
                type="color"
                value={section.content.backgroundColor || "#0EA5E9"}
                onChange={(e) => updateContent("backgroundColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-3">
            <div>
              <Label>Image URL (supports {`{{variables}}`})</Label>
              <Input
                value={section.content.url || ""}
                onChange={(e) => updateContent("url", e.target.value)}
                placeholder={`https://example.com/image.jpg or {{image_url}}`}
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={section.content.alt || ""}
                onChange={(e) => updateContent("alt", e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case "divider":
        return (
          <div className="text-sm text-muted-foreground">
            Horizontal divider line
          </div>
        );

      case "footer":
        return (
          <div className="space-y-3">
            <div>
              <Label>Footer Text</Label>
              <Textarea
                value={section.content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                placeholder="© 2025 Company Name"
                rows={2}
              />
            </div>
            <div>
              <Label>Unsubscribe Text</Label>
              <Input
                value={section.content.unsubscribeText || ""}
                onChange={(e) => updateContent("unsubscribeText", e.target.value)}
                placeholder="Unsubscribe from these emails"
              />
            </div>
          </div>
        );

      default:
        return <div className="text-sm text-muted-foreground">Unknown section type</div>;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className="h-6 w-6 p-0"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className="h-6 w-6 p-0"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium capitalize">{section.type}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {renderSectionEditor()}
        </div>
      </div>
    </div>
  );
};