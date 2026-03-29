/**
 * Typed Google Analytics event tracking service.
 *
 * Pure TypeScript module — no React imports. Safe to import from any file
 * including contexts, services, and components.
 *
 * Tracking is disabled by default (enabled: false). Set enabled: true and
 * confirm shouldTrack returns true before events fire.
 */

// ── Configuration ────────────────────────────────────────────

export const GOOGLE_ANALYTICS_CONFIG = {
  measurementId: 'G-J9DK22GGZC',

  /** Privacy-first: disabled by default */
  enabled: false,

  /** Set to true to test analytics locally */
  trackInDevelopment: false,

  get shouldTrack(): boolean {
    if (!this.enabled) return false;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return false;

    const isProduction = import.meta.env.MODE === 'production';
    if (!isProduction && !this.trackInDevelopment) return false;

    return true;
  },
};

// ── Event taxonomy ───────────────────────────────────────────

type BillEvent =
  | { name: 'bill_created'; params: { mode: 'calculated' | 'blank'; category_count: number } }
  | { name: 'bill_previewed'; params: { mode: 'calculated' | 'blank' } }
  | { name: 'bill_category_added'; params: { billing_type: 'single_flat' | 'divided' } }
  | { name: 'bill_category_removed' }
  | { name: 'bill_settings_changed'; params: { setting: 'exclude_vacant' | 'owner_only' | 'garage_motorcycle' | 'garage_car' } }
  | { name: 'bill_creation_failed'; params: { error: string } };

type ResidentEvent =
  | { name: 'flat_added'; params: { flat_type: 'owned' | 'rented' } }
  | { name: 'flat_edited' }
  | { name: 'flat_deleted' }
  | { name: 'building_setup_completed'; params: { flat_count: number } };

type ExportEvent =
  | { name: 'pdf_downloaded'; params: { content: 'bill' | 'resident_list' } }
  | { name: 'pdf_download_failed'; params: { content: 'bill' | 'resident_list'; error: string } }
  | { name: 'data_exported'; params: { data_type: 'bill' | 'building' } }
  | { name: 'data_imported'; params: { data_type: 'bill' | 'building' } };

type UIEvent =
  | { name: 'language_changed'; params: { language: 'bn' | 'en' } }
  | { name: 'tab_switched'; params: { tab: 'bills' | 'residents' } }
  | { name: 'data_cleared' }
  | { name: 'pwa_installed' };

type ErrorEvent = {
  name: 'error_occurred';
  params: { category: string; action: string; error: string };
};

export type AnalyticsEvent =
  | BillEvent
  | ResidentEvent
  | ExportEvent
  | UIEvent
  | ErrorEvent;

// ── Core tracking function ───────────────────────────────────

/**
 * Send a typed analytics event to Google Analytics.
 * No-ops gracefully when gtag is unavailable (SSR, ad blockers, disabled).
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!GOOGLE_ANALYTICS_CONFIG.shouldTrack) return;
  if (typeof window === 'undefined' || !window.gtag) return;

  const { name, ...rest } = event;
  const params = 'params' in rest ? rest.params : undefined;
  window.gtag('event', name, params);
}

// ── Helpers ──────────────────────────────────────────────────

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/g;

/**
 * Strip email addresses from error messages to prevent PII leakage.
 * Truncates to 100 characters.
 */
export function sanitizeError(msg: string): string {
  return msg.replace(EMAIL_PATTERN, '[email]').slice(0, 100);
}
