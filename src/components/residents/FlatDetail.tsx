import { useState } from 'react';
import type { Flat, Resident } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations } from '../../utils/i18n';
import { deleteFlat, deleteResident } from '../../utils/buildingStorage';
import ResidentForm from './ResidentForm';
import ResidentCard from './ResidentCard';
import ConfirmModal from '../ConfirmModal';

interface FlatDetailProps {
  flat: Flat;
  language: SupportedLanguage;
  onClose: () => void;
  onUpdate: () => void;
  onEditFlat: () => void;
}

export default function FlatDetail({ flat, language, onClose, onUpdate, onEditFlat }: FlatDetailProps) {
  const [showResidentForm, setShowResidentForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | undefined>(undefined);
  const [showDeleteFlatConfirm, setShowDeleteFlatConfirm] = useState(false);
  const [deletingResidentId, setDeletingResidentId] = useState<string | null>(null);

  const t = getTranslations(language);

  const handleDeleteFlat = () => {
    if (deleteFlat(flat.id)) {
      onUpdate();
      onClose();
    } else {
      alert('Failed to delete flat. Please try again.');
    }
  };

  const handleDeleteResident = (residentId: string) => {
    if (deleteResident(flat.id, residentId)) {
      setDeletingResidentId(null);
      onUpdate();
    } else {
      alert('Failed to delete resident. Please try again.');
    }
  };

  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setShowResidentForm(true);
  };

  const handleResidentFormSuccess = () => {
    setShowResidentForm(false);
    setEditingResident(undefined);
    onUpdate();
  };

  const handleResidentFormCancel = () => {
    setShowResidentForm(false);
    setEditingResident(undefined);
  };

  const ownershipLabel = flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented;

  // Confirmation message for deleting flat
  const deleteFlatMessage = flat.residents.length > 0
    ? t.flat.confirmDeleteWithResidents.replace('{count}', flat.residents.length.toString())
    : t.flat.confirmDelete;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {flat.flatNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  {t.flat.floor} {flat.floorNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Flat Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t.flat.details}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={onEditFlat}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {t.flat.edit}
                  </button>
                  <button
                    onClick={() => setShowDeleteFlatConfirm(true)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {t.flat.delete}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Ownership */}
                <div>
                  <p className="text-sm text-gray-500">{t.flat.ownership}</p>
                  <p className="font-medium text-gray-900">{ownershipLabel}</p>
                </div>

                {/* Parking */}
                {(flat.motorcycleParkingCount > 0 || flat.carParkingCount > 0) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Parking</p>
                    <div className="flex gap-4">
                      {flat.motorcycleParkingCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span>🏍️</span>
                          <span className="font-medium text-gray-900">{flat.motorcycleParkingCount}</span>
                        </div>
                      )}
                      {flat.carParkingCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span>🚗</span>
                          <span className="font-medium text-gray-900">{flat.carParkingCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {flat.notes && (
                  <div>
                    <p className="text-sm text-gray-500">{t.flat.notes}</p>
                    <p className="text-gray-900">{flat.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Residents Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.flat.residents} ({flat.residents.length})
                </h3>
                {!showResidentForm && (
                  <button
                    onClick={() => setShowResidentForm(true)}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.resident.add}
                  </button>
                )}
              </div>

              {/* Resident Form */}
              {showResidentForm && (
                <ResidentForm
                  language={language}
                  flatId={flat.id}
                  resident={editingResident}
                  onSuccess={handleResidentFormSuccess}
                  onCancel={handleResidentFormCancel}
                />
              )}

              {/* Residents List */}
              {flat.residents.length === 0 && !showResidentForm ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600 mb-1">{t.resident.noResidentsYet}</p>
                  <p className="text-sm text-gray-500">{t.resident.addFirstResident}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flat.residents.map((resident) => (
                    <ResidentCard
                      key={resident.id}
                      resident={resident}
                      language={language}
                      onEdit={() => handleEditResident(resident)}
                      onDelete={() => setDeletingResidentId(resident.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Flat Confirmation */}
      {showDeleteFlatConfirm && (
        <ConfirmModal
          isOpen={showDeleteFlatConfirm}
          title={t.flat.delete}
          message={deleteFlatMessage}
          confirmText={t.flat.delete}
          cancelText={t.flat.cancel}
          onConfirm={handleDeleteFlat}
          onCancel={() => setShowDeleteFlatConfirm(false)}
          language={language}
        />
      )}

      {/* Delete Resident Confirmation */}
      {deletingResidentId && (
        <ConfirmModal
          isOpen={!!deletingResidentId}
          title={t.resident.delete}
          message={t.resident.confirmDelete}
          confirmText={t.resident.delete}
          cancelText={t.resident.cancel}
          onConfirm={() => handleDeleteResident(deletingResidentId)}
          onCancel={() => setDeletingResidentId(null)}
          language={language}
        />
      )}
    </>
  );
}
