
# Full Restore Plan — astro-film-quest backup → connected Supabase

The target Supabase project (`ieexucxbbpfudeedehva`) is currently **empty** (0 users, no public tables). The uploaded `.backup` is a valid pg_dump custom-format file. I will restore it in one carefully ordered migration so existing users can sign in exactly as before (email/password hashes preserved, Google OAuth identities preserved), and all their data appears immediately.

## What's in the backup

| Table | Rows |
|---|---|
| auth.users | 40 |
| auth.identities | 44 (Google + email) |
| public.profiles | 39 |
| public.bookmarks | 31 |
| public.watch_history | 164 |
| public.collections | 11 |
| public.collection_items | 18 |
| public.ratings | 7 |
| storage.buckets | `avatars` (public), `database_export_21_07_26` |

Also present: `handle_new_user()` function + `on_auth_user_created` trigger on `auth.users`, plus RLS policies and grants on every public table.

## Restore strategy

Everything runs through a single Supabase migration (executes as `postgres` superuser, which is required to insert into `auth.users` / `auth.identities`). Order matters because of the auth trigger — if I create the trigger before inserting existing users, the trigger will try to double-insert profile rows.

```text
Step 1  Create public schema objects (tables, functions, RLS, grants)
         — but DO NOT yet create the auth.users trigger
Step 2  Insert auth.users        (40 rows, preserves id + encrypted_password)
Step 3  Insert auth.identities   (44 rows, preserves Google `sub` mapping)
Step 4  Insert public.profiles, bookmarks, watch_history,
         collections, collection_items, ratings
Step 5  Create the on_auth_user_created trigger (fires only for future signups)
Step 6  Create the `avatars` storage bucket (public, empty — avatar files
         intentionally deferred per your instruction)
```

All inserts use `ON CONFLICT DO NOTHING` so the migration is safely re-runnable.

## What users will experience

- **Email/password users** — sign in with the exact same email + password. Same `user_id`, so all their bookmarks/watchlists/history are already linked.
- **Google users** — click "Sign in with Google", the identity's `provider_id`/`sub` matches, they land on the same account.
- **All app data** — bookmarks, watch_history, collections, ratings show up on first load.
- **Avatars** — bucket is recreated empty; existing avatar image files are not restored (per your instruction, we'll handle those later). The `avatar_url` column in profiles is preserved but will 404 until files are re-uploaded.

## Post-restore verification (I'll run automatically after the migration)

- Counts match the table above.
- `SELECT COUNT(*) FROM auth.users WHERE encrypted_password IS NOT NULL` matches source.
- `SELECT provider, COUNT(*) FROM auth.identities GROUP BY provider` matches source.
- RLS enabled on all 6 public tables, policies present.
- `handle_new_user` trigger installed and pointing at correct function.

## Things this plan does NOT touch

- No changes to `src/` code — the client already points at this project with the correct anon key.
- No changes to edge functions (already deployed).
- No password resets, no email re-verification, no OAuth reconfiguration.
- Storage objects (avatar files, old export bucket contents) are not copied.

## If you want to also restore avatar image files later

That requires a separate step outside SQL (copying blob files into `storage.objects` + physical storage). Say the word when you're ready and I'll plan it.

---

Approve this and I'll execute the migration in the next turn, then run the verification queries and report the row counts back to you.
