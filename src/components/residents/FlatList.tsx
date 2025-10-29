import { useState } from 'react';
import type { Flat } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations } from '../../utils/i18n';
import { getFlatsByFloor } from '../../utils/buildingStorage';
import FlatCard from './FlatCard';
import FlatDetail from './FlatDetail';
import FlatForm from './FlatForm';

interface FlatListProps {
  language: SupportedLanguage;
  onUpdate: () => void;
}

export default function FlatList({ language, onUpdate }: FlatListProps) {
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());

  const t = getTranslations(language);
  const flatsByFloor = getFlatsByFloor();

  const toggleFloor = (floor: string) => {
    const newCollapsed = new Set(collapsedFloors);
    if (newCollapsed.has(floor)) {
      newCollapsed.delete(floor);
    } else {
      newCollapsed.add(floor);
    }
    setCollapsedFloors(newCollapsed);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingFlat(null);
    onUpdate();
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingFlat(null);
  };

  const handleDetailUpdate = () => {
    onUpdate();
  };

  const handleEditFlat = () => {
    if (selectedFlat) {
      setEditingFlat(selectedFlat);
      setSelectedFlat(null);
    }
  };

  if (flatsByFloor.size === 0) {
    return (
      <>
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">{t.flat.noFlatsYet}</p>
          <p className="text-gray-500 mb-6">{t.flat.addFirstFlat}</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.flat.add}
          </button>
        </div>

        {showAddForm && (
          <FlatForm
            language={language}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Floor Groups */}
        {Array.from(flatsByFloor.entries()).map(([floor, flats]) => {
          const isCollapsed = collapsedFloors.has(floor);
          const floorLabel = floor === 'G' || floor.toLowerCase() === 'ground'
            ? `${t.flat.floor} ${floor} (Ground)`
            : `${t.flat.floor} ${floor}`;

          return (
            <div key={floor} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Floor Header */}
              <button
                onClick={() => toggleFloor(floor)}
                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">{floor}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{floorLabel}</h3>
                    <p className="text-sm text-gray-500">
                      {flats.length} {flats.length === 1 ? 'flat' : 'flats'}
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Flats Grid */}
              {!isCollapsed && (
                <div className="p-4 sm:p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flats.map((flat) => (
                    <FlatCard
                      key={flat.id}
                      flat={flat}
                      language={language}
                      onViewDetails={() => setSelectedFlat(flat)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
        aria-label={t.flat.add}
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Flat Detail Modal */}
      {selectedFlat && (
        <FlatDetail
          flat={selectedFlat}
          language={language}
          onClose={() => setSelectedFlat(null)}
          onUpdate={handleDetailUpdate}
          onEditFlat={handleEditFlat}
        />
      )}

      {/* Add/Edit Flat Form */}
      {(showAddForm || editingFlat) && (
        <FlatForm
          language={language}
          flat={editingFlat || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </>
  );
}
