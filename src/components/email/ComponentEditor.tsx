import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailComponent } from "./EmailTemplateBuilder";

interface ComponentEditorProps {
  component: EmailComponent;
  onUpdate: (updates: Partial<EmailComponent>) => void;
}

export const ComponentEditor = ({ component, onUpdate }: ComponentEditorProps) => {
  const updateContent = (content: string) => {
    onUpdate({ content });
  };

  const updateProp = (key: string, value: any) => {
    onUpdate({ props: { ...component.props, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Type</Label>
        <p className="text-sm font-medium capitalize">{component.type}</p>
      </div>

      {(component.type === "heading" || component.type === "text" || component.type === "button") && (
        <div>
          <Label htmlFor="content">Content</Label>
          {component.type === "text" ? (
            <Textarea
              id="content"
              value={component.content || ""}
              onChange={(e) => updateContent(e.target.value)}
              rows={3}
            />
          ) : (
            <Input
              id="content"
              value={component.content || ""}
              onChange={(e) => updateContent(e.target.value)}
            />
          )}
        </div>
      )}

      {(component.type === "heading" || component.type === "text" || component.type === "button") && (
        <div>
          <Label htmlFor="align">Alignment</Label>
          <Select
            value={component.props?.align || "left"}
            onValueChange={(value) => updateProp("align", value)}
          >
            <SelectTrigger id="align">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(component.type === "heading" || component.type === "text") && (
        <>
          <div>
            <Label htmlFor="color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={component.props?.color || "#000000"}
                onChange={(e) => updateProp("color", e.target.value)}
                className="w-16"
              />
              <Input
                value={component.props?.color || "#000000"}
                onChange={(e) => updateProp("color", e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="fontSize">Font Size</Label>
            <Input
              id="fontSize"
              value={component.props?.fontSize || ""}
              onChange={(e) => updateProp("fontSize", e.target.value)}
              placeholder="14px"
            />
          </div>
        </>
      )}

      {component.type === "button" && (
        <>
          <div>
            <Label htmlFor="href">Link URL</Label>
            <Input
              id="href"
              value={component.props?.href || ""}
              onChange={(e) => updateProp("href", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={component.props?.backgroundColor || "#000000"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
                className="w-16"
              />
              <Input
                value={component.props?.backgroundColor || "#000000"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={component.props?.color || "#ffffff"}
                onChange={(e) => updateProp("color", e.target.value)}
                className="w-16"
              />
              <Input
                value={component.props?.color || "#ffffff"}
                onChange={(e) => updateProp("color", e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </>
      )}

      {component.type === "image" && (
        <>
          <div>
            <Label htmlFor="src">Image URL</Label>
            <Input
              id="src"
              value={component.props?.src || ""}
              onChange={(e) => updateProp("src", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={component.props?.alt || ""}
              onChange={(e) => updateProp("alt", e.target.value)}
              placeholder="Image description"
            />
          </div>
          <div>
            <Label htmlFor="imageAlign">Alignment</Label>
            <Select
              value={component.props?.align || "center"}
              onValueChange={(value) => updateProp("align", value)}
            >
              <SelectTrigger id="imageAlign">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {component.type === "divider" && (
        <div>
          <Label htmlFor="dividerColor">Color</Label>
          <div className="flex gap-2">
            <Input
              id="dividerColor"
              type="color"
              value={component.props?.color || "#e5e5e5"}
              onChange={(e) => updateProp("color", e.target.value)}
              className="w-16"
            />
            <Input
              value={component.props?.color || "#e5e5e5"}
              onChange={(e) => updateProp("color", e.target.value)}
              placeholder="#e5e5e5"
            />
          </div>
        </div>
      )}

      {component.type === "spacer" && (
        <div>
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={component.props?.height || 20}
            onChange={(e) => updateProp("height", parseInt(e.target.value) || 20)}
            min="0"
          />
        </div>
      )}
    </div>
  );
};
