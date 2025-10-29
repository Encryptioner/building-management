Based on my analysis of the codebase, I'll create a comprehensive plan for
   evolving from a service charge calculator to a building management system
   with residents management.

  Comprehensive Plan: Building Management System with Residents Module

  1. Data Model Design

  // New types to add to src/types/index.ts

  export type FlatOwnershipType = 'owned' | 'rented';

  export interface Resident {
    id: string;
    name: string;
    phone: string;
    email?: string;
    nid?: string; // National ID (optional for privacy)
    moveInDate?: string;
    notes?: string;
  }

  export interface Flat {
    id: string;
    flatNumber: string; // Flexible: "1A", "2B", "101", "Ground-1"
    floorNumber: string; // "1", "2", "G", "Ground", etc.
    ownershipType: FlatOwnershipType; // Ownership at flat level
    residents: Resident[];
    motorcycleParkingCount: number; // 0 if none
    carParkingCount: number; // 0 if none
    notes?: string;
  }

  export interface Building {
    id: string;
    name: string;
    address: string;
    totalFloors: number;
    flats: Flat[];
    createdAt: string;
    updatedAt: string;
  }

  // localStorage keys
  export const STORAGE_KEYS = {
    BILL_DATA: 'serviceBillData',
    BUILDING_DATA: 'buildingData',
    ACTIVE_VIEW: 'activeView', // 'bills' | 'residents'
    PREFERRED_LANGUAGE: 'preferred-language' // Existing key
  }

  2. Navigation Architecture

  Approach: Tab-based navigation (simple, mobile-friendly, BD-friendly)

  ┌──────────────────────────────────────────────────┐
  │  Building Management / ভবন ব্যবস্থাপনা           │
  │  [বিল/Bills] [বাসিন্দা/Residents] [🌐 ভাষা/Lang] │
  └──────────────────────────────────────────────────┘

  Design Decisions:
  - Bilingual labels on tabs (Bangla/English) for clarity
  - Language selector remains accessible but moved to tab bar
  - Active tab highlighted with underline + color
  - Touch-friendly spacing (min 44x44px tap targets)

  3. Residents Management UX Flow

  Industry Standard Pattern: List → Add/Edit → Detail View
  Optimized for BD building committees (novice-friendly)

  SCENARIO A: No Building Setup Yet
  ┌─────────────────────────────────────┐
  │ Welcome to Residents Management     │
  │                                     │
  │ Track residents, flats, and parking │
  │                                     │
  │ [Setup Building] (primary button)   │
  │                                     │
  │ Note: Optional - Bills work without │
  │       resident data                 │
  └─────────────────────────────────────┘

  SCENARIO B: Building Setup Complete
  ┌─────────────────────────────────────┐
  │ Building Info Card                  │
  │ Name: Green Tower                   │
  │ Address: Gulshan, Dhaka             │
  │ Flats: 12 | Residents: 24          │
  │ [Edit Building]                     │
  ├─────────────────────────────────────┤
  │ Floor-grouped Flat List             │
  │                                     │
  │ ▼ Floor 1 (তলা ১)                  │
  │   • Flat 1A [মালিকানা: নিজস্ব]     │
  │     👤 3 residents                   │
  │     🏍️ 1 motorcycle                 │
  │     [View Details]                  │
  │                                     │
  │   • Flat 1B [মালিকানা: ভাড়া]      │
  │     👤 2 residents                   │
  │     [View Details]                  │
  │                                     │
  │ ▼ Floor 2 (তলা ২)                  │
  │   • ...                             │
  │                                     │
  │ [+ Add New Flat] (floating button)  │
  └─────────────────────────────────────┘

  Flat Detail View (Modal/Sheet)
  ┌─────────────────────────────────────┐
  │ Flat 1A - Floor 1                   │
  │ [Edit Flat Info]                    │
  ├─────────────────────────────────────┤
  │ Ownership: নিজস্ব (Owned)           │
  │ Parking: 🏍️ 1 motorcycle            │
  │                                     │
  │ Residents (বাসিন্দা):              │
  │ ┌─────────────────────────────────┐ │
  │ │ 1. Ahmed Ali                    │ │
  │ │    📱 +880 1711-123456          │ │
  │ │    [Edit] [Remove]              │ │
  │ ├─────────────────────────────────┤ │
  │ │ 2. Fatema Ali                   │ │
  │ │    📱 +880 1711-234567          │ │
  │ │    [Edit] [Remove]              │ │
  │ └─────────────────────────────────┘ │
  │                                     │
  │ [+ Add Resident]                    │
  │                                     │
  │ [Close]                             │
  └─────────────────────────────────────┘

  4. Key Features & User Flows (Simplified for BD Context)

  A. Building Setup (First Time - One-time setup)

  Form Fields (all in Bangla/English):
  - Building Name (required) - e.g., "Green Tower", "গ্রিন টাওয়ার"
  - Address (required) - e.g., "Gulshan, Dhaka"
  - Total Floors (required) - Number input
  - [Save & Continue] button

  B. Flat Management (Simple CRUD)

  Add Flat Form:
  - Floor Number (required) - Dropdown or text (supports "G", "1", "2", etc.)
  - Flat Number (required) - Text (supports "1A", "101", etc.)
  - Ownership (required) - Radio: নিজস্ব/Owned or ভাড়া/Rented
  - Motorcycle Parking (optional) - Number (default: 0)
  - Car Parking (optional) - Number (default: 0)
  - Notes (optional) - Textarea
  - [Save Flat] button

  Edit Flat: Same form pre-filled
  Delete Flat: Confirmation modal with warning if residents exist

  C. Resident Management (Within Flat Context)

  Add Resident Form (appears in flat detail):
  - Name (required) - Text
  - Phone (required) - Text (supports +880 format)
  - Email (optional) - Text
  - NID (optional) - Text (privacy note shown)
  - Move-in Date (optional) - Date picker
  - Notes (optional) - Textarea
  - [Add Resident] button

  Edit Resident: Same form pre-filled
  Delete Resident: Simple confirmation ("আপনি কি নিশ্চিত?")

  5. UI Components to Create

  New Components (src/components/):
  ├── Navigation.tsx - Tab switcher (Bills/Residents/Language)
  ├── residents/
  │   ├── ResidentsManager.tsx - Main container for residents tab
  │   ├── BuildingSetup.tsx - First-time building setup form
  │   ├── BuildingInfo.tsx - Building info card (editable)
  │   ├── FlatList.tsx - Floor-grouped flat list with collapse/expand
  │   ├── FlatCard.tsx - Individual flat summary card
  │   ├── FlatDetail.tsx - Modal/sheet with full flat details + residents
  │   ├── FlatForm.tsx - Add/Edit flat form (modal)
  │   ├── ResidentForm.tsx - Add/Edit resident form (within flat detail)
  │   └── ResidentCard.tsx - Individual resident display
  └── common/
      └── EmptyState.tsx - Reusable empty state component

  Modified Components:
  ├── BillCalculator.tsx - Wrap in Navigation component
  ├── LanguageSelector.tsx - Integrate into Navigation tabs
  └── pages/index.astro - Update to use new Navigation wrapper

  New Utils (src/utils/):
  ├── buildingStorage.ts - localStorage operations for building data
  └── buildingValidation.ts - Form validation helpers

  6. Integration with Service Charge Calculator (Future Phase)

  Phase 1: No integration (keep features separate)
  - Bill calculator works as-is
  - Residents module works independently

  Phase 2: Soft integration (optional enhancements)
  - Show "Use building data" toggle in bill calculator
  - If enabled: Auto-populate number of flats
  - If enabled: Show flat-wise parking charges
  - User can still override and use calculator standalone

  Phase 3: Advanced integration (future)
  - Generate per-flat bills with resident names
  - Owner-only charge filtering based on flat ownership
  - Payment tracking per flat

  7. Backward Compatibility & Data Safety

  Critical Requirements:
  ✓ Existing bill data (serviceBillData) remains untouched
  ✓ Service charge calculator works without building data
  ✓ No breaking changes to existing localStorage schema
  ✓ New users can use either feature independently
  ✓ Existing users can continue using bills without setup

  Migration Strategy:
  - No migration needed (new localStorage key)
  - Building data (buildingData) is separate
  - Feature detection: if no building data, show welcome screen

  8. Mobile-First Design Principles (BD Context)

  1. Touch-friendly: All tap targets min 44x44px (easy for all ages)
  2. Large text: Base font 16px, headings larger (readability)
  3. Clear hierarchy: Visual separation between sections
  4. Collapsible floors: Save screen space, show/hide floors
  5. Modal forms: Bottom sheets on mobile, centered on desktop
  6. Offline-first: Works without internet (PWA capability)
  7. Simple colors: High contrast, accessible to all
  8. Bilingual UI: Both languages visible where needed

  9. Implementation Phases (Start with Phase 1 & 2)

  Phase 1: Foundation & Setup (IMPLEMENT NOW)
  ├── Update types in src/types/index.ts
  ├── Create buildingStorage.ts utility
  ├── Create Navigation.tsx component
  ├── Create BuildingSetup.tsx form
  ├── Create BuildingInfo.tsx card
  ├── Add i18n translations (Bangla + English)
  └── Integration: Wrap BillCalculator in Navigation

  Phase 2: Flat & Resident Management (IMPLEMENT NOW)
  ├── Create FlatForm.tsx (Add/Edit)
  ├── Create FlatList.tsx (Floor-grouped)
  ├── Create FlatCard.tsx
  ├── Create FlatDetail.tsx (Modal)
  ├── Create ResidentForm.tsx
  ├── Create ResidentCard.tsx
  ├── Add validation helpers
  └── Complete CRUD for flats and residents

  Phase 3: Export/Import & Data Portability (IMPLEMENT NEXT)
  ├── Export Building Data:
  │   ├── JSON export (complete data backup)
  │   ├── Printable PDF/HTML format:
  │   │   ├── Visually clean, simple layout
  │   │   ├── Black & white printer-friendly
  │   │   ├── Floor-grouped flat list with residents
  │   │   ├── Building info header
  │   │   └── Statistics summary
  │   └── [Export Data] button in residents tab
  ├── Import Building Data:
  │   ├── JSON import (restore complete backup)
  │   ├── [Import Data] button in residents tab
  │   ├── File upload validation
  │   ├── Preview before import
  │   └── Confirmation modal with data merge/replace options
  └── Data Management UI:
      ├── Export/Import section in building settings
      ├── Clear visual feedback on success/error
      └── Download/upload progress indicators

  Phase 4: Enhancement (LATER)
  ├── Search/filter flats by number or resident name
  ├── Sort flats by floor/number
  └── Resident directory with contact info

  Phase 5: Bill Integration (FUTURE)
  ├── "Use building data" toggle in bill calculator
  ├── Auto-populate flat count
  ├── Link parking to specific flats
  ├── Generate per-flat bills
  └── Payment tracking per flat

  10. Technical Decisions

  | Aspect           | Decision                      | Rationale
           |
  |------------------|-------------------------------|----------------------
  ---------|
  | State Management | React useState + localStorage | Simple, no external
  deps      |
  | Routing          | Client-side tab switching     | No need for URL
  routing (PWA) |
  | Forms            | Controlled components         | Better validation
  control     |
  | IDs              | crypto.randomUUID()           | Browser-native,
  unique        |
  | Validation       | Inline validation + submit    | Better UX than only
  on submit |
  | i18n             | Extend existing system        | Consistent with
  current app   |

  11. localStorage Schema (Updated)

  localStorage.getItem('buildingData') = {
    id: "uuid",
    name: "Green Tower", // or "গ্রিন টাওয়ার"
    address: "Gulshan, Dhaka",
    totalFloors: 10,
    flats: [
      {
        id: "uuid",
        flatNumber: "1A", // Flexible format
        floorNumber: "1", // or "G" for ground
        ownershipType: "owned", // or "rented"
        residents: [
          {
            id: "uuid",
            name: "Ahmed Ali",
            phone: "+880 1711-123456",
            email: "ahmed@example.com", // optional
            nid: "1234567890", // optional
            moveInDate: "2024-01-01", // optional
            notes: "" // optional
          }
        ],
        motorcycleParkingCount: 1, // 0 if none
        carParkingCount: 0, // 0 if none
        notes: "" // optional
      }
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  }

  localStorage.getItem('activeView') = 'bills' | 'residents'

  12. Accessibility & Localization

  Accessibility:
  - ARIA labels for all buttons and inputs
  - Keyboard navigation (Tab, Enter, Escape)
  - Focus management in modals/forms
  - Screen reader support for dynamic content
  - High contrast mode support
  - Touch-friendly for elderly users

  Localization (i18n):
  - Add translations to src/locales/bn.ts and en.ts
  - Use existing t() function from utils/i18n.ts
  - Bilingual labels where helpful (e.g., "বিল/Bills")
  - Support Bangla number formatting (০১২৩...)
  - Date formatting with locale support

  ---
  ## NEXT STEPS: START IMPLEMENTATION

  Begin with Phase 1 (Foundation) implementation:
  1. Update types
  2. Create storage utilities
  3. Add i18n translations
  4. Build Navigation component
  5. Create Building Setup flow

  Track progress in ai/building-user-entry/summary.md

⏺ The plan is complete! Key highlights:

  Architecture: Simple tab-based navigation with localStorage, maintaining
  your existing i18n and PWA setup.

  UX Flow: Industry-standard list-based management with floor grouping -
  familiar pattern for users (similar to contacts apps, property management
  systems).

  Implementation: Phased approach starting with essential features, allowing
   you to validate with users before adding complexity.

  Smart Integration: Building data can optionally enhance the existing bill
  calculator (auto-populate flat count, link parking charges).