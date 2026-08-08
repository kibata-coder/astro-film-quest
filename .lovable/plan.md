# Maintenance Mode with Admin Toggle

Add a site-wide maintenance mode that you can switch on/off from the Admin dashboard. When it's on, visitors see a full-screen "Under maintenance" page instead of the app. You (the admin) keep full access so you can verify changes while it's on.

## What the user sees

- Maintenance on: a full-screen branded page (SoudFlex logo, dark theme) with a headline "The website is under maintenance", a short line saying we'll be back shortly, and a retry button.
- Maintenance off: the site works normally.
- Admin account: never blocked, plus a small persistent bar at the top reading "Maintenance mode is ON - only you can see the site".

## Admin dashboard

A new card at the top of `/admin` with a switch labelled "Maintenance mode" and an optional short message field shown on the maintenance page. Flipping it saves immediately and shows a toast. Changes propagate to visitors in real time.

## Technical details

Database (migration):
- New table `public.site_settings` with a single row: `id text primary key default 'global'`, `maintenance_mode boolean not null default false`, `maintenance_message text`, `updated_at timestamptz not null default now()`.
- Grants: `SELECT` to `anon` and `authenticated`; `ALL` to `service_role`; `UPDATE` to `authenticated`.
- RLS on. Read policy: anyone can read. Write policy: only the admin, checked with `auth.jwt() ->> 'email' = 'kibata988@gmail.com'` (same check already used by the existing admin RPCs).
- Seed the single `global` row.
- Add the table to `supabase_realtime` publication so toggling reflects instantly for live visitors.

Frontend:
- `src/hooks/use-site-settings.ts` - React Query fetch of the settings row plus a realtime subscription (subscribed inside `useEffect`, cleaned up with `removeChannel`).
- `src/components/MaintenanceGate.tsx` - wraps the app routes in `App.tsx`. While settings are loading, render the existing `PageLoader`. If `maintenance_mode` is true and the signed-in user is not the admin, render `src/pages/Maintenance.tsx`; otherwise render children.
- `src/pages/Maintenance.tsx` - full-screen dark page using existing design tokens, with `Seo` meta and `noindex` so search engines don't index it.
- `src/features/admin/MaintenanceToggle.tsx` - shadcn `Card` + `Switch` + message input, mutation via Supabase update with optimistic UI, rendered at the top of `src/pages/Admin.tsx`.

Notes:
- The gate does not block `/admin` or `/login`, so you can always sign in and turn it back off.
- Admin identity keeps using the existing hardcoded admin email so nothing else changes.
