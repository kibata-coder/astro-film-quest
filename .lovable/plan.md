# Speed up TMDB & Vidsrc loading

## Diagnosis

**TMDB slowness** — every call goes `client → supabase.functions.invoke('tmdb') → TMDB`. The edge function only sets a browser `Cache-Control: max-age=300` header but does no server-side caching, so cold invokes pay full TMDB latency + edge cold-start every time, and the homepage fires ~15 parallel section queries on first load. Also `supabase.functions.invoke` uses POST, which browsers never cache.

**Vidsrc slowness** — we don't call Vidsrc ourselves; it's a third-party iframe (`vsembed.su` etc.). What's slow is the iframe's own JS/scrapers. We can't fix their backend, but we can shave the connection setup time and avoid loading it before the user clicks play.

## Changes

### 1. Edge function: server-side cache (`supabase/functions/tmdb/index.ts`)
- Use Deno's built-in `caches.default` keyed on `endpoint+params` (no auth, public data).
- Cache TTLs by endpoint type:
  - `/trending/*`, `/discover/*`, genre lists → 1 hour
  - `/movie/:id`, `/tv/:id`, season/episode details → 24 hours
  - `/search/*` → 5 minutes
- Return cached response immediately on hit (skips TMDB round-trip & cold-start cost).
- Bump browser `Cache-Control` headers to match (also add `stale-while-revalidate`).

### 2. Client: switch from `functions.invoke` to plain `fetch` GET (`src/lib/tmdb.ts`)
- Build a stable GET URL: `${SUPABASE_URL}/functions/v1/tmdb?endpoint=...&params=...`.
- Browser HTTP cache + service-worker-less BFCache will now reuse responses across reloads.
- Keep anon key in `Authorization` header (same as invoke does).
- Update edge function to accept both GET (query string) and POST (existing body) for compatibility.

### 3. React Query tuning (`src/hooks/use-media.ts` + `App.tsx`)
- Raise `staleTime` for static-ish lists (trending: 15 min, genres/discover: 6 h, details: 24 h).
- Keep `gcTime` at 1 h+ so back-navigation is instant.
- Stagger non-critical homepage sections: keep top 3 eager, wrap the rest in the existing `LazySection` (IntersectionObserver) so they only fetch when scrolled near.

### 4. Preconnect to streaming hosts (`index.html`)
- Add `<link rel="preconnect">` + `dns-prefetch` for `vsembed.su`, `vidsrc-embed.su`, `vidsrcme.su`, `vsrc.su` so TLS/DNS is warm before the user clicks Play.
- Add `preconnect` to the Supabase functions origin too.

### 5. Iframe loading hint (`src/features/player/VideoPlayer.tsx`)
- Add `loading="eager"` + `referrerPolicy="no-referrer"` (already there) and `importance="high"` to the iframe so the browser prioritizes it.
- Show the existing loading spinner until `onLoad` fires (already done) — no change needed if present.

## Out of scope
- Migrating off Vidsrc, queue-based async job system (overkill for read-only public data), service workers, or any visual redesign.

## Expected impact
- Repeat homepage loads: near-instant (HTTP cache + React Query cache).
- First load for any user: faster after the first visitor warms the edge cache for that endpoint (shared `caches.default`).
- Vidsrc click-to-play: ~200-500 ms saved on first play via preconnect.
