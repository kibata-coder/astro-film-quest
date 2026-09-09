# TV Remote Navigation for SoudFlex

Make the whole site usable with a TV remote or arrow keys: move between posters, press OK to open, press Back to close.

## Honest answer on complications

Three real ones, worth deciding before I build:

1. **Inside the video player, the remote stops working.** Movies and series play inside an embedded player from another site (Vidsrc). Once that area has focus, its own page swallows remote presses, so our Back handling can miss. Workaround: keep a visible "Back" button on screen during playback and catch the Back key while focus is still on our page. Anime uses our own player, so it behaves fully.
2. **Focus rings must not appear for mouse users.** Handled by only showing the TV highlight after a remote/arrow key press, and hiding it again the moment the mouse moves.
3. **Pop-ups already trap focus.** The details pop-ups use a library that keeps focus inside them. That mostly helps, but it means arrow movement inside a pop-up must respect that boundary rather than fighting it.

Everything else (rails, hero, header, brand tiles, anime cards) is straightforward.

## What you will be able to do

- Arrow keys / D-pad move between posters; a row scrolls sideways on its own to keep the highlighted poster in view.
- Up and Down jump between rows, up into the hero area and the top menu.
- The highlighted poster grows slightly with a glowing blue outline, readable from across a room.
- OK / Enter opens the details pop-up; focus lands straight on Play so a second OK starts playback.
- Back / Return / Escape closes the pop-up or leaves playback and puts the highlight back on the poster you came from.
- Touch a mouse and everything behaves exactly as it does today.

## Technical details

New `src/lib/tv-navigation.ts`
- Geometric direction search over visible focusable elements using `getBoundingClientRect` (direction cone + Euclidean distance tie-break).
- Key normalisation: arrows, Enter, Space, plus Tizen `10009`, webOS `461`, Android TV back `4`, and `Escape`.
- Scope resolution: if a Radix dialog/sheet with `[role="dialog"][data-state="open"]` is present, candidates are limited to it; otherwise document scope.
- After focusing, scroll the nearest `overflow-x` ancestor to centre horizontally, else `scrollIntoView({ block: 'center' })`.

New `src/hooks/useTvNavigation.ts`
- Single global `keydown` listener (capture) + `mousemove` listener toggling `body.tv-mode`.
- Remembers the element focused before a dialog opens and restores it on close.
- Mounted once in `App.tsx` inside `BrowserRouter`.

Component edits (presentation only)
- `MediaCard.tsx`: `tabIndex={0}`, `role="button"`, `data-tv-card`, Enter/Space triggers existing `onClick`; hover overlay also shown on focus.
- `SoudanimeCard.tsx`: `data-tv-card` on the `Link` (already keyboard-activatable).
- `ScrollableSection.tsx`: `onFocusCapture` centres the focused child in the rail.
- `HeroBanner.tsx`, `BrandRail.tsx`, `Header.tsx`: `data-tv-focusable` on primary actions/links.
- `MovieModal.tsx` / `TVShowModal.tsx`: `ref` + autofocus the Play button on open; TV back keycodes call the existing close handler.
- `VideoPlayer.tsx`: extend the existing Escape handler to the TV back keycodes; keep an always-visible close button (no `sandbox` attribute on the Vidsrc iframe, per existing project rule).
- `src/index.css`: `body.tv-mode :focus-visible` → `outline: 3px solid hsl(var(--primary))`, `box-shadow: 0 0 30px hsl(var(--primary) / 0.6)`, `transform: scale(1.08)`; suppressed when `tv-mode` is absent.

## Verification

- Build and lint must pass.
- Manual arrow-key walkthrough of home rails, hero, header, a movie pop-up, a series pop-up, an anime card, and playback exit.
