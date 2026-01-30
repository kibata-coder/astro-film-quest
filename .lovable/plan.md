

# Performance, Reliability & Scalability Refactor Plan

## Overview
This plan addresses performance bottlenecks, code duplication, and scalability concerns in your SoudFlex streaming application. The refactoring focuses on three pillars: **Speed**, **Reliability**, and **Scalability**.

---

## Current Issues Identified

1. **Code Duplication**: Modal logic, video player state, and episode navigation are duplicated across Index.tsx, Movies.tsx, and TVShows.tsx
2. **Prop Drilling**: Callback functions passed deeply through component trees
3. **Missing Error Boundaries**: No graceful error handling for component failures
4. **No Global State**: Auth state, media modals, and video player should be centralized
5. **LatestSection Performance**: Makes 20+ sequential API calls on every page load
6. **Missing React.memo**: Components re-render unnecessarily
7. **Font Loading**: Blocking render with Google Fonts import in CSS

---

## Refactoring Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Global Context Providers                   │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │  │ AuthContext │ │MediaContext │ │ VideoPlayerCtx  │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Error Boundary                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      Routes                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Global Modals (MovieModal, TVShowModal)      │ │
│  │            Global VideoPlayer                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Context & State Management (Core Infrastructure)

**1.1 Create AuthContext (`src/contexts/AuthContext.tsx`)**
- Centralize auth state management
- Remove auth checks scattered across Header, MovieModal, TVShowModal, MyList
- Provide `user`, `isAuthenticated`, `signIn`, `signOut` via context

**1.2 Create MediaContext (`src/contexts/MediaContext.tsx`)**
- Centralize modal state: `selectedMovie`, `selectedTVShow`, `isModalOpen`
- Provide `openMovieModal()`, `openTVModal()`, `closeModal()` functions
- Move modals to App.tsx level (render once, not per-page)

**1.3 Create VideoPlayerContext (`src/contexts/VideoPlayerContext.tsx`)**
- Centralize video player state
- Manage episode navigation state
- Provide `playMovie()`, `playEpisode()`, `close()` functions
- Move VideoPlayer to App.tsx level

**Benefits:**
- Eliminates 200+ lines of duplicated code across pages
- Modals/player only render once in the app
- Cleaner page components focused on layout

---

### Phase 2: Performance Optimizations

**2.1 Memoize Components**
Apply `React.memo` to prevent unnecessary re-renders:
- `MediaCard` - most frequently rendered component
- `ScrollableSection` - re-renders on every parent update
- `HeroBanner` - only needs to update when movies change
- `Footer` - static component

**2.2 Optimize LatestSection**
Current: 20 sequential API calls (10 movies + 10 TV shows)
Solution:
- Batch TMDB requests using `Promise.allSettled`
- Add React Query caching (currently using `useEffect` without caching)
- Use `useLatestMedia` hook with proper query keys

**2.3 Font Loading Optimization**
Move from blocking CSS import to async font loading in index.html:
```html
<link rel="preload" href="font-url" as="font" type="font/woff2" crossorigin>
```

**2.4 Image Preloading for Hero**
Preload the first hero banner image to eliminate layout shift:
- Add `fetchpriority="high"` to first backdrop
- Preload first trending movie backdrop in head

---

### Phase 3: Error Handling & Reliability

**3.1 Create ErrorBoundary Component (`src/components/ErrorBoundary.tsx`)**
- Catch React rendering errors
- Show user-friendly fallback UI
- Log errors for debugging
- "Try Again" functionality

**3.2 Add Section-Level Error Handling**
Wrap each media section in error boundaries:
- If TrendingMovies fails, other sections still render
- Prevents full page crashes from single API failure

**3.3 API Error Recovery**
- Add retry logic to TMDB hook (already have `retry: 1`, consider `retry: 2`)
- Show "Failed to load" states with retry buttons
- Graceful degradation when sections fail

---

### Phase 4: Code Simplification

**4.1 Simplify Page Components**
After context refactoring, pages become much cleaner:

```typescript
// Before: Index.tsx (335 lines)
// After: Index.tsx (~80 lines)
const Index = () => {
  const { openMovie, openShow } = useMedia();
  // Just layout + section components
};
```

**4.2 Create Shared Layout Component (`src/components/Layout.tsx`)**
Extract common structure:
- Header
- Main content area
- Footer
- Global modals (from context)
- Global video player (from context)

**4.3 Clean Up Unused Components**
Remove after unification:
- `MovieCard.tsx` (merged into `MediaCard.tsx` already)
- `TVShowCard.tsx` (merged into `MediaCard.tsx` already)
- `TVShowSection.tsx` (using MovieSections.tsx)
- `GenreSection.tsx` (not used)

---

### Phase 5: Scalability Improvements

**5.1 Hooks Consolidation**
Create unified media hooks:
- `useMediaDetails(id, type)` - get movie or TV details
- `useWatchHistory()` - React Query based history hook
- `useBookmarks()` - React Query based bookmarks hook

**5.2 Type Safety Improvements**
Create shared types file (`src/types/media.ts`):
- `VideoState` type (used in 3 places)
- `TVEpisodeContext` type (duplicated in 2 places)
- Shared modal props interfaces

**5.3 API Layer Abstraction**
Consider creating `src/api/` directory for:
- Cleaner separation of concerns
- Easier testing
- Rate limiting/caching strategies

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `src/contexts/AuthContext.tsx` | Centralized auth state |
| Create | `src/contexts/MediaContext.tsx` | Modal & selection state |
| Create | `src/contexts/VideoPlayerContext.tsx` | Video player state |
| Create | `src/components/ErrorBoundary.tsx` | Error handling wrapper |
| Create | `src/components/Layout.tsx` | Shared page layout |
| Create | `src/types/media.ts` | Shared TypeScript types |
| Modify | `src/App.tsx` | Add providers, global modals |
| Modify | `src/pages/Index.tsx` | Simplify, use contexts |
| Modify | `src/pages/Movies.tsx` | Simplify, use contexts |
| Modify | `src/pages/TVShows.tsx` | Simplify, use contexts |
| Modify | `src/pages/MyList.tsx` | Use auth context |
| Modify | `src/components/MediaCard.tsx` | Add React.memo |
| Modify | `src/components/ScrollableSection.tsx` | Add React.memo |
| Modify | `src/components/HeroBanner.tsx` | Add React.memo, preload |
| Modify | `src/components/Header.tsx` | Use auth context |
| Modify | `src/components/LatestSection.tsx` | Convert to React Query |
| Modify | `src/index.css` | Remove blocking font import |
| Modify | `index.html` | Async font loading |
| Delete | `src/components/GenreSection.tsx` | Not used |

---

## Technical Details

### AuthContext Structure
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  openAuthModal: () => void;
}
```

### MediaContext Structure
```typescript
interface MediaContextType {
  selectedMovie: Movie | null;
  selectedShow: TVShow | null;
  isMovieModalOpen: boolean;
  isTVModalOpen: boolean;
  openMovieModal: (movie: Movie) => void;
  openTVModal: (show: TVShow) => void;
  closeModals: () => void;
}
```

### VideoPlayerContext Structure
```typescript
interface VideoPlayerContextType {
  isOpen: boolean;
  videoState: VideoState;
  episodeContext: TVEpisodeContext | null;
  playMovie: (movie: Movie) => void;
  playEpisode: (show, season, episode) => void;
  nextEpisode: () => void;
  prevEpisode: () => void;
  close: () => void;
}
```

---

## Expected Improvements

| Metric | Before | After |
|--------|--------|-------|
| Lines of code (pages) | ~750 | ~250 |
| Duplicate logic | 3 copies | 1 source |
| Re-renders per interaction | Multiple | Minimal |
| Error recovery | None | Graceful fallbacks |
| Component isolation | Coupled | Decoupled |
| Time to add new page | High | Low |

---

## Implementation Order

1. Create type definitions first
2. Create contexts (auth, media, video player)
3. Add ErrorBoundary
4. Create Layout component
5. Refactor App.tsx with providers
6. Simplify each page one by one
7. Add React.memo optimizations
8. Optimize LatestSection with React Query
9. Update font loading
10. Clean up unused files

