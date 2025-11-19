import type { Building, BillData } from '../types';

// ==================== Building Export/Import ====================

/**
 * Export building data as JSON file
 */
export function exportBuildingData(building: Building): void {
  const dataStr = JSON.stringify(building, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${building.name.replace(/[^a-z0-9]/gi, '_')}_building_data_${
    new Date().toISOString().split('T')[0]
  }.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported building data structure
 */
export function validateBuildingData(data: any): { valid: boolean; error?: string } {
  // Check if data exists
  if (!data) {
    return { valid: false, error: 'No data provided' };
  }

  // Check required fields
  const requiredFields = ['id', 'name', 'address', 'totalFloors', 'flats', 'createdAt', 'updatedAt'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate field types
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    return { valid: false, error: 'Invalid id: must be a non-empty string' };
  }

  if (typeof data.name !== 'string' || data.name.trim() === '') {
    return { valid: false, error: 'Invalid name: must be a non-empty string' };
  }

  if (typeof data.address !== 'string' || data.address.trim() === '') {
    return { valid: false, error: 'Invalid address: must be a non-empty string' };
  }

  if (typeof data.totalFloors !== 'number' || data.totalFloors <= 0) {
    return { valid: false, error: 'Invalid totalFloors: must be a positive number' };
  }

  if (!Array.isArray(data.flats)) {
    return { valid: false, error: 'Invalid flats: must be an array' };
  }

  // Validate each flat
  for (let i = 0; i < data.flats.length; i++) {
    const flat = data.flats[i];
    const flatValidation = validateFlat(flat, i);
    if (!flatValidation.valid) {
      return flatValidation;
    }
  }

  // Validate timestamps
  if (typeof data.createdAt !== 'string' || !isValidISODate(data.createdAt)) {
    return { valid: false, error: 'Invalid createdAt: must be a valid ISO date string' };
  }

  if (typeof data.updatedAt !== 'string' || !isValidISODate(data.updatedAt)) {
    return { valid: false, error: 'Invalid updatedAt: must be a valid ISO date string' };
  }

  return { valid: true };
}

/**
 * Validate a single flat object
 */
function validateFlat(flat: any, index: number): { valid: boolean; error?: string } {
  const requiredFields = ['id', 'flatNumber', 'floorNumber', 'ownershipType', 'residents', 'motorcycleParkingCount', 'carParkingCount'];

  for (const field of requiredFields) {
    if (!(field in flat)) {
      return { valid: false, error: `Flat ${index}: Missing required field: ${field}` };
    }
  }

  if (typeof flat.id !== 'string' || flat.id.trim() === '') {
    return { valid: false, error: `Flat ${index}: Invalid id` };
  }

  if (typeof flat.flatNumber !== 'string' || flat.flatNumber.trim() === '') {
    return { valid: false, error: `Flat ${index}: Invalid flatNumber` };
  }

  if (typeof flat.floorNumber !== 'string' || flat.floorNumber.trim() === '') {
    return { valid: false, error: `Flat ${index}: Invalid floorNumber` };
  }

  if (flat.ownershipType !== 'owned' && flat.ownershipType !== 'rented') {
    return { valid: false, error: `Flat ${index}: Invalid ownershipType (must be "owned" or "rented")` };
  }

  if (!Array.isArray(flat.residents)) {
    return { valid: false, error: `Flat ${index}: residents must be an array` };
  }

  // Validate each resident
  for (let j = 0; j < flat.residents.length; j++) {
    const resident = flat.residents[j];
    const residentValidation = validateResident(resident, index, j);
    if (!residentValidation.valid) {
      return residentValidation;
    }
  }

  if (typeof flat.motorcycleParkingCount !== 'number' || flat.motorcycleParkingCount < 0) {
    return { valid: false, error: `Flat ${index}: Invalid motorcycleParkingCount` };
  }

  if (typeof flat.carParkingCount !== 'number' || flat.carParkingCount < 0) {
    return { valid: false, error: `Flat ${index}: Invalid carParkingCount` };
  }

  // Optional notes field
  if ('notes' in flat && typeof flat.notes !== 'string') {
    return { valid: false, error: `Flat ${index}: notes must be a string` };
  }

  return { valid: true };
}

/**
 * Validate a single resident object
 */
function validateResident(resident: any, flatIndex: number, residentIndex: number): { valid: boolean; error?: string } {
  const requiredFields = ['id', 'name', 'phone'];

  for (const field of requiredFields) {
    if (!(field in resident)) {
      return { valid: false, error: `Flat ${flatIndex}, Resident ${residentIndex}: Missing required field: ${field}` };
    }
  }

  if (typeof resident.id !== 'string' || resident.id.trim() === '') {
    return { valid: false, error: `Flat ${flatIndex}, Resident ${residentIndex}: Invalid id` };
  }

  if (typeof resident.name !== 'string' || resident.name.trim() === '') {
    return { valid: false, error: `Flat ${flatIndex}, Resident ${residentIndex}: Invalid name` };
  }

  if (typeof resident.phone !== 'string' || resident.phone.trim() === '') {
    return { valid: false, error: `Flat ${flatIndex}, Resident ${residentIndex}: Invalid phone` };
  }

  // Optional fields
  const optionalStringFields = ['email', 'nid', 'moveInDate', 'notes'];
  for (const field of optionalStringFields) {
    if (field in resident && typeof resident[field] !== 'string') {
      return { valid: false, error: `Flat ${flatIndex}, Resident ${residentIndex}: ${field} must be a string` };
    }
  }

  return { valid: true };
}

/**
 * Check if a string is a valid ISO date
 */
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Parse and validate imported JSON file
 */
export async function importBuildingDataFromFile(file: File): Promise<{ success: boolean; data?: Building; error?: string }> {
  try {
    // Check file type
    if (!file.name.endsWith('.json')) {
      return { success: false, error: 'Invalid file type. Please upload a JSON file.' };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' };
    }

    // Read file content
    const text = await file.text();

    // Parse JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return { success: false, error: 'Invalid JSON format. Please check your file.' };
    }

    // Validate structure
    const validation = validateBuildingData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Update timestamps to reflect import
    const now = new Date().toISOString();
    data.updatedAt = now;

    return { success: true, data: data as Building };
  } catch (error) {
    console.error('Error importing building data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while importing file.'
    };
  }
}

// ==================== Bill Export/Import ====================

/**
 * Export bill data as JSON file
 */
export function exportBillData(billData: BillData): void {
  const dataStr = JSON.stringify(billData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  const titleSlug = billData.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  link.download = `${titleSlug}_bill_data_${new Date().toISOString().split('T')[0]}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported bill data structure
 */
export function validateBillData(data: any): { valid: boolean; error?: string } {
  // Check if data exists
  if (!data) {
    return { valid: false, error: 'No data provided' };
  }

  // Check required fields
  const requiredFields = ['title', 'numberOfFlats', 'garage', 'paymentInfo', 'notes', 'categories'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate title
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    return { valid: false, error: 'Invalid title: must be a non-empty string' };
  }

  // Validate numberOfFlats
  if (typeof data.numberOfFlats !== 'number' || data.numberOfFlats <= 0) {
    return { valid: false, error: 'Invalid numberOfFlats: must be a positive number' };
  }

  // Validate garage
  if (!data.garage || typeof data.garage !== 'object') {
    return { valid: false, error: 'Invalid garage: must be an object' };
  }

  const garageValidation = validateGarageSpace(data.garage);
  if (!garageValidation.valid) {
    return garageValidation;
  }

  // Validate paymentInfo
  if (typeof data.paymentInfo !== 'string') {
    return { valid: false, error: 'Invalid paymentInfo: must be a string' };
  }

  // Validate notes
  if (typeof data.notes !== 'string') {
    return { valid: false, error: 'Invalid notes: must be a string' };
  }

  // Validate categories
  if (!Array.isArray(data.categories)) {
    return { valid: false, error: 'Invalid categories: must be an array' };
  }

  // Validate each category
  for (let i = 0; i < data.categories.length; i++) {
    const category = data.categories[i];
    const categoryValidation = validateServiceCategory(category, i);
    if (!categoryValidation.valid) {
      return categoryValidation;
    }
  }

  // Optional fields validation
  if ('showMotorcycleInBlankForm' in data && typeof data.showMotorcycleInBlankForm !== 'boolean') {
    return { valid: false, error: 'Invalid showMotorcycleInBlankForm: must be a boolean' };
  }

  if ('showCarInBlankForm' in data && typeof data.showCarInBlankForm !== 'boolean') {
    return { valid: false, error: 'Invalid showCarInBlankForm: must be a boolean' };
  }

  return { valid: true };
}

/**
 * Validate garage space object
 */
function validateGarageSpace(garage: any): { valid: boolean; error?: string } {
  const requiredFields = [
    'motorcycleSpaces',
    'motorcycleSpaceAmount',
    'motorcycleSpaceNotes',
    'carSpaces',
    'carSpaceAmount',
    'carSpaceNotes'
  ];

  for (const field of requiredFields) {
    if (!(field in garage)) {
      return { valid: false, error: `Garage: Missing required field: ${field}` };
    }
  }

  if (typeof garage.motorcycleSpaces !== 'number' || garage.motorcycleSpaces < 0) {
    return { valid: false, error: 'Garage: Invalid motorcycleSpaces (must be a non-negative number)' };
  }

  if (typeof garage.motorcycleSpaceAmount !== 'number' || garage.motorcycleSpaceAmount < 0) {
    return { valid: false, error: 'Garage: Invalid motorcycleSpaceAmount (must be a non-negative number)' };
  }

  if (typeof garage.motorcycleSpaceNotes !== 'string') {
    return { valid: false, error: 'Garage: Invalid motorcycleSpaceNotes (must be a string)' };
  }

  if (typeof garage.carSpaces !== 'number' || garage.carSpaces < 0) {
    return { valid: false, error: 'Garage: Invalid carSpaces (must be a non-negative number)' };
  }

  if (typeof garage.carSpaceAmount !== 'number' || garage.carSpaceAmount < 0) {
    return { valid: false, error: 'Garage: Invalid carSpaceAmount (must be a non-negative number)' };
  }

  if (typeof garage.carSpaceNotes !== 'string') {
    return { valid: false, error: 'Garage: Invalid carSpaceNotes (must be a string)' };
  }

  return { valid: true };
}

/**
 * Validate a single service category
 */
function validateServiceCategory(category: any, index: number): { valid: boolean; error?: string } {
  const requiredFields = ['id', 'name', 'duration', 'info', 'billType', 'amount'];

  for (const field of requiredFields) {
    if (!(field in category)) {
      return { valid: false, error: `Category ${index}: Missing required field: ${field}` };
    }
  }

  if (typeof category.id !== 'string' || category.id.trim() === '') {
    return { valid: false, error: `Category ${index}: Invalid id` };
  }

  if (typeof category.name !== 'string' || category.name.trim() === '') {
    return { valid: false, error: `Category ${index}: Invalid name` };
  }

  if (typeof category.duration !== 'string') {
    return { valid: false, error: `Category ${index}: Invalid duration (must be a string)` };
  }

  if (typeof category.info !== 'string') {
    return { valid: false, error: `Category ${index}: Invalid info (must be a string)` };
  }

  if (category.billType !== 'single-flat' && category.billType !== 'all-building') {
    return { valid: false, error: `Category ${index}: Invalid billType (must be "single-flat" or "all-building")` };
  }

  if (typeof category.amount !== 'number' || category.amount < 0) {
    return { valid: false, error: `Category ${index}: Invalid amount (must be a non-negative number)` };
  }

  // Optional isOwnerOnly field
  if ('isOwnerOnly' in category && typeof category.isOwnerOnly !== 'boolean') {
    return { valid: false, error: `Category ${index}: Invalid isOwnerOnly (must be a boolean)` };
  }

  return { valid: true };
}

/**
 * Parse and validate imported bill JSON file
 */
export async function importBillDataFromFile(file: File): Promise<{ success: boolean; data?: BillData; error?: string }> {
  try {
    // Check file type
    if (!file.name.endsWith('.json')) {
      return { success: false, error: 'Invalid file type. Please upload a JSON file.' };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10MB.' };
    }

    // Read file content
    const text = await file.text();

    // Parse JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return { success: false, error: 'Invalid JSON format. Please check your file.' };
    }

    // Validate structure
    const validation = validateBillData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    return { success: true, data: data as BillData };
  } catch (error) {
    console.error('Error importing bill data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while importing file.'
    };
  }
}
