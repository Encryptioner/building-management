import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import type { Building, Flat } from '../../types';
import type { SupportedLanguage } from '../../locales/config';
import { getTranslations, getLocaleCode } from '../../utils/i18n';

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
  const printRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const currentDate = new Date().toLocaleString(getLocaleCode(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Small delay to allow UI to update with loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!offscreenRef.current) {
        setIsGeneratingPDF(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Use jsPDF's html method for better pagination that respects element boundaries
      await pdf.html(offscreenRef.current, {
        callback: function (pdf) {
          const sanitizedName = building.name
            .trim()
            .replace(/[^\w\s\u0980-\u09FF-]/g, ' ')
            .replace(/\s+/g, '_')
            .replace(/^_+|_+$/g, '');
          const fileName = `${sanitizedName}_residents_${
            new Date().toISOString().split('T')[0]
          }.pdf`;
          pdf.save(fileName);
          setIsGeneratingPDF(false);
        },
        x: 10,
        y: 10,
        html2canvas: {
          scale: 0.75, // Lower scale for better page fitting
          logging: false,
          useCORS: true,
          allowTaint: true,
        },
        autoPaging: 'text', // Automatically paginate while respecting text boundaries
        margin: [10, 10, 10, 10], // Top, Right, Bottom, Left margins in mm
        width: 190, // Content width (210 - 20 for margins)
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setIsGeneratingPDF(false);
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

  // Separate component for PDF rendering with fixed styling (no responsive classes)
  const PDFContent = () => (
    <div className="bg-white p-6 max-w-4xl mx-auto" style={{ width: '794px', pageBreakAfter: 'auto' }}>
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b-2 border-gray-300" style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t.building.residentList}
        </h1>
        <h2 className="text-lg font-semibold text-blue-600 mb-1">{building.name}</h2>
        <p className="text-sm text-gray-600">{building.address}</p>
        <p className="text-xs text-gray-500 mt-1">
          {t.pdf.generatedOn}: {currentDate}
        </p>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
        <div>
          <p className="text-sm text-gray-600">{t.stats.totalFlats}</p>
          <p className="text-2xl font-bold text-blue-600">{totalFlats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t.stats.totalResidents}</p>
          <p className="text-2xl font-bold text-blue-600">{totalResidents}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t.flat.owned}</p>
          <p className="text-xl font-semibold text-green-600">{ownedFlats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t.flat.rented}</p>
          <p className="text-xl font-semibold text-orange-600">{rentedFlats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t.stats.occupied}</p>
          <p className="text-xl font-semibold text-gray-700">{occupiedFlats}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t.stats.vacant}</p>
          <p className="text-xl font-semibold text-gray-700">{vacantFlats}</p>
        </div>
      </div>

      {/* Flats by Floor */}
      {sortedFloors.map((floor) => {
        const flats = flatsByFloor.get(floor)!;
        const floorLabel = floor === 'G' || floor.toLowerCase() === 'ground'
          ? `${t.flat.floor} ${floor} (Ground)`
          : `${t.flat.floor} ${floor}`;

        return (
          <div key={floor} className="mb-3" style={{ pageBreakBefore: 'auto', pageBreakInside: 'avoid' }}>
            {/* Floor Header */}
            <div className="bg-gray-100 px-3 py-1 rounded-t-lg border-b-2 border-gray-300" style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}>
              <h3 className="text-base font-bold text-gray-900">{floorLabel}</h3>
              <p className="text-xs text-gray-600">
                {flats.length} {flats.length === 1 ? t.pdf.flat : t.pdf.flats}
              </p>
            </div>

            {/* Flats */}
            <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
              {flats.map((flat, idx) => (
                <div
                  key={flat.id}
                  className={`p-2 ${idx > 0 ? 'border-t border-gray-200' : ''} ${
                    flat.residents.length === 0 ? 'bg-gray-50' : ''
                  }`}
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {/* Flat Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">{flat.flatNumber}</span>
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${
                          flat.ownershipType === 'owned'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      {flat.motorcycleParkingCount > 0 && (
                        <span className="mr-3">
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
                    <p className="text-xs text-gray-500 italic">
                      {t.pdf.noResidents}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {flat.residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 p-2 rounded border border-gray-200" style={{ pageBreakInside: 'avoid' }}>
                          <p className="font-semibold text-sm text-gray-900">{resident.name}</p>
                          <div className="grid grid-cols-2 gap-1 mt-0.5 text-xs text-gray-600">
                            {resident.phone && (
                              <div>
                                <span className="font-medium">{t.pdf.phone}:</span>{' '}
                                {resident.phone}
                              </div>
                            )}
                            {resident.email && (
                              <div>
                                <span className="font-medium">{t.pdf.email}:</span>{' '}
                                {resident.email}
                              </div>
                            )}
                            {resident.nid && (
                              <div>
                                <span className="font-medium">{t.pdf.nid}:</span>{' '}
                                {resident.nid}
                              </div>
                            )}
                            {resident.moveInDate && (
                              <div>
                                <span className="font-medium">{t.pdf.moveIn}:</span>{' '}
                                {new Date(resident.moveInDate).toLocaleDateString(getLocaleCode(language))}
                              </div>
                            )}
                          </div>
                          {resident.notes && (
                            <p className="text-xs text-gray-600 mt-0.5 italic">{resident.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flat Notes */}
                  {flat.notes && (
                    <p className="text-xs text-gray-600 mt-1 italic border-t border-gray-200 pt-1">
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
      <div className="mt-4 pt-2 border-t border-gray-300 text-center text-xs text-gray-500" style={{ pageBreakBefore: 'auto', pageBreakInside: 'avoid' }}>
        <p>
          {t.pdf.generatedBy}{' '}
          <a href={window.location.href} className="text-blue-600 underline">
            {window.location.hostname + window.location.pathname}
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
          {t.pdf.generatedBy}{' '}
          <span className="font-semibold">{t.navigation.appTitle}</span>
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

          {/* Modal Body - Scrollable Preview with horizontal scroll support */}
          <div className="flex-1 overflow-auto p-3 sm:p-6 bg-gray-50">
            <div ref={printRef} className="min-w-min">
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
                  <span className="hidden xs:inline">{t.pdf.downloading}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden xs:inline">{t.actions.download}</span>
                  <span className="xs:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offscreen rendering for PDF generation - Fixed width for consistent output */}
      <div
        className="fixed -left-[9999px] -top-[9999px]"
        style={{ width: '794px' }} // A4 width at 96 DPI
      >
        <div ref={offscreenRef} style={{ width: '794px' }}>
          <PDFContent />
        </div>
      </div>
    </>
  );
}
