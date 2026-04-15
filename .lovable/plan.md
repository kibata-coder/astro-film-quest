

## Sign-Up Prompt Popup for Guest Users

### Behavior
- Show a popup after 5 seconds on the home page for users who are **not signed in**
- The popup highlights benefits of creating an account
- If the user clicks **"Create Account"**, open the existing auth modal
- If the user clicks **X** or **"Maybe Later"**, close the popup **but do NOT persist dismissal** — the popup will appear again on the next visit/refresh
- The popup **never shows** for authenticated users — checked via `useAuth().user`
- No localStorage needed — the popup simply checks auth state on each page load

### Changes

**1. New file: `src/components/SignUpPrompt.tsx`**
- Dialog component listing benefits (bookmarks, collections, watch history sync, continue watching, personalized recommendations)
- "Create Free Account" button → calls `openAuthModal()` and closes popup
- "Maybe Later" / X button → just closes popup (no persistence)
- Uses a `setTimeout(5000)` to delay showing
- Checks `useAuth().user` — if user exists, never show

**2. Edit: `src/pages/Index.tsx`**
- Import and render `<SignUpPrompt />` inside the non-search home view

### No database or localStorage changes needed — purely auth-state driven.

