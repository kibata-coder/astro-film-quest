

## Fix Continue Watching — Full Backend + Sync Overhaul

### Problems Found

1. **Progress column is `integer`** — the code stores decimals like `0.45` but the DB truncates them to `0` or `1`. Progress bars and "Stopped at" labels are broken for signed-in users.
2. **No `duration` column** — the DB doesn't store media duration, so `duration` is always `0` when loaded from the backend. The "Stopped at Xm" label never renders.
3. **No local-to-cloud sync** — when a user signs in, their localStorage watch history is discarded. Anything they watched while logged out is lost.

---

### Plan

#### 1. Database Migration
- Change `watch_history.progress` from `integer` to `real` (float) so values like `0.45` are stored correctly.
- Add a `duration` column (`integer`, default `0`) to store total media runtime in seconds.

```sql
ALTER TABLE public.watch_history
  ALTER COLUMN progress TYPE real USING progress::real;

ALTER TABLE public.watch_history
  ADD COLUMN IF NOT EXISTS duration integer NOT NULL DEFAULT 0;
```

#### 2. `src/lib/watchHistory.ts` — Update all functions
- **`saveWatchProgress`**: Include `duration: totalDuration` in the upsert payload so it's persisted to DB.
- **`getWatchHistory`**: Map `item.duration` from the DB row instead of hardcoding `0`.
- **`addToHistory`**: Accept and store duration when available.
- **New `syncLocalHistoryToCloud()`**: On sign-in, read localStorage history, upsert each item into DB (only if it has higher progress than existing), then clear localStorage.

#### 3. `src/features/auth/AuthContext.tsx` — Trigger sync on sign-in
- In `onAuthStateChange`, when event is `SIGNED_IN`, call `syncLocalHistoryToCloud()` then dispatch `watch-history-updated` event so the UI refreshes.

#### 4. `src/components/ContinueWatchingSection.tsx` — No changes needed
- Already listens to `onAuthStateChange` and `watch-history-updated` events, so it will auto-refresh after sync.

### Files to Edit
| File | Change |
|------|--------|
| DB migration | Add `duration` column, change `progress` to `real` |
| `src/lib/watchHistory.ts` | Store/read duration, fix progress type, add sync function |
| `src/features/auth/AuthContext.tsx` | Call sync on sign-in |

