import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateSection } from "./TemplateSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateBuilderProps {
  sections: Array<{ type: string; content: Record<string, any> }>;
  onChange: (sections: Array<{ type: string; content: Record<string, any> }>) => void;
}

const SECTION_TYPES = [
  { value: "header", label: "Header" },
  { value: "hero", label: "Hero Banner" },
  { value: "text", label: "Text Block" },
  { value: "image", label: "Image" },
  { value: "button", label: "Button" },
  { value: "divider", label: "Divider" },
  { value: "footer", label: "Footer" },
];

const DEFAULT_CONTENT: Record<string, any> = {
  header: { logo: "Teslys", backgroundColor: "#0EA5E9" },
  hero: { title: "{{title}}", subtitle: "{{subtitle}}", backgroundColor: "#F0F9FF" },
  text: { body: "Enter your text here. Use {{variables}} for personalization." },
  image: { url: "https://via.placeholder.com/600x300", alt: "Image" },
  button: { text: "Click Here", url: "https://teslys.app", backgroundColor: "#0EA5E9" },
  divider: {},
  footer: { text: "© 2025 Teslys. All rights reserved.", unsubscribeText: "Unsubscribe" },
};

export const TemplateBuilder = ({ sections, onChange }: TemplateBuilderProps) => {
  const [newSectionType, setNewSectionType] = useState<string>("");

  const addSection = () => {
    if (!newSectionType) return;
    
    const newSection = {
      type: newSectionType,
      content: { ...DEFAULT_CONTENT[newSectionType] },
    };
    
    onChange([...sections, newSection]);
    setNewSectionType("");
  };

  const updateSection = (index: number, content: Record<string, any>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], content };
    onChange(updated);
  };

  const deleteSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={newSectionType} onValueChange={setNewSectionType}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select section type" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addSection} disabled={!newSectionType}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No sections yet. Add your first section above.
          </div>
        ) : (
          sections.map((section, index) => (
            <TemplateSection
              key={index}
              section={section}
              index={index}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onMoveUp={(i) => moveSection(i, i - 1)}
              onMoveDown={(i) => moveSection(i, i + 1)}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            />
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Available Variables</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Use these variables in your template for personalization:
        </p>
        <div className="flex flex-wrap gap-2">
          {["{{first_name}}", "{{email}}", "{{title}}", "{{subtitle}}", "{{body}}"].map((variable) => (
            <code key={variable} className="px-2 py-1 bg-background rounded text-xs">
              {variable}
            </code>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          You can also create custom variables like {`{{custom_variable}}`} and provide values when sending campaigns.
        </p>
      </div>
    </div>
  );
};