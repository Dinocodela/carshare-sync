import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const FUNCTIONS_URL = `${(supabase as any).supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;
const ANON_KEY = (supabase as any).supabaseKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) { setState("error"); setMessage("Missing token."); return; }
    (async () => {
      try {
        const r = await fetch(`${FUNCTIONS_URL}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: ANON_KEY },
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.error) {
          setState("error");
          setMessage(data?.error ?? "This unsubscribe link is invalid or expired.");
        } else {
          setEmail(data?.email ?? "");
          setState("ready");
        }
      } catch (e: any) {
        setState("error");
        setMessage(e?.message ?? "Network error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setState("loading");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    if (error || (data as any)?.error) {
      setState("error");
      setMessage((data as any)?.error ?? error?.message ?? "Could not unsubscribe.");
    } else {
      setState("done");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Unsubscribe</h1>
        {state === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {state === "ready" && (
          <>
            <p className="text-muted-foreground mb-6">
              Unsubscribe {email ? <strong>{email}</strong> : "this email"} from TESLYS notifications?
            </p>
            <Button onClick={confirm} className="w-full">Confirm unsubscribe</Button>
          </>
        )}
        {state === "done" && <p className="text-muted-foreground">You have been unsubscribed.</p>}
        {state === "error" && <p className="text-destructive">{message}</p>}
      </div>
    </div>
  );
}
