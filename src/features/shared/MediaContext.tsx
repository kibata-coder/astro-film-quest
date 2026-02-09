import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Movie, TVShow } from '@/lib/tmdb';

interface MediaContextType {
  // Movie modal
  selectedMovie: Movie | null;
  isMovieModalOpen: boolean;
  openMovieModal: (movie: Movie) => void;
  closeMovieModal: () => void;
  
  // TV modal
  selectedShow: TVShow | null;
  isTVModalOpen: boolean;
  openTVModal: (show: TVShow) => void;
  closeTVModal: () => void;
  
  // Close all modals
  closeAllModals: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [isTVModalOpen, setIsTVModalOpen] = useState(false);

  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If the state is not 'modal', close any open modals
      if (!event.state || !event.state.modal) {
        if (isMovieModalOpen) setIsMovieModalOpen(false);
        if (isTVModalOpen) setIsTVModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMovieModalOpen, isTVModalOpen]);

  const openMovieModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
    // Push state so back button works
    window.history.pushState({ modal: 'movie' }, '', window.location.pathname);
  }, []);

  const closeMovieModal = useCallback(() => {
    // If we are currently in a modal state, go back
    if (window.history.state?.modal === 'movie') {
      window.history.back();
    } else {
      // Fallback for direct closure
      setIsMovieModalOpen(false);
      setTimeout(() => setSelectedMovie(null), 300);
    }
  }, []);

  const openTVModal = useCallback((show: TVShow) => {
    setSelectedShow(show);
    setIsTVModalOpen(true);
    window.history.pushState({ modal: 'tv' }, '', window.location.pathname);
  }, []);

  const closeTVModal = useCallback(() => {
    if (window.history.state?.modal === 'tv') {
      window.history.back();
    } else {
      setIsTVModalOpen(false);
      setTimeout(() => setSelectedShow(null), 300);
    }
  }, []);

  const closeAllModals = useCallback(() => {
    // Just reset state visually, do not mess with history here as it might be complex
    setIsMovieModalOpen(false);
    setIsTVModalOpen(false);
  }, []);

  return (
    <MediaContext.Provider value={{
      selectedMovie,
      isMovieModalOpen,
      openMovieModal,
      closeMovieModal,
      selectedShow,
      isTVModalOpen,
      openTVModal,
      closeTVModal,
      closeAllModals,
    }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}
