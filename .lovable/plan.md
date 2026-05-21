## The bug

The play flow currently does this:

1. Modal is open → history stack has a `{ modal: 'movie' }` entry on top.
2. User clicks Play → `forceCloseMovieModal()` runs `window.history.back()`. This is **asynchronous** — the `popstate` event fires on the next tick.
3. Immediately after, `playMovie()` runs `window.history.pushState({ player: true }, ...)` and sets `videoState.isOpen = true`. The player opens.
4. *Then* the queued `popstate` from step 2 fires. By this time, `isOpenRef.current` in `VideoPlayerContext` is already `true`, so its popstate handler closes the player.

Net effect: player flashes open, then instantly closes, dropping the user back on the homepage. Same race exists for TV.

The previous "open synchronously" change didn't fix it because the race is between two history operations, not between state and history.

## Fix

### `src/features/shared/MediaContext.tsx`
- In `forceCloseMovieModal` and `forceCloseTVModal`, **stop calling `window.history.back()`**. Instead, if the current `history.state` is the modal entry, call `window.history.replaceState({}, '', window.location.pathname)` to overwrite it in place.
- No popstate fires, so the player isn't collateral damage.
- Modal UI still closes via the existing `setIs*ModalOpen(false)` calls.

### `src/features/player/VideoPlayerContext.tsx`
- Add a defensive guard in the popstate handler: ignore the popstate if the new `window.history.state?.player === true` (means we're still on the player entry, not actually navigating away). Belt-and-suspenders against any other history race.

### `src/components/Layout.tsx`
- Drop the `await` on `playMovie` / `playEpisode` in `handlePlayMovie` / `handlePlayTVShow` so the transition is fully synchronous from the user's perspective (functions are already fire-and-forget internally).

## What stays the same

- Normal modal close (X / back button / Esc) still uses `history.back()` and the popstate handler — unchanged.
- Player close (`closePlayer`) still uses `history.back()` to pop its own entry — unchanged.
- Watch-history saving, providers, episode logic — untouched.
