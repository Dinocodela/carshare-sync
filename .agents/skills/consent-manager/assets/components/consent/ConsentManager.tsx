import { CookieBanner } from "./CookieBanner";
import { PreferencesModal } from "./PreferencesModal";

/**
 * Single mount point for the consent UI. Place once near the app root,
 * inside <ConsentProvider>.
 */
export function ConsentManager() {
  return (
    <>
      <CookieBanner />
      <PreferencesModal />
    </>
  );
}
