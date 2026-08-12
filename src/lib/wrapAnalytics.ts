import { afLogEvent } from "@/analytics/appsflyer";

/**
 * Lightweight analytics for the public wraps funnel.
 * Routes through the existing AppsFlyer helper (a no-op on web / when the SDK
 * is not started). No new analytics vendor is introduced.
 */

export type WrapEvent =
  | "wrap_gallery_view"
  | "wrap_card_click"
  | "wrap_detail_view"
  | "wrap_download_click"
  | "wrap_install_guide_open"
  | "wrap_model_tab_click";

function utmPayload(): Record<string, string> {
  const payload: Record<string, string> = {};
  if (typeof window === "undefined") return payload;
  try {
    const params = new URLSearchParams(window.location.search);
    (
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const
    ).forEach((key) => {
      const fromUrl = params.get(key);
      if (fromUrl) {
        payload[key] = fromUrl;
        try {
          window.localStorage.setItem(key, fromUrl);
        } catch {
          /* storage unavailable — skip persistence */
        }
        return;
      }
      try {
        const stored = window.localStorage.getItem(key);
        if (stored) payload[key] = stored;
      } catch {
        /* storage unavailable — skip lookup */
      }
    });
  } catch {
    /* URL parsing unavailable — skip UTM enrichment */
  }
  return payload;
}

export function trackWrapEvent(
  event: WrapEvent,
  data: Record<string, unknown> = {}
) {
  const payload = { ...data, ...utmPayload() };
  try {
    void afLogEvent(event, payload);
  } catch {
    /* never let analytics break the page */
  }
}