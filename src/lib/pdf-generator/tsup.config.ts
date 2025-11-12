/**
 * Build configuration for PDF Generator library
 *
 * This configuration creates separate bundles for:
 * - Core library (framework-agnostic)
 * - React adapter
 * - Vue adapter
 * - Svelte adapter
 */

import { defineConfig } from 'tsup';

export default defineConfig([
  // Core bundle (framework-agnostic)
  {
    entry: {
      core: 'src/lib/pdf-generator/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    external: ['jspdf', 'html2canvas'],
    treeshake: true,
    splitting: false,
    sourcemap: true,
    minify: false, // Keep readable for debugging
    outDir: 'dist/pdf-generator',
  },

  // React adapter
  {
    entry: {
      react: 'src/lib/pdf-generator/adapters/react/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    external: ['react', 'jspdf', 'html2canvas'],
    treeshake: true,
    splitting: false,
    sourcemap: true,
    outDir: 'dist/pdf-generator',
  },

  // Vue adapter
  {
    entry: {
      vue: 'src/lib/pdf-generator/adapters/vue/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    external: ['vue', 'jspdf', 'html2canvas'],
    treeshake: true,
    splitting: false,
    sourcemap: true,
    outDir: 'dist/pdf-generator',
  },

  // Svelte adapter
  {
    entry: {
      svelte: 'src/lib/pdf-generator/adapters/svelte/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    external: ['svelte', 'svelte/store', 'jspdf', 'html2canvas'],
    treeshake: true,
    splitting: false,
    sourcemap: true,
    outDir: 'dist/pdf-generator',
  },
]);
