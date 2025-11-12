import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BillData, BillSummary } from '../types';
import type { SupportedLanguage } from '../locales/config';
import { getTranslations, getLocaleCode, getUIMessages } from '../utils/i18n';
import { formatNumber } from '../utils/calculations';
import { numberToWords } from '../utils/numberToWords';
import { injectPDFStyles } from '../utils/pdf-helpers';

interface BillPreviewProps {
  billData: BillData;
  language: SupportedLanguage;
  summary: BillSummary;
  onClose: () => void;
}

export default function BillPreview({
  billData,
  language,
  summary,
  onClose,
}: BillPreviewProps) {
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

    // Inject CSS to override OKLCH color variables with hex equivalents using shared utility
    const removeStyles = injectPDFStyles();

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
    removeStyles();

    return canvas;
  };

  const getSanitizedFileName = (extension: string) => {
    let fileName = `service_charge_bill.${extension}`;
    if (billData.title && billData.title.trim()) {
      // Remove special characters and replace spaces with underscores
      const sanitized = billData.title
        .trim()
        .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Keep alphanumeric, spaces, and Bangla characters
        .replace(/\s+/g, '_') // Replace spaces with underscore
        .substring(0, 50); // Limit length
      fileName = sanitized ? `${sanitized}.${extension}` : `service_charge_bill.${extension}`;
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

  const handleShare = async () => {
    try {
      // Check if Web Share API is supported
      if (!navigator.share) {
        alert(uiMsgs.shareNotSupported || 'Sharing is not supported on this browser');
        return;
      }

      const canvas = await generateCanvas();
      if (!canvas) return;

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });

      if (!blob) {
        alert(uiMsgs.imageGenerationError);
        return;
      }

      // Create a File object from the blob
      const fileName = getSanitizedFileName('jpg');
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Check if files can be shared
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        alert(uiMsgs.shareNotSupported || 'Sharing files is not supported on this device');
        return;
      }

      // Share the file
      await navigator.share({
        title: billData.title || t.header.title,
        text: t.preview.shareText || 'Service Charge Bill',
        files: [file],
      });
    } catch (error) {
      // User cancelled the share or other error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        alert(uiMsgs.shareError || 'Failed to share the bill');
      }
    }
  };

  const BillContent = () => (
    <>
            {/* Bill Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {billData.title || t.header.title}
              </h1>
              <p className="text-sm font-semibold text-blue-600">
                {uiMsgs.numberOfFlats}: {billData.numberOfFlats}
              </p>
              <p className="text-xs text-gray-500 italic mt-2">
                {t.summary.roundingNote}
              </p>
              <p className="text-xs text-gray-500 italic mt-2">
                {t.preview.printedOn}: {currentDate}
              </p>
            </div>

            {/* Owner-Only Categories Table */}
            {billData.categories.some(cat => cat.isOwnerOnly) && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{color: '#111827'}}>
                  <span>{t.summary.ownerCollection}</span>
                  <span className="text-sm font-normal" style={{color: '#c2410c'}}>({t.category.isOwnerOnly})</span>
                </h2>
                <table className="w-full border-collapse" style={{
                  background: 'repeating-linear-gradient(45deg, #fff, #fff 10px, #f9fafb 10px, #f9fafb 20px)'
                }}>
                  <thead>
                    <tr style={{backgroundColor: '#e5e7eb', borderTop: '3px solid #000', borderBottom: '3px solid #000'}}>
                      <th className="px-3 py-2 text-left text-sm font-bold" style={{border: '2px solid #1f2937'}}>
                        {t.preview.category}
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-bold" style={{border: '2px solid #1f2937'}}>
                        {t.preview.duration}
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-bold" style={{border: '2px solid #1f2937'}}>
                        {t.preview.info}
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-bold" style={{border: '2px solid #1f2937'}}>
                        {t.preview.type}
                      </th>
                      <th className="px-3 py-2 text-right text-sm font-bold whitespace-nowrap" style={{border: '2px solid #1f2937'}}>
                        {t.preview.amount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {billData.categories.filter(cat => cat.isOwnerOnly).map((category) => {
                      const perFlat = summary.categoryTotals.get(category.id) || 0;
                      return (
                        <tr key={category.id}>
                          <td className="px-3 py-2 font-bold text-sm" style={{border: '2px solid #1f2937'}}>
                            {category.name}
                          </td>
                          <td className="px-3 py-2 text-xs" style={{border: '2px solid #1f2937'}}>
                            {category.duration}
                          </td>
                          <td className="px-3 py-2 text-xs" style={{border: '2px solid #1f2937'}}>
                            {category.info}
                          </td>
                          <td className="px-3 py-2 text-xs" style={{border: '2px solid #1f2937'}}>
                            {category.billType === 'single-flat'
                              ? t.category.singleFlat
                              : `${formatNumber(category.amount)} ÷ ${billData.numberOfFlats}`}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-sm whitespace-nowrap" style={{border: '2px solid #1f2937'}}>
                            {formatNumber(perFlat)} {t.currency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold" style={{backgroundColor: '#e5e7eb', borderTop: '3px solid #000'}}>
                      <td
                        colSpan={4}
                        className="px-3 py-1 text-sm text-right"
                        style={{border: '2px solid #1f2937'}}
                      >
                        {t.summary.perFlat} ({t.summary.ownerNote}):
                      </td>
                      <td className="px-3 py-1 text-right whitespace-nowrap" style={{border: '2px solid #1f2937'}}>
                        {formatNumber(summary.perFlatOwnerTotal)} {t.currency}
                      </td>
                    </tr>
                    <tr style={{backgroundColor: '#f3f4f6'}}>
                      <td
                        colSpan={5}
                        className="px-3 py-1 text-right text-xs italic"
                        style={{border: '2px solid #1f2937', color: '#4b5563'}}
                      >
                        {t.summary.inWords}: {numberToWords(summary.perFlatOwnerTotal, language)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Categories Table */}
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
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm whitespace-nowrap">
                      {t.preview.amount}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billData.categories.filter(cat => !cat.isOwnerOnly).map((category) => {
                    const perFlat = summary.categoryTotals.get(category.id) || 0;
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
                            : `${formatNumber(category.amount)} ÷ ${billData.numberOfFlats}`}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-medium text-sm whitespace-nowrap">
                          {formatNumber(perFlat)} {t.currency}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    {summary.perFlatOwnerTotal > 0 ? (
                      <>
                        <td
                          colSpan={2}
                          className="border border-gray-300 px-2 py-1 text-xs font-normal text-left"
                          style={{color: '#c2410c'}}
                        >
                          {t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.perFlatTotal + summary.perFlatOwnerTotal)} {t.currency}
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
                    <td className="border border-gray-300 px-3 py-1 text-right whitespace-nowrap">
                      {formatNumber(summary.perFlatTotal)} {t.currency}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={5}
                      className="border border-gray-300 px-3 py-1 text-right text-xs text-gray-600 italic"
                    >
                      {t.summary.inWords}: {numberToWords(summary.perFlatTotal, language)}
                    </td>
                  </tr>

                  {/* Garage space variations */}
                  {billData.garage.motorcycleSpaces > 0 && (
                    <tr className="bg-gray-50 font-medium">
                      {summary.perFlatOwnerTotal > 0 ? (
                        <>
                          <td
                            colSpan={2}
                            className="border border-gray-300 px-2 py-1 text-xs font-normal text-left"
                            style={{color: '#c2410c'}}
                          >
                            {t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithMotorcycle + summary.perFlatOwnerTotal)} {t.currency}
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
                      <td className="border border-gray-300 px-3 py-1 text-right text-xs whitespace-nowrap">
                        {formatNumber(summary.totalWithMotorcycle)} {t.currency}
                      </td>
                    </tr>
                  )}

                  {billData.garage.carSpaces > 0 && (
                    <tr className="bg-gray-50 font-medium">
                      {summary.perFlatOwnerTotal > 0 ? (
                        <>
                          <td
                            colSpan={2}
                            className="border border-gray-300 px-2 py-1 text-xs font-normal text-left"
                            style={{color: '#c2410c'}}
                          >
                            {t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithCar + summary.perFlatOwnerTotal)} {t.currency}
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
                      <td className="border border-gray-300 px-3 py-1 text-right text-xs whitespace-nowrap">
                        {formatNumber(summary.totalWithCar)} {t.currency}
                      </td>
                    </tr>
                  )}

                  {billData.garage.motorcycleSpaces > 0 && billData.garage.carSpaces > 0 && (
                    <tr className="bg-gray-50 font-medium">
                      {summary.perFlatOwnerTotal > 0 ? (
                        <>
                          <td
                            colSpan={2}
                            className="border border-gray-300 px-2 py-1 text-xs font-normal text-left"
                            style={{color: '#c2410c'}}
                          >
                            {t.summary.ownerNote}: +{formatNumber(summary.perFlatOwnerTotal)} = {formatNumber(summary.totalWithBoth + summary.perFlatOwnerTotal)} {t.currency}
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
                      <td className="border border-gray-300 px-3 py-1 text-right text-xs whitespace-nowrap">
                        {formatNumber(summary.totalWithBoth)} {t.currency}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Garage Space Information */}
            {(billData.garage.motorcycleSpaces > 0 || billData.garage.carSpaces > 0) && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t.summary.garageCollection}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {billData.garage.motorcycleSpaces > 0 && (
                    <div className="p-3 bg-gray-100 rounded border border-gray-300">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">{t.form.motorcycleSpaces}</h3>
                      <div className="space-y-1 text-xs">
                        <p>
                          <span className="font-medium">{t.summary.totalMotorcycleSpaces}:</span> {billData.garage.motorcycleSpaces}
                        </p>
                        <p>
                          <span className="font-medium">{t.form.motorcycleSpaceAmount}:</span> {formatNumber(billData.garage.motorcycleSpaceAmount)} {t.currency}
                        </p>
                        <p className="font-bold pt-1 border-t border-gray-400">
                          {t.summary.totalAmount}: {formatNumber(billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount)} {t.currency}
                        </p>
                        {billData.garage.motorcycleSpaceNotes && (
                          <div className="pt-1 border-t border-gray-400 mt-1">
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">{t.form.motorcycleSpaceNotes}:</span> {billData.garage.motorcycleSpaceNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {billData.garage.carSpaces > 0 && (
                    <div className="p-3 bg-gray-100 rounded border border-gray-300">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">{t.form.carSpaces}</h3>
                      <div className="space-y-1 text-xs">
                        <p>
                          <span className="font-medium">{t.summary.totalCarSpaces}:</span> {billData.garage.carSpaces}
                        </p>
                        <p>
                          <span className="font-medium">{t.form.carSpaceAmount}:</span> {formatNumber(billData.garage.carSpaceAmount)} {t.currency}
                        </p>
                        <p className="font-bold pt-1 border-t border-gray-400">
                          {t.summary.totalAmount}: {formatNumber(billData.garage.carSpaces * billData.garage.carSpaceAmount)} {t.currency}
                        </p>
                        {billData.garage.carSpaceNotes && (
                          <div className="pt-1 border-t border-gray-400 mt-1">
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">{t.form.carSpaceNotes}:</span> {billData.garage.carSpaceNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-2 bg-gray-200 rounded border-2 border-gray-400">
                  <p className="font-bold text-sm text-gray-900">
                    {t.summary.totalGarageCollection}: {formatNumber((billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount) + (billData.garage.carSpaces * billData.garage.carSpaceAmount))} {t.currency}
                  </p>
                </div>
              </div>
            )}

            {/* Combined Total Collection */}
            {(billData.garage.motorcycleSpaces > 0 || billData.garage.carSpaces > 0 || summary.grandOwnerTotal > 0) && (() => {
              const hasGarage = (billData.garage.motorcycleSpaces > 0 || billData.garage.carSpaces > 0);
              const hasOwner = summary.grandOwnerTotal > 0;
              const garageTotal = (billData.garage.motorcycleSpaces * billData.garage.motorcycleSpaceAmount) + (billData.garage.carSpaces * billData.garage.carSpaceAmount);
              const combinedTotal = summary.grandTotal + garageTotal + summary.grandOwnerTotal;

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
                      <p className="font-bold text-gray-900">{formatNumber(summary.grandTotal)} {t.currency}</p>
                    </div>
                    {hasGarage && (
                      <div>
                        <p className="text-gray-600">{t.summary.totalGarageCollection}:</p>
                        <p className="font-bold text-gray-900">{formatNumber(garageTotal)} {t.currency}</p>
                      </div>
                    )}
                    {hasOwner && (
                      <div>
                        <p className="text-gray-600">{t.summary.ownerCollection}:</p>
                        <p className="font-bold text-gray-900">{formatNumber(summary.grandOwnerTotal)} {t.currency}</p>
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
                    <p className="font-bold text-xl text-gray-900">{formatNumber(combinedTotal)} {t.currency}</p>
                    <p className="text-xs text-gray-600 italic mt-2">
                      {t.summary.inWords}: {numberToWords(combinedTotal, language)}
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
        <BillContent />
      </div>

      {/* Visible preview modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4 md:my-0">
        {/* Header */}
        <div className="flex justify-between items-center p-3 md:p-4 border-b bg-gray-50 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{t.preview.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleShare}
              className="px-3 py-2 text-sm md:px-4 md:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="hidden sm:inline">{t.actions.share}</span>
              <span className="sm:hidden">{t.actions.share}</span>
            </button>
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
            <BillContent />
          </div>
        </div>
      </div>

    </div>
  );
}
