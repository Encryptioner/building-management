# Google Analytics Setup Guide

Quick setup guide for Google Analytics 4 in Building Management.

## Quick Setup

### 1. Get Measurement ID

1. Visit [analytics.google.com](https://analytics.google.com/)
2. Admin → Data Streams → Your Stream
3. Copy your Measurement ID (G-XXXXXXXXXX)

### 2. Configure

Open `src/config/googleAnalytics.ts`:

```typescript
export const GOOGLE_ANALYTICS_CONFIG = {
  measurementId: 'G-YOUR-ID-HERE', // Replace with your ID
  enabled: true,                     // Enable tracking
  trackInDevelopment: false,         // Test locally
};
```

### 3. Build & Deploy

```bash
pnpm build
# Deploy dist/ folder to your hosting
```

### 4. Verify

Check browser console for:
```
[Google Analytics] Initialized successfully with ID: G-XXXXXXXXXX
```

## Tracked Events

The app can track:

- **Bill Creation**: `trackBillCreation(categoryCount)`
- **PDF Download**: `trackPDFDownload()`
- **Language Change**: `trackLanguageChange(language)`
- **Data Clear**: `trackDataClear()`

## Custom Tracking

Add this to your React components:

```typescript
import { trackEvent } from '@/config/googleAnalytics';

// Track custom event
trackEvent('custom_event', {
  category: 'Category',
  param: 'value'
});
```

## Usage Examples

```typescript
import {
  trackBillCreation,
  trackPDFDownload,
  trackLanguageChange
} from '@/config/googleAnalytics';

// Track bill creation
trackBillCreation(5);

// Track PDF download
trackPDFDownload();

// Track language change
trackLanguageChange('en');
```

## Privacy First

- **Disabled by default** - respects user privacy
- **No tracking in development** - clean dev environment
- **Configurable** - easy to enable/disable

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Google Analytics Config](../src/config/googleAnalytics.ts)
- [Astro Integration Guide](https://docs.astro.build/en/guides/integrations-guide/)
