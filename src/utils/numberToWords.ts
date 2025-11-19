/**
 * Converts a number to its word representation in English or Bangla
 */

const ENGLISH_ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const ENGLISH_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const ENGLISH_TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

// Bangla number words (0-99) - complete list with proper compound words
const BANGLA_NUMBERS: { [key: number]: string } = {
  0: '', 1: 'এক', 2: 'দুই', 3: 'তিন', 4: 'চার', 5: 'পাঁচ',
  6: 'ছয়', 7: 'সাত', 8: 'আট', 9: 'নয়', 10: 'দশ',
  11: 'এগারো', 12: 'বারো', 13: 'তেরো', 14: 'চৌদ্দ', 15: 'পনেরো',
  16: 'ষোলো', 17: 'সতেরো', 18: 'আঠারো', 19: 'উনিশ', 20: 'বিশ',
  21: 'একুশ', 22: 'বাইশ', 23: 'তেইশ', 24: 'চব্বিশ', 25: 'পঁচিশ',
  26: 'ছাব্বিশ', 27: 'সাতাশ', 28: 'আটাশ', 29: 'ঊনতিরিশ', 30: 'তিরিশ',
  31: 'একত্রিশ', 32: 'বত্রিশ', 33: 'তেত্রিশ', 34: 'চৌত্রিশ', 35: 'পঁয়তিরিশ',
  36: 'ছত্রিশ', 37: 'সাঁইতিরিশ', 38: 'আটত্রিশ', 39: 'ঊনচল্লিশ', 40: 'চল্লিশ',
  41: 'একচল্লিশ', 42: 'বিয়াল্লিশ', 43: 'তেতাল্লিশ', 44: 'চুয়াল্লিশ', 45: 'পঁয়তাল্লিশ',
  46: 'ছেচল্লিশ', 47: 'সাতচল্লিশ', 48: 'আটচল্লিশ', 49: 'ঊনপঞ্চাশ', 50: 'পঞ্চাশ',
  51: 'একান্ন', 52: 'বাহান্ন', 53: 'তিপ্পান্ন', 54: 'চুয়ান্ন', 55: 'পঞ্চান্ন',
  56: 'ছাপ্পান্ন', 57: 'সাতান্ন', 58: 'আটান্ন', 59: 'ঊনষাট', 60: 'ষাট',
  61: 'একষট্টি', 62: 'বাষট্টি', 63: 'তেষট্টি', 64: 'চৌষট্টি', 65: 'পঁয়সট্টি',
  66: 'ছেষট্টি', 67: 'সাতষট্টি', 68: 'আটষট্টি', 69: 'ঊনসত্তর', 70: 'সত্তর',
  71: 'একাত্তর', 72: 'বাহাত্তর', 73: 'তিয়াত্তর', 74: 'চুয়াত্তর', 75: 'পঁচাত্তর',
  76: 'ছিয়াত্তর', 77: 'সাতাত্তর', 78: 'আটাত্তর', 79: 'ঊনআশি', 80: 'আশি',
  81: 'একাশি', 82: 'বিরাশি', 83: 'তিরাশি', 84: 'চুরাশি', 85: 'পঁচাশি',
  86: 'ছিয়াশি', 87: 'সাতাশি', 88: 'আটাশি', 89: 'ঊননব্বই', 90: 'নব্বই',
  91: 'একানব্বই', 92: 'বিরানব্বই', 93: 'তিরানব্বই', 94: 'চুরানব্বই', 95: 'পঁচানব্বই',
  96: 'ছিয়ানব্বই', 97: 'সাতানব্বই', 98: 'আটানব্বই', 99: 'নিরানব্বই'
};

function convertBelowHundredEnglish(num: number): string {
  if (num === 0) return '';
  if (num < 10) return ENGLISH_ONES[num];
  if (num < 20) return ENGLISH_TEENS[num - 10];

  const tens = Math.floor(num / 10);
  const ones = num % 10;

  return ENGLISH_TENS[tens] + (ones ? ' ' + ENGLISH_ONES[ones] : '');
}

function convertBelowHundredBangla(num: number): string {
  if (num === 0) return '';
  if (num <= 99) return BANGLA_NUMBERS[num] || '';
  return '';
}

function numberToWordsEnglish(num: number): string {
  if (num === 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(convertBelowHundredEnglish(crore) + ' Crore');
  }

  if (lakh > 0) {
    parts.push(convertBelowHundredEnglish(lakh) + ' Lakh');
  }

  if (thousand > 0) {
    parts.push(convertBelowHundredEnglish(thousand) + ' Thousand');
  }

  if (hundred > 0) {
    parts.push(ENGLISH_ONES[hundred] + ' Hundred');
  }

  if (remainder > 0) {
    parts.push(convertBelowHundredEnglish(remainder));
  }

  return parts.join(' ');
}

function numberToWordsBangla(num: number): string {
  if (num === 0) return 'শূন্য';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(convertBelowHundredBangla(crore) + ' কোটি');
  }

  if (lakh > 0) {
    parts.push(convertBelowHundredBangla(lakh) + ' লক্ষ');
  }

  if (thousand > 0) {
    parts.push(convertBelowHundredBangla(thousand) + ' হাজার');
  }

  if (hundred > 0) {
    parts.push(BANGLA_NUMBERS[hundred] + ' শত');
  }

  if (remainder > 0) {
    parts.push(convertBelowHundredBangla(remainder));
  }

  return parts.join(' ');
}

// Negative number prefixes by language
const NEGATIVE_PREFIXES: Record<string, string> = {
  'bn': 'ঋণাত্মক',
  'en': 'Negative',
};

/**
 * Converts a number to words in the specified language
 * @param num - The number to convert
 * @param language - The language code ('en' or 'bn')
 * @returns The number in words
 */
export function numberToWords(num: number, language: string = 'en'): string {
  // Handle negative numbers
  if (num < 0) {
    const prefix = NEGATIVE_PREFIXES[language] || NEGATIVE_PREFIXES['en'];
    return prefix + ' ' + numberToWords(Math.abs(num), language);
  }

  // Round to nearest integer
  num = Math.round(num);

  if (language === 'bn') {
    return numberToWordsBangla(num);
  }

  return numberToWordsEnglish(num);
}
