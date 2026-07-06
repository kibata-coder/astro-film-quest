## Goal
After Google sign-in/sign-up, always redirect users to `https://soudflex.pages.dev/` instead of the current origin (which may be a preview or Lovable subdomain).

## Changes

1. **`src/features/auth/AuthModal.tsx`** — change the `lovable.auth.signInWithOAuth('google', ...)` call to use `redirect_uri: 'https://soudflex.pages.dev/'`.

2. **`src/pages/Login.tsx`** — same change in its `handleGoogleSignIn`.

## Notes
- The target URL `https://soudflex.pages.dev/` must be in the Cloud Auth allowed redirect URLs list; it already is since it's the published domain.
- Email/password flows are left alone (only Google was requested).
- Users signing in from a preview/editor URL will land on the production site after Google auth — confirming that's the intended behavior.