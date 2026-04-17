import { cn } from "@/lib/utils";

interface BlogCategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function BlogCategoryFilter({ categories, selected, onSelect }: BlogCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            selected === cat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
