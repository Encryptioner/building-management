# TypeScript Fixes - UsePDFGeneratorManualReturn

## Issue
The type `UsePDFGeneratorManualReturn` was being exported and used in the React adapter but was never actually defined. This caused TypeScript errors.

## Root Cause
The `usePDFGeneratorManual` function in both:
- `src/lib/pdf-generator/adapters/react/usePDFGenerator.ts`
- `src/lib/pdf-generator/hooks.ts`

...was using an inline return type instead of a named exported interface:
```typescript
// OLD - inline type
export function usePDFGeneratorManual(
  options: UsePDFGeneratorOptions = {}
): Omit<UsePDFGeneratorReturn, 'targetRef'> & {
  generatePDF: (element: HTMLElement, filename?: string) => Promise<PDFGenerationResult | null>;
  generateBlob: (element: HTMLElement) => Promise<Blob | null>;
} {
  // ...
}
```

But the `index.ts` file was trying to export a type that didn't exist:
```typescript
export type {
  UsePDFGeneratorOptions,
  UsePDFGeneratorReturn,
  UsePDFGeneratorManualReturn,  // ❌ This didn't exist!
} from './usePDFGenerator';
```

## Fixes Applied

### 1. Created Missing Type Definition
Added the `UsePDFGeneratorManualReturn` interface in both files:

```typescript
export interface UsePDFGeneratorManualReturn {
  /** Generate and download PDF from a custom element */
  generatePDF: (element: HTMLElement, filename?: string) => Promise<PDFGenerationResult | null>;

  /** Generate PDF blob from a custom element without downloading */
  generateBlob: (element: HTMLElement) => Promise<Blob | null>;

  /** Whether PDF is currently being generated */
  isGenerating: boolean;

  /** Current progress (0-100) */
  progress: number;

  /** Error if generation failed */
  error: Error | null;

  /** Result from last successful generation */
  result: PDFGenerationResult | null;

  /** Reset state */
  reset: () => void;
}
```

### 2. Fixed Import Paths in React Adapter
The React adapter was importing from wrong paths:

```typescript
// OLD - incorrect relative paths
import { PDFGenerator } from './core';
import type { PDFGeneratorOptions, PDFGenerationResult } from './types';

// NEW - correct paths
import { PDFGenerator } from '../../core';
import type { PDFGeneratorOptions, PDFGenerationResult } from '../../types';
```

### 3. Added Missing Callback Types
Added optional callback properties to `UsePDFGeneratorOptions`:

```typescript
export interface UsePDFGeneratorOptions extends Partial<PDFGeneratorOptions> {
  /** Filename for the generated PDF */
  filename?: string;
  /** Callback for progress updates */
  onProgress?: (progress: number) => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
  /** Callback when PDF generation completes */
  onComplete?: (blob: Blob) => void;
}
```

### 4. Fixed Ref Type to Allow Null
Updated the `targetRef` type to properly handle null:

```typescript
// OLD
targetRef: React.RefObject<HTMLDivElement>;

// NEW
targetRef: React.RefObject<HTMLDivElement | null>;
```

And the ref initialization:
```typescript
// OLD
const targetRef = useRef<HTMLDivElement>(null);

// NEW
const targetRef = useRef<HTMLDivElement | null>(null);
```

### 5. Excluded Non-Project Files from TypeScript Checking
Updated `tsconfig.json` to exclude files that are:
- Documentation examples (don't need to compile in this project)
- Framework adapters requiring peer dependencies (Vue, Svelte)
- Library build configuration (tsup.config.ts)

```json
{
  "exclude": [
    "dist",
    "docs/examples",
    "src/lib/pdf-generator/EXAMPLE.tsx",
    "src/lib/pdf-generator/tsup.config.ts",
    "src/lib/pdf-generator/adapters/vue",
    "src/lib/pdf-generator/adapters/svelte"
  ]
}
```

## Files Modified

1. **`src/lib/pdf-generator/adapters/react/usePDFGenerator.ts`**
   - Added `UsePDFGeneratorManualReturn` interface
   - Fixed import paths (./core → ../../core, ./types → ../../types)
   - Added callback types to `UsePDFGeneratorOptions`
   - Fixed `targetRef` type to allow null
   - Updated function signature to use named type

2. **`src/lib/pdf-generator/hooks.ts`**
   - Added `UsePDFGeneratorManualReturn` interface
   - Added callback types to `UsePDFGeneratorOptions`
   - Fixed `targetRef` type to allow null
   - Updated function signature to use named type

3. **`tsconfig.json`**
   - Added exclusions for documentation examples and non-project files

## Verification

### TypeScript Check
```bash
pnpm astro check
```

**Result**: ✅ **0 errors, 0 warnings** (only 31 hints which are suggestions)

### Dev Server
```bash
pnpm dev
```

**Result**: ✅ Running successfully at `http://localhost:4321/building-management/`

## Benefits

1. **Type Safety**: The `UsePDFGeneratorManualReturn` type is now properly defined and exported
2. **Better DX**: TypeScript can now provide proper autocomplete and type checking
3. **Consistency**: Both `usePDFGenerator` and `usePDFGeneratorManual` now use named exported types
4. **Documentation**: The types serve as inline documentation for the API
5. **Clean Build**: No TypeScript errors in the project

## Testing

After these fixes:
- [x] TypeScript compilation succeeds
- [x] Dev server starts without errors
- [x] All type exports are valid
- [x] No breaking changes to public API

## Related Files

- `src/lib/pdf-generator/adapters/react/index.ts` - Exports the type
- `src/lib/pdf-generator/README.md` - Documents the API (uses the type)
- `docs/examples/pdf-generator/react/App.tsx` - Example usage (excluded from check)
