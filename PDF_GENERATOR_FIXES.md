# PDF Generator Fixes - Device Independence & Text Alignment

## Issues Fixed

### 1. Text Alignment Issue in ResidentsPrint
**Problem**: The "Resident List" heading and other header text were becoming left-aligned in the PDF output, while other text remained centered.

**Root Cause**: The PDF generator's html2canvas rendering doesn't properly inherit CSS text-alignment from parent elements during offscreen rendering. Tailwind's `text-center` class on the parent div wasn't being applied consistently.

**Solution**: Added explicit `textAlign: 'center'` inline styles to all header and footer text elements in the PDFContent component.

**Files Modified**:
- `src/components/residents/ResidentsPrint.tsx`: Lines 89-98, 243-249

### 2. Device-Independent PDF Generation
**Problem**: Components were using hardcoded `794px` width, which didn't match the PDF generator's calculated usable width. This could cause:
- Layout reflow when the PDF generator clones and resizes the element
- Inconsistent rendering across different screen sizes
- Content scaling issues

**Root Cause**: Width mismatch between:
- Components: 794px (full A4 width)
- PDF Generator: 718px (A4 width minus 10mm margins on each side)

**Solution**:
1. Created `getPDFContentWidth()` utility function in `src/utils/pdf-helpers.ts`
2. Exported `PDF_CONTENT_WIDTH_PX = 718` constant for consistent use
3. Updated `ResidentsPrint.tsx` to use the calculated width instead of hardcoded 794px

**Calculation**:
```
A4 Width: 210mm
Margins (L+R): 10mm + 10mm = 20mm
Usable Width: 210mm - 20mm = 190mm
Conversion (96 DPI): 190mm × 3.7795275591 = 718.105px
Rounded: 718px
```

**Files Modified**:
- `src/utils/pdf-helpers.ts`: Added `getPDFContentWidth()` and `PDF_CONTENT_WIDTH_PX`
- `src/components/residents/ResidentsPrint.tsx`: Lines 6, 87, 487, 489

## How PDF Generation Works

### Device Independence Architecture

The PDF generator ensures consistent output across all screen sizes through:

1. **Fixed-Width Offscreen Container** (core.ts:150-160)
   - Container positioned absolutely at `-9999px` (offscreen)
   - Fixed width: `718px` (calculated from page config)
   - Natural height: `auto` (content flows naturally)
   - Isolated from viewport size

2. **Full-Height Capture** (core.ts:226-247)
   - html2canvas captures entire content height at once
   - `windowWidth` and `windowHeight` override viewport dimensions
   - Like GoFullPage extension approach

3. **Smart Page Splitting** (core.ts:253-365)
   - Canvas split into PDF pages at proper boundaries
   - No content cuts in middle of elements
   - Multi-page support when needed

### Why 718px Instead of 794px?

- **794px** = Full A4 width (210mm) at 96 DPI
- **718px** = Usable width after subtracting 10mm margins on each side
- Using 718px ensures content stays within printable area
- PDF generator adds margins around the 718px content

## Testing

To verify the fixes work correctly:

1. **Desktop Testing**:
   - Open the app on a desktop browser (1920×1080 or larger)
   - Navigate to Residents section
   - Generate PDF
   - Verify: All text is properly aligned, especially "Resident List" header

2. **Mobile Testing**:
   - Open the app on mobile (375×667 iPhone SE size)
   - Navigate to Residents section
   - Generate PDF
   - Verify: PDF is identical to desktop version

3. **Consistency Check**:
   - Generate PDF from desktop
   - Generate PDF from mobile
   - Compare PDFs visually
   - Expected: Both PDFs should be pixel-perfect identical

## Benefits

✅ **Consistent Output**: Same PDF generated on all screen sizes
✅ **Proper Alignment**: All text elements properly aligned in PDF
✅ **Professional Quality**: Clean, centered headers and footers
✅ **Maintainable**: Centralized width calculation in `PDF_CONTENT_WIDTH_PX`
✅ **Future-Proof**: Easy to update width calculation for different paper sizes

## Related Files

- `src/lib/pdf-generator/core.ts` - Main PDF generator logic
- `src/lib/pdf-generator/utils.ts` - Width calculations
- `src/utils/pdf-helpers.ts` - Shared PDF utilities
- `src/components/residents/ResidentsPrint.tsx` - Resident list PDF component

## Notes

- `BillPreview.tsx` and `BlankFormPreview.tsx` still use manual html2canvas approach with 794px
- These components should eventually be migrated to use PDFGenerator library for consistency
- For now, they work correctly with their current implementation
