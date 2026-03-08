

## Plan: Remove Mobile Genres List from Header

Remove the "GENRES" section (lines 202-224) from the mobile menu in `src/components/Header.tsx`. This includes the "For You" link and all genre buttons. Users can already access genres via the desktop dropdown and the FilterBar on Movies/TV Shows pages.

### Changes

**`src/components/Header.tsx`**
- Delete lines 202-224 (the `{/* Mobile Genres List */}` block containing the genres heading, "For You" button, and genre buttons).
- Optionally clean up unused imports (`Sparkles`, `Sword`, `Compass`, etc.) and the `genres` array if they're only used in the mobile menu — but they're also used in the desktop dropdown, so only `Sparkles` may be removable if "For You" isn't referenced elsewhere in desktop nav.

Single file change, straightforward deletion.

