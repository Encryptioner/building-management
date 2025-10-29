import { useState, useRef } from 'react';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getValidationMessages } from '../../utils/i18n';
import { saveBuilding } from '../../utils/buildingStorage';
import { generateExampleBuildingData } from '../../utils/exampleBuildingData';
import { importBuildingDataFromFile } from '../../utils/dataExport';

interface BuildingSetupProps {
  language: SupportedLanguage;
  onSetupComplete: () => void;
}

export default function BuildingSetup({ language, onSetupComplete }: BuildingSetupProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    totalFloors?: string;
  }>({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);
  const validationMsgs = getValidationMessages(language);

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
      const building = {
        id: crypto.randomUUID(),
        name: name.trim(),
        address: address.trim(),
        totalFloors: parseInt(totalFloors),
        flats: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveBuilding(building);
      onSetupComplete();
    } catch (error) {
      console.error('Failed to create building:', error);
      alert('Failed to save building data. Please try again.');
    }
  };

  const handleLoadExampleData = () => {
    try {
      const exampleBuilding = generateExampleBuildingData();
      saveBuilding(exampleBuilding);
      onSetupComplete();
    } catch (error) {
      console.error('Failed to load example data:', error);
      alert(language === 'bn' ? 'উদাহরণ ডেটা লোড করতে ব্যর্থ। আবার চেষ্টা করুন।' : 'Failed to load example data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importBuildingDataFromFile(file);

      if (result.success && result.data) {
        saveBuilding(result.data);
        onSetupComplete();
      } else {
        alert(
          language === 'bn'
            ? `ইমপোর্ট করতে ব্যর্থ: ${result.error}`
            : `Import failed: ${result.error}`
        );
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert(
        language === 'bn'
          ? 'ফাইল ইমপোর্ট করতে ব্যর্থ। আবার চেষ্টা করুন।'
          : 'Failed to import file. Please try again.'
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t.building.welcome}
            </h1>
            <p className="text-gray-600 mb-4">
              {t.building.welcomeDescription}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              {t.building.setupNote}
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.building.setup}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Building Name */}
            <div>
              <label htmlFor="building-name" className="block text-sm font-medium text-gray-700 mb-2">
                {t.building.name}
              </label>
              <input
                id="building-name"
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
              <p className="mt-1 text-sm text-gray-500">{t.building.nameHelp}</p>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="building-address" className="block text-sm font-medium text-gray-700 mb-2">
                {t.building.address}
              </label>
              <input
                id="building-address"
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
              <p className="mt-1 text-sm text-gray-500">{t.building.addressHelp}</p>
            </div>

            {/* Total Floors */}
            <div>
              <label htmlFor="total-floors" className="block text-sm font-medium text-gray-700 mb-2">
                {t.building.totalFloors}
              </label>
              <input
                id="total-floors"
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
              <p className="mt-1 text-sm text-gray-500">{t.building.totalFloorsHelp}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t.building.saveAndContinue}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {language === 'bn' ? 'অথবা' : 'OR'}
              </span>
            </div>
          </div>

          {/* Quick Start Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Load Example Data */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {t.building.loadExampleData}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {t.building.exampleDataNote}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadExampleData}
                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
              >
                {t.building.loadExampleData}
              </button>
            </div>

            {/* Import from File */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    {language === 'bn' ? 'ফাইল থেকে ইমপোর্ট করুন' : 'Import from File'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {language === 'bn' ? 'আগের এক্সপোর্ট করা JSON ফাইল লোড করুন' : 'Load previously exported JSON file'}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isImporting
                  ? (language === 'bn' ? 'ইমপোর্ট হচ্ছে...' : 'Importing...')
                  : (language === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Choose File')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
