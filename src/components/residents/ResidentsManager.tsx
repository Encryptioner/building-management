import { useState, useEffect } from 'react';
import type { Building } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { loadBuilding } from '../../utils/buildingStorage';
import { exportBuildingData } from '../../utils/dataExport';
import BuildingSetup from './BuildingSetup';
import BuildingInfo from './BuildingInfo';
import FlatList from './FlatList';
import ResidentsPrint from './ResidentsPrint';

interface ResidentsManagerProps {
  language: SupportedLanguage;
}

export default function ResidentsManager({ language }: ResidentsManagerProps) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);

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
      <div className="space-y-6">
        {/* Building Info Card with Action Buttons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <BuildingInfo building={building} language={language} onUpdate={handleUpdate} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {language === 'bn' ? 'এক্সপোর্ট' : 'Export'}
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {language === 'bn' ? 'প্রিন্ট' : 'Print'}
            </button>
          </div>
        </div>

        {/* Flats List */}
        <FlatList language={language} onUpdate={handleUpdate} />
      </div>

      {/* Print Modal */}
      {showPrint && (
        <ResidentsPrint
          building={building}
          language={language}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
