

## Fix Signed-In Header UI + Video Player Fullscreen

### Issues Found

1. **Signed-in UI broken on mobile**: The account icon and sign-out button are wrapped in `hidden md:flex` (Header line 165), making them completely invisible on mobile when signed in. Users see no indication they're logged in and no way to sign out from the header bar.

2. **Vidsrc domain migration**: The Vidsrc homepage announces a domain change from `vidsrc-embed.ru` to `vsembed.ru`. The old domain may be causing embed failures or fullscreen restrictions.

3. **Iframe z-index conflict**: The iframe sits at `zIndex: 1` while overlay controls are at `z-40`/`z-50`. When controls are visible, they can intercept touch/click events on the iframe's native fullscreen button area, especially on mobile where the control bar is at the bottom of the screen.

---

### Changes

#### 1. `src/components/Header.tsx` -- Fix signed-in mobile UI
- Remove `hidden md:flex` from the signed-in user container so the account icon and sign-out button appear on all screen sizes.
- Show a compact version on mobile: just the UserCircle icon that opens a small dropdown with email display and sign-out option, keeping the header clean.

#### 2. `src/lib/vidsrc.ts` -- Update embed domain
- Change `VIDSRC_BASE_URL` from `https://vidsrc-embed.ru` to `https://vsembed.ru` (the new official domain per their announcement).
- Keep the Latest API URLs on the old domain if they still work, or update them too.

#### 3. `src/features/player/VideoPlayer.tsx` -- Fix fullscreen interaction
- Lower the overlay z-indexes so they don't block the iframe's native controls when visible. Move the iframe to `zIndex: 10` and keep overlays at `z-20`/`z-30` instead of `z-40`/`z-50`.
- Ensure the bottom ~60px of the screen (where the iframe's native control bar sits) is not covered by any overlay element, so fullscreen and subtitle buttons remain tappable.

---

### Technical Details

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Replace `hidden md:flex` signed-in block with a responsive version: on mobile show UserCircle icon with a dropdown menu (email + sign out); on desktop keep current layout |
| `src/lib/vidsrc.ts` | Update `VIDSRC_BASE_URL` to `https://vsembed.ru`; update Latest API URLs if needed |
| `src/features/player/VideoPlayer.tsx` | Adjust z-index hierarchy (iframe z-10, overlays z-20/z-30); add `pointer-events-none` to a bottom safe zone so iframe controls remain accessible |

