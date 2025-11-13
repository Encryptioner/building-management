# Testing Local PDF Generator Package

This guide shows how to test the extracted `@encryptioner/html-to-pdf-generator` package locally in this project.

## Package Location
- **Local Package**: `/<file-path>/html-to-pdf-generator`
- **Package Name**: `@encryptioner/html-to-pdf-generator`
- **Current Project**: `/<file-path>/service-charge`

## Method 1: Using `pnpm link` (Recommended)

### Step 1: Link the Package Globally

In the pdf generator project directory:

```bash
cd /<file-path>/html-to-pdf-generator

# Build the package (if not already built)
pnpm build

# Link it globally
pnpm link --global
```

### Step 2: Link in This Project

In the service-charge project directory:

```bash
cd /<file-path>/service-charge

# Link the global package
pnpm link --global @encryptioner/html-to-pdf-generator
```

### Step 3: Update Imports

Replace the local imports with the package imports:

**Before:**
```typescript
import { usePDFGeneratorManual } from './lib/pdf-generator/hooks';
import { PDF_CONTENT_WIDTH_PX } from './utils/pdf-helpers';
```

**After:**
```typescript
import { usePDFGeneratorManual } from '@encryptioner/html-to-pdf-generator/react';
// Note: PDF_CONTENT_WIDTH_PX might need to be handled differently or re-exported
```

### Step 4: Test

```bash
pnpm dev
```

Visit your app and test the PDF generation functionality.

### Step 5: Unlink When Done

To unlink and go back to local version:

```bash
# In service-charge project
pnpm unlink --global @encryptioner/html-to-pdf-generator

# Optionally, in pdf generator project
cd /<file-path>/html-to-pdf-generator
pnpm unlink --global
```

## Method 2: Using `file:` Protocol (Alternative)

This method doesn't require linking and changes are reflected immediately.

### Step 1: Add Dependency

Edit `package.json` in the service-charge project:

```json
{
  "dependencies": {
    "@encryptioner/html-to-pdf-generator": "file:../html-to-pdf-generator"
  }
}
```

### Step 2: Install

```bash
pnpm install
```

This creates a symlink to the local package.

### Step 3: Update Imports (same as Method 1)

### Step 4: Test

```bash
pnpm dev
```

### Step 5: Switch Back

When ready to use the npm published version:

```json
{
  "dependencies": {
    "@encryptioner/html-to-pdf-generator": "^1.0.0"
  }
}
```

Then run `pnpm install`.

## Method 3: Using Workspace (If Using Monorepo)

If you want to manage both projects in a monorepo:

### Create pnpm-workspace.yaml

In a parent directory containing both projects:

```yaml
packages:
  - 'service-charge'
  - 'html-to-pdf-generator'
```

Then you can reference the package directly in service-charge's package.json:

```json
{
  "dependencies": {
    "@encryptioner/html-to-pdf-generator": "workspace:*"
  }
}
```

## Important Notes

### 1. Build the Package First

Always build the pdf generator before linking/testing:

```bash
cd /<file-path>/html-to-pdf-generator
pnpm build
```

### 2. Watch Mode for Development

If you're actively developing the package, use watch mode:

```bash
cd /<file-path>/html-to-pdf-generator
pnpm dev  # Runs tsup --watch
```

This auto-rebuilds when you make changes.

### 3. PDF_CONTENT_WIDTH_PX Constant

The `PDF_CONTENT_WIDTH_PX` constant from `src/utils/pdf-helpers.ts` is specific to this project. You have two options:

**Option A: Keep it local**
```typescript
// In service-charge project
export const PDF_CONTENT_WIDTH_PX = 718; // A4 width - margins
```

**Option B: Export from package**
```typescript
// In html-to-pdf-generator/src/index.ts
export { PDF_CONTENT_WIDTH_PX } from './utils/pdf-helpers';

// Then import in service-charge
import { PDF_CONTENT_WIDTH_PX } from '@encryptioner/html-to-pdf-generator';
```

## Current File That Uses PDF Generator

The main file using the PDF generator is:
- `src/components/residents/ResidentsPrint.tsx`

It currently imports:
```typescript
import { usePDFGeneratorManual } from '../../lib/pdf-generator/hooks';
import { DEFAULT_PDF_OPTIONS, PDF_CONTENT_WIDTH_PX } from '../../utils/pdf-helpers';
```

To use the package, change to:
```typescript
import { usePDFGeneratorManual } from '@encryptioner/html-to-pdf-generator/react';
import { PDF_CONTENT_WIDTH_PX } from '../../utils/pdf-helpers'; // Keep local
```

## Quick Test Commands

```bash
# In pdf generator directory
cd /<file-path>/html-to-pdf-generator
pnpm build
pnpm link --global

# In service-charge directory
cd /<file-path>/service-charge
pnpm link --global @encryptioner/html-to-pdf-generator

# Update imports in ResidentsPrint.tsx
# Then test
pnpm dev
```

## Troubleshooting

### Issue: "Cannot find module @encryptioner/html-to-pdf-generator"

**Solution**: Make sure you built and linked the package:
```bash
cd /<file-path>/html-to-pdf-generator
pnpm build
pnpm link --global
```

### Issue: "Changes not reflected"

**Solution**:
1. Rebuild the package: `pnpm build` (or use `pnpm dev` for watch mode)
2. If using `pnpm link`, you might need to restart your dev server

### Issue: "Type errors"

**Solution**: Make sure the package has TypeScript definitions built:
```bash
cd /<file-path>/html-to-pdf-generator
ls -la dist/*.d.ts  # Should see index.d.ts, react.d.ts, etc.
```

### Issue: "Peer dependency warnings"

**Solution**: The package has React as a peer dependency. Make sure React is installed in service-charge project (it already is).

## Recommended Workflow

1. **Development Phase**:
   - Use Method 2 (file: protocol) or Method 1 (pnpm link)
   - Keep pdf generator in watch mode: `pnpm dev`
   - Changes reflect immediately

2. **Testing Phase**:
   - Build the package: `pnpm build`
   - Link and test all features
   - Verify PDF generation works identically

3. **Production Phase**:
   - Publish package to npm
   - Update service-charge to use `"@encryptioner/html-to-pdf-generator": "^1.0.0"`
   - Remove local lib folder if no longer needed

## Next Steps

After successfully testing locally:

1. ✅ Verify all PDF generation features work
2. ✅ Test on different screen sizes (desktop, mobile)
3. ✅ Ensure no regressions in PDF output
4. 📦 Publish to npm: `npm publish --access public`
5. 🔄 Update service-charge to use published package
6. 🗑️ Remove `src/lib/pdf-generator/` folder (keep a backup first!)
