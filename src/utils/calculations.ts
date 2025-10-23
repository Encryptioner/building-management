import type { ServiceCategory, BillSummary, GarageSpace } from '../types';

export function calculateBillSummary(
  categories: ServiceCategory[],
  numberOfFlats: number,
  garage: GarageSpace
): BillSummary {
  let perFlatTotal = 0; // For non-owner categories
  let perFlatOwnerTotal = 0; // For owner-only categories
  const categoryTotals = new Map<string, number>();

  categories.forEach((category) => {
    let categoryPerFlat = 0;

    if (category.billType === 'single-flat') {
      // Amount is per flat
      categoryPerFlat = category.amount;
    } else {
      // Amount is divided among all flats, rounded up to nearest integer
      categoryPerFlat = numberOfFlats > 0 ? Math.ceil(category.amount / numberOfFlats) : 0;
    }

    // Separate owner-only categories from regular categories
    if (category.isOwnerOnly) {
      perFlatOwnerTotal += categoryPerFlat;
    } else {
      perFlatTotal += categoryPerFlat;
    }

    categoryTotals.set(category.id, categoryPerFlat);
  });

  // Round up per flat totals to nearest integer
  perFlatTotal = Math.ceil(perFlatTotal);
  perFlatOwnerTotal = Math.ceil(perFlatOwnerTotal);

  // Grand totals
  const grandTotal = Math.ceil(perFlatTotal * numberOfFlats);
  const grandOwnerTotal = Math.ceil(perFlatOwnerTotal * numberOfFlats);

  // Calculate totals with garage spaces (not including owner charges)
  const totalWithMotorcycle = perFlatTotal + garage.motorcycleSpaceAmount;
  const totalWithCar = perFlatTotal + garage.carSpaceAmount;
  const totalWithBoth = perFlatTotal + garage.motorcycleSpaceAmount + garage.carSpaceAmount;

  return {
    perFlatTotal,
    grandTotal,
    perFlatOwnerTotal,
    grandOwnerTotal,
    totalWithMotorcycle,
    totalWithCar,
    totalWithBoth,
    categoryTotals,
  };
}

export function formatCurrency(amount: number, locale: string = 'en-BD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number, locale: string = 'en-BD'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
