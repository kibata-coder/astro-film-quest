

## Diagnosis

After inspecting the live mobile view and all relevant code, here are the concrete issues:

### 1. Header cramped on mobile when signed in
The header row on mobile shows: **SoudFlex | Sparkles icon | Search icon | UserCircle icon | Hamburger menu** -- that's 5 items in a narrow bar. The `gap-10` between logo and nav area pushes everything together. The Sparkles "For You" shortcut icon is redundant since it's already in the mobile menu.

### 2. Index.tsx layout -- ContinueWatching + FeedCustomizer in broken flex row
Line 58-61: `ContinueWatchingSection` (which is full-width) and `FeedCustomizer` are placed in a `flex items-center justify-between` row. This forces them side-by-side, which breaks when ContinueWatching takes the full width. They should be stacked vertically.

### 3. ForYouSection "Refresh" button visible in header area
The ForYouSection title ("Top Picks For You" + "Refresh" button) renders inside the main content but visually overlaps with the header on small screens because the `-mt-20` on the main area pulls content up into the banner zone.

### 4. Media cards not responsive enough
Cards are fixed at `w-40 md:w-48` which only shows ~2 cards on mobile. The gap and card sizing could be more dynamic to fit the viewport better.

### 5. Video player embed URL format
The current Vidsrc embed URLs use `/embed/movie/{id}` and `/embed/tv/{id}/{season}-{episode}`. Need to verify this matches the actual working format -- the documented format may use `/embed/movie?tmdb={id}` or similar query-param style.

---

## Plan

### File: `src/components/Header.tsx`
- Remove the mobile-only Sparkles "For You" shortcut button (lines 112-123). It's redundant -- already in the hamburger menu.
- Reduce gap between logo and right-side items on mobile from `gap-10` to `gap-4 md:gap-10`.

### File: `src/pages/Index.tsx`
- Fix the ContinueWatching + FeedCustomizer layout: change from a horizontal flex row to a vertical stack. Put FeedCustomizer as a small aligned button above the sections, not beside ContinueWatching.
- Restructure lines 58-63 so ContinueWatching and FeedCustomizer are separate blocks.

### File: `src/components/MediaCard.tsx`
- Make cards slightly smaller on mobile: change from `w-40` to `w-[130px] sm:w-40 md:w-48` for better fit on small screens (shows ~2.5 cards instead of ~2).

### File: `src/components/ForYouSection.tsx`
- Make the "Refresh" button icon-only on mobile (hide the "Refresh" text) to prevent header overlap.
- Match card sizing to MediaCard responsive widths.

### File: `src/lib/vidsrc.ts`
- Update embed URLs to use the query-parameter format that matches the current vsembed.ru API:
  - Movie: `https://vsembed.ru/embed/movie?tmdb={id}`
  - TV: `https://vsembed.ru/embed/tv?tmdb={id}&season={s}&episode={e}`

### File: `src/features/player/VideoPlayer.tsx`
- Ensure the iframe `sandbox` and `allow` attributes are correct for fullscreen. Add `referrerpolicy="origin"` for embed compatibility.

