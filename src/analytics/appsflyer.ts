import { Capacitor } from "@capacitor/core";
import { AppsFlyer, AFConstants, AFInit } from "appsflyer-capacitor-plugin";

const DEV_KEY = import.meta.env.VITE_APPSFLYER_DEV_KEY as string | undefined;
const IOS_APP_ID = import.meta.env.VITE_APPSFLYER_IOS_APP_ID as string | undefined;

let started = false;

export function isAppsFlyerReady() {
	return started;
}

export type AfAttributionHandlers = {
	onConversion?: (data: any) => void;
	onAppOpenAttribution?: (data: any) => void;
};

export async function initAppsFlyer(handlers: AfAttributionHandlers = {}) {
	if (!Capacitor.isNativePlatform()) return;
	if (started) return;

	if (!DEV_KEY) throw new Error("Missing VITE_APPSFLYER_DEV_KEY");
	if (!IOS_APP_ID) {
		console.warn("[AF] Missing VITE_APPSFLYER_IOS_APP_ID");
	}

	// Cast to 'any' to fix the TS error for disableCollectASA
	const options: any = {
		devKey: DEV_KEY,
		appID: IOS_APP_ID,
		isDebug: import.meta.env.DEV,
		// These two lines are CRITICAL for skipping the ATT prompt
		disableCollectASA: true,
		disableAdvertisingIdentifier: true,
	};

	AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, (event) => {
		console.log("[AF] conversion", event);
		handlers.onConversion?.(event);
	});

	AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, (event) => {
		console.log("[AF] app-open attribution", event);
		handlers.onAppOpenAttribution?.(event);
	});

	// Pass options cast as AFInit to satisfy the function signature
	await AppsFlyer.initSDK(options as AFInit);
	started = true;
}

export async function afSetCustomerUserId(userId: string) {
	if (!Capacitor.isNativePlatform() || !started) return;
	try {
		await AppsFlyer.setCustomerUserId({ cuid: userId });
	} catch (e) {
		console.warn("[AF] setCustomerUserId failed", e);
	}
}

export async function afLogEvent(eventName: string, eventValue: Record<string, any> = {}) {
	if (!Capacitor.isNativePlatform() || !started) return;
	try {
		await AppsFlyer.logEvent({ eventName, eventValue });
	} catch (e) {
		console.warn("[AF] logEvent failed", eventName, e);
	}
}