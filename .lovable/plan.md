# Admin: view a single user's activity

Add a click-through user detail view in the admin dashboard so you can open any user from the directory and see their full activity, silently.

## What you'll get

- In the User Directory table, each row becomes clickable.
- Clicking a user opens a side panel with:
  - Account info: email, user ID, display name, sign-up date, last sign-in.
  - Watch history: title, movie/TV/anime, season & episode, how far they watched (%), last watched time — newest first.
  - Ratings: what they liked/disliked.
  - Bookmarks (My List) and their named collections.
  - Small summary counts at the top (items watched, ratings, bookmarks, collections).
- Nothing is visible to the user — this is read-only and leaves no trace on their account.

## How it works (technical)

Current access rules only let a person read their own rows, so the admin page cannot read other users' data directly. One database migration adds admin-only read functions:

- `get_admin_user_detail(target_user_id uuid)` — returns profile + auth metadata (email, created_at, last_sign_in_at) for one user.
- `get_admin_user_activity(target_user_id uuid)` — returns that user's watch history (capped at 200 newest rows), ratings, bookmarks and collections.

Both are `SECURITY DEFINER` with `SET search_path = public`, and both start with the same guard already used by `get_admin_users`: proceed only when `auth.jwt() ->> 'email' = 'kibata988@gmail.com'`, otherwise raise an exception. Execute is granted to `authenticated` only.

Frontend:

- New `src/features/admin/UserDetailSheet.tsx` — shadcn `Sheet`, tabbed sections (Overview / Watch history / Ratings / Lists), loaded with TanStack Query only when a user is selected, `staleTime` 5 minutes.
- `src/pages/Admin.tsx` — row `onClick` sets the selected user and renders the sheet.
- Posters reuse the existing TMDB image paths already stored on the rows, so no extra TMDB calls.

## About your Supabase free tier

This adds very little. Your whole database is tiny right now: 443 watch-history rows, 43 bookmarks, 11 collections, 7 ratings across 85 profiles. One user's activity is a few kilobytes, fetched only when you click that user, and cached for the session. Even browsing every user repeatedly would be a fraction of a percent of the free allowance — the earlier overrun came from a runaway repeating request loop, not from pages like this.
