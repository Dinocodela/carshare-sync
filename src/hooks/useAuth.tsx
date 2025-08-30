// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { registerPushToken, unregisterPushToken } from "@/lib/push";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    role: "client" | "host",
    metadata?: any
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Restore session deterministically
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!alive) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // 2) Subscribe for future changes (don’t gate initial loading on this)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!alive) return;
      setSession(s ?? null);
      setUser(s?.user ?? null);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  // 3) Register/unregister push token when user changes (native only)
  useEffect(() => {
    if (!user?.id || !Capacitor.isNativePlatform()) return;
    registerPushToken(user.id).catch((e) =>
      console.warn("registerPushToken failed:", e)
    );
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    role: "client" | "host",
    metadata?: any
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    const { phone, ...other } = metadata || {};
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { role, phone, ...other },
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      if (Capacitor.isNativePlatform()) await unregisterPushToken();
    } catch (e) {
      console.warn("unregisterPushToken failed:", e);
    } finally {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
