## Problems

**1. Clicking Play briefly returns to the homepage / feels slow**

In `Layout.handlePlayMovie` (and the TV equivalent):
```
forceCloseMovieModal();     // closes modal + history.back()
await playMovie(movie);     // awaits Supabase addToHistory, THEN pushes player state + opens UI
```
The `await addToHistory(...)` (Supabase round-trip) runs *before* the player UI is opened, so for 1–3 seconds the user sees the bare homepage. The history `back()` from the modal compounds the "I got sent home" feeling.

**2. Player header shows a "Server 1" dropdown and an external-link button**

The user wants both removed from the top bar in `VideoPlayer.tsx`.

## Changes

### `src/features/player/VideoPlayerContext.tsx`
- In `playMovie`: open the player **synchronously first** (set `videoState.isOpen = true`, push `{ player: true }` history entry), then fire `addToHistory(...)` in the background (no `await`) and dispatch `watch-history-updated` after it resolves. Same pattern for `playEpisode` — open the player UI immediately, then fetch season details and update `episodeContext` when ready (player can show "loading episodes" briefly; the iframe doesn't need season data to start).
- Result: clicking Play opens the fullscreen player instantly; the homepage is no longer visible during the transition.

### `src/features/player/VideoPlayer.tsx`
- Remove the `<Select>` provider switcher (Server 1/2/3/4 dropdown) from the header.
- Remove the external-link `<Button>` (and the `ExternalLink` import).
- Keep provider selection internally with the persisted default (so streams still work); just hide the UI controls. The header keeps only: title, episode info, prev/next episode (for TV), and close.

### Optional small win
- In `Layout.handlePlayMovie` / `handlePlayTVShow`, no longer need `await` on `playMovie` since it becomes synchronous-ish; switch to fire-and-forget so the close + open feel instant.

## What stays the same

- Watch-history saving still happens (just non-blocking).
- Streaming providers and the saved preference in `localStorage` are untouched — Server 1 remains the default; only the visible switcher is removed.
- Modal close behavior, popstate handling, and the rest of the player UI are unchanged.