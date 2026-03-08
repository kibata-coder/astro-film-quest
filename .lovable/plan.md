

## Root Cause

The `watch_history` table is missing a **DELETE** RLS policy. The recent migration that converted all policies to PERMISSIVE created SELECT, INSERT, and UPDATE policies but omitted DELETE. When an authenticated user clicks the X button, the Supabase delete call is silently denied by RLS, so the item stays.

## Fix (2 changes)

### 1. Add missing DELETE RLS policy (database migration)

```sql
CREATE POLICY "Users can delete own watch history"
ON public.watch_history AS PERMISSIVE
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

### 2. Add `user_id` filter to the delete query in `removeFromHistory`

Currently line 83 deletes by `media_id` + `media_type` only. Add `.eq('user_id', user.id)` for defense-in-depth (RLS handles it, but explicit filtering is safer and clearer).

Also add `await` error checking and optimistic UI update in `ContinueWatchingSection` so the item disappears immediately and rolls back on failure.

