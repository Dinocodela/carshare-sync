import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Renders the managed CAPTCHA and returns a token via `onVerify`. The token is
 * short-lived and must be verified server-side (see the edge function).
 *
 * Configure the site key in `.env` as `VITE_TURNSTILE_SITE_KEY`. If it is not
 * set, the widget renders nothing so forms keep working during setup.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "flexible" | "compact";
        }
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __turnstileScriptLoading?: Promise<void>;
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileScriptLoading) return window.__turnstileScriptLoading;

  window.__turnstileScriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
  return window.__turnstileScriptLoading;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

export function Turnstile({ onVerify, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return; // Not configured yet — render nothing.
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          size: "flexible",
          callback: (token) => onVerify(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => onExpire?.(),
        });
      })
      .catch((err) => console.warn("[turnstile]", err));

    return () => {
      cancelled = true;
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className={className} />;
}

/** True when a Turnstile site key is configured. */
export const isTurnstileEnabled = Boolean(SITE_KEY);
