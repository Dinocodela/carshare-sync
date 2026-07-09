/**
 * Consent persistence — reads/writes the consent record to localStorage with
 * versioning, timestamp, browser identifier, and 6-month expiration.
 */
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_EXPIRY_DAYS,
  type ConsentCategory,
} from "@/config/consent.config";

export type ConsentChoices = Record<Exclude<ConsentCategory, "essential">, boolean>;

export interface ConsentRecord {
  version: string;
  timestamp: string; // ISO
  expiresAt: string; // ISO
  browserId: string;
  choices: ConsentChoices;
}

export const DEFAULT_CHOICES: ConsentChoices = {
  analytics: false,
  marketing: false,
  functional: false,
};

function genBrowserId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `bid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;

    // Invalidate on version change or expiry → re-prompt.
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(choices: ConsentChoices): ConsentRecord {
  const now = new Date();
  const expires = new Date(now.getTime() + CONSENT_EXPIRY_DAYS * 864e5);
  const existing = (() => {
    try {
      const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ConsentRecord) : null;
    } catch {
      return null;
    }
  })();

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: now.toISOString(),
    expiresAt: expires.toISOString(),
    browserId: existing?.browserId ?? genBrowserId(),
    choices,
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage may be unavailable (private mode) */
  }
  return record;
}

export const ACCEPT_ALL: ConsentChoices = {
  analytics: true,
  marketing: true,
  functional: true,
};

export const REJECT_ALL: ConsentChoices = { ...DEFAULT_CHOICES };
