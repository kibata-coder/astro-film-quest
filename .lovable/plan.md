

## Remove Server 2 (SuperEmbed) and Simplify to Vidsrc Only

### What's Changing
Remove all Server 2 (SuperEmbed/MultiEmbed) code and the server selector UI. The app will only use Vidsrc for playback. The iframe will be kept as clean as possible -- no `sandbox`, no `referrerPolicy` -- so the Vidsrc player's built-in fullscreen and subtitles work natively without interference.

### Files to Modify

**1. `src/lib/vidsrc.ts`**
- Remove `SUPEREMBED_BASE_URL`, `getSuperembedMovieUrl`, `getSuperembedTVShowUrl`
- Remove `ServerType` type (no longer needed)
- Remove `SERVER_OPTIONS` array
- Simplify `getMovieEmbedUrl` and `getTVShowEmbedUrl` to only return Vidsrc URLs (no server parameter)
- Keep the Latest API functions and Vidsrc URL builders unchanged

**2. `src/types/media.ts`**
- Remove `ServerType` export
- Remove `server` field from `VideoState` interface

**3. `src/features/player/VideoPlayer.tsx`**
- Remove `server`, `onChangeServer` props
- Remove the entire server selector UI (the MonitorPlay button and dropdown menu)
- Remove `MonitorPlay` import
- Remove `showServerMenu` state
- Simplify `embedUrl` to call the functions without a server parameter
- Remove `server` from the useEffect dependency that triggers reconnect
- Keep the iframe clean: `allowFullScreen`, broad `allow` permissions, NO `sandbox`, NO `referrerPolicy`

**4. `src/features/player/VideoPlayerContext.tsx`**
- Remove `changeServer` method and its export
- Remove `server` from `VideoState` initial state
- Remove `ServerType` import

**5. `src/components/Layout.tsx`**
- Remove `changeServer` from `useVideoPlayer()` destructuring
- Remove `onChangeServer` prop from `<VideoPlayer>`
- Remove `server` prop from `<VideoPlayer>` (it won't need it)

### Iframe Configuration (the key to fullscreen working)
The iframe will be rendered as:
```html
<iframe
  src={embedUrl}
  className="w-full h-full border-0"
  allowFullScreen
  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
/>
```
No `sandbox` attribute, no `referrerPolicy` -- these are the attributes that break fullscreen and subtitle rendering in embedded players.

### What Stays the Same
- All other player features: title overlay, close button, episode navigation (prev/next), resume overlay, watch history tracking, connecting spinner
- The Vidsrc Latest API for fetching available movies/TV shows
- All modal, history management, and playback flow logic
