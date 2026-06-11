## Goal
Surface the sister site SoudSport (`https://soudsports.pages.dev/`) on SoudFlex so visitors know a sports streaming option exists.

## Plan

### 1. Header Navigation
Add a **SoudSport** link in the top nav bar next to the existing route links (Movies, TV Shows, Anime, Anime Movies).
- Opens `https://soudsports.pages.dev/` in a new tab (`target="_blank" rel="noopener noreferrer"`).
- Styled with a subtle accent (e.g., a small sports-themed icon or a distinct hover state) so it stands out slightly as an external property without clashing with the dark Netflix-like UI.
- Included in both desktop nav and the mobile Sheet menu.

### 2. Footer — "Our Network" column
Add a new column in the footer grid titled **Our Network**.
- Link: **SoudSport** → `https://soudsports.pages.dev/` (new tab).
- One-liner beneath it: "Live sports, highlights, and more."
- Keep the existing footer columns (Browse, Categories, Help) intact.

### 3. Homepage Banner / Notice
Add a compact, dismissible or static promo banner on the homepage, placed just below the `HeroBanner` (above the `main` content grid).
- Copy: "Looking for live sports? Check out SoudSport."
- CTA button: **Go to SoudSport** → opens in new tab.
- Visual style: uses a dark card surface with the primary accent color for the CTA, matching the existing theme. No hardcoded colors.
- On mobile: banner stacks vertically, stays unobtrusive.

## Technical Details
- `src/components/Header.tsx`: add `<a>` link for SoudSport in desktop nav and mobile Sheet.
- `src/components/Footer.tsx`: add the "Our Network" column with the SoudSport link.
- `src/pages/Index.tsx`: insert the promo banner component between `HeroBanner` and `main`.
- New component: `src/components/SoudSportBanner.tsx` (small, reusable promo banner).
- All external links use `target="_blank"` with `rel="noopener noreferrer"`.
- Uses Tailwind semantic tokens (`bg-card`, `text-primary`, `border-border`, etc.) — no hardcoded hex values.

## Out of Scope
- No iframes or embedding of SoudSport.
- No backend changes.
- No new routes or pages on SoudFlex.