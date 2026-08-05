# Fix: security hole, slow loads, and page crashes

Yes — and while looking into it I found something that needs fixing before anything else.

## 1. Urgent: an open door into your database

During the data restore I deployed a temporary helper function called `admin-sql`. It was meant to be deleted the moment the restore finished. The migration step reported as "interrupted", I moved on, and it was never removed. It is still live.

It runs any database command it is given, and it has no password or auth check on it at all. Anyone who knows or guesses the URL can read every one of your 63 users' email addresses and password hashes, or delete all your data.

This is my mistake and it is the first thing to fix.

- Delete the deployed `admin-sql` function
- Delete `supabase/functions/admin-sql/index.ts`
- Delete the now-unused `ADMIN_SQL_TOKEN` secret
- Rotate the database password, since the function had the connection string loaded

Good news on the restore itself: it did complete. The signup trigger, the avatars bucket, and 4 storage rules are all in place, and the database has grown to 63 users and 277 watch rows since — so real people are signing up and watching.

## 2. Why the page crashes ("Brave says fix the page")

That message means the browser tab ran out of memory or the renderer died. Three things are feeding it:

- **The Vidsrc iframe.** Its ad scripts keep running after you close the player. Every movie you open leaves another one behind, and memory climbs until the tab dies. The player needs to blank the iframe's URL on close so the ad code is actually torn down.
- **The anime player's video engine** is not always shut down on close, which leaks a video buffer each time.
- **The poster cache in browser storage** only ever grows. It needs a size cap so it cannot fill up and start throwing errors.

## 3. Why it is slow

- **Continue Watching is the main stall.** On every homepage load it walks your watch history and, for each row, asks TMDB two separate questions — what the poster is, and whether it is anime. For someone with 25 items in their history that is dozens of requests before the row will draw. This should be one batched pass, with the anime flag saved once instead of re-derived every visit.
- **The homepage builds 15 category rows.** They already wait until you scroll near them, but all 15 draw a loading skeleton immediately, so the first paint is heavy. Trimming to a handful of rows up front and adding the rest as you scroll makes the page feel instant.
- **Cast and poster images are fetched at larger sizes than they are displayed**, so the browser downloads more than it needs.
- **Movie and TV modals and both players load their code on every page**, even when nothing is open. They should only load when actually opened.

## Technical notes

- Remove function via delete_edge_functions, then delete the source file and secret; rotate the DB password in Supabase settings.
- `VideoPlayer.tsx`: set `iframe.src = 'about:blank'` in cleanup before unmount. `AnimePlayer.tsx`: ensure `hls.destroy()` runs in the effect cleanup on every path.
- `ContinueWatchingSection.tsx`: collapse `fetchMissingPoster` and `checkIsAnime` into a single details fetch per item, run with `Promise.all`, and persist `is_anime` to the `watch_history` table so it is computed once, not per visit. Add an LRU cap (~300 entries) before writing to localStorage.
- `Index.tsx` / `MovieSections.tsx`: render only the first ~4 sections eagerly; mount the rest behind the existing IntersectionObserver instead of rendering all 15 skeletons.
- `Layout.tsx`: gate the lazy modal/player imports on their open state so the chunks are not requested on load.
- `MediaCard`/cast images: drop to `w185` for small posters and `w154` for cast headshots.

## Order

Security cleanup first, then the crash fixes, then the speed work. The security step needs your approval to rotate the database password — everything else I can do directly.
