import { useState } from 'react';
import type { Resident } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getValidationMessages } from '../../utils/i18n';
import { addResident, updateResident } from '../../utils/buildingStorage';

interface ResidentFormProps {
  language: SupportedLanguage;
  flatId: string;
  resident?: Resident; // If provided, we're editing; otherwise, adding new
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResidentForm({ language, flatId, resident, onSuccess, onCancel }: ResidentFormProps) {
  const [name, setName] = useState(resident?.name || '');
  const [phone, setPhone] = useState(resident?.phone || '');
  const [email, setEmail] = useState(resident?.email || '');
  const [nid, setNid] = useState(resident?.nid || '');
  const [moveInDate, setMoveInDate] = useState(resident?.moveInDate || '');
  const [notes, setNotes] = useState(resident?.notes || '');
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const t = getTranslations(language);
  const validationMsgs = getValidationMessages(language);
  const isEditing = !!resident;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = validationMsgs.required;
    }

    if (!phone.trim()) {
      newErrors.phone = validationMsgs.required;
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
        updateResident(flatId, resident.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          nid: nid.trim() || undefined,
          moveInDate: moveInDate || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        addResident(flatId, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          nid: nid.trim() || undefined,
          moveInDate: moveInDate || undefined,
          notes: notes.trim() || undefined,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save resident:', error);
      alert('Failed to save resident data. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? t.resident.edit : t.resident.add}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="resident-name" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.name}
          </label>
          <input
            id="resident-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.resident.namePlaceholder}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{t.resident.nameHelp}</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="resident-phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.phone}
          </label>
          <input
            id="resident-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.resident.phonePlaceholder}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{t.resident.phoneHelp}</p>
        </div>

        {/* Email (Optional) */}
        <div>
          <label htmlFor="resident-email" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.email}
          </label>
          <input
            id="resident-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.resident.emailPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500">{t.resident.emailHelp}</p>
        </div>

        {/* NID (Optional) */}
        <div>
          <label htmlFor="resident-nid" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.nid}
          </label>
          <input
            id="resident-nid"
            type="text"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
            placeholder={t.resident.nidPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500">{t.resident.nidHelp}</p>
        </div>

        {/* Move-in Date (Optional) */}
        <div>
          <label htmlFor="resident-move-in-date" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.moveInDate}
          </label>
          <input
            id="resident-move-in-date"
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500">{t.resident.moveInDateHelp}</p>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="resident-notes" className="block text-sm font-medium text-gray-700 mb-2">
            {t.resident.notes}
          </label>
          <textarea
            id="resident-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.resident.notesPlaceholder}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">{t.resident.notesHelp}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t.resident.save}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t.resident.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
