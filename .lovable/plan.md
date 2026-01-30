
# Fix Black/Blank Screen on Published Sites

## Problem Analysis

Both your published sites are showing blank screens:
- **astro-film-quest.lovable.app** - Black screen (background color with no content)
- **soudflex.pages.dev** - White blank page

The HTML returned from both sites is essentially empty - just `<div id="root"></div>` with no JavaScript bundle being loaded or executed. This indicates a **build failure** that's preventing the JavaScript from being properly generated or served.

## Root Causes Identified

### 1. Vite 7 Breaking Change
Your `package.json` shows `"vite": "^7.3.1"` which is a very recent major version. Vite 7 made breaking changes to the build system:
- Changed how ES module targets work (your `target: "es2015"` may conflict)
- Modified chunk naming and module resolution

### 2. Cloudflare Pages Build Environment
When Cloudflare Pages triggers a build from GitHub:
- It runs `npm install` then `npm run build`
- If the build fails silently or produces malformed output, it may still deploy an empty shell
- The Node.js version on Cloudflare may not support Vite 7's requirements

### 3. Lovable Published Site
The Lovable published site (`astro-film-quest.lovable.app`) runs through Lovable's build pipeline. If there's a build-time error, the old deployment may remain, showing a broken state.

## Solution Plan

### Step 1: Fix Build Configuration for Compatibility
Update `vite.config.ts` to ensure builds work across all environments:
- Change build target from `es2015` to `esnext` (Vite 7 default)
- Simplify manual chunk configuration to avoid module resolution issues
- Ensure PWA plugin configuration is compatible

### Step 2: Add Build Error Visibility
Add a minimal error boundary or fallback HTML that shows if the app fails to load, instead of a blank screen.

### Step 3: Re-publish to Both Platforms
After fixes:
1. Republish on Lovable (click Publish > Update)
2. GitHub sync will trigger Cloudflare rebuild automatically

---

## Technical Details

### Changes to `vite.config.ts`

```text
Current problematic settings:
- target: "es2015" (too old for Vite 7)
- Complex manualChunks (can cause circular dependency issues)

New settings:
- target: "esnext" (modern default)
- Simplified chunking strategy
- Add build.modulePreload.polyfill for older browsers
```

### Changes to `index.html`
Add a no-script fallback and loading indicator so users see something if JavaScript fails:
```html
<noscript>
  <div style="...">
    Please enable JavaScript to use SoudFlex
  </div>
</noscript>
```

### Files to Modify
1. `vite.config.ts` - Fix build configuration
2. `index.html` - Add fallback content

### Verification Steps
After implementing:
1. Test the Lovable preview (should continue working)
2. Click Publish > Update to push to astro-film-quest.lovable.app
3. Verify GitHub received the changes
4. Check Cloudflare Pages dashboard for build logs on soudflex.pages.dev
