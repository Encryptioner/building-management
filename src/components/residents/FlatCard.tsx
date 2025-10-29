import type { Flat } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations } from '../../utils/i18n';

interface FlatCardProps {
  flat: Flat;
  language: SupportedLanguage;
  onViewDetails: () => void;
}

export default function FlatCard({ flat, language, onViewDetails }: FlatCardProps) {
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

      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
      >
        {t.flat.viewDetails}
      </button>
    </div>
  );
}
