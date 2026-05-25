
# Native HLS Anime Player (frontend)

Replace the Vidsrc iframe for anime only. Non-anime keeps the existing iframe. If Consumet fails or times out, anime also falls back to the iframe — no broken state.

## Assumptions

- These 3 edge functions will exist (built next, or already exist) at:
  - `anime-resolve` — `{ tmdbId, mediaType }` → `{ provider, episodes:[{id, number, title, hasDub}], anilistId }` or 404
  - `anime-stream` — `{ episodeId, category }` → `{ sources:[{url,quality}], subtitles:[{url,lang}], headers:{Referer} }`
  - `hls-proxy` — `GET ?url=<encoded>&ref=<encoded>` → streams m3u8/ts/vtt, rewrites inner segment URLs to itself
- `CONSUMET_BASE_URL` secret already configured for the backend (this PR is frontend only — edge functions are a separate task).
- For now, anime detection on the frontend = `original_language === 'ja' && genre_ids.includes(16)` (or `genres[].id === 16` from the detail payload).

## 1. Dependency

Add `hls.js` via npm. `@types/hls.js` is not needed — hls.js ships its own types.

## 2. `src/lib/anime.ts` (new)

```ts
import { supabase } from '@/integrations/supabase/client';

export interface AnimeEpisode { id: string; number: number; title?: string; hasDub?: boolean; }
export interface AnimeResolve { provider: string; anilistId: number; episodes: AnimeEpisode[]; }
export interface AnimeSource { url: string; quality: string; isM3U8?: boolean; }
export interface AnimeSubtitle { url: string; lang: string; }
export interface AnimeStream { sources: AnimeSource[]; subtitles: AnimeSubtitle[]; headers: { Referer?: string }; }

export async function resolveAnime(tmdbId: number|string, mediaType: 'tv'|'movie'): Promise<AnimeResolve | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const { data, error } = await supabase.functions.invoke('anime-resolve', {
      body: { tmdbId: String(tmdbId), mediaType },
    });
    clearTimeout(timer);
    if (error || !data?.episodes?.length) return null;
    return data as AnimeResolve;
  } catch { return null; }
}

export async function getAnimeStream(episodeId: string, category: 'sub'|'dub'): Promise<AnimeStream | null> {
  try {
    const { data, error } = await supabase.functions.invoke('anime-stream', { body: { episodeId, category } });
    if (error || !data?.sources?.length) return null;
    return data as AnimeStream;
  } catch { return null; }
}

export function buildProxyUrl(streamUrl: string, referer?: string): string {
  const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hls-proxy`;
  const params = new URLSearchParams({ url: streamUrl });
  if (referer) params.set('ref', referer);
  return `${base}?${params.toString()}`;
}
```

Note: `supabase.functions.invoke` doesn't accept AbortSignal directly — the 4s timeout is enforced by racing with `Promise.race(...)`; final code will use that pattern.

## 3. `src/features/player/AnimePlayer.tsx` (new)

- HTML5 `<video>` + `hls.js`. Use native HLS on Safari (`canPlayType('application/vnd.apple.mpegurl')`).
- Custom Netflix-skin controls: top bar (back, title, Sub/Dub toggle, episode picker), bottom bar (play/pause, scrubber, time, volume, fullscreen). Auto-hide after 3s of inactivity.
- Pick highest quality source by default; quality menu shown only if >1 source.
- Subtitles via `<track kind="subtitles" srclang={lang} src={proxiedVttUrl} default={lang==='English'}/>`. VTT URLs also routed through `hls-proxy` to dodge CORS.
- Sub/Dub toggle: save `video.currentTime`, refetch `getAnimeStream(episodeId, newCategory)`, destroy current hls instance, reload with new proxied URL, restore time on `loadedmetadata`.
- Loading / error overlays. If stream errors, expose "Try fallback" button that calls `onFallback?.()` (used by context to swap to iframe).
- Props: `{ episodeId; initialCategory: 'sub'|'dub'; title: string; onClose: () => void; onFallback?: () => void; onNext?: () => void; onPrev?: () => void; }`.

## 4. `src/features/player/VideoPlayerContext.tsx` (edit)

- Extend `VideoState` with optional `mode: 'iframe' | 'anime' | 'resolving'` and `animeEpisodeId?: string`, `animeCategory?: 'sub'|'dub'`, `animeResolve?: AnimeResolve | null`.
- New helper `isAnime(item)` — checks `original_language === 'ja' && (genre_ids ?? genres.map(g=>g.id)).includes(16)`.
- Modify `playMovie` and `playEpisode`:
  1. If not anime → keep current iframe behavior verbatim.
  2. If anime → set `mode:'resolving'` (modal shows spinner), call `resolveAnime`. On success store `animeResolve`, find `episodeId` for current `episodeNumber` (movies: episode 1 of single-episode mapping), set `mode:'anime'`. On null/timeout → set `mode:'iframe'` (current Vidsrc flow).
- Expose `openAnimePlayer({ tmdbId, episodeId, category })` for explicit calls and `switchAnimeCategory`.
- `nextEpisode` / `previousEpisode`: when `mode==='anime'`, advance through `animeResolve.episodes` and update `animeEpisodeId`; otherwise current TMDB logic.
- Watch history calls unchanged (still keyed by TMDB id + season/episode).

## 5. `src/components/Layout.tsx` (edit)

In the `<VideoPlayer/>` slot, branch on `mode`:
- `'anime'` → render lazy `<AnimePlayer/>` with `onFallback={() => setMode('iframe')}`.
- `'resolving'` → small full-screen dark overlay with `LoadingSpinner`.
- otherwise → existing `<VideoPlayer/>` iframe.

(All wiring stays in the context; Layout just reads `videoState.mode`.)

## 6. `src/features/tv/TVShowModal.tsx` (edit, anime path only)

- On open, if show is anime, fire `resolveAnime` in a `useQuery` and:
  - When data arrives, override the season's episode titles with `animeResolve.episodes[i].title` (fall back to TMDB title if missing).
  - Show small `Badge`s next to each episode: always render `SUB`; render `DUB` when `episode.hasDub`.
- TMDB still drives season selection and poster art. If `resolveAnime` returns null, fall back to pure TMDB rendering (current behavior).

## 7. `src/features/movies/MovieModal.tsx` (edit, anime path only)

- Same resolve call. Show a single `SUB` / `DUB` badge near the Play button if dub is available, indicating default + toggle option. Play handler unchanged — context decides which player to mount.

## 8. Memory updates (`mem://index.md`)

- Core: change "Streaming via Vidsrc (vsembed.su) iframes." → "Streaming: HiAnime via Consumet + hls-proxy for anime; Vidsrc iframe for everything else and as anime fallback."
- Add new entry: `[Anime Player](mem://features/anime-player) — hls.js native player, Sub/Dub toggle, 4s resolve timeout, seamless Vidsrc fallback`.

## Out of scope (frontend PR)

- The 3 edge functions themselves and the `anime_mappings` table — separate task.
- Quality persistence across sessions.
- Skip-intro / skip-outro markers (Consumet returns these; can layer in later).
- Watch progress sync for anime player (current hook works on TMDB id; will plug `onTimeUpdate` into existing `addToHistory` in a follow-up).

## Risks

- `supabase.functions.invoke` ignores AbortController — timeout will be implemented via `Promise.race`, slightly less clean.
- If browser blocks mixed content from `hls-proxy`, every segment must go through it — verified by ensuring proxy uses HTTPS (Supabase functions always do).
- Hls.js bundle (~120KB gzip) — lazy-load `AnimePlayer.tsx` so non-anime users never pay for it (already covered by Layout's `lazy()` pattern).
