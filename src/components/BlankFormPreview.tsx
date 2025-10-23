import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BillData } from '../types';
import type { SupportedLanguage } from '../locales/config';
import { getTranslations, getLocaleCode, getUIMessages } from '../utils/i18n';

interface BlankFormPreviewProps {
  billData: BillData;
  language: SupportedLanguage;
  onClose: () => void;
}

export default function BlankFormPreview({
  billData,
  language,
  onClose,
}: BlankFormPreviewProps) {
  const t = getTranslations(language);
  const uiMsgs = getUIMessages(language);
  const printRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);
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
        --color-red-600: #dc2626 !important;
        --color-red-700: #b91c1c !important;
        --color-yellow-50: #fefce8 !important;
        --color-yellow-100: #fef9c3 !important;
        --color-yellow-200: #fef08a !important;
        --color-yellow-300: #fde047 !important;
        --color-green-50: #f0fdf4 !important;
        --color-green-100: #dcfce7 !important;
        --color-green-600: #16a34a !important;
        --color-green-700: #15803d !important;
        --color-blue-50: #eff6ff !important;
        --color-blue-100: #dbeafe !important;
        --color-blue-200: #bfdbfe !important;
        --color-blue-300: #93c5fd !important;
        --color-blue-400: #60a5fa !important;
        --color-blue-500: #3b82f6 !important;
        --color-blue-600: #2563eb !important;
        --color-blue-700: #1d4ed8 !important;
        --color-purple-50: #faf5ff !important;
        --color-purple-100: #f3e8ff !important;
        --color-purple-200: #e9d5ff !important;
        --color-purple-600: #9333ea !important;
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
      .bg-blue-200 { background-color: #bfdbfe !important; }
      .bg-purple-50 { background-color: #faf5ff !important; }
      .bg-purple-100 { background-color: #f3e8ff !important; }
      .bg-purple-200 { background-color: #e9d5ff !important; }
      .bg-green-50 { background-color: #f0fdf4 !important; }
      .bg-green-100 { background-color: #dcfce7 !important; }
      .bg-yellow-50 { background-color: #fefce8 !important; }
      .bg-yellow-100 { background-color: #fef9c3 !important; }
      .bg-gray-50 { background-color: #f9fafb !important; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
      .bg-gray-200 { background-color: #e5e7eb !important; }

      /* Border colors */
      .border-blue-200 { border-color: #bfdbfe !important; }
      .border-blue-300 { border-color: #93c5fd !important; }
      .border-purple-200 { border-color: #e9d5ff !important; }
      .border-purple-300 { border-color: #e9d5ff !important; }
      .border-yellow-200 { border-color: #fef08a !important; }
      .border-gray-200 { border-color: #e5e7eb !important; }
      .border-gray-300 { border-color: #d1d5db !important; }
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

  const getSanitizedFileName = (extension: string) => {
    let fileName = `blank_service_charge_form.${extension}`;
    if (billData.title && billData.title.trim()) {
      // Remove special characters and replace spaces with underscores
      const sanitized = billData.title
        .trim()
        .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep alphanumeric, spaces, and Bangla characters
        .replace(/\s+/g, '_') // Replace spaces with underscore
        .substring(0, 50); // Limit length
      fileName = sanitized ? `${sanitized}_blank.${extension}` : `blank_service_charge_form.${extension}`;
    }
    return fileName;
  };

  const handleDownloadImage = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      // Convert canvas to blob and download as JPEG
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getSanitizedFileName('jpg');
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.9); // 90% quality for image download
    } catch (error) {
      console.error('Error generating image:', error);
      alert(uiMsgs.imageGenerationError);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;

      // Use JPEG format with compression instead of PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // 85% quality for good balance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable PDF compression
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        'JPEG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(getSanitizedFileName('pdf'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(uiMsgs.pdfGenerationError);
    }
  };

  const BlankFormContent = () => (
    <>
      {/* Bill Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {billData.title || t.header.title}
        </h1>
        <p className="text-sm font-semibold text-blue-600">
          {uiMsgs.numberOfFlats}: <span className="inline-block min-w-[60px] border-b-2 border-blue-500 border-dashed mx-1"></span>
        </p>
      </div>

      {/* Owner-Only Categories Table - Blank Form */}
      {billData.categories.some(cat => cat.isOwnerOnly) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>{t.summary.ownerCollection}</span>
            <span className="text-sm font-normal text-orange-700">({t.category.isOwnerOnly})</span>
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-50 border-t-4 border-orange-600 border-b-2 border-gray-800">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  {t.preview.category}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  {t.preview.duration}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  {t.preview.info}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  {t.preview.type}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold">
                  {t.preview.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              {billData.categories.filter(cat => cat.isOwnerOnly).map((category) => {
                return (
                  <tr key={category.id}>
                    <td className="border border-gray-300 px-3 py-2 font-bold text-sm bg-orange-50">
                      {category.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.duration}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.info}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.billType === 'single-flat'
                        ? t.category.singleFlat
                        : t.category.allBuilding}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium text-sm">
                      <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-orange-50 font-bold border-t-2 border-gray-800">
                <td
                  colSpan={4}
                  className="border border-gray-300 px-3 py-1 text-sm text-right"
                >
                  {t.summary.perFlat} ({t.summary.ownerNote}):
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right font-medium text-sm">
                  <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td
                  colSpan={5}
                  className="border border-gray-300 px-3 py-1 text-right text-xs text-gray-600 italic"
                >
                  {t.summary.inWords}: <span className="inline-block min-w-[300px] border-b border-gray-400 border-dashed ml-2"></span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Regular Categories Table - Blank Form */}
      {billData.categories.some(cat => !cat.isOwnerOnly) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t.category.title}
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                  {t.preview.category}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                  {t.preview.duration}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                  {t.preview.info}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                  {t.preview.type}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm">
                  {t.preview.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              {billData.categories.filter(cat => !cat.isOwnerOnly).map((category) => {
                return (
                  <tr key={category.id}>
                    <td className="border border-gray-300 px-3 py-2 font-medium text-sm">
                      {category.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.duration}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.info}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {category.billType === 'single-flat'
                        ? t.category.singleFlat
                        : t.category.allBuilding}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium text-sm">
                      <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              {billData.categories.some(cat => cat.isOwnerOnly) ? (
                <>
                  <td
                    colSpan={2}
                    className="border border-gray-300 px-2 py-1 text-xs text-orange-700 font-normal text-left"
                  >
                    {t.summary.ownerNote}: +<span className="inline-block min-w-[50px] border-b border-orange-400 border-dashed mx-1"></span> = <span className="inline-block min-w-[50px] border-b border-orange-400 border-dashed mx-1"></span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-300 px-3 py-1 text-sm text-right"
                  >
                    {t.summary.perFlat}:
                  </td>
                </>
              ) : (
                <td
                  colSpan={4}
                  className="border border-gray-300 px-3 py-1 text-sm text-right"
                >
                  {t.summary.perFlat}:
                </td>
              )}
              <td className="border border-gray-300 px-1 py-1 text-right">
                <div className="min-h-[28px] border-b-2 border-gray-500 border-dashed"></div>
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td
                colSpan={5}
                className="border border-gray-300 px-3 py-1 text-right text-xs text-gray-600 italic"
              >
                {t.summary.inWords}: <span className="inline-block min-w-[300px] border-b border-gray-400 border-dashed ml-2"></span>
              </td>
            </tr>

            {/* Garage space variations - with blank spaces - only show if enabled */}
            {billData.showMotorcycleInBlankForm && (
              <tr className="bg-gray-50 font-medium">
                {billData.categories.some(cat => cat.isOwnerOnly) ? (
                  <>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-2 py-1 text-xs text-orange-700 font-normal text-left"
                    >
                      {t.summary.ownerNote}: +<span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span> = <span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span>
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-3 py-1 text-xs text-right"
                    >
                      {t.summary.withMotorcycleSpace}:
                    </td>
                  </>
                ) : (
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-3 py-1 text-xs text-right"
                  >
                    {t.summary.withMotorcycleSpace}:
                  </td>
                )}
                <td className="border border-gray-300 px-3 py-1 text-right text-xs">
                  <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                </td>
              </tr>
            )}

            {billData.showCarInBlankForm && (
              <tr className="bg-gray-50 font-medium">
                {billData.categories.some(cat => cat.isOwnerOnly) ? (
                  <>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-2 py-1 text-xs text-orange-700 font-normal text-left"
                    >
                      {t.summary.ownerNote}: +<span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span> = <span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span>
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-3 py-1 text-xs text-right"
                    >
                      {t.summary.withCarSpace}:
                    </td>
                  </>
                ) : (
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-3 py-1 text-xs text-right"
                  >
                    {t.summary.withCarSpace}:
                  </td>
                )}
                <td className="border border-gray-300 px-3 py-1 text-right text-xs">
                  <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                </td>
              </tr>
            )}

            {billData.showMotorcycleInBlankForm && billData.showCarInBlankForm && (
              <tr className="bg-gray-50 font-medium">
                {billData.categories.some(cat => cat.isOwnerOnly) ? (
                  <>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-2 py-1 text-xs text-orange-700 font-normal text-left"
                    >
                      {t.summary.ownerNote}: +<span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span> = <span className="inline-block min-w-[40px] border-b border-orange-400 border-dashed mx-1"></span>
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-3 py-1 text-xs text-right"
                    >
                      {t.summary.withBothSpaces}:
                    </td>
                  </>
                ) : (
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-3 py-1 text-xs text-right"
                  >
                    {t.summary.withBothSpaces}:
                  </td>
                )}
                <td className="border border-gray-300 px-3 py-1 text-right text-xs">
                  <div className="min-h-[24px] border-b border-gray-400 border-dashed"></div>
                </td>
              </tr>
            )}
          </tfoot>
        </table>
        </div>
      )}

      {/* Garage Space Information - Blank Form - Only show if either is enabled */}
      {(billData.showMotorcycleInBlankForm || billData.showCarInBlankForm) && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {t.summary.garageCollection}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billData.showMotorcycleInBlankForm && (
                <div className="p-3 bg-gray-100 rounded border border-gray-300">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{t.form.motorcycleSpaces}</h3>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="font-medium">{t.summary.totalMotorcycleSpaces}:</span>
                      <span className="inline-block min-w-[60px] border-b border-gray-400 border-dashed ml-2"></span>
                    </p>
                    <p>
                      <span className="font-medium">{t.form.motorcycleSpaceAmount}:</span>
                      <span className="inline-block min-w-[80px] border-b border-gray-400 border-dashed ml-2"></span> {t.currency}
                    </p>
                    <p className="font-bold pt-1 border-t border-gray-400">
                      {t.summary.totalAmount}:
                      <span className="inline-block min-w-[100px] border-b border-gray-400 border-dashed ml-2"></span> {t.currency}
                    </p>
                    <div className="pt-1 border-t border-gray-400 mt-1">
                      <p className="font-medium">{t.form.motorcycleSpaceNotes}:</p>
                      <div className="min-h-[40px] border border-gray-300 border-dashed rounded p-1 mt-0.5"></div>
                    </div>
                  </div>
                </div>
              )}

              {billData.showCarInBlankForm && (
                <div className="p-3 bg-gray-100 rounded border border-gray-300">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{t.form.carSpaces}</h3>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="font-medium">{t.summary.totalCarSpaces}:</span>
                      <span className="inline-block min-w-[60px] border-b border-gray-400 border-dashed ml-2"></span>
                    </p>
                    <p>
                      <span className="font-medium">{t.form.carSpaceAmount}:</span>
                      <span className="inline-block min-w-[80px] border-b border-gray-400 border-dashed ml-2"></span> {t.currency}
                    </p>
                    <p className="font-bold pt-1 border-t border-gray-400">
                      {t.summary.totalAmount}:
                      <span className="inline-block min-w-[100px] border-b border-gray-400 border-dashed ml-2"></span> {t.currency}
                    </p>
                    <div className="pt-1 border-t border-gray-400 mt-1">
                      <p className="font-medium">{t.form.carSpaceNotes}:</p>
                      <div className="min-h-[40px] border border-gray-300 border-dashed rounded p-1 mt-0.5"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(billData.showMotorcycleInBlankForm || billData.showCarInBlankForm) && (
              <div className="mt-3 p-2 bg-gray-200 rounded border-2 border-gray-400">
                <p className="font-bold text-sm text-gray-900">
                  {t.summary.totalGarageCollection}:
                  <span className="inline-block min-w-[120px] border-b-2 border-gray-600 border-dashed ml-2"></span> {t.currency}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Combined Total Collection - Blank Form - Only show if garage or owner is enabled */}
      {(() => {
        const hasGarage = (billData.showMotorcycleInBlankForm || billData.showCarInBlankForm);
        const hasOwner = billData.categories.some(cat => cat.isOwnerOnly);

        if (!hasGarage && !hasOwner) return null;

        // Determine grid columns based on what's present
        const gridColsClass = hasGarage && hasOwner ? 'grid-cols-3' :
                              (hasGarage || hasOwner) ? 'grid-cols-2' :
                              'grid-cols-1';

        return (
          <div className="mb-6 p-4 bg-blue-50 rounded border-2 border-blue-300">
            <h2 className="text-base font-bold text-gray-900 mb-3">{t.summary.combinedTotal}</h2>
            <div className={`grid ${gridColsClass} gap-3 text-sm mb-3`}>
              <div>
                <p className="text-gray-600">{t.summary.totalFlatCollection}:</p>
                <p className="font-bold text-gray-900">
                  <span className="inline-block min-w-[80px] border-b border-gray-500 border-dashed"></span> {t.currency}
                </p>
              </div>
              {hasGarage && (
                <div>
                  <p className="text-gray-600">{t.summary.totalGarageCollection}:</p>
                  <p className="font-bold text-gray-900">
                    <span className="inline-block min-w-[80px] border-b border-gray-500 border-dashed"></span> {t.currency}
                  </p>
                </div>
              )}
              {hasOwner && (
                <div>
                  <p className="text-gray-600">{t.summary.ownerCollection}:</p>
                  <p className="font-bold text-gray-900">
                    <span className="inline-block min-w-[80px] border-b border-gray-500 border-dashed"></span> {t.currency}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-3 border-t-2 border-blue-400">
              <p className="text-gray-700 text-sm font-medium">
                {hasGarage && hasOwner ? t.summary.flatsPlusGarageAndOwner :
                 hasGarage ? t.summary.flatsPlusGarage :
                 hasOwner ? t.summary.flatsPlusOwner :
                 t.summary.totalFlatCollection}:
              </p>
              <p className="font-bold text-xl text-gray-900">
                <span className="inline-block min-w-[150px] border-b-2 border-gray-600 border-dashed"></span> {t.currency}
              </p>
              <p className="text-xs text-gray-600 italic mt-2">
                {t.summary.inWords}: <span className="inline-block min-w-[300px] border-b border-gray-400 border-dashed ml-2"></span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* Payment Info */}
      {billData.paymentInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 text-base">
            {t.form.paymentInfo}
          </h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {billData.paymentInfo}
          </pre>
        </div>
      )}

      {/* Notes */}
      {billData.notes && (
        <div className="mb-6 p-4 bg-yellow-50 rounded border border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-2 text-base">{t.form.notes}</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {billData.notes}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>
          {uiMsgs.generatedFrom}:{' '}
          <a href={window.location.href} className="text-blue-600 underline">
            {window.location.hostname + window.location.pathname}
          </a>
        </p>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      {/* Off-screen fixed-width version for PDF/image generation */}
      <div
        ref={offscreenRef}
        className="absolute"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '794px', // A4 width at 96 DPI
          padding: '32px',
          backgroundColor: '#ffffff',
        }}
      >
        <BlankFormContent />
      </div>

      {/* Visible preview modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4 md:my-0">
        {/* Header */}
        <div className="flex justify-between items-center p-3 md:p-4 border-b bg-gray-50 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.preview.blankForm}</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 text-sm md:px-4 md:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">{t.actions.download}</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="px-3 py-2 text-sm md:px-4 md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">{t.actions.downloadImage}</span>
              <span className="sm:hidden">IMG</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm md:px-4 md:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {t.preview.close}
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-2 md:p-8 bg-gray-100">
          <div
            ref={printRef}
            className="bg-white p-4 md:p-8 shadow-lg mx-auto overflow-x-auto"
            style={{ maxWidth: '210mm' }}
          >
            <BlankFormContent />
          </div>
        </div>
      </div>

    </div>
  );
}
