import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  /** Fallback route if there’s no history (e.g., deep link) */
  fallbackHref?: string;
  rightSlot?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  fallbackHref = "/settings",
  rightSlot,
  className = "",
}: Props) {
  const navigate = useNavigate();
  const goBack = () => {
    // react-router v6 on web can have history length = 1; handle native too
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackHref);
  };

  return (
    <header
      className={[
        "z-10 flex items-center justify-between gap-2 py-2 mb-4",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b",
        className,
      ].join(" ")}
    >
      <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>

      {/* spacer to keep title perfectly centered */}
      <div className="w-9 h-9 flex items-center justify-center">
        {rightSlot ?? null}
      </div>
    </header>
  );
}
