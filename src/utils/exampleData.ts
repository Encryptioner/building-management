import type { BillData } from '../types';
import type { SupportedLanguage } from '../locales/config';
import type { FormMode } from './storage';

// CALCULATED MODE EXAMPLE DATA
const calculatedExampleDataEn: BillData = {
  title: 'Monthly Service Charge - January 2025',
  numberOfFlats: 30,
  garage: {
    motorcycleSpaces: 0,
    motorcycleSpaceAmount: 100,
    motorcycleSpaceNotes: 'Flats: 1-A, 2-B, 3-C',
    carSpaces: 0,
    carSpaceAmount: 250,
    carSpaceNotes: 'Flats: 1-A, 2-B, 3-C',
  },
  paymentInfo: `Bank: ABC Bank Limited
Account Name: Building Management Committee
Account Number: 1234567890
Bkash: +880 1712345678`,
  notes: `Please pay by the 22th of each month.
Late payment fee: 50 BDT per day after the 22th.
For queries, contact: +880 1912345678`,
  categories: [
    {
      id: '1',
      name: 'Electricity (Common Area)',
      duration: 'December 15, 2024 - January 15, 2025',
      info: 'Bill No: 123456, Previous: 5000 units, Current: 5500 units',
      billType: 'all-building',
      amount: 50000,
    },
    {
      id: '2',
      name: 'Water Bill',
      duration: 'January 2025',
      info: 'WASA Bill for the entire building',
      billType: 'all-building',
      amount: 20000,
      excludedFlats: 2,
    },
    {
      id: '3',
      name: 'Caretaker Salary',
      duration: 'January 2025',
      info: '15,000 BDT',
      billType: 'all-building',
      amount: 15000,
    },
    {
      id: '4',
      name: 'Small Bills',
      duration: 'January 2025',
      info: 'Photocopy',
      billType: 'all-building',
      amount: 50,
    },
    {
      id: '5',
      name: 'Deposit',
      duration: 'January 2025',
      info: 'Monthly subscription for future use',
      billType: 'single-flat',
      amount: 100,
    },
  ],
};

// BLANK FORM MODE EXAMPLE DATA
const blankExampleDataEn: BillData = {
  title: 'Monthly Service Charge Bill',
  numberOfFlats: 0,
  garage: {
    motorcycleSpaces: 0,
    motorcycleSpaceAmount: 0,
    motorcycleSpaceNotes: '',
    carSpaces: 0,
    carSpaceAmount: 0,
    carSpaceNotes: '',
  },
  paymentInfo: `Payment Details:
Bank Name: _____________________
Account Number: _____________________
Mobile Banking: _____________________`,
  notes: `Important Notes:
Payment Due Date: _____________________
Contact for queries: _____________________`,
  showMotorcycleInBlankForm: true,
  showCarInBlankForm: true,
  categories: [
    {
      id: '1',
      name: 'Electricity Bill',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
    {
      id: '2',
      name: 'Water Bill',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
    {
      id: '3',
      name: 'Staff Salary',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
  ],
};

// CALCULATED MODE EXAMPLE DATA - Bangla
const calculatedExampleDataBn: BillData = {
  title: 'মাসিক সার্ভিস চার্জ - জানুয়ারি ২০২৫',
  numberOfFlats: 30,
  garage: {
    motorcycleSpaces: 0,
    motorcycleSpaceAmount: 100,
    motorcycleSpaceNotes: 'ফ্ল্যাট: ১-এ, ২-বি, ৩-সি',
    carSpaces: 0,
    carSpaceAmount: 250,
    carSpaceNotes: 'ফ্ল্যাট: ১-এ, ২-বি, ৩-সি',
  },
  paymentInfo: `ব্যাংক: এবিসি ব্যাংক লিমিটেড
অ্যাকাউন্টের নাম: বিল্ডিং ম্যানেজমেন্ট কমিটি
অ্যাকাউন্ট নম্বর: ১২৩৪৫৬৭৮৯০
বিকাশ: +৮৮০ ১৭১২৩৪৫৬৭৮`,
  notes: `অনুগ্রহ করে প্রতি মাসের ২২ তারিখের মধ্যে পেমেন্ট করুন।
বিলম্ব ফি: ২২ তারিখের পর প্রতিদিন ৫০ টাকা।
যেকোনো প্রশ্নের জন্য যোগাযোগ: +৮৮০ ১৯১২৩৪৫৬৭৮`,
  categories: [
    {
      id: '1',
      name: 'বিদ্যুৎ (কমন এরিয়া)',
      duration: '১৫ ডিসেম্বর, ২০২৪ - ১৫ জানুয়ারি, ২০২৫',
      info: 'বিল নং: ১২৩৪৫৬, পূর্ববর্তী: ৫০০০ ইউনিট, বর্তমান: ৫৫০০ ইউনিট',
      billType: 'all-building',
      amount: 50000,
    },
    {
      id: '2',
      name: 'পানির বিল',
      duration: 'জানুয়ারি ২০২৫',
      info: 'সম্পূর্ণ ভবনের জন্য ওয়াসা বিল',
      billType: 'all-building',
      amount: 20000,
      excludedFlats: 2,
    },
    {
      id: '3',
      name: 'কেয়ারটেকারের বেতন',
      duration: 'জানুয়ারি ২০২৫',
      info: '১৫,০০০ টাকা',
      billType: 'all-building',
      amount: 15000,
    },
    {
      id: '4',
      name: 'ছোট বিল',
      duration: 'জানুয়ারি ২০২৫',
      info: 'ফটোকপি',
      billType: 'all-building',
      amount: 50,
    },
    {
      id: '5',
      name: 'ডিপোজিট',
      duration: 'জানুয়ারি ২০২৫',
      info: 'ভবিষ্যতের ব্যাবহারের জন্য মাসিক চাঁদা',
      billType: 'single-flat',
      amount: 100,
    },
  ],
};

// BLANK FORM MODE EXAMPLE DATA - Bangla
const blankExampleDataBn: BillData = {
  title: 'মাসিক সার্ভিস চার্জ বিল',
  numberOfFlats: 0,
  garage: {
    motorcycleSpaces: 0,
    motorcycleSpaceAmount: 0,
    motorcycleSpaceNotes: '',
    carSpaces: 0,
    carSpaceAmount: 0,
    carSpaceNotes: '',
  },
  paymentInfo: `পেমেন্টের বিবরণ:
ব্যাংকের নাম: _____________________
অ্যাকাউন্ট নম্বর: _____________________
মোবাইল ব্যাংকিং: _____________________`,
  notes: `গুরুত্বপূর্ণ নোট:
পেমেন্টের শেষ তারিখ: _____________________
যোগাযোগ: _____________________`,
  showMotorcycleInBlankForm: true,
  showCarInBlankForm: true,
  categories: [
    {
      id: '1',
      name: 'বিদ্যুৎ বিল',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
    {
      id: '2',
      name: 'পানির বিল',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
    {
      id: '3',
      name: 'কর্মচারীর বেতন',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    },
  ],
};

// Example data maps - add new language example data here
export const calculatedExampleDataMap: Record<SupportedLanguage, BillData> = {
  en: calculatedExampleDataEn,
  bn: calculatedExampleDataBn,
};

export const blankExampleDataMap: Record<SupportedLanguage, BillData> = {
  en: blankExampleDataEn,
  bn: blankExampleDataBn,
};

/**
 * Get example data for a specific language and mode
 */
export const getExampleData = (language: SupportedLanguage, mode: FormMode = 'calculated'): BillData => {
  const map = mode === 'calculated' ? calculatedExampleDataMap : blankExampleDataMap;
  return map[language] || map.bn;
};
