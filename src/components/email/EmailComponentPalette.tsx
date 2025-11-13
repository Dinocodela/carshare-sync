import { useDraggable } from "@dnd-kit/core";
import { Type, Heading1, MousePointer, Image, Minus, Space } from "lucide-react";
import { Card } from "@/components/ui/card";

const components = [
  { id: "heading", icon: Heading1, label: "Heading" },
  { id: "text", icon: Type, label: "Text" },
  { id: "button", icon: MousePointer, label: "Button" },
  { id: "image", icon: Image, label: "Image" },
  { id: "divider", icon: Minus, label: "Divider" },
  { id: "spacer", icon: Space, label: "Spacer" },
];

const DraggableComponent = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-move hover:bg-accent transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Card>
  );
};

export const EmailComponentPalette = () => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm mb-3">Components</h3>
      {components.map((component) => (
        <DraggableComponent key={component.id} {...component} />
      ))}
    </div>
  );
};
