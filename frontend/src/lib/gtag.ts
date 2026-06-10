declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID ?? "";

function _gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

export function pageview(url: string) {
  if (!GTAG_ID) return;
  _gtag("config", GTAG_ID, { page_path: url });
}

export function event(action: string, params?: Record<string, unknown>) {
  if (!GTAG_ID) return;
  _gtag("event", action, params ?? {});
}

// Kullanıcı kaydı — Google Ads "sign_up" dönüşümü
export function conversionSignUp() {
  const label = process.env.NEXT_PUBLIC_GADS_SIGN_UP;
  if (label) {
    event("conversion", { send_to: label });
  } else {
    event("sign_up", { method: "email" });
  }
}

// Ödeme talebi başlatıldı — Google Ads "initiate_checkout" dönüşümü
export function conversionInitiateCheckout(value: number) {
  const label = process.env.NEXT_PUBLIC_GADS_CHECKOUT;
  if (label) {
    event("conversion", { send_to: label, value, currency: "TRY" });
  } else {
    event("begin_checkout", { value, currency: "TRY" });
  }
}

// Sipariş verildi (opsiyonel, bakiye düşüşünde çağrılabilir)
export function conversionPurchase(value: number) {
  const label = process.env.NEXT_PUBLIC_GADS_PURCHASE;
  if (label) {
    event("conversion", { send_to: label, value, currency: "TRY" });
  } else {
    event("purchase", { value, currency: "TRY" });
  }
}
