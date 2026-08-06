# Stop the Supabase egress overrun

## What's actually happening

The 17.35 GB is not stored data. The database is tiny (282 watch-history rows, 63 profiles, 1 avatar file, ~400 kB total). It is a runaway request loop.

Edge log query for the last 24 hours:

```text
/rest/v1/profiles        33,969 requests
/auth/v1/user                 7 requests
/rest/v1/watch_history        6 requests
```

Nearly 34,000 profile reads a day from a handful of users. Every one of those carries response headers plus the Supabase client's auth payload, which is what is eating the quota.

## Root cause

Two bugs feeding each other:

1. `src/features/auth/AuthContext.tsx` — the auth `useEffect` lists `user` in its dependency array, but the same effect calls `setUser` from inside `onAuthStateChange`. Each auth event changes `user`, which tears down and re-creates the subscription, which fires another event. The subscription is being rebuilt continuously.
2. `src/hooks/use-user-preferences.tsx` — its `useEffect` also depends on the whole `user` object. Every new `user` object identity from the loop triggers a fresh `SELECT preferences FROM profiles`. That's the 34k requests.

The auth context value is also rebuilt on every render, so every consumer re-renders alongside it.

## The fix

**1. Repair the auth effect**
- Change the dependency array to `[]` so the session listener is created once for the lifetime of the app.
- Move the "auto login prompt after 5s" timer into its own effect that reads the current user via a ref, so it no longer forces the listener to re-subscribe.
- Only call `setUser` when the user id actually changed, so identical session refreshes don't cascade new object identities to consumers.
- Wrap the context value in `useMemo`.

**2. Stop preference refetching**
- Key the preferences effect on `user?.id` (a string) rather than the `user` object.
- Move the read into React Query with a long `staleTime` and a stable `['profile-preferences', userId]` key so it is fetched once per session and shared, with the toggle writing through to the cache.

**3. Guard against regressions**
- Audit the remaining `profiles` reads (`src/pages/Profile.tsx`) to confirm they are keyed on `user.id`, not the user object.

## After the change

Profile reads should drop from ~34,000/day to roughly one per signed-in session. Egress should fall back well under the 5 GB allowance. Since the current billing period has already exceeded the cap, that usage number won't reset until the next cycle, but it will stop climbing immediately.

## Technical notes

Files touched: `src/features/auth/AuthContext.tsx`, `src/hooks/use-user-preferences.tsx`. No schema changes, no migration, no change to auth behaviour, sign-in flow, or the preferences UI.
