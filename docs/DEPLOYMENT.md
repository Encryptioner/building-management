# Deployment Guide

This project supports two deployment scenarios:

1. **GitHub Pages** (subdirectory deployment)
2. **Custom Domain** (root deployment)

## 🚀 GitHub Pages Deployment (Current Default)

### Automatic Deployment

The project is configured for automatic deployment to GitHub Pages.

**Deployment URL:** `https://encryptioner.github.io/building-management/`

### Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Automatic Build:**
   - GitHub Actions will automatically build and deploy
   - Check the **Actions** tab for deployment status

3. **Verify Deployment:**
   - Visit: `https://encryptioner.github.io/building-management/`
   - Check service worker registration in DevTools → Application → Service Workers

### Manual Build (Local Testing)

```bash
# Build for GitHub Pages
pnpm build:github

# Or explicitly
DEPLOY_TARGET=github pnpm build

# Preview
pnpm preview
```

---

## 🌐 Custom Domain Deployment

When you're ready to deploy to your own domain, follow these steps:

### 1. Update Configuration

**Option A: Environment Variable (Recommended)**

Set the `SITE_URL` environment variable:

```bash
SITE_URL=https://yourdomain.com DEPLOY_TARGET=custom pnpm build
```

**Option B: Update astro.config.mjs**

Edit `astro.config.mjs` and update the custom config:

```javascript
custom: {
  site: 'https://yourdomain.com',  // Your domain here
  base: '/',
}
```

### 2. Build for Custom Domain

```bash
# Build for custom domain
pnpm build:custom

# Or with environment variable
DEPLOY_TARGET=custom pnpm build
```

### 3. Deploy to Your Hosting

The build output is in the `dist/` folder. Deploy this folder to your hosting provider:

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Traditional Hosting (cPanel, FTP, etc.)
1. Build the project: `pnpm build:custom`
2. Upload the contents of `dist/` to your web root
3. Ensure your server serves `index.html` for all routes

### 4. DNS Configuration

Point your domain to your hosting provider:

- **Vercel/Netlify:** Follow their DNS setup instructions
- **Traditional Hosting:**
  - A Record → Your server IP
  - CNAME (www) → Your domain

### 5. SSL Certificate

Ensure HTTPS is enabled (required for service workers):

- **Vercel/Netlify:** Automatic SSL
- **Traditional Hosting:** Use Let's Encrypt or your hosting provider's SSL

---

## 🔄 Switching Between Deployments

### From GitHub Pages to Custom Domain

1. Build for custom domain:
   ```bash
   pnpm build:custom
   ```

2. Deploy to your hosting

3. Update GitHub Pages settings (optional):
   - Repository Settings → Pages
   - Disable GitHub Pages if not needed

### From Custom Domain to GitHub Pages

1. Build for GitHub Pages:
   ```bash
   pnpm build:github
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

---

## ⚙️ Environment Variables

### Available Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEPLOY_TARGET` | Deployment target (`github` or `custom`) | `github` | No |
| `SITE_URL` | Full site URL for custom domain | `https://servicecharge.example.com` | Only for custom |

### Setting Environment Variables

#### Local Development

Create `.env` file:
```bash
DEPLOY_TARGET=custom
SITE_URL=https://yourdomain.com
```

#### CI/CD (GitHub Actions)

Add to repository secrets or workflow file:
```yaml
env:
  DEPLOY_TARGET: custom
  SITE_URL: https://yourdomain.com
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] All assets load (check DevTools Network tab)
- [ ] Service worker registers (DevTools → Application → Service Workers)
- [ ] PWA manifest is valid (DevTools → Application → Manifest)
- [ ] App can be installed (Add to Home Screen)
- [ ] Offline mode works (DevTools → Network → Offline)
- [ ] Language switching works
- [ ] PDF generation works
- [ ] Print functionality works

---

## 📁 Build Output

### GitHub Pages Build

```
dist/
├── building-management/
│   ├── index.html
│   ├── favicon.svg
│   ├── manifest.json       # Points to /building-management/
│   ├── sw.js               # Auto-detects /building-management/
│   └── _astro/
```

### Custom Domain Build

```
dist/
├── index.html
├── favicon.svg
├── manifest.json           # Points to /
├── sw.js                   # Auto-detects /
└── _astro/
```

---

## 🐛 Troubleshooting

### Service Worker Not Registering

**Symptom:** Console error: `Failed to register service worker`

**Solution:**
1. Ensure HTTPS is enabled
2. Check `manifest.json` has correct paths
3. Verify `sw.js` is accessible at the correct URL
4. Clear browser cache and reload

### Assets 404 Errors

**Symptom:** Favicon, icons, or CSS not loading

**Solution:**
1. Check you built with correct `DEPLOY_TARGET`
2. Verify `base` URL in `astro.config.mjs`
3. Rebuild with: `pnpm build:github` or `pnpm build:custom`

### PWA Not Installing

**Symptom:** "Add to Home Screen" not appearing

**Solution:**
1. Verify HTTPS is enabled
2. Check `manifest.json` is valid
3. Ensure all required manifest fields are present
4. Service worker must be registered successfully

---

## 📚 Additional Resources

- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [PWA Manifest Documentation](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🎯 Quick Commands Reference

```bash
# GitHub Pages (default)
pnpm build
pnpm build:github

# Custom Domain
pnpm build:custom
DEPLOY_TARGET=custom pnpm build

# With custom URL
SITE_URL=https://yourdomain.com DEPLOY_TARGET=custom pnpm build

# Development
pnpm dev

# Preview build
pnpm preview
```

---

**Need Help?** Check the [main README](README.md) or open an issue on GitHub.
