import { useState, useEffect } from 'react';
import type { Flat, FlatOwnershipType } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getValidationMessages } from '../../utils/i18n';
import { addFlat, updateFlat } from '../../utils/buildingStorage';
import { trackEvent } from '../../config/googleAnalytics';

interface FlatFormProps {
  language: SupportedLanguage;
  flat?: Flat; // If provided, we're editing; otherwise, adding new
  preselectedFloor?: string; // If provided, preselect and disable floor selection
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlatForm({ language, flat, preselectedFloor, onSuccess, onCancel }: FlatFormProps) {
  const [floorNumber, setFloorNumber] = useState(flat?.floorNumber || preselectedFloor || '');
  const [flatNumber, setFlatNumber] = useState(flat?.flatNumber || '');
  const [ownershipType, setOwnershipType] = useState<FlatOwnershipType>(flat?.ownershipType || 'owned');
  const [motorcycleParkingCount, setMotorcycleParkingCount] = useState(flat?.motorcycleParkingCount.toString() || '0');
  const [carParkingCount, setCarParkingCount] = useState(flat?.carParkingCount.toString() || '0');
  const [notes, setNotes] = useState(flat?.notes || '');
  const [errors, setErrors] = useState<{
    floorNumber?: string;
    flatNumber?: string;
  }>({});

  const t = getTranslations(language);
  const validationMsgs = getValidationMessages(language);
  const isEditing = !!flat;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!floorNumber.trim()) {
      newErrors.floorNumber = validationMsgs.required;
    }

    if (!flatNumber.trim()) {
      newErrors.flatNumber = validationMsgs.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        updateFlat(flat.id, {
          floorNumber: floorNumber.trim(),
          flatNumber: flatNumber.trim(),
          ownershipType,
          motorcycleParkingCount: parseInt(motorcycleParkingCount) || 0,
          carParkingCount: parseInt(carParkingCount) || 0,
          notes: notes.trim(),
        });
        trackEvent({ name: 'flat_edited' });
      } else {
        addFlat({
          floorNumber: floorNumber.trim(),
          flatNumber: flatNumber.trim(),
          ownershipType,
          residents: [],
          motorcycleParkingCount: parseInt(motorcycleParkingCount) || 0,
          carParkingCount: parseInt(carParkingCount) || 0,
          notes: notes.trim(),
        });
        trackEvent({ name: 'flat_added', params: { flat_type: ownershipType } });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save flat:', error);
      alert('Failed to save flat data. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? t.flat.edit : t.flat.add}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Floor Number */}
            <div>
              <label htmlFor="floor-number" className="block text-sm font-medium text-gray-700 mb-2">
                {t.flat.floorNumber} <span className="text-red-600">*</span>
              </label>
              <input
                id="floor-number"
                type="text"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder={t.flat.floorNumberPlaceholder}
                disabled={!!preselectedFloor && !isEditing}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.floorNumber ? 'border-red-500' : 'border-gray-300'
                } ${preselectedFloor && !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.floorNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.floorNumber}</p>
              )}
              {preselectedFloor && !isEditing ? (
                <p className="mt-1 text-sm text-blue-600">{t.flat.floorNumberAutoSelected}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">{t.flat.floorNumberHelp}</p>
              )}
            </div>

            {/* Flat Number */}
            <div>
              <label htmlFor="flat-number" className="block text-sm font-medium text-gray-700 mb-2">
                {t.flat.flatNumber} <span className="text-red-600">*</span>
              </label>
              <input
                id="flat-number"
                type="text"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder={t.flat.flatNumberPlaceholder}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.flatNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.flatNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.flatNumber}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">{t.flat.flatNumberHelp}</p>
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.flat.ownership}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    value="owned"
                    checked={ownershipType === 'owned'}
                    onChange={() => setOwnershipType('owned')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900">{t.flat.owned}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    value="rented"
                    checked={ownershipType === 'rented'}
                    onChange={() => setOwnershipType('rented')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900">{t.flat.rented}</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">{t.flat.ownershipHelp}</p>
            </div>

            {/* Parking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Motorcycle Parking */}
              <div>
                <label htmlFor="motorcycle-parking" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.flat.motorcycleParking}
                </label>
                <input
                  id="motorcycle-parking"
                  type="number"
                  min="0"
                  value={motorcycleParkingCount}
                  onChange={(e) => setMotorcycleParkingCount(e.target.value)}
                  placeholder={t.flat.motorcycleParkingPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500">{t.flat.motorcycleParkingHelp}</p>
              </div>

              {/* Car Parking */}
              <div>
                <label htmlFor="car-parking" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.flat.carParking}
                </label>
                <input
                  id="car-parking"
                  type="number"
                  min="0"
                  value={carParkingCount}
                  onChange={(e) => setCarParkingCount(e.target.value)}
                  placeholder={t.flat.carParkingPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500">{t.flat.carParkingHelp}</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="flat-notes" className="block text-sm font-medium text-gray-700 mb-2">
                {t.flat.notes}
              </label>
              <textarea
                id="flat-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.flat.notesPlaceholder}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">{t.flat.notesHelp}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t.flat.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t.flat.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
