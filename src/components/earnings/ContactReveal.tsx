import { useState } from "react";
import { Phone, Mail } from "lucide-react";

interface ContactRevealProps {
  phone?: string | null;
  email?: string | null;
}

/**
 * Compact tap-to-reveal contact chips. By default only icons show;
 * tapping reveals the value (and offers a tel:/mailto: link).
 */
export function ContactReveal({ phone, email }: ContactRevealProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  if (!phone && !email) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {phone && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPhone((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <Phone className="h-3 w-3" />
          {showPhone ? (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="tabular-nums underline-offset-2 hover:underline"
            >
              {phone}
            </a>
          ) : (
            "Phone"
          )}
        </button>
      )}
      {email && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmail((v) => !v);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground active:scale-95 max-w-full"
        >
          <Mail className="h-3 w-3 shrink-0" />
          {showEmail ? (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate underline-offset-2 hover:underline"
            >
              {email}
            </a>
          ) : (
            "Email"
          )}
        </button>
      )}
    </div>
  );
}
