/**
 * useConsent — global consent context.
 *
 * Provides the current consent record, whether the banner should show, and
 * mutation helpers. Also exposes lightweight convenience hooks:
 *   - useAnalytics()         → { granted }
 *   - useMarketingConsent()  → { granted }
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ConsentChoices,
  ConsentRecord,
  DEFAULT_CHOICES,
  ACCEPT_ALL,
  REJECT_ALL,
  readConsent,
  writeConsent,
} from "@/lib/consent/storage";
import { activateConsentedServices } from "@/lib/consent/scriptLoader";
import type { ConsentCategory } from "@/config/consent.config";

interface ConsentContextValue {
  record: ConsentRecord | null;
  choices: ConsentChoices;
  hasConsented: boolean;
  showBanner: boolean;
  showPreferences: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (choices: ConsentChoices) => void;
  isAllowed: (category: ConsentCategory) => boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(() => readConsent());
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // On mount: decide whether to prompt, and activate already-consented services.
  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      setRecord(existing);
      activateConsentedServices(existing.choices);
    } else {
      setShowBanner(true);
    }
  }, []);

  const persist = useCallback((choices: ConsentChoices) => {
    const saved = writeConsent(choices);
    setRecord(saved);
    setShowBanner(false);
    setShowPreferences(false);
    activateConsentedServices(saved.choices);
  }, []);

  const acceptAll = useCallback(() => persist(ACCEPT_ALL), [persist]);
  const rejectAll = useCallback(() => persist(REJECT_ALL), [persist]);
  const savePreferences = useCallback(
    (choices: ConsentChoices) => persist(choices),
    [persist],
  );

  const choices = record?.choices ?? DEFAULT_CHOICES;

  const isAllowed = useCallback(
    (category: ConsentCategory) => {
      if (category === "essential") return true;
      return Boolean(choices[category]);
    },
    [choices],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      record,
      choices,
      hasConsented: Boolean(record),
      showBanner,
      showPreferences,
      openPreferences: () => setShowPreferences(true),
      closePreferences: () => setShowPreferences(false),
      acceptAll,
      rejectAll,
      savePreferences,
      isAllowed,
    }),
    [record, choices, showBanner, showPreferences, acceptAll, rejectAll, savePreferences, isAllowed],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}

/** Convenience hook — is analytics tracking allowed? */
export function useAnalytics() {
  const { isAllowed } = useConsent();
  return { granted: isAllowed("analytics") };
}

/** Convenience hook — is marketing/advertising allowed? */
export function useMarketingConsent() {
  const { isAllowed } = useConsent();
  return { granted: isAllowed("marketing") };
}
