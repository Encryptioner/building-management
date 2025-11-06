# PWA Icon Generation Guide

To generate PWA icons for the Building Management:

## Option 1: Using Online Tools (Recommended)

1. **Use PWA Asset Generator**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload your logo/icon (minimum 512x512 PNG)
   - Download generated icons
   - Place `icon-192.png` and `icon-512.png` in the `public/` folder

2. **Alternative: RealFaviconGenerator**
   - Visit: https://realfavicongenerator.net/
   - Upload your icon
   - Select PWA icons
   - Download and extract to `public/`

## Option 2: Using ImageMagick (Command Line)

If you have a logo.png (512x512 or larger):

```bash
# Install ImageMagick if needed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate 192x192 icon
convert logo.png -resize 192x192 public/icon-192.png

# Generate 512x512 icon
convert logo.png -resize 512x512 public/icon-512.png
```

## Option 3: Create Simple Placeholder Icons

For now, placeholders are created. Replace them with:
- `icon-192.png` - 192x192 PNG with your app logo/branding
- `icon-512.png` - 512x512 PNG with your app logo/branding

## Current Setup

The manifest.json is already configured to use:
- `/service-charge/icon-192.png`
- `/service-charge/icon-512.png`

Just replace the placeholder files with your actual icons!
