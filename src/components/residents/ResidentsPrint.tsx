import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  const generateCanvas = async () => {
    if (!offscreenRef.current) return null;

    // Inject CSS to override OKLCH color variables with hex equivalents
    const styleOverride = document.createElement('style');
    styleOverride.id = 'pdf-color-override';
    styleOverride.textContent = `
      :root, :host, * {
        --color-blue-50: #eff6ff !important;
        --color-blue-100: #dbeafe !important;
        --color-blue-200: #bfdbfe !important;
        --color-blue-600: #2563eb !important;
        --color-blue-700: #1d4ed8 !important;
        --color-green-50: #f0fdf4 !important;
        --color-green-100: #dcfce7 !important;
        --color-green-200: #bbf7d0 !important;
        --color-green-600: #16a34a !important;
        --color-green-700: #15803d !important;
        --color-orange-50: #fff7ed !important;
        --color-orange-100: #ffedd5 !important;
        --color-orange-200: #fed7aa !important;
        --color-orange-600: #ea580c !important;
        --color-orange-700: #c2410c !important;
        --color-gray-50: #f9fafb !important;
        --color-gray-100: #f3f4f6 !important;
        --color-gray-200: #e5e7eb !important;
        --color-gray-300: #d1d5db !important;
        --color-gray-400: #9ca3af !important;
        --color-gray-500: #6b7280 !important;
        --color-gray-600: #4b5563 !important;
        --color-gray-700: #374151 !important;
        --color-gray-800: #1f2937 !important;
        --color-gray-900: #111827 !important;
        --color-black: #000000 !important;
        --color-white: #ffffff !important;
      }

      /* Force specific background colors for print */
      .bg-blue-50 { background-color: #eff6ff !important; }
      .bg-blue-100 { background-color: #dbeafe !important; }
      .bg-green-50 { background-color: #f0fdf4 !important; }
      .bg-green-100 { background-color: #dcfce7 !important; }
      .bg-orange-50 { background-color: #fff7ed !important; }
      .bg-orange-100 { background-color: #ffedd5 !important; }
      .bg-gray-50 { background-color: #f9fafb !important; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
      .bg-gray-200 { background-color: #e5e7eb !important; }

      /* Border colors */
      .border-blue-200 { border-color: #bfdbfe !important; }
      .border-green-200 { border-color: #bbf7d0 !important; }
      .border-orange-200 { border-color: #fed7aa !important; }
      .border-gray-200 { border-color: #e5e7eb !important; }
      .border-gray-300 { border-color: #d1d5db !important; }

      /* Text colors */
      .text-blue-600 { color: #2563eb !important; }
      .text-blue-700 { color: #1d4ed8 !important; }
      .text-green-600 { color: #16a34a !important; }
      .text-green-700 { color: #15803d !important; }
      .text-orange-600 { color: #ea580c !important; }
      .text-orange-700 { color: #c2410c !important; }
      .text-gray-500 { color: #6b7280 !important; }
      .text-gray-600 { color: #4b5563 !important; }
      .text-gray-700 { color: #374151 !important; }
      .text-gray-800 { color: #1f2937 !important; }
      .text-gray-900 { color: #111827 !important; }
    `;
    document.head.appendChild(styleOverride);

    // Wait a tick for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(offscreenRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: false,
      imageTimeout: 0,
      width: 794, // A4 width in pixels at 96 DPI (210mm)
      windowWidth: 794,
    });

    // Remove the style override
    document.head.removeChild(styleOverride);

    return canvas;
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Small delay to allow UI to update with loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await generateCanvas();
      if (!canvas) {
        setIsGeneratingPDF(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // A4 dimensions (in mm) with margins
      const marginTop = 10;
      const marginBottom = 10;
      const usableHeight = pdfHeight - marginTop - marginBottom;

      // Convert to pixels (96 DPI: 1mm = 3.7795px)
      const pageHeightPx = usableHeight * 3.7795;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate how many pages we need
      let heightLeft = canvasHeight;
      let position = 0;
      let pageNumber = 0;

      while (heightLeft > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        // Create a temporary canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = Math.min(pageHeightPx, heightLeft);

        const ctx = pageCanvas.getContext('2d');
        if (!ctx) break;

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw the portion of the full canvas that fits on this page
        ctx.drawImage(
          canvas,
          0, position,           // Source x, y
          canvasWidth, pageCanvas.height, // Source width, height
          0, 0,                  // Dest x, y
          canvasWidth, pageCanvas.height  // Dest width, height
        );

        const pageImgData = pageCanvas.toDataURL('image/png');

        // Calculate dimensions to fit the page width with margins
        const imgWidth = pdfWidth;
        const imgHeight = (pageCanvas.height * pdfWidth) / canvasWidth;

        pdf.addImage(
          pageImgData,
          'PNG',
          0,
          marginTop,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeightPx;
        position += pageHeightPx;
        pageNumber++;
      }

      const sanitizedName = building.name
        .trim()
        .replace(/[^\w\s\u0980-\u09FF-]/g, ' ') // Replace special chars with space
        .replace(/\s+/g, '_') // Replace multiple spaces with single underscore
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
      const fileName = `${sanitizedName}_residents_${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      pdf.save(fileName);

      setIsGeneratingPDF(false);
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
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ width: '794px' }}>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.building.residentList}
        </h1>
        <h2 className="text-xl font-semibold text-blue-600 mb-1">{building.name}</h2>
        <p className="text-gray-600">{building.address}</p>
        <p className="text-sm text-gray-500 mt-2">
          {t.pdf.generatedOn}: {currentDate}
        </p>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
          <div key={floor} className="mb-6">
            {/* Floor Header */}
            <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b-2 border-gray-300">
              <h3 className="text-lg font-bold text-gray-900">{floorLabel}</h3>
              <p className="text-sm text-gray-600">
                {flats.length} {flats.length === 1 ? t.pdf.flat : t.pdf.flats}
              </p>
            </div>

            {/* Flats */}
            <div className="border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
              {flats.map((flat, idx) => (
                <div
                  key={flat.id}
                  className={`p-4 ${idx > 0 ? 'border-t border-gray-200' : ''} ${
                    flat.residents.length === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Flat Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{flat.flatNumber}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          flat.ownershipType === 'owned'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {flat.ownershipType === 'owned' ? t.flat.owned : t.flat.rented}
                      </span>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {flat.motorcycleParkingCount > 0 && (
                        <span className="mr-3">
                          🏍️ {flat.motorcycleParkingCount}
                        </span>
                      )}
                      {flat.carParkingCount > 0 && (
                        <span>
                          🚗 {flat.carParkingCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Residents */}
                  {flat.residents.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      {t.pdf.noResidents}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {flat.residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="font-semibold text-gray-900">{resident.name}</p>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-sm text-gray-600">
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
                            <p className="text-sm text-gray-600 mt-1 italic">{resident.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flat Notes */}
                  {flat.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic border-t border-gray-200 pt-2">
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
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
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
                        {flat.ownershipType === 'owned'
                          ? (language === 'bn' ? 'মালিকানা' : 'Owned')
                          : (language === 'bn' ? 'ভাড়া' : 'Rented')}
                      </span>
                    </div>
                    <div className="text-right text-xs sm:text-sm text-gray-600 flex-shrink-0">
                      {flat.motorcycleParkingCount > 0 && (
                        <span className="mr-2 sm:mr-3 whitespace-nowrap">
                          🏍️ {flat.motorcycleParkingCount}
                        </span>
                      )}
                      {flat.carParkingCount > 0 && (
                        <span className="whitespace-nowrap">
                          🚗 {flat.carParkingCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Residents */}
                  {flat.residents.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500 italic">
                      {language === 'bn' ? 'কোনো বাসিন্দা নেই (খালি)' : 'No residents (Vacant)'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {flat.residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{resident.name}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                            {resident.phone && (
                              <div className="break-all">
                                <span className="font-medium">{language === 'bn' ? 'ফোন' : 'Phone'}:</span>{' '}
                                {resident.phone}
                              </div>
                            )}
                            {resident.email && (
                              <div className="break-all">
                                <span className="font-medium">{language === 'bn' ? 'ইমেইল' : 'Email'}:</span>{' '}
                                {resident.email}
                              </div>
                            )}
                            {resident.nid && (
                              <div className="break-all">
                                <span className="font-medium">{language === 'bn' ? 'এনআইডি' : 'NID'}:</span>{' '}
                                {resident.nid}
                              </div>
                            )}
                            {resident.moveInDate && (
                              <div className="break-all">
                                <span className="font-medium">{language === 'bn' ? 'প্রবেশ তারিখ' : 'Move-in'}:</span>{' '}
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
          {language === 'bn' ? 'তৈরি করেছেন' : 'Generated by'}{' '}
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
              {t.building.residentListPreview || (language === 'bn' ? 'বাসিন্দা তালিকা প্রিভিউ' : 'Resident List Preview')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
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
              className="px-3 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden xs:inline">{language === 'bn' ? 'PDF ডাউনলোড করুন' : 'Download PDF'}</span>
              <span className="xs:hidden">PDF</span>
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
