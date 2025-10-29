import type { Building, Flat, Resident } from '../types';
import { STORAGE_KEYS } from '../types';

/**
 * Load building data from localStorage
 */
export function loadBuilding(): Building | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUILDING_DATA);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load building data:', error);
    return null;
  }
}

/**
 * Save building data to localStorage
 */
export function saveBuilding(building: Building): void {
  try {
    const updatedBuilding = {
      ...building,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.BUILDING_DATA, JSON.stringify(updatedBuilding));
  } catch (error) {
    console.error('Failed to save building data:', error);
    throw error;
  }
}

/**
 * Create a new building
 */
export function createBuilding(name: string, address: string, totalFloors: number): Building {
  const building: Building = {
    id: crypto.randomUUID(),
    name,
    address,
    totalFloors,
    flats: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveBuilding(building);
  return building;
}

/**
 * Update building info
 */
export function updateBuilding(updates: Partial<Omit<Building, 'id' | 'flats' | 'createdAt'>>): Building | null {
  const building = loadBuilding();
  if (!building) return null;

  const updatedBuilding = {
    ...building,
    ...updates,
  };
  saveBuilding(updatedBuilding);
  return updatedBuilding;
}

/**
 * Clear all building data
 */
export function clearBuilding(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BUILDING_DATA);
  } catch (error) {
    console.error('Failed to clear building data:', error);
  }
}

/**
 * Add a new flat to the building
 */
export function addFlat(flat: Omit<Flat, 'id'>): Flat | null {
  const building = loadBuilding();
  if (!building) return null;

  const newFlat: Flat = {
    ...flat,
    id: crypto.randomUUID(),
  };

  building.flats.push(newFlat);
  saveBuilding(building);
  return newFlat;
}

/**
 * Update a flat
 */
export function updateFlat(flatId: string, updates: Partial<Omit<Flat, 'id' | 'residents'>>): Flat | null {
  const building = loadBuilding();
  if (!building) return null;

  const flatIndex = building.flats.findIndex((f) => f.id === flatId);
  if (flatIndex === -1) return null;

  building.flats[flatIndex] = {
    ...building.flats[flatIndex],
    ...updates,
  };

  saveBuilding(building);
  return building.flats[flatIndex];
}

/**
 * Delete a flat
 */
export function deleteFlat(flatId: string): boolean {
  const building = loadBuilding();
  if (!building) return false;

  const flatIndex = building.flats.findIndex((f) => f.id === flatId);
  if (flatIndex === -1) return false;

  building.flats.splice(flatIndex, 1);
  saveBuilding(building);
  return true;
}

/**
 * Get a flat by ID
 */
export function getFlat(flatId: string): Flat | null {
  const building = loadBuilding();
  if (!building) return null;
  return building.flats.find((f) => f.id === flatId) || null;
}

/**
 * Add a resident to a flat
 */
export function addResident(flatId: string, resident: Omit<Resident, 'id'>): Resident | null {
  const building = loadBuilding();
  if (!building) return null;

  const flat = building.flats.find((f) => f.id === flatId);
  if (!flat) return null;

  const newResident: Resident = {
    ...resident,
    id: crypto.randomUUID(),
  };

  flat.residents.push(newResident);
  saveBuilding(building);
  return newResident;
}

/**
 * Update a resident
 */
export function updateResident(
  flatId: string,
  residentId: string,
  updates: Partial<Omit<Resident, 'id'>>
): Resident | null {
  const building = loadBuilding();
  if (!building) return null;

  const flat = building.flats.find((f) => f.id === flatId);
  if (!flat) return null;

  const residentIndex = flat.residents.findIndex((r) => r.id === residentId);
  if (residentIndex === -1) return null;

  flat.residents[residentIndex] = {
    ...flat.residents[residentIndex],
    ...updates,
  };

  saveBuilding(building);
  return flat.residents[residentIndex];
}

/**
 * Delete a resident
 */
export function deleteResident(flatId: string, residentId: string): boolean {
  const building = loadBuilding();
  if (!building) return false;

  const flat = building.flats.find((f) => f.id === flatId);
  if (!flat) return false;

  const residentIndex = flat.residents.findIndex((r) => r.id === residentId);
  if (residentIndex === -1) return false;

  flat.residents.splice(residentIndex, 1);
  saveBuilding(building);
  return true;
}

/**
 * Get all flats grouped by floor
 */
export function getFlatsByFloor(): Map<string, Flat[]> {
  const building = loadBuilding();
  if (!building) return new Map();

  const floorMap = new Map<string, Flat[]>();

  building.flats.forEach((flat) => {
    const floor = flat.floorNumber;
    if (!floorMap.has(floor)) {
      floorMap.set(floor, []);
    }
    floorMap.get(floor)!.push(flat);
  });

  // Sort floors numerically (handle "G" for ground)
  const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => {
    if (a === 'G' || a.toLowerCase() === 'ground') return -1;
    if (b === 'G' || b.toLowerCase() === 'ground') return 1;
    return parseInt(a) - parseInt(b);
  });

  const sortedMap = new Map<string, Flat[]>();
  sortedFloors.forEach((floor) => {
    sortedMap.set(floor, floorMap.get(floor)!);
  });

  return sortedMap;
}

/**
 * Get building statistics
 */
export function getBuildingStats() {
  const building = loadBuilding();
  if (!building) {
    return {
      totalFlats: 0,
      totalResidents: 0,
      ownedFlats: 0,
      rentedFlats: 0,
      totalMotorcycleParking: 0,
      totalCarParking: 0,
    };
  }

  const stats = {
    totalFlats: building.flats.length,
    totalResidents: 0,
    ownedFlats: 0,
    rentedFlats: 0,
    totalMotorcycleParking: 0,
    totalCarParking: 0,
  };

  building.flats.forEach((flat) => {
    stats.totalResidents += flat.residents.length;
    if (flat.ownershipType === 'owned') {
      stats.ownedFlats++;
    } else {
      stats.rentedFlats++;
    }
    stats.totalMotorcycleParking += flat.motorcycleParkingCount;
    stats.totalCarParking += flat.carParkingCount;
  });

  return stats;
}
