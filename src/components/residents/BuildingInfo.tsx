import { useState } from 'react';
import type { Building } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getValidationMessages } from '../../utils/i18n';
import { updateBuilding, getBuildingStats } from '../../utils/buildingStorage';
import ImageUploader from '../ImageUploader';

interface BuildingInfoProps {
  building: Building;
  language: SupportedLanguage;
  onUpdate: () => void;
}

export default function BuildingInfo({ building, language, onUpdate }: BuildingInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(building.name);
  const [address, setAddress] = useState(building.address);
  const [totalFloors, setTotalFloors] = useState(building.totalFloors.toString());
  const [referenceImages, setReferenceImages] = useState<string[]>(building.referenceImages || []);
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    totalFloors?: string;
  }>({});

  const t = getTranslations(language);
  const validationMsgs = getValidationMessages(language);
  const stats = getBuildingStats();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = validationMsgs.required;
    }

    if (!address.trim()) {
      newErrors.address = validationMsgs.required;
    }

    if (!totalFloors || parseInt(totalFloors) <= 0) {
      newErrors.totalFloors = validationMsgs.required;
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
      updateBuilding({
        name: name.trim(),
        address: address.trim(),
        totalFloors: parseInt(totalFloors),
        referenceImages,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update building:', error);
      alert('Failed to update building data. Please try again.');
    }
  };

  const handleCancel = () => {
    setName(building.name);
    setAddress(building.address);
    setTotalFloors(building.totalFloors.toString());
    setReferenceImages(building.referenceImages || []);
    setErrors({});
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.building.edit}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Building Name */}
          <div>
            <label htmlFor="edit-building-name" className="block text-sm font-medium text-gray-700 mb-2">
              {t.building.name}
            </label>
            <input
              id="edit-building-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.building.namePlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="edit-building-address" className="block text-sm font-medium text-gray-700 mb-2">
              {t.building.address}
            </label>
            <input
              id="edit-building-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.building.addressPlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Total Floors */}
          <div>
            <label htmlFor="edit-total-floors" className="block text-sm font-medium text-gray-700 mb-2">
              {t.building.totalFloors}
            </label>
            <input
              id="edit-total-floors"
              type="number"
              min="1"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              placeholder={t.building.totalFloorsPlaceholder}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.totalFloors ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.totalFloors && (
              <p className="mt-1 text-sm text-red-600">{errors.totalFloors}</p>
            )}
          </div>

          {/* Reference Images */}
          <div>
            <ImageUploader
              images={referenceImages}
              onImagesChange={setReferenceImages}
              language={language}
              maxImages={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 ml-auto">
            <button
              type="submit"
              className="sm:flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t.building.saveAndContinue}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="sm:flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {t.flat.cancel}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t.building.info}</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t.building.edit}
        </button>
      </div>

      <div className="space-y-4">
        {/* Building Name */}
        <div>
          <p className="text-sm text-gray-500">{t.building.name}</p>
          <p className="text-lg font-medium text-gray-900">{building.name}</p>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm text-gray-500">{t.building.address}</p>
          <p className="text-lg font-medium text-gray-900">{building.address}</p>
        </div>

        {/* Total Floors */}
        <div>
          <p className="text-sm text-gray-500">{t.building.totalFloors}</p>
          <p className="text-lg font-medium text-gray-900">{building.totalFloors}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{t.building.stats}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.totalFlats}</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalFlats}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.totalResidents}</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalResidents}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.ownedFlats}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.ownedFlats}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.rentedFlats}</p>
            <p className="text-2xl font-bold text-orange-600">{stats.rentedFlats}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.motorcycleSpaces}</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.totalMotorcycleParking}</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{t.stats.carSpaces}</p>
            <p className="text-2xl font-bold text-pink-600">{stats.totalCarParking}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
