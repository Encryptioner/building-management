import { bn } from '../locales/bn';
import { en } from '../locales/en';
import type { SupportedLanguage } from '../locales/config';
import { AVAILABLE_LANGUAGES } from '../locales/config';

// Translation map - add new language imports here
const translations = {
  bn,
  en,
  // Add new languages here:
  // hi: hi,
} as const;

// Type for translation keys
export type TranslationKey = typeof bn;

/**
 * Get translations for a specific language
 */
export const getTranslations = (language: SupportedLanguage): TranslationKey => {
  return translations[language as keyof typeof translations] || translations.bn;
};

/**
 * Get locale code for date/time formatting
 * Maps language codes to valid locale strings
 */
export const getLocaleCode = (language: SupportedLanguage): string => {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    bn: 'bn-BD',
    // Add new locale mappings here:
    // hi: 'hi-IN',
  };

  return localeMap[language] || 'en-US';
};

/**
 * Get example data for a specific language
 * Returns a function that imports the example data dynamically
 */
export const getExampleDataKey = (language: SupportedLanguage): string => {
  // Convert language code to capitalized format for import names
  // e.g., 'en' -> 'En', 'bn' -> 'Bn'
  const capitalizedLang = language.charAt(0).toUpperCase() + language.slice(1);
  return `exampleData${capitalizedLang}`;
};

/**
 * Validation error messages - locale-specific
 */
export const getValidationMessages = (language: string) => {
  const messages: Record<string, Record<string, string>> = {
    en: {
      billTitleRequired: 'Bill title is required',
      numberOfFlatsMin: 'Number of flats must be at least 1',
      categoryNameRequired: 'Category name is required',
      amountMin: 'Amount must be at least 1',
    },
    bn: {
      billTitleRequired: 'বিলের শিরোনাম প্রয়োজন',
      numberOfFlatsMin: 'ফ্ল্যাটের সংখ্যা কমপক্ষে ১ হতে হবে',
      categoryNameRequired: 'বিভাগের নাম প্রয়োজন',
      amountMin: 'পরিমাণ কমপক্ষে ১ হতে হবে',
    },
    // Add new languages here:
    // hi: {
    //   billTitleRequired: 'बिल शीर्षक आवश्यक है',
    //   ...
    // },
  };

  return messages[language] || messages.en;
};

/**
 * Get confirmation dialog messages - locale-specific
 */
export const getConfirmationMessages = (language: string) => {
  const messages: Record<string, Record<string, string>> = {
    en: {
      clearAllTitle: 'Clear All Data?',
      clearAllMessage: 'This will permanently delete all your bill data. This action cannot be undone.',
      clearBuildingTitle: 'Clear Building Data?',
      clearBuildingMessage: 'This will permanently delete all building and resident data. This action cannot be undone.',
      confirmButton: 'Yes, Clear All',
      confirmClear: 'Yes, Clear All',
      cancelButton: 'Cancel',
      cancel: 'Cancel',
    },
    bn: {
      clearAllTitle: 'সব ডেটা মুছবেন?',
      clearAllMessage: 'এটি আপনার সমস্ত বিল ডেটা স্থায়ীভাবে মুছে ফেলবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
      clearBuildingTitle: 'বিল্ডিং ডেটা মুছবেন?',
      clearBuildingMessage: 'এটি আপনার সমস্ত বিল্ডিং এবং বাসিন্দা ডেটা স্থায়ীভাবে মুছে ফেলবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
      confirmButton: 'হ্যাঁ, সব মুছুন',
      confirmClear: 'হ্যাঁ, সব মুছুন',
      cancelButton: 'বাতিল',
      cancel: 'বাতিল',
    },
    // Add new languages here:
    // hi: {
    //   clearAllTitle: 'सभी डेटा साफ़ करें?',
    //   ...
    // },
  };

  return messages[language] || messages.en;
};

/**
 * Get UI text messages - locale-specific
 * These are for UI elements not covered in the main translation files
 */
export const getUIMessages = (language: string) => {
  const messages: Record<string, Record<string, string>> = {
    en: {
      quickGuide: 'Guide',
      help: 'Help',
      example: 'Example',
      numberOfFlats: 'Number of Flats',
      flats: 'flats',
      generatedFrom: 'Generated from',
      generatingPDF: 'Generating PDF...',
      imageGenerationError: 'Failed to generate image. Please try again.',
      pdfGenerationError: 'Failed to generate PDF. Please try again.',
      shareNotSupported: 'Sharing is not supported on this browser',
      shareError: 'Failed to share the bill. Please try again.',
    },
    bn: {
      quickGuide: 'গাইড',
      help: 'সাহায্য',
      example: 'উদাহরণ',
      numberOfFlats: 'ফ্ল্যাটের সংখ্যা',
      flats: 'ফ্ল্যাট',
      generatedFrom: 'তৈরি হয়েছে',
      generatingPDF: 'পিডিএফ তৈরি হচ্ছে...',
      imageGenerationError: 'ছবি তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।',
      pdfGenerationError: 'পিডিএফ তৈরি করতে ব্যর্থ। আবার চেষ্টা করুন।',
      shareNotSupported: 'এই ব্রাউজারে শেয়ার সমর্থিত নয়',
      shareError: 'বিল শেয়ার করতে ব্যর্থ। আবার চেষ্টা করুন।',
    },
    // Add new languages here:
    // hi: {
    //   quickGuide: 'त्वरित मार्गदर्शिका',
    //   help: 'मदद',
    //   example: 'उदाहरण',
    //   numberOfFlats: 'फ्लैटों की संख्या',
    //   flats: 'फ्लैट',
    //   generatedFrom: 'से उत्पन्न',
    // },
  };

  return messages[language] || messages.en;
};
