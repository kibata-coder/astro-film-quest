

## Fix "Skip Intro" — Make It Work Properly

### Problem
1. **Doesn't actually skip** — Vidsrc's `vsembed.ru` embed does NOT support a `&t=` start-time query parameter. The iframe just reloads from 0, so clicking "Skip Intro" feels like a no-op.
2. **Appearance is wrong** — currently a small pill button tucked top-right of the iframe. User expects a Netflix-style prominent button bottom-right that's always visible during the intro window.

### Root Cause
Confirmed by reading `src/lib/vidsrc.ts` — we append `&t={seconds}` but vsembed.ru ignores it. There's no postMessage API exposed by the embed either (per `mem://constraints/video-player-limitations`). So the previous implementation was fundamentally broken.

### New Approach

Since we cannot seek inside the iframe, we'll **simulate** Skip Intro via a controlled UX that's honest about what it does:

**Option A — Visible countdown overlay (chosen)**
- Show a large **"Skip Intro"** button at **bottom-right** of the player (Netflix position).
- Visible for the first 90 seconds after iframe loads (the typical intro window).
- Clicking it: closes the player and reopens it bookmarked at the same episode — but since seeking doesn't work, instead we'll **simply hide the button** and show a toast: "Skip Intro is not supported by this stream provider. Use the video player's own seek bar."
- This is honest UX — users stop expecting magic.

**Option B (better) — Remove "Skip Intro" entirely + improve "Next Episode" placement**
Since Skip Intro genuinely cannot work with iframe streams, removing it is more honest than faking it. Instead:
- Remove "Skip Intro" button + `skipOffset` state + `startTime` param plumbing.
- Keep & improve **"Next Episode"** button:
  - Move from top-right → **bottom-right**, larger, Netflix-style pill
  - Always visible (not auto-hiding) when on a TV episode that has a next one
  - Background: `bg-white/90 text-black` for high contrast like Netflix
- Update memory `mem://constraints/video-player-limitations` to record that Skip Intro is impossible.

### Recommendation
**Go with Option B.** Skip Intro literally cannot work — the embed provider doesn't support timestamp seeking and iframe sandboxing blocks postMessage control. Faking it wastes a click and erodes trust.

### Files to change
- `src/features/player/VideoPlayer.tsx` — remove Skip Intro UI + skipOffset state; restyle Next Episode button (bottom-right, prominent, persistent).
- `src/lib/vidsrc.ts` — remove unused `startTime` param from embed URL builders.
- `mem://constraints/video-player-limitations` — note Skip Intro infeasibility.

### Out of scope
- Building a custom HTML5 player (would require leaving Vidsrc entirely).
- Server-side proxy that injects timestamp control (Vidsrc CDN tokenized URLs prevent this).

