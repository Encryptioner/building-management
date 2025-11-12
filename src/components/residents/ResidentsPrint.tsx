import { useRef } from 'react';
import type { Building, Flat } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getLocaleCode, getUIMessages } from '../../utils/i18n';
import { usePDFGeneratorManual } from '../../lib/pdf-generator/hooks';
import { DEFAULT_PDF_OPTIONS, PDF_CONTENT_WIDTH_PX } from '../../utils/pdf-helpers';

interface ResidentsPrintProps {
  building: Building;
  language: SupportedLanguage;
  onClose: () => void;
}

export default function ResidentsPrint({
  building,
  language,
  onClose,
}: ResidentsPrintProps) {
  const t = getTranslations(language);
  const uiMsgs = getUIMessages(language);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date().toLocaleString(getLocaleCode(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Use shared PDF generator settings
  const {
    generatePDF: generatePDFLib,
    isGenerating: isGeneratingPDF,
    progress,
  } = usePDFGeneratorManual(DEFAULT_PDF_OPTIONS);

  const handleDownloadPDF = async () => {
    if (!offscreenRef.current) {
      alert(t.pdf?.downloading || 'Failed to generate PDF. Please try again.');
      return;
    }

    try {
      const sanitizedName = building.name
        .trim()
        .replace(/[^\w\s\u0980-\u09FF-]/g, ' ')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '');
      const fileName = `${sanitizedName}_residents_${
        new Date().toISOString().split('T')[0]
      }.pdf`;

      await generatePDFLib(offscreenRef.current, fileName);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert(t.pdf?.downloading || 'Failed to generate PDF. Please try again.');
    }
  };

  // Group flats by floor
  const flatsByFloor = building.flats.reduce((acc, flat) => {
    const floor = flat.floorNumber;
    if (!acc.has(floor)) {
      acc.set(floor, []);
    }
    acc.get(floor)!.push(flat);
    return acc;
  }, new Map<string, Flat[]>());

  // Sort floors (Ground first, then numeric)
  const sortedFloors = Array.from(flatsByFloor.keys()).sort((a, b) => {
    if (a === 'G' || a.toLowerCase() === 'ground') return -1;
    if (b === 'G' || b.toLowerCase() === 'ground') return 1;
    return parseInt(a) - parseInt(b);
  });

  // Count statistics
  const totalFlats = building.flats.length;
  const totalResidents = building.flats.reduce((sum, flat) => sum + flat.residents.length, 0);
  const ownedFlats = building.flats.filter(f => f.ownershipType === 'owned').length;
  const rentedFlats = building.flats.filter(f => f.ownershipType === 'rented').length;
  const occupiedFlats = building.flats.filter(f => f.residents.length > 0).length;
  const vacantFlats = totalFlats - occupiedFlats;

  // Separate component for PDF rendering with inline styles for PDF
  const PDFContent = () => (
    <div style={{ width: `${PDF_CONTENT_WIDTH_PX}px`, padding: '24px', margin: '0 auto', pageBreakAfter: 'auto', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid', textAlign: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #d1d5db' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827', textAlign: 'center', lineHeight: '1.2' }}>
          {t.building.residentList}
        </h1>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#2563eb', textAlign: 'center', lineHeight: '1.3' }}>{building.name}</h2>
        <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', textAlign: 'center', lineHeight: '1.5' }}>{building.address}</p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4' }}>
          {t.pdf.generatedOn}: {currentDate}
        </p>
      </div>

      {/* Statistics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', padding: '16px', border: '1px solid #bfdbfe', borderRadius: '8px', pageBreakInside: 'avoid', pageBreakAfter: 'avoid', backgroundColor: '#eff6ff', boxSizing: 'border-box' }}>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.stats.totalFlats}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', lineHeight: '1.2' }}>{totalFlats}</p>
        </div>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.stats.totalResidents}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', lineHeight: '1.2' }}>{totalResidents}</p>
        </div>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.flat.owned}</p>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a', lineHeight: '1.2' }}>{ownedFlats}</p>
        </div>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.flat.rented}</p>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#ea580c', lineHeight: '1.2' }}>{rentedFlats}</p>
        </div>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.stats.occupied}</p>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', lineHeight: '1.2' }}>{occupiedFlats}</p>
        </div>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '4px', color: '#4b5563', lineHeight: '1.5' }}>{t.stats.vacant}</p>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', lineHeight: '1.2' }}>{vacantFlats}</p>
        </div>
      </div>

      {/* Flats by Floor */}
      {sortedFloors.map((floor) => {
        const flats = flatsByFloor.get(floor)!;
        const floorLabel = floor === 'G' || floor.toLowerCase() === 'ground'
          ? `${t.flat.floor} ${floor} (Ground)`
          : `${t.flat.floor} ${floor}`;

        return (
          <div key={floor} style={{ marginBottom: '16px', pageBreakBefore: 'auto', pageBreakInside: 'avoid' }}>
            {/* Floor Header */}
            <div style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid', padding: '8px 12px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '2px solid #d1d5db', backgroundColor: '#f3f4f6' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#111827', lineHeight: '1.4' }}>{floorLabel}</h3>
              <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>
                {flats.length} {flats.length === 1 ? t.pdf.flat : t.pdf.flats}
              </p>
            </div>

            {/* Flats */}
            <div style={{ border: '1px solid #d1d5db', borderTop: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', overflow: 'hidden' }}>
              {flats.map((flat, idx) => (
                <div
                  key={flat.id}
                  style={{
                    padding: '12px',
                    pageBreakInside: 'avoid',
                    backgroundColor: flat.residents.length === 0 ? '#f9fafb' : 'transparent',
                    borderTop: idx > 0 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  {/* Flat Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{flat.flatNumber}</span>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: flat.ownershipType === 'owned' ? '#dcfce7' : '#ffedd5',
                          color: flat.ownershipType === 'owned' ? '#15803d' : '#c2410c'
                        }}
                      >
                        {flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563' }}>
                      {flat.motorcycleParkingCount > 0 && (
                        <span style={{ marginRight: '12px' }}>
                          M: {flat.motorcycleParkingCount}
                        </span>
                      )}
                      {flat.carParkingCount > 0 && (
                        <span>
                          C: {flat.carParkingCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Residents */}
                  {flat.residents.length === 0 ? (
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280' }}>
                      {t.pdf.noResidents}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {flat.residents.map((resident) => (
                        <div key={resident.id} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #e5e7eb', pageBreakInside: 'avoid', backgroundColor: '#f9fafb' }}>
                          <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '6px', color: '#111827', lineHeight: '1.4' }}>{resident.name}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#4b5563', lineHeight: '1.5' }}>
                            {resident.phone && (
                              <div>
                                <span style={{ fontWeight: '500' }}>{t.pdf.phone}:</span>{' '}
                                {resident.phone}
                              </div>
                            )}
                            {resident.email && (
                              <div>
                                <span style={{ fontWeight: '500' }}>{t.pdf.email}:</span>{' '}
                                {resident.email}
                              </div>
                            )}
                            {resident.nid && (
                              <div>
                                <span style={{ fontWeight: '500' }}>{t.pdf.nid}:</span>{' '}
                                {resident.nid}
                              </div>
                            )}
                            {resident.moveInDate && (
                              <div>
                                <span style={{ fontWeight: '500' }}>{t.pdf.moveIn}:</span>{' '}
                                {new Date(resident.moveInDate).toLocaleDateString(getLocaleCode(language))}
                              </div>
                            )}
                          </div>
                          {resident.notes && (
                            <p style={{ fontSize: '12px', marginTop: '6px', fontStyle: 'italic', color: '#4b5563', lineHeight: '1.5' }}>{resident.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flat Notes */}
                  {flat.notes && (
                    <p style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: '8px', color: '#4b5563', lineHeight: '1.5' }}>
                      {flat.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #d1d5db', textAlign: 'center', fontSize: '12px', pageBreakBefore: 'auto', pageBreakInside: 'avoid', color: '#6b7280' }}>
        <p style={{ textAlign: 'center', lineHeight: '1.5' }}>
          {uiMsgs.generatedFrom}:{' '}
          <a 
            href={window.location.href} 
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            {window.location.href}
          </a>
        </p>
      </div>
    </div>
  );

  // Preview component with responsive styling for modal display
  const PrintContent = () => (
    <div className="bg-white p-4 sm:p-8 max-w-4xl mx-auto min-w-[300px]">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-300">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
          {t.building.residentList}
        </h1>
        <h2 className="text-base sm:text-xl font-semibold text-blue-600 mb-1 break-words">{building.name}</h2>
        <p className="text-sm sm:text-base text-gray-600 break-words">{building.address}</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          {t.pdf.generatedOn}: {currentDate}
        </p>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.stats.totalFlats}</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{totalFlats}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.stats.totalResidents}</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{totalResidents}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.flat.owned}</p>
          <p className="text-base sm:text-xl font-semibold text-green-600">{ownedFlats}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.flat.rented}</p>
          <p className="text-base sm:text-xl font-semibold text-orange-600">{rentedFlats}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.stats.occupied}</p>
          <p className="text-base sm:text-xl font-semibold text-gray-700">{occupiedFlats}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{t.stats.vacant}</p>
          <p className="text-base sm:text-xl font-semibold text-gray-700">{vacantFlats}</p>
        </div>
      </div>

      {/* Flats by Floor */}
      {sortedFloors.map((floor) => {
        const flats = flatsByFloor.get(floor)!;
        const floorLabel = floor === 'G' || floor.toLowerCase() === 'ground'
          ? `${t.flat.floor} ${floor} (Ground)`
          : `${t.flat.floor} ${floor}`;

        return (
          <div key={floor} className="mb-4 sm:mb-6">
            {/* Floor Header */}
            <div className="bg-gray-100 px-3 sm:px-4 py-2 rounded-t-lg border-b-2 border-gray-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{floorLabel}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {flats.length} {flats.length === 1 ? t.pdf.flat : t.pdf.flats}
              </p>
            </div>

            {/* Flats */}
            <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
              {flats.map((flat, idx) => (
                <div
                  key={flat.id}
                  className={`p-3 sm:p-4 ${idx > 0 ? 'border-t border-gray-200' : ''} ${
                    flat.residents.length === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Flat Header */}
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-gray-900 break-all">{flat.flatNumber}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          flat.ownershipType === 'owned'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented}
                      </span>
                    </div>
                    <div className="text-right text-xs sm:text-sm text-gray-600 flex-shrink-0">
                      {flat.motorcycleParkingCount > 0 && (
                        <span className="mr-2 sm:mr-3 whitespace-nowrap">
                          M: {flat.motorcycleParkingCount}
                        </span>
                      )}
                      {flat.carParkingCount > 0 && (
                        <span className="whitespace-nowrap">
                          C: {flat.carParkingCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Residents */}
                  {flat.residents.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500 italic">
                      {t.pdf.noResidents}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {flat.residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{resident.name}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                            {resident.phone && (
                              <div className="break-all">
                                <span className="font-medium">{t.pdf.phone}:</span>{' '}
                                {resident.phone}
                              </div>
                            )}
                            {resident.email && (
                              <div className="break-all">
                                <span className="font-medium">{t.pdf.email}:</span>{' '}
                                {resident.email}
                              </div>
                            )}
                            {resident.nid && (
                              <div className="break-all">
                                <span className="font-medium">{t.pdf.nid}:</span>{' '}
                                {resident.nid}
                              </div>
                            )}
                            {resident.moveInDate && (
                              <div className="break-all">
                                <span className="font-medium">{t.pdf.moveIn}:</span>{' '}
                                {new Date(resident.moveInDate).toLocaleDateString(getLocaleCode(language))}
                              </div>
                            )}
                          </div>
                          {resident.notes && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 italic break-words">{resident.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flat Notes */}
                  {flat.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 italic border-t border-gray-200 pt-2 break-words">
                      {flat.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="mt-4 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-300 text-center text-xs sm:text-sm text-gray-500">
        <p className="break-words">
          {uiMsgs.generatedFrom}:{' '}
          <a 
            href={window.location.href} 
            className="text-blue-600 underline"
          >
            {window.location.href}
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate pr-2">
              {t.building.residentListPreview}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label={t.preview.close}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable Preview */}
          <div className="flex-1 overflow-auto p-3 sm:p-6 bg-gray-50">
            <div className="min-w-min">
              <PrintContent />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 p-3 sm:p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isGeneratingPDF}
              className="px-3 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.preview.close}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden xs:inline">{progress > 0 ? `${progress}%` : t.pdf.downloading}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden xs:inline">{t.actions.download}</span>
                  <span className="xs:hidden">{t.actions.downloadShort}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offscreen rendering for PDF generation - Fixed width for consistent output */}
      <div
        className="fixed -left-[9999px] -top-[9999px]"
        style={{ width: `${PDF_CONTENT_WIDTH_PX}px` }} // Calculated PDF usable width
      >
        <div ref={offscreenRef} style={{ width: `${PDF_CONTENT_WIDTH_PX}px` }}>
          <PDFContent />
        </div>
      </div>
    </>
  );
}
