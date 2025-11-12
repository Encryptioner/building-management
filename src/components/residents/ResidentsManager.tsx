import { useState, useEffect, useRef } from 'react';
import type { Building } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { loadBuilding, clearBuilding, saveBuilding } from '../../utils/buildingStorage';
import { exportBuildingData, importBuildingDataFromFile } from '../../utils/dataExport';
import { getTranslations, getConfirmationMessages } from '../../utils/i18n';
import { generateExampleBuildingData } from '../../utils/exampleBuildingData';
import BuildingSetup from './BuildingSetup';
import BuildingInfo from './BuildingInfo';
import FlatList from './FlatList';
import ResidentsPrint from './ResidentsPrint';
import ConfirmModal from '../ConfirmModal';

interface ResidentsManagerProps {
  language: SupportedLanguage;
}

export default function ResidentsManager({ language }: ResidentsManagerProps) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslations(language);
  const confirmMsgs = getConfirmationMessages(language);

  const loadBuildingData = () => {
    const data = loadBuilding();
    setBuilding(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBuildingData();
  }, []);

  const handleSetupComplete = () => {
    loadBuildingData();
  };

  const handleUpdate = () => {
    loadBuildingData();
  };

  const handleExport = () => {
    if (building) {
      exportBuildingData(building);
    }
  };

  const handleClearAll = () => {
    clearBuilding();
    setShowClearConfirm(false);
    // Reload the building data which will be null now, triggering the setup screen
    loadBuildingData();
  };

  const handleLoadExampleData = () => {
    try {
      const exampleBuilding = generateExampleBuildingData(language);
      saveBuilding(exampleBuilding);
      loadBuildingData();
    } catch (error) {
      console.error('Failed to load example data:', error);
      alert(t.errors.loadExampleFailed);
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
        loadBuildingData();
      } else {
        alert(`${t.errors.importFailed}: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert(t.errors.importFileFailed);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!building) {
    return <BuildingSetup language={language} onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}icon-residents.svg`}
                alt="Residents Icon"
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t.building.title}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t.building.welcomeDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Preview Button - Show only if there's data */}
            {building && building.flats && building.flats.length > 0 && (
              <button
                onClick={() => setShowPrint(true)}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
                title={t.actions.preview}
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">{t.actions.preview}</span>
                <span className="sm:hidden">{t.actions.previewShort}</span>
              </button>
            )}
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
                {t.actions.guide}
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
              <span className="sm:hidden">{t.actions.loadExampleShort}</span>
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
              title={t.actions.import}
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">{isImporting ? t.actions.importing : t.actions.import}</span>
            </button>
            <button
              onClick={handleExport}
              className="p-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
              title={t.actions.export}
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">{t.actions.export}</span>
            </button>
          </div>
        </div>

        {/* Guide Section */}
        {showGuide && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-4">
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
              {t.actions.howToUse}
            </h3>
            <div className="space-y-3 text-sm text-purple-800">
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">1.</span>
                <p>{t.help.residentsStep1}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">2.</span>
                <p>{t.help.residentsStep2}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">3.</span>
                <p>{t.help.residentsStep3}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">4.</span>
                <p>{t.help.residentsStep4}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Building Info Section */}
        <BuildingInfo building={building} language={language} onUpdate={handleUpdate} />

        {/* Flats List */}
        <FlatList language={language} onUpdate={handleUpdate} />
      </div>

      {/* Bottom Action Buttons - Show only if there's data */}
      {building && building.flats && building.flats.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden xs:inline">{t.actions.clearAll}</span>
              <span className="xs:hidden">{t.actions.clearShort}</span>
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden xs:inline">{t.actions.preview}</span>
              <span className="xs:hidden">{t.actions.previewShort}</span>
            </button>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrint && (
        <ResidentsPrint
          building={building}
          language={language}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <ConfirmModal
          isOpen={showClearConfirm}
          title={confirmMsgs.clearBuildingTitle}
          message={confirmMsgs.clearBuildingMessage}
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
          confirmText={confirmMsgs.confirmClear}
          cancelText={confirmMsgs.cancel}
          language={language}
          isDangerous={true}
        />
      )}
    </div>
  );
}
