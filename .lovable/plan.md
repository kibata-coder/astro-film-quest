## Goal
Let users explore an actor's or director's full body of work and play any title directly from their page.

## Entry points
1. **Clickable cast in modals** — In `MovieModal` and `TVShowModal`, make each cast member's name/photo a link to `/person/:id`.
2. **People in search** — Extend search to include TMDB `/search/person`. Add a "People" section in search results showing photo + name + known-for role; click → `/person/:id`.

## New route: `/person/:id`
Full-page route (added to `App.tsx`), styled to match existing pages (dark theme, semantic tokens).

Layout:
- Header strip: profile photo, name, known-for department, short bio (collapsible "Read more"), birthday/place of birth.
- Filmography tabs/sections, split by role and media type:
  - **Acting — Movies**
  - **Acting — TV**
  - **Directing — Movies**
  - **Directing — TV**
  - (Hide empty sections.)
- Each section is a responsive grid of `MediaCard`s sorted by popularity, with year + character/job under the title.
- Clicking a card opens the existing `MovieModal` / `TVShowModal` (with Play button → existing `VideoPlayer` / `AnimePlayer`). No new playback logic.

## TMDB additions (`src/lib/tmdb.ts`)
- `getPersonDetails(personId)` → `/person/{id}`
- `getPersonCombinedCredits(personId)` → `/person/{id}/combined_credits` (returns `cast` and `crew` with `media_type`)
- `searchPeople(query, signal)` → `/search/person`
- Types: `Person`, `PersonCredit`.

Filmography is derived client-side from `combined_credits`:
- Acting Movies = `cast.filter(c => c.media_type === 'movie')`
- Acting TV = `cast.filter(c => c.media_type === 'tv')`
- Directing Movies = `crew.filter(c => c.media_type === 'movie' && c.job === 'Director')`
- Directing TV = `crew.filter(c => c.media_type === 'tv' && c.job === 'Director')`
- Sort each by `popularity` desc; dedupe by id within each list.

## Hooks (`src/hooks/use-media.ts`)
- `usePerson(id)` — details
- `usePersonCredits(id)` — combined credits, 1h staleTime
- Extend `useSearchMedia` to also run `searchPeople` via `Promise.allSettled`, returning `{ movies, tvShows, people }`.

## Components
- `src/pages/Person.tsx` — the new route page.
- `src/components/PersonHeader.tsx` — photo + bio block.
- `src/components/FilmographySection.tsx` — titled grid of `MediaCard`s for one role/type bucket; opens the matching modal on click via `MediaContext`.
- Update `MovieModal` and `TVShowModal` cast lists: wrap each cast item in a `Link to={\`/person/${cast.id}\`}` and close the modal on navigate.
- Update search UI (in `Header` search overlay) to render a "People" group when results exist.

## Playback
Reuse existing flow: opening a movie/TV card uses the same `openMovie` / `openShow` actions in `MediaContext`, which already wire up the Play button and `VideoPlayer` / `AnimePlayer`. No backend or player changes.

## Out of scope
- No "follow person" / notifications.
- No backend tables; everything is TMDB-driven and cached by react-query.
- No crew roles beyond Director (can extend later).

## Files touched
- New: `src/pages/Person.tsx`, `src/components/PersonHeader.tsx`, `src/components/FilmographySection.tsx`
- Edited: `src/App.tsx` (route), `src/lib/tmdb.ts`, `src/hooks/use-media.ts`, `src/features/movies/MovieModal.tsx`, `src/features/tv/TVShowModal.tsx`, `src/components/Header.tsx` (search results People group)
