// lib/push/index.ts
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

export async function registerPushToken(userId: string) {
	if (!Capacitor.isNativePlatform()) return;

	FirebaseMessaging.addListener("tokenReceived", async ({ token }) => {
		console.log('token', token);
		await supabase.from("push_devices").upsert(
			{ user_id: userId, token, platform, muted: false, revoked_at: null },
			{ onConflict: "token" }
		);
		console.log('insert');
	});


	const perm = await FirebaseMessaging.requestPermissions();
	if (perm.receive === "denied") return;

	const { token } = await FirebaseMessaging.getToken();
	if (!token) return;

	const platform = Capacitor.getPlatform() === "android" ? "android" : "ios";
	await supabase.from("push_devices").upsert(
		{ user_id: userId, token, platform, muted: false, revoked_at: null },
		{ onConflict: "token" }
	);

}

export async function unregisterPushToken() {
	if (!Capacitor.isNativePlatform()) return;
	try {
		const { token } = await FirebaseMessaging.getToken();
		if (token) await supabase.from("push_devices").delete().eq("token", token);
	} catch (err) {
		console.log('error', err);
	}
}

/** Optional convenience if you want to flip muted quickly */
export async function muteCurrentDevice(muted: boolean) {
	if (!Capacitor.isNativePlatform()) return;
	try {
		const { token } = await FirebaseMessaging.getToken();
		if (token) await supabase.from("push_devices").update({ muted }).eq("token", token);
	} catch (err) {
		console.log('error', err);
	}
}

/**
 * Hook up navigation on notification tap.
 * Call once at app start (after Router is ready) and pass a navigate() callback.
 */
export function attachNotificationNavigation(navigate: (url: string) => void) {
	if (!Capacitor.isNativePlatform()) return () => { };

	console.log('push notifications handler');
	// One handler for any payload shape we get
	const goIfUrl = (payload: any) => {
		const url =
			payload?.data?.url ??
			payload?.notification?.data?.url ??
			payload?.message?.data?.url;
		if (typeof url === "string" && url.startsWith("/")) navigate(url);
	};


	// Foreground messages
	FirebaseMessaging.addListener("notificationReceived", (event) => {
		console.log('notificationReceived', { event });

		goIfUrl(event);
	})

	// Some platforms emit a different event on open
	// (kept broad as plugin event names vary across versions)
	FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
		console.log('notificationActionPerformed', { event });
		goIfUrl(event);
	})


}
