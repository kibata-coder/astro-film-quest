# Restore SoudFlex + Switch to a Small Domain-Change Announcement

## Goals
1. Take the site out of "maintenance mode" — full UI/UX restored.
2. Replace the full-screen black overlay with a small, non-blocking announcement informing users about the domain change (vsembed.ru → vsembed.su).
3. Confirm streaming embed URLs use the new `vsembed.su` domain.

## Changes

### 1. `src/components/SiteAnnouncement.tsx` — rewrite
Replace the full-screen maintenance overlay with a compact, dismissible toast/banner pinned to the bottom-right (above content, but not blocking). Behavior:

- Small card (~max-w-sm), bottom-right on desktop, full-width bottom on mobile (`bottom-4 right-4 left-4 sm:left-auto`).
- z-index high enough to float above content but below modals/player (`z-50`, NOT the max int).
- No body scroll lock, no countdown, no ETA logic — remove all of that.
- Content: short heading "Domain update" + message explaining one of our streaming providers moved from `vsembed.ru` to `vsembed.su` and everything is back to normal.
- "Got it" button + close (X) icon. Both dismiss.
- Dismissal stored in `localStorage` under `soudflex.announcement.domain-change.v1` so it doesn't reappear (no time expiry — once dismissed, gone).
- Subtle styling consistent with dark theme: `bg-card border border-border` + small primary accent icon (Megaphone or Info from lucide-react).

### 2. Streaming embed domain — verify only
`src/lib/vidsrc.ts` already uses `https://vsembed.su/...` for both movie and TV. No code change needed there. The domain change is already correct in code; the user's note about `vsembed.ru → vsembed.su` matches what's deployed.

### 3. Memory update
Project memory (`mem://features/streaming-service`) currently references `vsembed.ru`. Update it to `vsembed.su` to stay accurate. Also update `mem://index.md` Core line that mentions `vsembed.ru`.

## Result
- Full site UI restored exactly as before maintenance (Hero, rows, search, player, etc.) — no changes to App.tsx routing or layout.
- A small announcement appears once on visit, can be dismissed permanently with "Got it" or the X button.
- Streaming continues via `vsembed.su` (already in place).

## Files touched
- `src/components/SiteAnnouncement.tsx` (rewrite)
- `mem://features/streaming-service` (update domain)
- `mem://index.md` (update Core line)
