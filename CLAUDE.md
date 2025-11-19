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

### Application Structure
This is a **dual-mode application** with two main features accessible via tabs:
1. **Bills Tab**: Bill calculator for creating service charge bills (calculated or blank form modes)
2. **Residents Tab**: Building and resident management system

**Navigation flow**: `App.tsx` → `Navigation.tsx` (manages tabs + language) → `BillCalculator.tsx` or `ResidentsManager.tsx`

The `Navigation` component acts as the top-level state manager, handling:
- Active tab selection ('bills' | 'residents')
- Language switching and persistence
- Client-side hydration to prevent React mismatch errors

### Build Configuration System
The project has a dual-deployment architecture controlled by the `DEPLOY_TARGET` environment variable:
- **GitHub Pages mode** (`DEPLOY_TARGET=github`): Sets `base: '/building-management/'` and copies `manifest.github.json`
- **Custom domain mode** (`DEPLOY_TARGET=custom`): Sets `base: '/'` and copies `manifest.custom.json`

The build process runs `scripts/prepare-manifest.js` to copy the correct manifest file before Astro builds.

### Internationalization (i18n) System
Language support is modular and extensible:
1. Language configs defined in `src/locales/config.ts` (`AVAILABLE_LANGUAGES` array)
2. Translation files live in `src/locales/{code}.ts` (e.g., `bn.ts`, `en.ts`)
3. Default language is Bangla (`DEFAULT_LANGUAGE = 'bn'`)
4. `SupportedLanguage` type is **auto-generated** from `AVAILABLE_LANGUAGES` array - no manual type updates needed
5. See `docs/ADD_LANGUAGE.md` for detailed guide on adding new languages

Language preference is stored in localStorage as `preferred-language` key to persist across sessions.

**Important for i18n work**: Translation utilities in `src/utils/i18n.ts` provide:
- `getTranslations(lang)`: Main translation object
- `getValidationMessages(lang)`: Form validation messages
- `getConfirmationMessages(lang)`: Modal confirmation text
- `getUIMessages(lang)`: UI state messages (loading, errors, etc.)

### Bill Calculation Logic
Located in `src/utils/calculations.ts`:
- **Single-flat billing**: Amount charged per flat directly
- **All-building billing**: Total amount divided among all flats, rounded up with `Math.ceil()`
- **Excluded flats**: Categories can specify number of flats to exclude (vacant/unoccupied)
- **Owner-only charges**: Categories with `isOwnerOnly: true` are tracked separately
- **Garage charges**: Motorcycle and car parking calculated separately, added to per-flat total
- Per-flat total and grand total are both rounded up to nearest integer
- Currency formatting uses `Intl.NumberFormat` with BDT currency

### Data Persistence & Storage Keys
The app uses **separate localStorage keys** for different data types:

**Bill Data** (managed in `src/utils/storage.ts`):
- `building-management-bill-data-calculated`: Calculated mode bill data
- `building-management-bill-data-blank`: Blank form mode bill data
- Supports **dual modes**: Each mode has independent data storage

**Building Data** (managed in `src/utils/buildingStorage.ts`):
- `buildingData`: Stores building info, flats, and residents

**Preferences**:
- `preferred-language`: Current language selection
- `activeView`: Current tab ('bills' | 'residents')
- `preferred-form-mode`: Bill calculator mode ('calculated' | 'blank')

**Important**: When working with storage, always use the helper functions (`saveBillData`, `loadBillData`, `saveBuilding`, `loadBuilding`) - don't access localStorage directly.

### PDF Generation System (GoFullPage Approach)
Uses custom package `@encryptioner/html-to-pdf-generator` (see `src/lib/pdf-generator/` for implementation):

**Three-Step Process:**
1. **Natural Rendering**: Content flows in fixed-width (794px = A4 at 96 DPI), unlimited-height container
2. **Full Capture**: html2canvas captures ENTIRE content height at once (like full-page screenshot)
3. **Smart Splitting**: Canvas split into PDF pages at proper page boundaries

**Key Features:**
- No content cuts in middle of elements
- No blank spaces between pages
- Device-independent output (same PDF on all screen sizes)
- Multi-page support when needed
- OKLCH → RGB color conversion for Tailwind CSS v4 compatibility

**Settings**: `margins: [10,10,10,10]`, `imageQuality: 0.95`, `scale: 3`

### Form Modes Pattern
The bill calculator supports **two independent modes**:
- **Calculated Mode**: Enter amounts, auto-calculate per-flat charges
- **Blank Form Mode**: Create printable forms without amounts for manual filling

Each mode:
- Has separate localStorage persistence
- Maintains independent state
- Shares the same UI components but with different validation rules
- Mode preference persists across sessions

### Component Patterns

**Residents Management** (`src/components/residents/`):
- `ResidentsManager.tsx`: Top-level manager with setup/main view logic
- `BuildingSetup.tsx`: Initial setup wizard for new buildings
- `BuildingInfo.tsx`: Display/edit building information
- `FlatList.tsx`: Lists flats by floor with statistics
- `FlatCard.tsx` + `FlatDetail.tsx`: Flat display and detailed view
- `FlatForm.tsx`: Add/edit flat modal
- `ResidentCard.tsx` + `ResidentForm.tsx`: Resident display and edit
- `ResidentsPrint.tsx`: Printable resident list

**Bill Calculator** (`src/components/`):
- Uses **render prop pattern** in `Navigation.tsx` to inject active tab and language
- `BillCalculator.tsx`: Main form with validation and state management
- `CategoryForm.tsx`: Individual category with real-time validation
- `BillPreview.tsx`: Calculated bill preview with PDF generation
- `BlankFormPreview.tsx`: Blank form preview for manual filling

**Shared Components**:
- `ConfirmModal.tsx`: Reusable confirmation dialog
- `HelpSection.tsx`: Collapsible help text (mode-aware content)
- `LanguageSelector.tsx`: Dropdown with flag icons

### Core Types & Data Models
Defined in `src/types/index.ts`:

**Bill Types**:
- `BillType`: 'single-flat' | 'all-building'
- `ServiceCategory`: Charge item with `isOwnerOnly` and `excludedFlats` fields
- `GarageSpace`: Motorcycle and car parking configuration
- `BillData`: Complete bill with garage and display preferences
- `BillSummary`: Calculated totals including garage and owner-only charges

**Building Types**:
- `Building`: Building info with flats array
- `Flat`: Flat with residents, parking counts, ownership type
- `Resident`: Person info including optional NID, move-in date
- `FlatOwnershipType`: 'owned' | 'rented'

**Storage Keys**: All keys defined in `STORAGE_KEYS` constant for consistency

## Technology Stack
- **Framework**: Astro 5 with React 19 integration
- **UI**: Tailwind CSS v4 (via Vite plugin)
- **PDF**: Custom package `@encryptioner/html-to-pdf-generator` (uses jsPDF + html2canvas)
- **TypeScript**: Strict mode enabled
- **PWA**: Service worker in `public/sw.js`, multiple manifest files for deployment modes

## Data Export/Import System
Located in `src/utils/dataExport.ts`:
- **Export**: Generates JSON files with timestamps (`building-data-YYYY-MM-DD.json`, `bill-data-YYYY-MM-DD.json`)
- **Import**: Validates JSON structure before importing, supports both bill and building data
- **Data validation**: Ensures imported data matches expected schema
- Functions: `exportBillData()`, `importBillDataFromFile()`, `exportBuildingData()`, `importBuildingDataFromFile()`

## Author & Social Links
When updating author information or footer:
- Website: https://encryptioner.github.io/
- LinkedIn: https://www.linkedin.com/in/mir-mursalin-ankur
- GitHub: https://github.com/Encryptioner
- Email: mir.ankur.ruet13@gmail.com

## Important Development Notes

### Client-Side Hydration Pattern
To prevent React hydration errors when using localStorage:
```tsx
const [isClient, setIsClient] = useState(false);
useEffect(() => {
  setIsClient(true);
  // Load from localStorage here
}, []);

// Only render after client-side hydration
{isClient && <YourComponent />}
```
See `Navigation.tsx` and `BillCalculator.tsx` for examples.

### Adding New Languages
Complete guide in `docs/ADD_LANGUAGE.md`. Key steps:
1. Add to `AVAILABLE_LANGUAGES` in `src/locales/config.ts`
2. Create translation file `src/locales/{code}.ts`
3. Update `src/locales/index.ts` and `src/utils/i18n.ts`
4. Optionally create example data in `src/utils/exampleData.{code}.ts`
5. **No manual type updates needed** - `SupportedLanguage` auto-generates

### Working with Forms
- Use validation pattern from `BillCalculator.tsx`: separate state for `validationErrors`
- Real-time validation on blur for better UX
- Blank form mode has relaxed validation (amounts can be 0)
- Always clear validation errors when fixing issues

### Known Issues & Solutions
- **PDF color rendering**: App handles OKLCH→RGB conversion automatically via custom PDF package
- **Print pagination**: Fixed - bill fits on single page using GoFullPage approach
- **React hydration**: Fixed - use client-side hydration pattern above
- **Node version mismatch or too old**: Run `nvm use 22` in bash and use that node version
- **Storage conflicts**: Each mode/feature uses separate keys - never mix bill data with building data
