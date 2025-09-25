// src/components/LegalFooter.tsx
import { useNavigate } from "react-router-dom";

export function LegalFooter({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <div
      className={`text-xs text-muted-foreground leading-relaxed ${className}`}
    >
      By subscribing, you agree to our{" "}
      <button
        type="button"
        className="underline underline-offset-2"
        onClick={() => navigate("/terms")}
      >
        Terms of Use
      </button>{" "}
      and{" "}
      <button
        type="button"
        className="underline underline-offset-2"
        onClick={() => navigate("/privacy")}
      >
        Privacy Policy
      </button>
      .
    </div>
  );
}
