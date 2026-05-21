# Add Anime Pages

No new API or backend changes. The existing TMDB edge function already allows `/discover/tv` and `/discover/movie`, which is all anime needs.

## Data strategy
Use TMDB Discover with the broadest reliable anime filter so we catch **every anime available**:

- `with_genres=16` (Animation)
- `with_original_language=ja` (Japanese original audio — catches anime regardless of country of production, more inclusive than `with_origin_country=JP`)
- `sort_by=popularity.desc`
- Pagination support (page param) so the grids can load more

This combination is the standard "all anime" query used across anime catalogs and avoids missing co-productions while still excluding Western animation.

## Changes

### 1. `src/lib/tmdb.ts`
Add two fetchers:
- `getAnimeTVShows(page = 1)` → `/discover/tv` with the filter above
- `getAnimeMovies(page = 1)` → `/discover/movie` with the filter above

### 2. `src/hooks/use-media.ts`
Add `useAnimeTVShows(enabled)` and `useAnimeMovies(enabled)` mirroring the existing language hooks (1h staleTime).

### 3. `src/components/sections/MovieSections.tsx` (and TV sibling if present)
Add `AnimeSection` (TV) and `AnimeMoviesSection` exports using `DynamicSection`, icon e.g. `Sparkles` or `Flame`.

### 4. Homepage row
Inject `<AnimeSection />` into `src/pages/Index.tsx` near the other trending/language rows.

### 5. New pages
- `src/pages/Anime.tsx` — anime TV grid, paginated, opens `TVShowModal` via `openTVModal`
- `src/pages/AnimeMovies.tsx` — anime movie grid, paginated, opens `MovieModal` via `openMovieModal`

Both follow the existing `Movies.tsx` / `TVShows.tsx` pattern (FilterBar optional — start without it to keep scope tight; can be added later).

### 6. Routing — `src/App.tsx`
```tsx
const Anime = lazy(() => import("./pages/Anime"));
const AnimeMovies = lazy(() => import("./pages/AnimeMovies"));
// ...
<Route path="/anime" element={<Anime />} />
<Route path="/anime-movies" element={<AnimeMovies />} />
```

### 7. Header nav — `src/components/Header.tsx`
Add two nav links: **Anime** → `/anime`, **Anime Movies** → `/anime-movies`. Mirror existing Movies/TV NavLink styling and include them in the mobile dropdown.

### 8. Memory update
Update `mem://index.md` Core rule from "Only /movies and /tv routes" to also allow `/anime` and `/anime-movies`.

## Out of scope
- No edge function changes (already supports discover endpoints)
- No backend/RLS changes
- No new modal — reuses existing `MovieModal` and `TVShowModal`
- FilterBar integration on anime pages (can be a follow-up)
