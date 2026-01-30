
# Remove PWA - Convert to Regular Website

## Overview
Remove all Progressive Web App (PWA) functionality to make SoudFlex a standard website. This eliminates service worker caching conflicts and simplifies the build process.

## Files to Modify

### 1. vite.config.ts
Remove the VitePWA plugin import and configuration:
- Delete `import { VitePWA } from "vite-plugin-pwa";`
- Remove the entire `VitePWA({...})` plugin block (approximately 110 lines of caching configuration)
- Keep all other build optimizations intact

### 2. src/main.tsx
Remove service worker registration code:
- Delete lines 7-18 (the service worker registration block)
- Keep only the React app mounting code (5 lines total)

### 3. index.html
Remove PWA-specific meta tags:
- Delete `<meta name="theme-color">`
- Delete `<meta name="apple-mobile-web-app-capable">`
- Delete `<meta name="apple-mobile-web-app-status-bar-style">`
- Delete `<meta name="apple-mobile-web-app-title">`
- Delete `<link rel="apple-touch-icon">`
- Delete `<link rel="manifest">`
- Keep all other meta tags (Open Graph, Twitter, description, viewport, etc.)

### 4. package.json
Remove the PWA dependency:
- Delete `"vite-plugin-pwa": "^1.2.0"` from dependencies

### 5. Delete PWA Icon Files
- `public/pwa-192x192.png` - Delete
- `public/pwa-512x512.png` - Delete

## Benefits
- Simpler build process
- No service worker caching conflicts on deployments
- Faster initial load (no SW registration overhead)
- Eliminates potential cause of blank screen issues
- Easier debugging without cached assets

## After Implementation
1. Republish on Lovable (click Publish → Update)
2. GitHub sync will trigger Cloudflare rebuild automatically
3. Both sites should now load properly without caching interference
