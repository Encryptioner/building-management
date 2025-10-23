import { useState, useEffect } from 'react';
import type { BillData, ServiceCategory } from '../types';
import type { SupportedLanguage } from '../locales/config';
import { isLanguageSupported } from '../locales/config';
import { calculateBillSummary, formatNumber } from '../utils/calculations';
import { saveBillData, loadBillData, clearBillData } from '../utils/storage';
import { getExampleData } from '../utils/exampleData';
import { getTranslations, getValidationMessages, getConfirmationMessages, getUIMessages } from '../utils/i18n';
import { numberToWords } from '../utils/numberToWords';
import CategoryForm from './CategoryForm';
import BillPreview from './BillPreview';
import BlankFormPreview from './BlankFormPreview';
import HelpSection from './HelpSection';
import LanguageSelector from './LanguageSelector';
import ConfirmModal from './ConfirmModal';

// Helper function to get empty bill data
const getEmptyBillData = (): BillData => ({
  title: '',
  numberOfFlats: 0,
  garage: {
    motorcycleSpaces: 0,
    motorcycleSpaceAmount: 0,
    motorcycleSpaceNotes: '',
    carSpaces: 0,
    carSpaceAmount: 0,
    carSpaceNotes: '',
  },
  paymentInfo: '',
  notes: '',
  categories: [],
  showMotorcycleInBlankForm: true, // Default to showing motorcycle spaces in blank form
  showCarInBlankForm: true, // Default to showing car spaces in blank form
});

export default function BillCalculator() {
  // Load language from localStorage or default to 'bn' (Bangla)
  const [language, setLanguage] = useState<SupportedLanguage>('bn');
  const [isClient, setIsClient] = useState(false);

  // Initialize language and form mode on client side only
  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && isLanguageSupported(savedLang)) {
      setLanguage(savedLang);
    }

    const savedMode = localStorage.getItem('preferred-form-mode');
    if (savedMode === 'blank' || savedMode === 'calculated') {
      setFormMode(savedMode);
    }
  }, []);

  const [billData, setBillData] = useState<BillData>(getEmptyBillData());

  // Initialize form mode from localStorage or default to 'calculated'
  const [formMode, setFormMode] = useState<'calculated' | 'blank'>('calculated');

  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Start with false to prevent flash
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    numberOfFlats?: string;
    categories?: { [key: string]: { name?: string; amount?: string } };
  }>({});

  const t = getTranslations(language);
  const validationMsgs = getValidationMessages(language);
  const confirmMsgs = getConfirmationMessages(language);
  const uiMsgs = getUIMessages(language);

  const handleToggleHelp = () => {
    if (!showHelp) {
      // Scroll to top smoothly when opening help
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowHelp(!showHelp);
  };

  // Auto-collapse header on scroll (mobile only)
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768; // md breakpoint

      // Only collapse on mobile when scrolling down and header is expanded
      if (isMobile && !isHeaderCollapsed && currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderCollapsed(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHeaderCollapsed]);

  // Load saved data when mode changes
  useEffect(() => {
    const savedData = loadBillData(formMode);
    if (savedData) {
      setBillData(savedData);
      setShowHelp(false);
    } else {
      // Reset to empty state when switching to a mode with no saved data
      setBillData(getEmptyBillData());
      setShowHelp(true);
    }
  }, [formMode]);

  // Auto-save on changes based on current mode (debounced to avoid saving empty state)
  useEffect(() => {
    // Only save if there's actual content
    if (billData.title || billData.categories.length > 0) {
      const timeoutId = setTimeout(() => {
        saveBillData(billData, formMode);
      }, 300); // Debounce to avoid excessive saves

      return () => clearTimeout(timeoutId);
    }
  }, [billData, formMode]);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  // Save form mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferred-form-mode', formMode);
  }, [formMode]);


  const validateForm = () => {
    const errors: typeof validationErrors = {};

    // Validate bill title
    if (!billData.title.trim()) {
      errors.title = validationMsgs.billTitleRequired;
    }

    // Validate number of flats
    if (!billData.numberOfFlats || billData.numberOfFlats < 1) {
      errors.numberOfFlats = validationMsgs.numberOfFlatsMin;
    }

    // Validate categories
    const categoryErrors: { [key: string]: { name?: string; amount?: string } } = {};
    billData.categories.forEach((category) => {
      const catErrors: { name?: string; amount?: string } = {};

      if (!category.name.trim()) {
        catErrors.name = validationMsgs.categoryNameRequired;
      }

      if (!category.amount || category.amount < 1) {
        catErrors.amount = validationMsgs.amountMin;
      }

      if (Object.keys(catErrors).length > 0) {
        categoryErrors[category.id] = catErrors;
      }
    });

    if (Object.keys(categoryErrors).length > 0) {
      errors.categories = categoryErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof BillData, value: string | number | boolean) => {
    setBillData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (field === 'title' || field === 'numberOfFlats') {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addCategory = () => {
    const newCategory: ServiceCategory = {
      id: Date.now().toString(),
      name: '',
      duration: '',
      info: '',
      billType: 'all-building',
      amount: 0,
    };
    setBillData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const updateCategory = (id: string, updates: Partial<ServiceCategory>) => {
    setBillData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }));

    // Clear validation errors for this category field
    if (validationErrors.categories?.[id]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.categories) {
          const catErrors = { ...newErrors.categories[id] };
          if (updates.name !== undefined) delete catErrors.name;
          if (updates.amount !== undefined) delete catErrors.amount;

          if (Object.keys(catErrors).length === 0) {
            delete newErrors.categories[id];
            if (Object.keys(newErrors.categories).length === 0) {
              delete newErrors.categories;
            }
          } else {
            newErrors.categories = { ...newErrors.categories, [id]: catErrors };
          }
        }
        return newErrors;
      });
    }
  };

  const removeCategory = (id: string) => {
    setBillData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
    }));
  };

  const loadExample = () => {
    const exampleData = getExampleData(language, formMode);
    setBillData(exampleData);
    setShowHelp(false);
  };

  const clearAll = () => {
    clearBillData(formMode); // Clear localStorage data for current mode FIRST
    setBillData(getEmptyBillData()); // Then clear state
    setValidationErrors({});
    setShowHelp(true);
    setShowClearConfirm(false);
  };

  const handleGarageChange = (field: keyof typeof billData.garage, value: string | number) => {
    setBillData((prev) => ({
      ...prev,
      garage: { ...prev.garage, [field]: value },
    }));
  };

  const summary = calculateBillSummary(billData.categories, billData.numberOfFlats, billData.garage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-20">
        {/* Collapsed Mini Header */}
        <div className={`relative bg-white shadow-md transition-all duration-300 ${
          isHeaderCollapsed ? 'h-14 opacity-100' : 'h-0 opacity-0'
        }`}>
          <div className={`h-14 flex items-center px-4 gap-3 max-w-7xl mx-auto ${
            !isHeaderCollapsed ? 'overflow-hidden' : ''
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={`${import.meta.env.BASE_URL}icon.svg`}
                alt="Service Charge Icon"
                className="w-8 h-8 flex-shrink-0"
              />
              <h1 className="text-sm md:text-lg font-bold text-gray-900 truncate">
                {t.header.title}
              </h1>
              {/* Show mode indicator */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                {formMode === 'calculated' ? t.tabs.calculatedMode : t.tabs.blankFormMode}
              </span>
            </div>
            {/* Action buttons - Desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleToggleHelp}
                className={`px-3 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                  showHelp
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{uiMsgs.quickGuide}</span>
              </button>
              <button
                onClick={loadExample}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{uiMsgs.example}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Language selector on desktop */}
              <div className="hidden md:block">
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
              </div>
              {/* Expand button - always on the right */}
              <button
                onClick={() => setIsHeaderCollapsed(false)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                aria-label="Expand header"
                title="Expand header"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Full Header */}
        <header className={`bg-white shadow-sm transition-all duration-300 ${
          isHeaderCollapsed ? 'hidden' : 'block'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
            {/* Collapse button - Fixed in top right */}
            <button
              onClick={() => setIsHeaderCollapsed(true)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md z-10"
              aria-label="Collapse header"
              title="Collapse header"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-12">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}icon.svg`}
                  alt="Service Charge Icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {t.header.title}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">{t.header.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleToggleHelp}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all font-medium text-sm sm:text-base flex items-center gap-2 ${
                  showHelp
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {uiMsgs.quickGuide}
                </span>
              </button>
              <button
                onClick={loadExample}
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">{t.actions.loadExample}</span>
                <span className="sm:hidden">{uiMsgs.example}</span>
              </button>
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setFormMode('calculated')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  formMode === 'calculated'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">{t.tabs.calculatedMode}</div>
                    <div className="text-xs opacity-75">{t.tabs.calculatedModeDesc}</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setFormMode('blank')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  formMode === 'blank'
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">{t.tabs.blankFormMode}</div>
                    <div className="text-xs opacity-75">{t.tabs.blankFormModeDesc}</div>
                  </div>
                </div>
              </button>
            </div>
            {/* Mode Description */}
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              formMode === 'calculated'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-purple-50 text-purple-800 border border-purple-200'
            }`}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  {formMode === 'calculated'
                    ? t.help.calculatedWelcome
                    : t.help.blankWelcome
                  }
                </p>
              </div>
            </div>
          </div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHelp && <HelpSection language={language} mode={formMode} onClose={() => setShowHelp(false)} />}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bill Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.billTitle} <span className="text-red-600">*</span>
                <span className="text-gray-500 text-xs ml-2">{t.form.billTitleHelp}</span>
              </label>
              <input
                type="text"
                value={billData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t.form.billTitlePlaceholder}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            {/* Number of Flats */}
            {formMode === 'calculated' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.numberOfFlats} <span className="text-red-600">*</span>
                  <span className="text-gray-500 text-xs ml-2">{t.form.numberOfFlatsHelp}</span>
                </label>
                <input
                  type="number"
                  value={billData.numberOfFlats || ''}
                  onChange={(e) => handleInputChange('numberOfFlats', parseInt(e.target.value) || 0)}
                  placeholder={t.form.numberOfFlatsPlaceholder}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.numberOfFlats ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.numberOfFlats && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.numberOfFlats}</p>
                )}
              </div>
            )}

            {/* Garage Spaces Section */}
            {formMode === 'calculated' && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {t.form.garageSpaces}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Motorcycle Spaces */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{t.form.motorcycleSpaces}</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.motorcycleSpaces}
                      <span className="text-gray-500 text-xs ml-2">{t.form.motorcycleSpacesHelp}</span>
                    </label>
                    <input
                      type="number"
                      value={billData.garage.motorcycleSpaces || ''}
                      onChange={(e) => handleGarageChange('motorcycleSpaces', parseInt(e.target.value) || 0)}
                      placeholder={t.form.motorcycleSpacesPlaceholder}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {billData.garage.motorcycleSpaces > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.form.motorcycleSpaceAmount}
                          <span className="text-gray-500 text-xs ml-2">{t.form.motorcycleSpaceAmountHelp}</span>
                        </label>
                        <input
                          type="number"
                          value={billData.garage.motorcycleSpaceAmount || ''}
                          onChange={(e) => handleGarageChange('motorcycleSpaceAmount', parseInt(e.target.value) || 0)}
                          placeholder={t.form.motorcycleSpaceAmountPlaceholder}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.form.motorcycleSpaceNotes}
                          <span className="text-gray-500 text-xs ml-2">{t.form.motorcycleSpaceNotesHelp}</span>
                        </label>
                        <textarea
                          value={billData.garage.motorcycleSpaceNotes}
                          onChange={(e) => handleGarageChange('motorcycleSpaceNotes', e.target.value)}
                          placeholder={t.form.motorcycleSpaceNotesPlaceholder}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Car Spaces */}
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{t.form.carSpaces}</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.carSpaces}
                      <span className="text-gray-500 text-xs ml-2">{t.form.carSpacesHelp}</span>
                    </label>
                    <input
                      type="number"
                      value={billData.garage.carSpaces || ''}
                      onChange={(e) => handleGarageChange('carSpaces', parseInt(e.target.value) || 0)}
                      placeholder={t.form.carSpacesPlaceholder}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {billData.garage.carSpaces > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.form.carSpaceAmount}
                          <span className="text-gray-500 text-xs ml-2">{t.form.carSpaceAmountHelp}</span>
                        </label>
                        <input
                          type="number"
                          value={billData.garage.carSpaceAmount || ''}
                          onChange={(e) => handleGarageChange('carSpaceAmount', parseInt(e.target.value) || 0)}
                          placeholder={t.form.carSpaceAmountPlaceholder}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.form.carSpaceNotes}
                          <span className="text-gray-500 text-xs ml-2">{t.form.carSpaceNotesHelp}</span>
                        </label>
                        <textarea
                          value={billData.garage.carSpaceNotes}
                          onChange={(e) => handleGarageChange('carSpaceNotes', e.target.value)}
                          placeholder={t.form.carSpaceNotesPlaceholder}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              </div>
            )}

            {/* Show Garage Spaces in Blank Form - only for blank mode */}
            {formMode === 'blank' && (
              <div className="md:col-span-2">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {t.form.garageSpaces}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Motorcycle Space Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="showMotorcycleInBlankForm"
                      checked={billData.showMotorcycleInBlankForm ?? true}
                      onChange={(e) => handleInputChange('showMotorcycleInBlankForm', e.target.checked)}
                      className="cursor-pointer mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="showMotorcycleInBlankForm" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-medium text-gray-700">
                        {t.form.showMotorcycleInBlankForm}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {t.form.showMotorcycleInBlankFormHelp}
                      </span>
                    </label>
                  </div>

                  {/* Car Space Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <input
                      type="checkbox"
                      id="showCarInBlankForm"
                      checked={billData.showCarInBlankForm ?? true}
                      onChange={(e) => handleInputChange('showCarInBlankForm', e.target.checked)}
                      className="cursor-pointer mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <label htmlFor="showCarInBlankForm" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-medium text-gray-700">
                        {t.form.showCarInBlankForm}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {t.form.showCarInBlankFormHelp}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.paymentInfo}
                <span className="text-gray-500 text-xs ml-2">{t.form.paymentInfoHelp}</span>
              </label>
              <textarea
                value={billData.paymentInfo}
                onChange={(e) => handleInputChange('paymentInfo', e.target.value)}
                placeholder={t.form.paymentInfoPlaceholder}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.notes}
                <span className="text-gray-500 text-xs ml-2">{t.form.notesHelp}</span>
              </label>
              <textarea
                value={billData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={t.form.notesPlaceholder}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t.category.title}</h2>
            <button
              onClick={addCategory}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.category.addCategory}
            </button>
          </div>

          <div className="space-y-4">
            {billData.categories.map((category) => (
              <CategoryForm
                key={category.id}
                category={category}
                language={language}
                onUpdate={(updates) => updateCategory(category.id, updates)}
                onRemove={() => removeCategory(category.id)}
                validationErrors={validationErrors.categories?.[category.id]}
                isBlankMode={formMode === 'blank'}
                onAddNew={addCategory}
              />
            ))}
          </div>

          {billData.categories.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {t.category.noCategoriesYet}
            </p>
          )}
        </div>

        {/* Summary */}
        {formMode === 'calculated' && billData.categories.length > 0 && billData.numberOfFlats > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{t.summary.flatCollectionSummary}</h2>
              <p className="text-xs opacity-75 italic">{t.summary.roundingNote}</p>
            </div>

            {/* Per Flat Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 border-b border-white/30 pb-2">{t.summary.perFlat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90">{t.summary.perFlat}</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatNumber(summary.perFlatTotal)} {t.currency}
                  </p>
                  <p className="text-xs opacity-75 mt-2">
                    {t.summary.inWords}: {numberToWords(summary.perFlatTotal, language)}
                  </p>
                  {summary.perFlatOwnerTotal > 0 && (
                    <p className="text-xs text-orange-300 mt-1">
                      ({t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.perFlatTotal + summary.perFlatOwnerTotal)} {t.currency})
                    </p>
                  )}
                </div>

                {/* Garage Space Variations */}
                {billData.garage.motorcycleSpaces > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90">{t.summary.withMotorcycleSpace}</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatNumber(summary.totalWithMotorcycle)} {t.currency}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      {t.summary.inWords}: {numberToWords(summary.totalWithMotorcycle, language)}
                    </p>
                    {summary.perFlatOwnerTotal > 0 && (
                      <p className="text-xs text-orange-300 mt-1">
                        ({t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithMotorcycle + summary.perFlatOwnerTotal)} {t.currency})
                      </p>
                    )}
                  </div>
                )}

                {billData.garage.carSpaces > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90">{t.summary.withCarSpace}</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatNumber(summary.totalWithCar)} {t.currency}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      {t.summary.inWords}: {numberToWords(summary.totalWithCar, language)}
                    </p>
                    {summary.perFlatOwnerTotal > 0 && (
                      <p className="text-xs text-orange-300 mt-1">
                        ({t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithCar + summary.perFlatOwnerTotal)} {t.currency})
                      </p>
                    )}
                  </div>
                )}

                {billData.garage.motorcycleSpaces > 0 && billData.garage.carSpaces > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90">{t.summary.withBothSpaces}</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatNumber(summary.totalWithBoth)} {t.currency}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      {t.summary.inWords}: {numberToWords(summary.totalWithBoth, language)}
                    </p>
                    {summary.perFlatOwnerTotal > 0 && (
                      <p className="text-xs text-orange-300 mt-1">
                        ({t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithBoth + summary.perFlatOwnerTotal)} {t.currency})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Total Garage Collection Summary */}
            {(billData.garage.motorcycleSpaces > 0 || billData.garage.carSpaces > 0) && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold mb-3">{t.summary.garageCollection}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {billData.garage.motorcycleSpaces > 0 && (
                    <div>
                      <p className="opacity-90">{t.summary.totalMotorcycleSpaces}:</p>
                      <p className="font-bold text-lg">
                        {billData.garage.motorcycleSpaces} × {formatNumber(billData.garage.motorcycleSpaceAmount)} = {formatNumber(billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount)} {t.currency}
                      </p>
                    </div>
                  )}
                  {billData.garage.carSpaces > 0 && (
                    <div>
                      <p className="opacity-90">{t.summary.totalCarSpaces}:</p>
                      <p className="font-bold text-lg">
                        {billData.garage.carSpaces} × {formatNumber(billData.garage.carSpaceAmount)} = {formatNumber(billData.garage.carSpaces * billData.garage.carSpaceAmount)} {t.currency}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="opacity-90">{t.summary.totalGarageCollection}:</p>
                    <p className="font-bold text-xl">
                      {formatNumber((billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount) + (billData.garage.carSpaces * billData.garage.carSpaceAmount))} {t.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Combined Total (Flats + Garage + Owner) */}
            {(() => {
              const hasGarage = (billData.garage.motorcycleSpaces > 0 || billData.garage.carSpaces > 0);
              const hasOwner = summary.grandOwnerTotal > 0;

              if (!hasGarage && !hasOwner) return null;

              const garageTotal = (billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount) + (billData.garage.carSpaces * billData.garage.carSpaceAmount);
              const combinedTotal = summary.grandTotal + garageTotal + summary.grandOwnerTotal;
              const gridColsClass = hasGarage && hasOwner ? 'grid-cols-3' :
                                    (hasGarage || hasOwner) ? 'grid-cols-2' :
                                    'grid-cols-1';

              return (
                <div className="mt-6 pt-6 border-t-2 border-white/30">
                  <h3 className="text-xl font-bold mb-3">{t.summary.combinedTotal}</h3>
                  <div className={`grid ${gridColsClass} gap-4 text-base mb-3`}>
                    <div>
                      <p className="opacity-90">{t.summary.totalFlatCollection}:</p>
                      <p className="font-bold text-xl">
                        {formatNumber(summary.grandTotal)} {t.currency}
                      </p>
                    </div>
                    {hasGarage && (
                      <div>
                        <p className="opacity-90">{t.summary.totalGarageCollection}:</p>
                        <p className="font-bold text-xl">
                          {formatNumber(garageTotal)} {t.currency}
                        </p>
                      </div>
                    )}
                    {hasOwner && (
                      <div>
                        <p className="opacity-90">{t.summary.ownerCollection}:</p>
                        <p className="font-bold text-xl">
                          {formatNumber(summary.grandOwnerTotal)} {t.currency}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="opacity-90 text-base">
                      {hasGarage && hasOwner ? t.summary.flatsPlusGarageAndOwner :
                       hasGarage ? t.summary.flatsPlusGarage :
                       hasOwner ? t.summary.flatsPlusOwner :
                       t.summary.totalFlatCollection}:
                    </p>
                    <p className="font-bold text-3xl mt-1">
                      {formatNumber(combinedTotal)} {t.currency}
                    </p>
                    <p className="text-sm opacity-75 mt-3">
                      {t.summary.inWords}: {numberToWords(combinedTotal, language)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t.actions.clearAll}
          </button>
          <button
            onClick={() => {
              if (formMode === 'calculated') {
                if (validateForm()) {
                  setShowPreview(true);
                }
              } else {
                // Blank mode - only validate title and categories exist
                if (billData.title.trim() && billData.categories.length > 0) {
                  setShowPreview(true);
                }
              }
            }}
            disabled={billData.categories.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t.actions.preview}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {t.footer.createdBy}{' '}
              <a
                href="https://encryptioner.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Ankur Mursalin
              </a>
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.linkedin.com/in/mir-mursalin-ankur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/Encryptioner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="mailto:mir.ankur.ruet13@gmail.com"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onConfirm={clearAll}
        onCancel={() => setShowClearConfirm(false)}
        title={confirmMsgs.clearAllTitle}
        message={confirmMsgs.clearAllMessage}
        confirmText={confirmMsgs.confirmButton}
        cancelText={confirmMsgs.cancelButton}
        language={language}
      />

      {/* Preview Modals */}
      {showPreview && formMode === 'calculated' && (
        <BillPreview
          billData={billData}
          language={language}
          summary={summary}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showPreview && formMode === 'blank' && (
        <BlankFormPreview
          billData={billData}
          language={language}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
