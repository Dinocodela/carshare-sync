// Lightweight ad-conversion tracking for the shop.
// Pushes standardized ecommerce events to the GTM dataLayer, the Meta Pixel
// (fbq), and Google (gtag) when those globals are present. Safe no-ops otherwise.

type TrackedItem = {
  variantId: string;
  variantTitle?: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  product: { node: { title: string; handle: string } };
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function pushDataLayer(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function metaTrack(event: string, payload: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, payload);
  }
}

function googleTrack(event: string, payload: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
}

function lineValue(item: TrackedItem) {
  return parseFloat(item.price.amount) * item.quantity;
}

export function trackViewItem(item: {
  price: { amount: string; currencyCode: string };
  product: { node: { title: string; handle: string } };
}) {
  const value = parseFloat(item.price.amount);
  const currency = item.price.currencyCode;
  pushDataLayer("view_item", {
    ecommerce: { currency, value, items: [{ item_name: item.product.node.title, item_id: item.product.node.handle, price: value }] },
  });
  metaTrack("ViewContent", { content_name: item.product.node.title, content_ids: [item.product.node.handle], value, currency });
  googleTrack("view_item", { currency, value, items: [{ item_id: item.product.node.handle, item_name: item.product.node.title, price: value }] });
}

export function trackAddToCart(item: TrackedItem) {
  const value = lineValue(item);
  const currency = item.price.currencyCode;
  pushDataLayer("add_to_cart", {
    ecommerce: { currency, value, items: [{ item_name: item.product.node.title, item_id: item.product.node.handle, price: parseFloat(item.price.amount), quantity: item.quantity }] },
  });
  metaTrack("AddToCart", { content_name: item.product.node.title, content_ids: [item.product.node.handle], value, currency });
  googleTrack("add_to_cart", { currency, value, items: [{ item_id: item.product.node.handle, item_name: item.product.node.title, price: parseFloat(item.price.amount), quantity: item.quantity }] });
}

export function trackBeginCheckout(items: TrackedItem[]) {
  if (!items.length) return;
  const currency = items[0].price.currencyCode;
  const value = items.reduce((sum, i) => sum + lineValue(i), 0);
  pushDataLayer("begin_checkout", {
    ecommerce: {
      currency,
      value,
      items: items.map((i) => ({ item_name: i.product.node.title, item_id: i.product.node.handle, price: parseFloat(i.price.amount), quantity: i.quantity })),
    },
  });
  metaTrack("InitiateCheckout", { content_ids: items.map((i) => i.product.node.handle), value, currency, num_items: items.reduce((s, i) => s + i.quantity, 0) });
  googleTrack("begin_checkout", { currency, value, items: items.map((i) => ({ item_id: i.product.node.handle, item_name: i.product.node.title, price: parseFloat(i.price.amount), quantity: i.quantity })) });
}
