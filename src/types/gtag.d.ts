/**
 * Minimal gtag type declaration for Google Analytics 4.
 * Only the surface we actually use — avoids importing @types/gtag.js which
 * pulls in the full global augmentation.
 */

type GtagCommand = 'event' | 'config' | 'js' | 'set';

interface Window {
  gtag: (command: GtagCommand, target: string, params?: Record<string, unknown>) => void;
  dataLayer: unknown[];
}
