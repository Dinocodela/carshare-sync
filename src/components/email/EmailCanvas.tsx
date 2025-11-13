import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailComponent } from "./EmailTemplateBuilder";
import { useDroppable } from "@dnd-kit/core";

interface EmailCanvasProps {
  components: EmailComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
}

const SortableComponent = ({
  component,
  isSelected,
  onSelect,
  onDelete,
}: {
  component: EmailComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderComponent = () => {
    switch (component.type) {
      case "heading":
        return (
          <h1
            style={{
              textAlign: component.props?.align || "left",
              color: component.props?.color || "#000000",
              fontSize: component.props?.fontSize || "24px",
              margin: 0,
            }}
          >
            {component.content || "Heading"}
          </h1>
        );
      case "text":
        return (
          <p
            style={{
              textAlign: component.props?.align || "left",
              color: component.props?.color || "#333333",
              fontSize: component.props?.fontSize || "14px",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {component.content || "Text"}
          </p>
        );
      case "button":
        return (
          <div style={{ textAlign: component.props?.align || "center" }}>
            <span
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: component.props?.backgroundColor || "#000000",
                color: component.props?.color || "#ffffff",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {component.content || "Button"}
            </span>
          </div>
        );
      case "image":
        return (
          <div style={{ textAlign: component.props?.align || "center" }}>
            {component.props?.src ? (
              <img
                src={component.props.src}
                alt={component.props.alt || "Image"}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              <div className="bg-muted h-32 flex items-center justify-center text-muted-foreground text-sm">
                No image set
              </div>
            )}
          </div>
        );
      case "divider":
        return <hr style={{ border: "none", borderTop: `1px solid ${component.props?.color || "#e5e5e5"}`, margin: 0 }} />;
      case "spacer":
        return <div style={{ height: `${component.props?.height || 20}px` }} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border rounded-lg p-3 mb-2 bg-card ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="pl-6 pr-6">{renderComponent()}</div>
    </div>
  );
};

export const EmailCanvas = ({ components, selectedComponent, onSelectComponent, onDeleteComponent }: EmailCanvasProps) => {
  const { setNodeRef } = useDroppable({
    id: "email-canvas",
  });

  return (
    <div ref={setNodeRef} className="min-h-[400px] space-y-2">
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Drag components here to start building your email
        </div>
      ) : (
        components.map((component) => (
          <SortableComponent
            key={component.id}
            component={component}
            isSelected={selectedComponent === component.id}
            onSelect={() => onSelectComponent(component.id)}
            onDelete={() => onDeleteComponent(component.id)}
          />
        ))
      )}
    </div>
  );
};
