import { differenceInCalendarDays } from "date-fns";
import { Lock } from "lucide-react";
import { CarBlock } from "@/hooks/useCarBlocks";

interface BlockBarProps {
  block: CarBlock;
  windowStart: Date;
  days: number;
  colWidth: number;
  onClick: (block: CarBlock) => void;
}

export function BlockBar({
  block,
  windowStart,
  days,
  colWidth,
  onClick,
}: BlockBarProps) {
  const start = new Date(block.start_at);
  const end = new Date(block.end_at);

  const rawStartIdx = differenceInCalendarDays(start, windowStart);
  const rawEndIdx = differenceInCalendarDays(end, windowStart);

  const startIdx = Math.max(0, rawStartIdx);
  const endIdx = Math.min(days - 1, rawEndIdx);
  if (endIdx < 0 || startIdx > days - 1) return null;

  const spanDays = endIdx - startIdx + 1;
  const left = startIdx * colWidth + 4;
  const width = Math.max(spanDays * colWidth - 8, 20);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      className="absolute top-1/2 -translate-y-1/2 h-8 rounded-md flex items-center gap-1 px-2 text-[10px] font-semibold text-foreground/80 hover:text-foreground transition-colors"
      style={{
        left,
        width,
        backgroundImage:
          "repeating-linear-gradient(45deg, hsl(var(--muted)) 0 6px, hsl(var(--muted-foreground) / 0.15) 6px 12px)",
        border: "1px solid hsl(var(--border))",
      }}
      title={block.notes || "Blocked"}
    >
      <Lock className="h-3 w-3 shrink-0" />
      {width > 60 && (
        <span className="truncate">{block.notes || "Blocked"}</span>
      )}
    </button>
  );
}
