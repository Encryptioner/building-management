/**
 * PDF Generator Library - Usage Examples
 *
 * This file contains practical examples of how to use the PDF generator library
 */

import { useState } from 'react';
import { generatePDF, PDFGenerator } from './index';
import { usePDFGenerator, usePDFGeneratorManual } from './hooks';

// ============================================================================
// EXAMPLE 1: Simple usage with convenience function
// ============================================================================

export function Example1_SimpleUsage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    const element = document.getElementById('my-content');
    if (element) {
      await generatePDF(element, 'my-document.pdf', {
        format: 'a4',
        orientation: 'portrait',
        showPageNumbers: true,
      });
    }

    setIsLoading(false);
  };

  return (
    <div>
      <div id="my-content">
        <h1>My Document</h1>
        <p>This content will be converted to PDF</p>
      </div>

      <button onClick={handleDownload} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Download PDF'}
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Using React hook with ref
// ============================================================================

export function Example2_ReactHook() {
  const { targetRef, generatePDF, isGenerating, progress, error } = usePDFGenerator({
    filename: 'report.pdf',
    format: 'a4',
    orientation: 'portrait',
    margins: [20, 20, 20, 20],
    showPageNumbers: true,
    pageNumberPosition: 'footer',
    compress: true,
  });

  return (
    <div>
      {/* Attach ref to the element you want to convert */}
      <div ref={targetRef} style={{ width: '794px', padding: '20px' }}>
        <h1>Monthly Report</h1>
        <p>This is the content that will be in the PDF</p>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Service A</td>
              <td>$100</td>
            </tr>
            <tr>
              <td>Service B</td>
              <td>$200</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Download button */}
      <button onClick={generatePDF} disabled={isGenerating}>
        {isGenerating ? `Generating... ${progress}%` : 'Download PDF'}
      </button>

      {/* Error display */}
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Manual hook usage (pass element directly)
// ============================================================================

export function Example3_ManualHook() {
  const { generatePDF, isGenerating, progress } = usePDFGeneratorManual({
    format: 'a4',
    compress: true,
    onProgress: (p) => console.log(`Progress: ${p}%`),
    onComplete: (blob) => console.log(`PDF generated! Size: ${blob.size} bytes`),
  });

  const handleDownload = async () => {
    const element = document.getElementById('invoice-content');
    if (element) {
      await generatePDF(element, 'invoice.pdf');
    }
  };

  return (
    <div>
      <div id="invoice-content">
        <h1>Invoice #12345</h1>
        <p>Customer: John Doe</p>
        <p>Amount: $500.00</p>
      </div>

      <button onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? (
          <span>Generating PDF... {progress}%</span>
        ) : (
          <span>Download Invoice</span>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Advanced usage with PDFGenerator class
// ============================================================================

export function Example4_AdvancedUsage() {
  const [generator, setGenerator] = useState<PDFGenerator | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Initialize generator on mount
  useState(() => {
    const gen = new PDFGenerator({
      format: 'a4',
      orientation: 'portrait',
      margins: [15, 15, 15, 15],
      scale: 2,
      imageQuality: 0.9,
      showPageNumbers: true,
      compress: true,
      onProgress: (p) => setProgress(p),
      onComplete: (blob) => {
        console.log(`PDF generated! Size: ${(blob.size / 1024).toFixed(2)} KB`);
        setIsGenerating(false);
      },
      onError: (error) => {
        console.error('PDF generation failed:', error);
        alert(`Failed to generate PDF: ${error.message}`);
        setIsGenerating(false);
      },
    });
    setGenerator(gen);
  });

  const handleDownload = async () => {
    if (!generator) return;

    setIsGenerating(true);
    const element = document.getElementById('complex-content');

    if (element) {
      const result = await generator.generatePDF(element, 'complex-report.pdf');
      setPageCount(result.pageCount);
      console.log(`Generated ${result.pageCount} pages in ${result.generationTime}ms`);
    }
  };

  return (
    <div>
      <div id="complex-content" style={{ width: '794px', padding: '30px' }}>
        <h1>Complex Report</h1>

        <section>
          <h2>Section 1</h2>
          <p>Lorem ipsum dolor sit amet...</p>
        </section>

        <section>
          <h2>Section 2</h2>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </section>

        <section>
          <h2>Section 3</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 50 }, (_, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Item {i + 1}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>Value {i + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? `Generating PDF... ${progress}%` : 'Download PDF'}
        </button>

        {pageCount > 0 && (
          <p>Last PDF had {pageCount} pages</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Generate blob without downloading (for upload)
// ============================================================================

export function Example5_GenerateBlob() {
  const { generateBlob, isGenerating, progress } = usePDFGeneratorManual({
    format: 'a4',
    compress: true,
  });

  const handleUpload = async () => {
    const element = document.getElementById('upload-content');
    if (!element) return;

    // Generate blob
    const blob = await generateBlob(element);
    if (!blob) return;

    // Upload to server
    const formData = new FormData();
    formData.append('pdf', blob, 'document.pdf');

    try {
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('PDF uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <div id="upload-content">
        <h1>Document to Upload</h1>
        <p>This will be converted to PDF and uploaded to the server</p>
      </div>

      <button onClick={handleUpload} disabled={isGenerating}>
        {isGenerating ? `Processing... ${progress}%` : 'Upload PDF'}
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Custom color replacements for Tailwind
// ============================================================================

export function Example6_CustomColors() {
  const { targetRef, generatePDF, isGenerating } = usePDFGenerator({
    filename: 'styled-document.pdf',
    format: 'a4',
    colorReplacements: {
      // Override Tailwind colors
      '--color-primary': '#3b82f6',
      '--color-secondary': '#8b5cf6',
      '--my-brand-color': '#10b981',
    },
    customCSS: `
      .my-custom-class {
        background-color: #f0f9ff;
        padding: 20px;
        border-radius: 8px;
      }
    `,
  });

  return (
    <div>
      <div ref={targetRef}>
        <div className="my-custom-class">
          <h1 style={{ color: 'var(--color-primary)' }}>Styled Document</h1>
          <p style={{ color: 'var(--color-secondary)' }}>
            This document uses custom colors that will render correctly in the PDF
          </p>
          <div style={{ backgroundColor: 'var(--my-brand-color)', padding: '10px', color: 'white' }}>
            Brand colored box
          </div>
        </div>
      </div>

      <button onClick={generatePDF} disabled={isGenerating}>
        Download Styled PDF
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Real-world bill example (similar to BillPreview)
// ============================================================================

export function Example7_BillDocument() {
  const offscreenRef = useState<HTMLDivElement>(null);
  const { generatePDF, isGenerating, progress } = usePDFGeneratorManual({
    format: 'a4',
    orientation: 'portrait',
    margins: [10, 10, 10, 10],
    compress: true,
    imageQuality: 0.85,
    showPageNumbers: false,
  });

  const handleDownload = async () => {
    const element = offscreenRef.current;
    if (element) {
      await generatePDF(element, 'service-bill.pdf');
    }
  };

  return (
    <div>
      {/* Offscreen rendering area */}
      <div
        ref={offscreenRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '794px',
          padding: '32px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #d1d5db' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Service Charge Bill
          </h1>
          <p style={{ fontSize: '14px', color: '#2563eb' }}>
            Flats: 12
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'left' }}>Category</th>
              <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'left' }}>Duration</th>
              <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '12px' }}>Generator</td>
              <td style={{ border: '1px solid #d1d5db', padding: '12px' }}>January 2025</td>
              <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right' }}>5000 BDT</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '12px' }}>Security</td>
              <td style={{ border: '1px solid #d1d5db', padding: '12px' }}>January 2025</td>
              <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right' }}>3000 BDT</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
              <td colSpan={2} style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right' }}>
                Per Flat Total:
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right' }}>
                667 BDT
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visible UI */}
      <div>
        <h2>Service Charge Bill Preview</h2>
        <button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? `Generating... ${progress}%` : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
