// src/lib/revenuecat.ts
import {
	CustomerInfo,
	Purchases,
	PurchasesOffering,
	PurchasesOfferings,
} from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";

export async function configureRevenueCat(appUserId: string | null) {
	console.log('appueseRId', appUserId);
	const isAndroid = /Android/i.test(navigator.userAgent);
	await Purchases.configure({
		apiKey: isAndroid
			? import.meta.env.VITE_RC_ANDROID_API_KEY
			: import.meta.env.VITE_RC_IOS_API_KEY,
		appUserID: appUserId ?? undefined,
	});
	await Purchases.logIn({ appUserID: appUserId });

}

export async function getCustomerInfo(): Promise<CustomerInfo> {
	const { customerInfo } = await Purchases.getCustomerInfo();
	return customerInfo;
}

export async function syncDbWithRevenueCat(info?: CustomerInfo) {
	const ci = info ?? (await getCustomerInfo());
	await supabase.functions.invoke("rc-sync", { body: { customerInfo: ci } });
}


export function hasPro(info?: CustomerInfo) {
	return !!info?.entitlements?.active?.Pro;
}

export async function getOfferings(): Promise<PurchasesOfferings> {
	return Purchases.getOfferings();
}
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
	const o = await Purchases.getOfferings();
	return o.current ?? null;
}

export async function refreshCustomerInfo(): Promise<CustomerInfo> {
	const { customerInfo } = await Purchases.getCustomerInfo();
	return customerInfo;
}

export function onCustomerInfoUpdated(cb: (info: CustomerInfo) => void) {
	const idPromise = Purchases.addCustomerInfoUpdateListener((info) => cb(info));
	return async () => {
		try {
			const id = await idPromise;
			// @ts-expect-error – not in older types
			await Purchases.removeCustomerInfoUpdateListener?.(id);
		} catch { /* empty */ }
	};
}

// ---- Purchase/Restore with clear return shape ----
export type PurchaseResult =
	| { ok: true; info: CustomerInfo }
	| { ok: false; cancelled?: boolean; message?: string };

export async function purchasePackage(pkg: any): Promise<PurchaseResult> {
	try {
		const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
		return { ok: true, info: customerInfo };
	} catch (e: any) {
		// RevenueCat throws with a userCancelled flag on user cancel
		if (e?.userCancelled) return { ok: false, cancelled: true };
		return { ok: false, message: e?.message ?? "Purchase failed" };
	}
}

export async function restorePurchases(): Promise<CustomerInfo> {
	const { customerInfo } = await Purchases.restorePurchases();
	return customerInfo;
}

// ---- Manage link (native sheet when available) ----
export async function openManage() {

}

