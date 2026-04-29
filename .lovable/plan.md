## Why playback fails on soudflex.pages.dev

The app uses **only one** streaming provider — `vsembed.ru` — hardcoded in `src/lib/vidsrc.ts`. When you click a card, the player iframe loads that URL. The problem:

1. **`vsembed.ru` doesn't have every title.** For movies/episodes it doesn't host, the embed page shows a blank or "no source" frame inside the iframe — the page loads (HTTP 200) but no video plays. The app has zero fallback.
2. **No way for the user to switch source.** If one provider fails, the click is a dead end.
3. **No "open in new tab" escape hatch.** Some embeds throttle iframe usage but work standalone.

The TMDB data API itself works fine (network logs show `/discover/movie` and `/trending/tv/week` returning 200 with full results). The CORS allowlist already covers `*.pages.dev`. So data fetching is healthy — only playback is broken.

## Fix

**1. Add a multi-provider fallback in `src/lib/vidsrc.ts`.** Define an ordered list of mirror embeds:

```ts
const PROVIDERS = [
  { name: 'VidSrc',    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
                       tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'VidSrc.to', movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
                       tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
  { name: 'Embed.su',  movie: (id) => `https://embed.su/embed/movie/${id}`,
                       tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { name: 'VsEmbed',   movie: (id) => `https://vsembed.ru/embed/movie?tmdb=${id}&autoplay=1`,
                       tv: (id, s, e) => `https://vsembed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1` },
];
```

Export helpers: `getProviders()`, `getMovieEmbedUrl(tmdbId, providerIndex)`, `getTVShowEmbedUrl(tmdbId, season, episode, providerIndex)`. Default to provider 0 (VidSrc.xyz — biggest catalog).

**2. Add a "Server" picker to the player UI** (`src/features/player/VideoPlayer.tsx`). A small dropdown in the top control bar (next to prev/next/close) lets the user switch source if the current one fails. State: `const [providerIdx, setProviderIdx] = useState(0)`. The iframe `key` already includes provider index so it re-mounts cleanly.

**3. Add an "Open in new tab" link** as a last-resort escape hatch in the same control row.

**4. Persist the chosen provider** to `localStorage` so users who find a working mirror don't have to reselect every time.

## Files

- `src/lib/vidsrc.ts` — replace with multi-provider list + helpers (reverse-compatible: existing single-arg calls keep working with default index 0).
- `src/features/player/VideoPlayer.tsx` — add server-switcher dropdown, "open in new tab" link, persist provider in localStorage, re-key iframe on provider change.
- `mem://features/streaming-service` — update to note multi-provider fallback (no longer "Vidsrc only").

## Out of scope

- Building a custom HTML5 player or hosting our own streams (that's a different product).
- Auto-detecting which provider has a given title (none of these mirrors expose a reliable availability API; manual switch is the standard pattern across every streaming aggregator site).
