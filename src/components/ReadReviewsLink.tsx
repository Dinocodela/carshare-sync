import { Star, ChevronRight } from "lucide-react";

const REVIEWS_URL = "https://g.page/r/CSZM0Vxe9T-sEBE/review";

export function ReadReviewsLink() {
  return (
    <a
      href={REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto mt-4 mb-2 flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm transition-all active:scale-[0.98] hover:bg-card"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Star className="h-4 w-4 text-primary fill-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground leading-tight">
          Read Our Reviews
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight">
          See what our customers are saying
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}
