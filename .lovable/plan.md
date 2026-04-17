

## Problem
At the current viewport (888px), the trailer in MovieModal/TVShowModal still appears too large. The `max-h-[300px]` cap I added doesn't actually constrain because `aspect-video` on a ~720px wide modal produces ~405px height — but `max-h` with `aspect-video` and `overflow-hidden` just crops, it doesn't shrink. Also at md breakpoint (768px+), the modal is near full width of the 888px viewport.

## Fix

**MovieModal.tsx & TVShowModal.tsx** — replace the trailer/backdrop wrapper:

Instead of `aspect-video w-full max-h-[300px] overflow-hidden` (which crops), use a fixed height container that the iframe/image fills:

```tsx
<div className="w-full h-[220px] md:h-[280px] overflow-hidden bg-black">
  <iframe ... className="w-full h-full" />
  {/* or */}
  <img ... className="w-full h-full object-cover" />
</div>
```

This guarantees the hero never exceeds 280px on desktop and 220px on mobile, keeping title + action buttons visible without scrolling.

Also reduce dialog `max-w-3xl` → `max-w-2xl` (~672px) for a tighter modal on mid-size screens.

### Files
- `src/features/movies/MovieModal.tsx`
- `src/features/tv/TVShowModal.tsx`

