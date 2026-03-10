

## Problem

The movie/TV modal on desktop uses `max-w-4xl` (~896px) with a full-width `aspect-video` trailer, making the hero media section dominate the viewport. The trailer iframe takes up roughly 60% of the visible modal, pushing buttons and details below the fold.

## Plan

### 1. Reduce modal and trailer size

- **MovieModal & TVShowModal**: Change dialog `max-w-4xl` → `max-w-3xl` (~720px) to make the modal more compact
- **Trailer section**: Cap the trailer height with `max-h-[300px]` so it doesn't dominate, while keeping `aspect-video` as a fallback ratio
- Apply the same constraint to the backdrop image in both modals

### 2. Tighten internal spacing

- Reduce vertical padding/margins in the content area (`space-y-6` → `space-y-4`, `-mt-16` → `-mt-12`)
- Make title text slightly smaller on desktop (`text-3xl` → `text-2xl`)

This keeps the trailer visible as a preview without overwhelming the modal, letting users see the title, buttons, and details without scrolling.

---

## Feature suggestions for next steps

Here are ideas to keep improving the app:

1. **Search within My List / Collections** — filter saved items by name
2. **Watchlist sharing** — generate a shareable link for a collection
3. **Episode progress tracking** — show a progress bar on each episode in the TV modal
4. **"Continue Watching" in TV modal** — auto-select the last-watched episode/season when reopening a show
5. **Keyboard shortcuts** — Escape to close modals, arrow keys to navigate episodes

