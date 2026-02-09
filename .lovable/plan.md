

## Fix: Browser Back Button History Management and Playback

### Problem
The current history management implementation has several bugs:

1. **Two independent `popstate` listeners** (MediaContext + VideoPlayerContext) compete and cause race conditions
2. **Stale closures**: The `popstate` effect in MediaContext depends on `isMovieModalOpen`/`isTVModalOpen`, causing the listener to re-register on every state change and potentially miss events
3. **Modal not hidden when player opens**: The modal's Dialog/Sheet remains mounted and interactive behind the fullscreen player. The Radix Dialog overlay can intercept clicks or trigger `onOpenChange`, interfering with playback
4. **Play button broken**: When "Play" is clicked in the modal, `playMovie` pushes `{ player: true }` to history. The modal's Dialog is still open. Radix Dialog may detect focus loss or overlay interaction and fire `onOpenChange(false)` -> `closeMovieModal()`. Since `window.history.state` is now `{ player: true }` (not `{ modal: 'movie' }`), it falls into the else branch and directly closes the modal state -- but this can also trigger `history.back()` at the wrong time, corrupting the history stack

### Solution

Simplify the approach with these principles:
- **One centralized popstate handler** instead of two competing ones
- **Hide modals when player is active** (set `isOpen={false}` on the Dialog) so Radix doesn't interfere
- **Close modal before opening player** in Layout.tsx, but do it via direct state (not history.back) to avoid popstate race conditions
- **Clean history stack**: Modal open pushes state, closing pops it. Player open pushes state, closing pops it. Sequential, not nested.

### Files to Modify

**1. `src/features/shared/MediaContext.tsx`**
- Remove the `popstate` useEffect entirely
- Add `forceCloseMovieModal` and `forceCloseTVModal` methods that close modals by directly setting state (no history manipulation) -- used when transitioning to player
- Keep `closeMovieModal`/`closeTVModal` using `history.back()` for when user clicks X or presses Back
- Add a `handlePopState` that is registered once and uses refs to avoid stale closures

**2. `src/features/player/VideoPlayerContext.tsx`**
- Remove the `popstate` useEffect
- Same pattern: use a ref for `videoState.isOpen` to avoid stale closures
- Register popstate handler once

**3. `src/components/Layout.tsx`**
- Clean up commented-out code
- In `handlePlayMovie`: call `forceCloseMovieModal()` (direct state close, no history) before `playMovie()`. This removes the modal from the DOM so Radix Dialog doesn't interfere, and the modal's history entry gets cleaned up by the player's history push
- Same for `handlePlayTVShow`
- Pass `!videoState.isOpen` to modal `isOpen` props as a safety net so modals never render while player is active

### Technical Details

**MediaContext changes:**
```typescript
// Use ref to avoid stale closure in popstate
const isMovieOpenRef = useRef(false);
const isTVOpenRef = useRef(false);

// Keep refs in sync
useEffect(() => { isMovieOpenRef.current = isMovieModalOpen; }, [isMovieModalOpen]);
useEffect(() => { isTVOpenRef.current = isTVModalOpen; }, [isTVModalOpen]);

// Single popstate handler registered once
useEffect(() => {
  const handler = (e: PopStateEvent) => {
    if (isMovieOpenRef.current) {
      setIsMovieModalOpen(false);
      setTimeout(() => setSelectedMovie(null), 300);
    }
    if (isTVOpenRef.current) {
      setIsTVModalOpen(false);
      setTimeout(() => setSelectedShow(null), 300);
    }
  };
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}, []); // Empty deps - registered once

// Force close without touching history (for play transitions)
const forceCloseMovieModal = useCallback(() => {
  setIsMovieModalOpen(false);
  // Pop the modal's history entry silently
  if (window.history.state?.modal === 'movie') {
    window.history.back();
  }
}, []);
```

**VideoPlayerContext changes:**
```typescript
const isOpenRef = useRef(false);
useEffect(() => { isOpenRef.current = videoState.isOpen; }, [videoState.isOpen]);

useEffect(() => {
  const handler = (e: PopStateEvent) => {
    if (isOpenRef.current) {
      setVideoState(prev => ({ ...prev, isOpen: false }));
      setEpisodeContext(null);
    }
  };
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}, []);
```

**Layout.tsx changes:**
```typescript
const handlePlayMovie = async () => {
  if (selectedMovie) {
    closeMovieModal(); // Close modal (pops history)
    await playMovie(selectedMovie); // Opens player (pushes history)
  }
};
```

And for modal rendering, add a guard:
```tsx
<MovieModal
  isOpen={isMovieModalOpen && !videoState.isOpen}
  ...
/>
```

This ensures the flow works as: Home -> Click card -> Modal opens (push history) -> Click Play -> Modal closes (pop history) -> Player opens (push history) -> Back button -> Player closes (pop history) -> Back to Home.

