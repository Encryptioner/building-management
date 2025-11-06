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
  const [showGuide, setShowGuide] = useState(false);
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
          `${language === 'bn' ? 'ইমপোর্ট করতে ব্যর্থ' : 'Import failed'}: ${result.error}`
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
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}icon-residents.svg`}
                alt="Residents Icon"
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t.building.welcome}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t.building.welcomeDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all font-medium text-sm sm:text-base flex items-center gap-2 ${
                showGuide
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-2 border-purple-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {language === 'bn' ? 'গাইড' : 'Guide'}
              </span>
            </button>
            <button
              onClick={handleLoadExampleData}
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
              title={t.building.loadExampleData}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">{t.building.loadExampleData}</span>
              <span className="sm:hidden">{language === 'bn' ? 'উদাহরণ' : 'Example'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="p-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={language === 'bn' ? 'ইমপোর্ট করুন' : 'Import Data'}
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">{isImporting ? t.actions.importing : (language === 'bn' ? 'ইমপোর্ট করুন' : 'Import Data')}</span>
            </button>
          </div>
        </div>

        {/* Guide Section */}
        {showGuide && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
            <button
              onClick={() => setShowGuide(false)}
              className="float-right text-purple-600 hover:text-purple-800 transition-colors"
              aria-label="Close guide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {language === 'bn' ? 'কিভাবে ব্যবহার করবেন' : 'How to Use'}
            </h3>
            <div className="space-y-3 text-sm text-purple-800">
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">1.</span>
                <p>{language === 'bn' ? 'আপনার বিল্ডিংয়ের নাম, ঠিকানা এবং মোট তলা সংখ্যা দিয়ে শুরু করুন।' : 'Start by entering your building\'s name, address, and total number of floors.'}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">2.</span>
                <p>{language === 'bn' ? 'তারপর প্রতিটি ফ্ল্যাটের জন্য বাসিন্দাদের তথ্য যোগ করুন।' : 'Then add resident information for each flat in your building.'}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">3.</span>
                <p>{language === 'bn' ? 'ডেটা এক্সপোর্ট করে JSON ফাইল হিসেবে সংরক্ষণ করুন এবং পরে ইমপোর্ট করতে পারবেন।' : 'Export your data as a JSON file and import it later when needed.'}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">4.</span>
                <p>{language === 'bn' ? 'দ্রুত শুরু করতে "উদাহরণ ডেটা লোড করুন" ক্লিক করুন।' : 'Click "Load Example Data" to quickly get started with sample information.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Note */}
        {!showGuide && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            {t.building.setupNote}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">

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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t.building.saveAndContinue}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
