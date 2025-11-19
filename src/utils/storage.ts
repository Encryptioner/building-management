import type { BillData } from '../types';

const STORAGE_KEY_CALCULATED = 'building-management-bill-data-calculated';
const STORAGE_KEY_BLANK = 'building-management-bill-data-blank';

export type FormMode = 'calculated' | 'blank';

function getStorageKey(mode: FormMode): string {
  return mode === 'calculated' ? STORAGE_KEY_CALCULATED : STORAGE_KEY_BLANK;
}

export function saveBillData(data: BillData, mode: FormMode = 'calculated'): void {
  try {
    localStorage.setItem(getStorageKey(mode), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save bill data:', error);
  }
}

export function loadBillData(mode: FormMode = 'calculated'): BillData | null {
  try {
    const data = localStorage.getItem(getStorageKey(mode));
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Backward compatibility: add garage fields if they don't exist
    if (!parsed.garage) {
      parsed.garage = {
        motorcycleSpaces: 0,
        motorcycleSpaceAmount: 0,
        motorcycleSpaceNotes: '',
        carSpaces: 0,
        carSpaceAmount: 0,
        carSpaceNotes: '',
      };
    }

    // Ensure all categories have isOwnerOnly field (default to false for backward compatibility)
    if (parsed.categories) {
      parsed.categories = parsed.categories.map((cat: any) => ({
        ...cat,
        isOwnerOnly: cat.isOwnerOnly ?? false,
      }));
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load bill data:', error);
    return null;
  }
}

export function clearBillData(mode: FormMode = 'calculated'): void {
  try {
    localStorage.removeItem(getStorageKey(mode));
  } catch (error) {
    console.error('Failed to clear bill data:', error);
  }
}
