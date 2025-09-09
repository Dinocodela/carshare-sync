// src/hooks/useSubscription.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { App } from "@capacitor/app";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

import {
  configureRevenueCat,
  getCustomerInfo,
  syncDbWithRevenueCat,
} from "@/lib/revenuecat";
import { supabase } from "@/integrations/supabase/client";

type SubState = {
  loading: boolean;
  active: boolean;
  profile?: {
    is_subscribed?: boolean;
    rc_product_id?: string | null;
    rc_expiration_at?: string | null;
    rc_will_renew?: boolean | null;
    rc_entitlements?: any;
  } | null;
  refresh: () => Promise<void>;
};
const Ctx = createContext<SubState>({
  loading: true,
  active: false,
  refresh: async () => {},
});

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { setProfileLocal } = useProfile();
  const [state, setState] = useState<Omit<SubState, "refresh">>({
    loading: true,
    active: false,
    profile: null,
  });

  const loadFromDb = async () => {
    console.log("load from db", user);
    if (!user?.id) {
      setState({ loading: false, active: false, profile: null });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select(
        "is_subscribed, rc_product_id, rc_expiration_at, rc_will_renew, rc_entitlements"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    setState({
      loading: false,
      active: !!data?.is_subscribed,
      profile: (data as any) ?? null,
    });
  };

  useEffect(() => {
    if (!loading) {
      if (user) {
        loadFromDb();
      } else {
        setState({
          loading: false,
          active: false,
          profile: null,
        });
      }
    }
  }, [loading, user]);

  const refresh = useCallback(async () => {
    // await loadFromDb();
    const ci = await getCustomerInfo();

    const activeNow =
      !!ci?.entitlements?.active?.pro || !!ci?.entitlements?.active?.Pro;
    const pickedEnt =
      ci?.entitlements?.active?.pro ??
      ci?.entitlements?.active?.Pro ??
      Object.values(ci?.entitlements?.active ?? {})[0];

    const localPatch = {
      is_subscribed: activeNow,
      rc_env: null,
      rc_product_id: pickedEnt?.productIdentifier ?? null,
      rc_expiration_at: pickedEnt?.expirationDate,
    } as const;

    setProfileLocal(localPatch);

    console.log("localPAtch", localPatch);
    // 4) Update this provider’s state (so guards/UI flip instantly)
    setState({
      loading: false,
      active: !!localPatch.is_subscribed,
      profile: {
        is_subscribed: !!localPatch.is_subscribed,
        rc_product_id: localPatch.rc_product_id,
        rc_expiration_at:
          typeof localPatch.rc_expiration_at === "string"
            ? localPatch.rc_expiration_at
            : localPatch.rc_expiration_at
            ? new Date(localPatch.rc_expiration_at).toISOString()
            : null,
        rc_will_renew: undefined,
        rc_entitlements: ci?.entitlements ?? null,
      },
    });
  }, []);

  //   useEffect(() => {
  //     if (profile) {
  //       console.log("profile", profile);
  //       setState({
  //         loading: false,
  //         active: !!profile?.is_subscribed,
  //         profile: (profile as any) ?? null,
  //       });
  //     }
  //   }, [profile]);

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useSubscription = () => useContext(Ctx);
