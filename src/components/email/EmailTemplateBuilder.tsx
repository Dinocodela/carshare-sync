import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code } from "lucide-react";
import { EmailComponentPalette } from "./EmailComponentPalette";
import { EmailCanvas } from "./EmailCanvas";
import { EmailPreview } from "./EmailPreview";
import { ComponentEditor } from "./ComponentEditor";
import { Textarea } from "@/components/ui/textarea";

export interface EmailComponent {
  id: string;
  type: "text" | "heading" | "button" | "image" | "divider" | "spacer";
  content?: string;
  props?: {
    align?: "left" | "center" | "right";
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    href?: string;
    src?: string;
    alt?: string;
    height?: number;
  };
}

interface EmailTemplateBuilderProps {
  initialHtml?: string;
  onSave: (html: string) => void;
}

export const EmailTemplateBuilder = ({ initialHtml = "", onSave }: EmailTemplateBuilderProps) => {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState(initialHtml);
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual");

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // If dragging from palette
    if (active.id.toString().startsWith("palette-")) {
      const componentType = active.id.toString().replace("palette-", "") as EmailComponent["type"];
      const newComponent: EmailComponent = {
        id: `component-${Date.now()}`,
        type: componentType,
        content: getDefaultContent(componentType),
        props: getDefaultProps(componentType),
      };
      setComponents([...components, newComponent]);
      return;
    }

    // If reordering existing components
    if (active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      setComponents(arrayMove(components, oldIndex, newIndex));
    }
  };

  const getDefaultContent = (type: EmailComponent["type"]): string => {
    switch (type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Your text content goes here. Click to edit.";
      case "button":
        return "Click Here";
      case "image":
        return "";
      case "divider":
        return "";
      case "spacer":
        return "";
      default:
        return "";
    }
  };

  const getDefaultProps = (type: EmailComponent["type"]): EmailComponent["props"] => {
    switch (type) {
      case "heading":
        return { align: "left", color: "#000000", fontSize: "24px" };
      case "text":
        return { align: "left", color: "#333333", fontSize: "14px" };
      case "button":
        return { align: "center", backgroundColor: "#000000", color: "#ffffff", href: "#" };
      case "image":
        return { align: "center", src: "", alt: "Image" };
      case "divider":
        return { color: "#e5e5e5" };
      case "spacer":
        return { height: 20 };
      default:
        return {};
    }
  };

  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const generateHtml = (): string => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  </style>
</head>
<body>
  <div class="email-container">
`;

    components.forEach((component) => {
      switch (component.type) {
        case "heading":
          html += `    <h1 style="margin: 20px; text-align: ${component.props?.align || "left"}; color: ${component.props?.color || "#000000"}; font-size: ${component.props?.fontSize || "24px"};">${component.content || ""}</h1>\n`;
          break;
        case "text":
          html += `    <p style="margin: 20px; text-align: ${component.props?.align || "left"}; color: ${component.props?.color || "#333333"}; font-size: ${component.props?.fontSize || "14px"}; line-height: 1.6;">${component.content || ""}</p>\n`;
          break;
        case "button":
          html += `    <div style="margin: 20px; text-align: ${component.props?.align || "center"};">
      <a href="${component.props?.href || "#"}" style="display: inline-block; padding: 12px 24px; background-color: ${component.props?.backgroundColor || "#000000"}; color: ${component.props?.color || "#ffffff"}; text-decoration: none; border-radius: 4px; font-size: 14px;">${component.content || ""}</a>
    </div>\n`;
          break;
        case "image":
          html += `    <div style="margin: 20px; text-align: ${component.props?.align || "center"};">
      <img src="${component.props?.src || ""}" alt="${component.props?.alt || "Image"}" style="max-width: 100%; height: auto;">
    </div>\n`;
          break;
        case "divider":
          html += `    <hr style="margin: 20px; border: none; border-top: 1px solid ${component.props?.color || "#e5e5e5"};">\n`;
          break;
        case "spacer":
          html += `    <div style="height: ${component.props?.height || 20}px;"></div>\n`;
          break;
      }
    });

    html += `  </div>
</body>
</html>`;

    return html;
  };

  const handleSave = () => {
    const html = activeTab === "visual" ? generateHtml() : htmlCode;
    onSave(html);
  };

  const handleTabChange = (value: string) => {
    if (value === "code" && activeTab === "visual") {
      setHtmlCode(generateHtml());
    }
    setActiveTab(value as "visual" | "code");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Email Template Builder</h2>
        <Button onClick={handleSave}>Save Template</Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="flex-1 flex gap-4 p-4 mt-0">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="w-48 flex-shrink-0">
              <EmailComponentPalette />
            </div>

            <div className="flex-1 flex gap-4">
              <div className="flex-1 bg-muted/20 border rounded-lg p-4 overflow-auto">
                <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <EmailCanvas
                    components={components}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onDeleteComponent={deleteComponent}
                  />
                </SortableContext>
              </div>

              <div className="w-80 flex-shrink-0 space-y-4">
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold mb-4">Properties</h3>
                  {selectedComponent ? (
                    <ComponentEditor
                      component={components.find((c) => c.id === selectedComponent)!}
                      onUpdate={(updates) => updateComponent(selectedComponent, updates)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a component to edit its properties</p>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold mb-4">Preview</h3>
                  <EmailPreview html={generateHtml()} />
                </div>
              </div>
            </div>
          </DndContext>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-4 mt-0">
          <Textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            className="h-full font-mono text-sm"
            placeholder="Enter HTML code..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
