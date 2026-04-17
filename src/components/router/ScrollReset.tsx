// src/components/router/ScrollReset.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const isiOS =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" &&
      (navigator as any).maxTouchPoints > 1));

export default function ScrollReset() {
  const { pathname, search, hash } = useLocation();

  // disable native restoration (best effort)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  useEffect(() => {
    // If a hash is present, try to scroll to that anchor, else top
    const doScroll = () => {
      if (hash) {
        const el = document.querySelector(hash) as HTMLElement | null;
        if (el && "scrollIntoView" in el) {
          el.scrollIntoView({ block: "start", behavior: "auto" });
          return;
        }
      }
      hardScrollTop();
    };

    // run now
    doScroll();

    // iOS WKWebView sometimes ignores the first attempt until after paint
    if (isiOS) {
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 0);
      setTimeout(doScroll, 60);
    }
  }, [pathname, search, hash]);

  function hardScrollTop() {
    // Prefer the tagged container; fall back to document/window
    const container = document.querySelector(
      "[data-scroll-root]"
    ) as HTMLElement | null;

    const targets: (HTMLElement | Element | null | undefined)[] = [
      container,
      document.scrollingElement,
      document.documentElement,
      document.body,
    ];

    targets.forEach((el) => {
      if (el) {
        (el as HTMLElement).scrollTop = 0;
        (el as HTMLElement).scrollLeft = 0;
      }
    });

    // also instruct window (harmless if container is the scroller)
    window.scrollTo(0, 0);
  }

  return null;
}
