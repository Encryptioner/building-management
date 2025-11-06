# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Building Management - A PWA for managing apartment buildings, including creating and managing service charge bills. Users can add unlimited categories, choose billing types (single flat or divided among all flats), preview bills, and export to PDF. All data is stored in browser local storage for privacy.

## Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start dev server at localhost:4321
pnpm astro check          # TypeScript type checking

# Building
pnpm build                # Build for GitHub Pages (default)
pnpm build:github         # Explicit GitHub Pages build
pnpm build:custom         # Build for custom domain
pnpm preview              # Preview production build locally
```

## Architecture

### Build Configuration System
The project has a dual-deployment architecture controlled by the `DEPLOY_TARGET` environment variable:
- **GitHub Pages mode** (`DEPLOY_TARGET=github`): Sets `base: '/service-charge/'` and copies `manifest.github.json`
- **Custom domain mode** (`DEPLOY_TARGET=custom`): Sets `base: '/'` and copies `manifest.custom.json`

The build process runs `scripts/prepare-manifest.js` to copy the correct manifest file before Astro builds.

### Internationalization (i18n) System
Language support is modular and extensible:
1. Language configs defined in `src/locales/config.ts` (`AVAILABLE_LANGUAGES` array)
2. Translation files live in `src/locales/{code}.ts` (e.g., `bn.ts`, `en.ts`)
3. Default language is Bangla (`DEFAULT_LANGUAGE = 'bn'`)
4. To add a new language: Add config to `AVAILABLE_LANGUAGES`, create translation file, update `SupportedLanguage` type

Language preference is stored in localStorage as `preferred-language` key to persist across sessions.

### Bill Calculation Logic
Located in `src/utils/calculations.ts`:
- **Single-flat billing**: Amount charged per flat directly
- **All-building billing**: Total amount divided among all flats, rounded up with `Math.ceil()`
- Per-flat total and grand total are both rounded up to nearest integer
- Currency formatting uses `Intl.NumberFormat` with BDT currency

### PDF Generation System
The app uses jsPDF + html2canvas for PDF export:
- **Challenge**: Tailwind CSS v4 uses OKLCH colors which don't render in PDFs
- **Solution**: Color replacement logic converts OKLCH to RGB before PDF generation
- Preview component (`BillPreview.tsx`) is rendered to canvas, then converted to PDF

### Data Persistence
- All bill data stored in browser localStorage via `src/utils/storage.ts`
- Key: `serviceBillData`
- Auto-saves on every change to prevent data loss
- Includes example data loader for first-time users

### Core Types
Defined in `src/types/index.ts`:
- `BillType`: 'single-flat' | 'all-building'
- `ServiceCategory`: Individual charge item with id, name, duration, billType, amount
- `BillData`: Complete bill with title, numberOfFlats, categories, payment info
- `BillSummary`: Calculated totals (perFlatTotal, grandTotal, categoryTotals)

## Technology Stack
- **Framework**: Astro 5 with React 19 integration
- **UI**: Tailwind CSS v4 (via Vite plugin)
- **PDF**: jsPDF + html2canvas
- **TypeScript**: Strict mode enabled
- **PWA**: Service worker in `public/sw.js`, multiple manifest files for deployment modes

## Component Structure
- `BillCalculator.tsx`: Main component with form state, validation, and footer
- `CategoryForm.tsx`: Individual service category form with validation
- `BillPreview.tsx`: Preview modal with PDF download functionality
- `LanguageSelector.tsx`: Language switcher dropdown
- `HelpSection.tsx`: Collapsible help/tutorial section
- `ConfirmModal.tsx`: Reusable confirmation dialog

## Author & Social Links
When updating author information or footer:
- Website: https://encryptioner.github.io/
- LinkedIn: https://www.linkedin.com/in/mir-mursalin-ankur
- GitHub: https://github.com/Encryptioner
- Email: mir.ankur.ruet13@gmail.com

## Known Issues & Solutions
- **PDF color rendering**: App handles OKLCH→RGB conversion automatically
- **Print pagination**: Fixed - bill fits on single page
- **React hydration**: Fixed - language loads from localStorage correctly
- **Node version mismatch or too old**: Run `nvm use 22` in bash and use that node version
