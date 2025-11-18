export type BillType = 'single-flat' | 'all-building';

export interface ServiceCategory {
  id: string;
  name: string;
  duration: string;
  info: string;
  billType: BillType;
  amount: number;
  isOwnerOnly?: boolean; // If true, this charge applies only to flat owners
  excludedFlats?: number; // Number of flats to exclude from this category (e.g., vacant/unoccupied flats)
}

export interface GarageSpace {
  motorcycleSpaces: number;
  motorcycleSpaceAmount: number;
  motorcycleSpaceNotes: string;
  carSpaces: number;
  carSpaceAmount: number;
  carSpaceNotes: string;
}

export interface BillData {
  title: string;
  numberOfFlats: number;
  garage: GarageSpace;
  paymentInfo: string;
  notes: string;
  categories: ServiceCategory[];
  showMotorcycleInBlankForm?: boolean; // Controls motorcycle space visibility in blank form preview
  showCarInBlankForm?: boolean; // Controls car space visibility in blank form preview
}

export interface BillSummary {
  perFlatTotal: number; // Per flat total for non-owner categories
  grandTotal: number; // Grand total for all flats (non-owner categories)
  perFlatOwnerTotal: number; // Per flat total for owner-only categories
  grandOwnerTotal: number; // Grand total for owner-only categories (all flats)
  totalWithMotorcycle: number;
  totalWithCar: number;
  totalWithBoth: number;
  categoryTotals: Map<string, number>;
}

// Building Management Types
export type FlatOwnershipType = 'owned' | 'rented';

export interface Resident {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nid?: string; // National ID (optional for privacy)
  moveInDate?: string;
  notes?: string;
}

export interface Flat {
  id: string;
  flatNumber: string; // Flexible: "1A", "2B", "101", "Ground-1"
  floorNumber: string; // "1", "2", "G", "Ground", etc.
  ownershipType: FlatOwnershipType; // Ownership at flat level
  residents: Resident[];
  motorcycleParkingCount: number; // 0 if none
  carParkingCount: number; // 0 if none
  notes?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  totalFloors: number;
  flats: Flat[];
  createdAt: string;
  updatedAt: string;
}

// localStorage keys
export const STORAGE_KEYS = {
  BILL_DATA: 'serviceBillData',
  BUILDING_DATA: 'buildingData',
  ACTIVE_VIEW: 'activeView', // 'bills' | 'residents'
  PREFERRED_LANGUAGE: 'preferred-language' // Existing key
} as const;
