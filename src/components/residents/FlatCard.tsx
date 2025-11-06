import type { Flat } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations } from '../../utils/i18n';

interface FlatCardProps {
  flat: Flat;
  language: SupportedLanguage;
  onViewDetails: () => void;
  onDelete: () => void;
}

export default function FlatCard({ flat, language, onViewDetails, onDelete }: FlatCardProps) {
  const t = getTranslations(language);

  const ownershipLabel = flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented;
  const ownershipColor = flat.ownershipType === 'owned' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{flat.flatNumber}</h4>
          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${ownershipColor}`}>
            {ownershipLabel}
          </span>
        </div>
        {/* Quick Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
          title={t.flat.delete}
          aria-label={t.flat.delete}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        {/* Residents */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>
            {flat.residents.length} {flat.residents.length === 1 ? t.resident.name : t.flat.residents}
          </span>
        </div>

        {/* Parking */}
        {(flat.motorcycleParkingCount > 0 || flat.carParkingCount > 0) && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {flat.motorcycleParkingCount > 0 && (
              <div className="flex items-center gap-1">
                <span>🏍️</span>
                <span>{flat.motorcycleParkingCount}</span>
              </div>
            )}
            {flat.carParkingCount > 0 && (
              <div className="flex items-center gap-1">
                <span>🚗</span>
                <span>{flat.carParkingCount}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View/Edit Details Button */}
      <button
        onClick={onViewDetails}
        className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {t.flat.viewDetails}
      </button>
    </div>
  );
}
