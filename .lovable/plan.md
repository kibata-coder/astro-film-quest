

## Plan: Optimize App Performance and Load Speed

### Problems Identified

1. **Double font loading**: Google Fonts imported via `@import` in `index.css` AND preloaded in `index.html` — the CSS `@import` is render-blocking.
2. **Genre sections fetch data even when off-screen**: All 12 genre hooks fire on mount inside `DynamicSection`, even though `LazySection` wraps the rendering. The data fetches happen immediately regardless of scroll position.
3. **ForYouSection bypasses React Query**: Uses raw `useState`/`useEffect` — no caching, refetches every mount.
4. **LatestSection fires 20 individual API calls**: Fetches 10 movie details + 10 TV show details individually — massive waterfall.
5. **Edge function returns no cache headers**: Every TMDB response is re-fetched from scratch on each call.
6. **Missing `preconnect` to `image.tmdb.org`**: Images are the heaviest asset but the browser doesn't get an early connection hint.

### Changes

**1. `src/index.css`** — Remove the `@import` Google Fonts line (line 1). Already handled by the optimized preload in `index.html`.

**2. `src/components/sections/MovieSections.tsx`** — Make `DynamicSection` accept an `enabled` prop and pass it to `useDataHook`. When inside `LazySection`, only enable data fetching once the section is visible. This requires:
- Adding a visibility state to `LazySection` (expose via render prop or callback).
- Refactoring `DynamicSection` to use an `enabled` flag.
- Updating all genre hooks in `use-media.ts` to accept an `enabled` parameter.

**3. `src/hooks/use-media.ts`** — Add optional `enabled` parameter to all genre hooks so queries don't fire until the section scrolls into view.

**4. `src/components/LazySection.tsx`** — Support a render-prop pattern: `children` can be a function receiving `{ isVisible }`, so `DynamicSection` knows when to start fetching.

**5. `src/components/ForYouSection.tsx`** — Convert to use `useQuery` from React Query for caching and deduplication. Replace `useState`/`useEffect` with a single `useQuery` call.

**6. `src/components/LatestSection.tsx`** — Reduce individual API calls from 10 to 5 per category (movies + TV), cutting the waterfall in half.

**7. `supabase/functions/tmdb/index.ts`** — Add `Cache-Control` header to successful responses (e.g., `max-age=300` for 5-minute browser caching).

**8. `index.html`** — Add `<link rel="preconnect" href="https://image.tmdb.org">` for faster image loading.

### Technical Details

The biggest win is change #2-4 (lazy data fetching). Currently, landing on the homepage triggers ~15+ parallel API calls even though only 2-3 sections are visible. With lazy fetching, only visible sections fetch data, reducing initial API calls to ~3-4.

```text
Before (homepage load):
  → trending movies    ← needed (visible)
  → trending TV        ← needed (visible)  
  → action movies      ← NOT visible, fetched anyway
  → adventure movies   ← NOT visible, fetched anyway
  → comedy movies      ← NOT visible, fetched anyway
  → ... (12 more genre calls)
  → latest movies (10 detail calls)
  → latest TV (10 detail calls)
  Total: ~30+ API calls on load

After:
  → trending movies    ← fetched
  → trending TV        ← fetched  
  → genre sections     ← fetch only when scrolled into view
  → latest sections    ← fetch only when scrolled into view (5 each)
  Total: ~3-4 API calls on load, rest on scroll
```

