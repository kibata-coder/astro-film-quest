

## UI/UX Improvements Plan

### Issues Identified

1. **Movie Modal on Mobile -- broken layout**: The trailer iframe overlaps the title/buttons area. The YouTube "sign in to confirm you're not a bot" banner obscures content. The title and Play/My List buttons sit awkwardly over the video.

2. **Movie Modal on Mobile -- no proper slide-up behavior**: Uses a Sheet on mobile but the content layout inside needs refinement -- the title area overlaps the video embed.

3. **TV Show Modal -- no mobile-friendly Sheet**: Unlike the Movie Modal, the TV Show modal uses Dialog on all screen sizes, which doesn't feel native on mobile.

4. **Hero Banner on mobile**: The left navigation arrow overlaps the title text. The dots indicator sits too close to the content. The description text can be hard to read.

5. **Header on mobile**: The "SoudFlex" logo, search icon, "Sign In" text, and hamburger menu are all crammed together with minimal spacing.

6. **App.css has conflicting styles**: Contains `#root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }` which constrains the entire app to 1280px centered with padding -- this conflicts with the full-width streaming layout.

7. **Media cards section spacing**: Cards could use better gap and padding consistency.

---

### Changes

#### 1. Remove conflicting `App.css` styles
- Clear out the `#root` max-width, padding, and text-align rules from `src/App.css` that constrain the full-width layout.

#### 2. Fix Movie Modal (mobile and desktop)
- **Mobile**: Improve the Sheet layout so the backdrop image displays cleanly at the top, with the title and buttons below (not overlapping the iframe).
- Remove auto-playing YouTube trailer iframe on mobile (it causes bot-check popups and poor UX). Show the backdrop image instead, keeping the trailer only on desktop.
- Better spacing for the cast, genres, and overview sections.

#### 3. Fix TV Show Modal for mobile
- Add mobile-friendly Sheet (slide-up panel) like the Movie Modal, so it feels native on phones.

#### 4. Fix Hero Banner on mobile
- Hide the left/right navigation arrows on mobile (users can use the dots or swipe).
- Adjust bottom padding so dots don't overlap content.
- Improve text readability with slightly stronger gradient overlay.

#### 5. Fix Header spacing on mobile
- Tighten the gap between right-side items (search, sign in, menu) so they fit comfortably.
- Ensure the logo doesn't get cut off.

#### 6. General polish
- Consistent section spacing throughout the page.
- Better padding on the main content area.

---

### Technical Details

**Files to modify:**

| File | Changes |
|------|---------|
| `src/App.css` | Remove the `#root` max-width/padding/text-align rules |
| `src/features/movies/MovieModal.tsx` | Hide YouTube trailer on mobile (show backdrop instead), fix title/button overlap, improve content spacing |
| `src/features/tv/TVShowModal.tsx` | Add mobile Sheet variant (like MovieModal), fix layout |
| `src/components/HeroBanner.tsx` | Hide nav arrows on mobile, adjust gradient strength, fix dot indicator positioning |
| `src/components/Header.tsx` | Fix mobile spacing for right-side items |

