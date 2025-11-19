// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Configuration for deployment
// Use DEPLOY_TARGET environment variable to switch between GitHub Pages and custom domain
// Examples:
//   - GitHub Pages: DEPLOY_TARGET=github pnpm build
//   - Custom domain: DEPLOY_TARGET=custom pnpm build (or just pnpm build)
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'github';

const config = {
  github: {
    site: 'https://encryptioner.github.io',
    base: '/building-management/',
  },
  custom: {
    site: process.env.SITE_URL || 'https://servicecharge.example.com',
    base: '/',
  },
};

const deployConfig = (DEPLOY_TARGET === 'github' || DEPLOY_TARGET === 'custom')
  ? config[DEPLOY_TARGET]
  : config.custom;

// https://astro.build/config
export default defineConfig({
  site: deployConfig.site,
  base: deployConfig.base,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  // Production optimizations
  build: {
    inlineStylesheets: 'auto',
  },

  // Compression and performance
  compressHTML: true,
});