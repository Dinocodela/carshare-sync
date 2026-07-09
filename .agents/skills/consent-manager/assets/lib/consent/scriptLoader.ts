/**
 * Script loader — activates configured services only for consented categories.
 * Every service's `load()` is idempotent, so calling this repeatedly is safe.
 */
import { services } from "@/config/consent.config";
import type { ConsentChoices } from "./storage";

export function activateConsentedServices(choices: ConsentChoices) {
  if (typeof window === "undefined") return;
  for (const service of services) {
    if (service.category === "essential") {
      service.load();
      continue;
    }
    const allowed = choices[service.category];
    if (allowed) {
      try {
        service.load();
      } catch (err) {
        // Never let a misbehaving tag break the app.
        console.warn(`[consent] failed to load service "${service.id}"`, err);
      }
    }
  }
}
