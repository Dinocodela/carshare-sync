// src/pages/Settings/NotificationsCard.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { registerPushToken, unregisterPushToken } from "@/lib/push";
import { usePushNotifications as useWebPush } from "@/hooks/usePushNotifications";

export function NotificationsCard() {
  const { toast } = useToast();
  const { user } = useAuth();

  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);
  const web = useWebPush(); // { isSupported, isEnabled, loading, enable, disable, sendTest }

  // Native state
  const [nativeEnabled, setNativeEnabled] = useState(false);
  const [nativeLoading, setNativeLoading] = useState(false);

  // On native: check current device row (by token) -> muted=false => enabled
  useEffect(() => {
    if (!isNative || !user?.id) return;
    (async () => {
      try {
        const { token } = await FirebaseMessaging.getToken();
        if (!token) {
          setNativeEnabled(false);
          return;
        }
        const { data } = await supabase
          .from("push_devices")
          .select("muted")
          .eq("token", token)
          .maybeSingle();
        setNativeEnabled(!!data && data.muted === false);
      } catch {
        setNativeEnabled(false);
      }
    })();
  }, [isNative, user?.id]);

  const enableNative = useCallback(async () => {
    if (!user?.id) return;
    setNativeLoading(true);
    try {
      await registerPushToken(user.id);
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        await supabase
          .from("push_devices")
          .update({ muted: false, revoked_at: null })
          .eq("token", token);
      }
      setNativeEnabled(true);
      toast({ title: "Notifications enabled" });
    } catch (e: any) {
      toast({
        title: "Enable failed",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setNativeLoading(false);
    }
  }, [toast, user?.id]);

  const disableNative = useCallback(async () => {
    setNativeLoading(true);
    try {
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        await supabase
          .from("push_devices")
          .update({ muted: true })
          .eq("token", token);
      }
      await unregisterPushToken();
      setNativeEnabled(false);
      toast({ title: "Notifications disabled" });
    } catch (e: any) {
      toast({
        title: "Disable failed",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setNativeLoading(false);
    }
  }, [toast]);

  const sendNativeTest = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke("push-test", {
        body: {
          title: "TESLYS",
          body: "Test push from Settings",
          url: "/dashboard",
        },
      });
      if (error) throw error;
      toast({
        title: "Test sent",
        description: "Check your device for a notification.",
      });
    } catch (e: any) {
      toast({
        title: "Test failed",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    }
  }, [toast]);

  // Pick the right set for UI binding
  const enabled = isNative ? nativeEnabled : web.isSupported && web.isEnabled;
  const loading = isNative ? nativeLoading : web.loading;
  const onToggle = isNative
    ? (v: boolean) => (v ? enableNative() : disableNative)
    : (v: boolean) => (v ? web.enable() : web.disable());
  const onTest = isNative ? sendNativeTest : web.sendTest;
  const supported = isNative ? true : web.isSupported;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle id="notifications-section" className="text-xl">
          Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!supported ? (
          <div className="text-sm text-muted-foreground">
            Your browser does not support push notifications.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="push-toggle" className="font-medium">
                Enable push notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                {isNative
                  ? "Use device notifications on iOS/Android."
                  : "Allow TESLYS to send updates in your browser."}
              </div>
            </div>

            <Switch
              id="push-toggle"
              checked={!!enabled}
              disabled={loading}
              onCheckedChange={onToggle}
              className="h-6 w-11 data-[state=checked]:bg-primary"
              aria-label="Enable push notifications"
            />
          </div>
        )}

        {!isNative && (
          <Button
            variant="outline"
            disabled={!enabled || loading || !supported}
            onClick={onTest}
            className="w-full"
          >
            {loading ? "Sending…" : "Send test notification"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
