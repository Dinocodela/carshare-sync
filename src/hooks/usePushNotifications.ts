import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (!supported) return;

    // Check current subscription status
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await (reg as any)?.pushManager?.getSubscription();
        setIsEnabled(Notification.permission === 'granted' && !!sub);
      } catch {
        setIsEnabled(false);
      }
    })();
  }, []);

  const enable = useCallback(async () => {
    if (!isSupported) {
      toast({ title: 'Not supported', description: 'Your browser does not support push notifications.' });
      return false;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({ title: 'Permission needed', description: 'Please allow notifications in your browser.' });
        setLoading(false);
        return false;
      }

      const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/sw.js'));

      const { data: keyResp, error: keyErr } = await supabase.functions.invoke('get-vapid-public-key');
      if (keyErr || !keyResp?.publicKey) {
        toast({ title: 'Setup error', description: 'Could not get push key.' });
        setLoading(false);
        return false;
      }

      const subscription = await (reg as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(keyResp.publicKey) as BufferSource,
      });

      const subJson = subscription.toJSON();
      await supabase.functions.invoke('save-push-subscription', { body: subJson });

      setIsEnabled(true);
      toast({ title: 'Enabled', description: 'Push notifications enabled.' });
      setLoading(false);
      return true;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to enable', description: e?.message || 'Unexpected error.' });
      setLoading(false);
      return false;
    }
  }, [isSupported, toast]);

  const disable = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await (reg as any)?.pushManager?.getSubscription();
      const endpoint = sub?.endpoint;
      if (sub) await sub.unsubscribe();
      if (endpoint) {
        // Remove from server
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
      setIsEnabled(false);
      toast({ title: 'Disabled', description: 'Push notifications disabled.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to disable', description: e?.message || 'Unexpected error.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendTest = useCallback(async () => {
    const { error } = await supabase.functions.invoke('push-send', {
      body: { title: 'TESLYS', body: 'Test push from Settings', url: window.location.origin + '/settings' },
    });
    if (error) {
      toast({ title: 'Test failed', description: error.message || 'Could not send test notification.' });
    } else {
      toast({ title: 'Test sent', description: 'Check your device for a notification.' });
    }
  }, [toast]);

  return { isSupported, isEnabled, loading, enable, disable, sendTest };
}
