/**
 * Google Analytics 4 Configuration
 * Privacy-first analytics implementation with environment-based tracking
 */

/**
 * Google Analytics Configuration
 */
export const GOOGLE_ANALYTICS_CONFIG = {
  /**
   * Your Google Analytics 4 Measurement ID
   * Get it from: https://analytics.google.com/ > Admin > Data Streams
   */
  measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 Measurement ID

  /**
   * Enable/disable Google Analytics
   * Privacy-first: disabled by default
   */
  enabled: false, // Set to true when you add your measurement ID

  /**
   * Track in development environment
   * Set to true if you want to test analytics locally
   */
  trackInDevelopment: false,

  /**
   * Determine if tracking should be active
   */
  get shouldTrack(): boolean {
    if (!this.enabled) return false;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return false;

    const isProduction = import.meta.env.MODE === 'production';
    if (!isProduction && !this.trackInDevelopment) return false;

    return true;
  },
};

/**
 * Track a custom event (client-side)
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!GOOGLE_ANALYTICS_CONFIG.shouldTrack) return;

  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
      console.log('[Google Analytics] Event tracked:', eventName, params);
    }
  } catch (error) {
    console.error('[Google Analytics] Event tracking failed:', error);
  }
};

/**
 * Track bill creation
 */
export const trackBillCreation = (categoryCount: number): void => {
  trackEvent('create_bill', {
    category: 'Bill',
    category_count: categoryCount,
  });
};

/**
 * Track PDF download
 */
export const trackPDFDownload = (): void => {
  trackEvent('download_pdf', {
    category: 'PDF',
  });
};

/**
 * Track language change
 */
export const trackLanguageChange = (language: string): void => {
  trackEvent('change_language', {
    category: 'Preferences',
    language: language,
  });
};

/**
 * Track data clear
 */
export const trackDataClear = (): void => {
  trackEvent('clear_data', {
    category: 'Data',
  });
};
