import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PostStatus } from "@/hooks/social/useSocial";

const STYLES: Record<PostStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  needs_review: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  scheduled: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  publishing: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
  published: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
  canceled: "bg-muted text-muted-foreground line-through",
};

const LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
  canceled: "Canceled",
};

export function StatusPill({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STYLES[status], className)}>
      {LABELS[status]}
    </Badge>
  );
}

export const POST_STATUS_LABELS = LABELS;
