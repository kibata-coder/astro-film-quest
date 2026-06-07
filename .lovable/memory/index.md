# Project Memory

## Core
SoudFlex. Strictly dark theme (#0f0f0f), primary #2563eb. No light mode.
Cloudflare Pages deployment. Use npm only (no bun.lockb). Vite 7+ (esnext).
Supabase auth: Auto-confirm email signups (no verification). All RLS PERMISSIVE.
Streaming: HiAnime via Consumet + hls-proxy for anime; Vidsrc iframe for non-anime and as anime fallback.
NEVER apply a `sandbox` attribute to any Vidsrc/streaming iframe — it breaks playback. Solve top-nav hijacks via other means.
Netflix-like full-width UI. No max-width container constraints on root.
Routes: /movies, /tv, /anime, /anime-movies. No "New & Popular" pages.
No PWA or service workers. No analytics tracking scripts.
Footer must include: "This website is for educational purposes only."

## Memories
- [Vidsrc No Sandbox](mem://constraints/vidsrc-no-sandbox) — Hard rule against sandbox attr on Vidsrc iframes
- [TMDB API Proxy](mem://integration/tmdb-api-proxy) — Allowlist and regex path validation, sanitized errors
- [Deployment Config](mem://devops/deployment-config) — Cloudflare pages build/install commands and npm requirement
- [Deployment Domains](mem://devops/deployment-domains) — CORS whitelist for Edge Functions and preview domains
- [Page Navigation Structure](mem://features/page-navigation-structure) — Simplified routes, React.lazy code splitting
- [Email Verification Config](mem://devops/email-verification-config) — Redirect URLs and email template branding
- [UI Spacing Strategy](mem://design/ui-spacing-strategy) — Responsive media cards, vertical stacking, icon-only tertiary buttons
- [PWA Exclusion](mem://constraints/pwa-exclusion) — Explicit removal of service workers to prevent caching issues
- [Global State Management](mem://architecture/global-state-management) — Context for Auth/Media/Player, centralized ErrorBoundaries
- [Build Compatibility](mem://devops/build-compatibility) — Vite manualChunks to prevent circular dependencies
- [Analytics Status](mem://integration/analytics-status) — No active external tracking scripts
- [Data Fetching Strategy](mem://architecture/data-fetching-strategy) — TanStack Query, 5m staleTime for TMDB
- [Feature-Based Architecture](mem://architecture/feature-based-organization) — src/features/ grouping, src/components/ui for generic components
- [Video Player UI Layout](mem://features/video-player-ui-layout) — Fullscreen-first, top control bar, no bottom overlays
- [Continue Watching UX](mem://features/continue-watching-ux) — Supabase watch_history, localStorage merge, optimistic UI
- [Navigation History Management](mem://architecture/navigation-history-management) — popstate listener for modals/player routing
- [Branding](mem://design/branding) — SoudFlex identity, primary #2563eb, dark background #0f0f0f
- [Performance Optimization](mem://architecture/performance-optimization) — LazySection with IntersectionObserver, preconnect hints
- [Streaming Service](mem://features/streaming-service) — Vidsrc query params (vsembed.su), allowFullScreen, no-referrer
- [Video Player Constraints](mem://constraints/video-player-limitations) — Iframe sandbox omission, no-referrer for native controls
- [Header UI Layout](mem://design/header-ui-layout) — Auth states, responsive dropdown, fixed search overlay z-[60]
- [Email Verification Policy](mem://auth/email-verification-policy) — Auto-confirm signups
- [Footer Legal Disclaimer](mem://design/footer-legal-disclaimer) — Educational purposes disclaimer
- [User Profiles & Avatars](mem://features/user-profiles-avatars) — /profile, Supabase storage 2MB limit with RLS
- [Ratings System](mem://features/ratings-system) — Thumbs up/down (1/-1), restricted visibility to auth.uid()
- [Collections & Watchlists](mem://features/collections-watchlists) — Multiple named lists, AddToCollection dialog, hover delete
- [Advanced Filtering & Sorting](mem://features/advanced-filtering-sorting) — TMDB discovery API integration in FilterBar
- [RLS Policy Standard](mem://security/rls-policy-standard) — PERMISSIVE type enforcement and auth.uid() checks
- [Media Modals UI Layout](mem://features/media-modals/ui-layout) — Sheets on mobile, Dialog on desktop, TV actions layout
- [Anime Player](mem://features/anime-player) — hls.js native player, Sub/Dub toggle, 4s resolve timeout, Vidsrc fallback
