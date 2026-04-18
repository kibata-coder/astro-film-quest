

## Add "Next Episode" and "Skip Intro" Controls in TV Player

### Context
The video player uses an iframe (Vidsrc) so we cannot detect playback time or actually skip frames inside the video. But we CAN add overlay buttons in the player chrome that:
- **Next Episode** — already partially exists (`onNextEpisode` prop in `VideoPlayer.tsx` + `nextEpisode()` in `VideoPlayerContext`). Need a more prominent overlay button instead of a small header icon.
- **Skip Intro** — since we can't read iframe time, we reload the iframe with a `?t=85` start-time parameter (Vidsrc supports timestamp params) to jump ~85 seconds in.

### Changes

**1. `src/lib/vidsrc.ts`**
- Add optional `startTime` param to `getTVShowEmbedUrl()` and `getMovieEmbedUrl()` → appends `&t={seconds}` to embed URL.

**2. `src/features/player/VideoPlayer.tsx`**
- Add a `skipOffset` state (default 0).
- Add two prominent overlay buttons in top-right of video area (visible for ~10s after load, then auto-hide; reappear on mouse move):
  - **"Skip Intro"** — only shown for TV episodes, sets `skipOffset = 85`, forces iframe reload via `key` prop.
  - **"Next Episode"** — only shown for TV when `onNextEpisode` available and not last episode. Calls `onNextEpisode()`.
- Reset `skipOffset` to 0 whenever episode changes.
- Pass `skipOffset` into `getTVShowEmbedUrl(...)`.

**3. No changes** to `VideoPlayerContext.tsx` — `nextEpisode` already exists and is wired through `Layout.tsx`.

### UX
- Buttons styled as floating pill buttons, top-right, semi-transparent dark bg, white text — Netflix-like.
- Auto-hide after 8s of mouse inactivity over the player; show on mousemove.
- "Skip Intro" disappears once clicked (only one skip per episode).

### Files
- `src/lib/vidsrc.ts`
- `src/features/player/VideoPlayer.tsx`

### Limitation note
Since the player is an iframe, "Skip Intro" works by reloading the stream at t=85s (Vidsrc query param). It's not a seamless seek — the stream reconnects. This is the only approach possible given iframe sandboxing.

