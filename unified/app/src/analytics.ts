// Lightweight GA4 event helper. Safe no-op if gtag isn't loaded (e.g. ad-blockers, dev).
// The base gtag.js snippet lives in index.html — replace G-XXXXXXXXXX there with your GA4 ID.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, params)
    }
  } catch {
    /* analytics must never break the app */
  }
}

export {}
