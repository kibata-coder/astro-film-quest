import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { Movie, TVShow } from '@/lib/tmdb';

interface MediaContextType {
  // Movie modal
  selectedMovie: Movie | null;
  isMovieModalOpen: boolean;
  openMovieModal: (movie: Movie) => void;
  closeMovieModal: () => void;
  forceCloseMovieModal: () => void;
  
  // TV modal
  selectedShow: TVShow | null;
  isTVModalOpen: boolean;
  openTVModal: (show: TVShow) => void;
  closeTVModal: () => void;
  forceCloseTVModal: () => void;
  
  // Close all modals
  closeAllModals: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [isTVModalOpen, setIsTVModalOpen] = useState(false);

  // Refs to avoid stale closures in popstate handler
  const isMovieOpenRef = useRef(false);
  const isTVOpenRef = useRef(false);

  useEffect(() => { isMovieOpenRef.current = isMovieModalOpen; }, [isMovieModalOpen]);
  useEffect(() => { isTVOpenRef.current = isTVModalOpen; }, [isTVModalOpen]);

  // Single popstate handler registered once
  useEffect(() => {
    const handler = () => {
      if (isMovieOpenRef.current) {
        setIsMovieModalOpen(false);
        setTimeout(() => setSelectedMovie(null), 300);
      }
      if (isTVOpenRef.current) {
        setIsTVModalOpen(false);
        setTimeout(() => setSelectedShow(null), 300);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const openMovieModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
    window.history.pushState({ modal: 'movie' }, '', window.location.pathname);
  }, []);

  const closeMovieModal = useCallback(() => {
    if (window.history.state?.modal === 'movie') {
      window.history.back();
    } else {
      setIsMovieModalOpen(false);
      setTimeout(() => setSelectedMovie(null), 300);
    }
  }, []);

  // Force close without history.back race conditions (for play transitions)
  const forceCloseMovieModal = useCallback(() => {
    setIsMovieModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
    // Pop the modal's history entry silently
    if (window.history.state?.modal === 'movie') {
      window.history.back();
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

  // Force close without history.back race conditions (for play transitions)
  const forceCloseTVModal = useCallback(() => {
    setIsTVModalOpen(false);
    setTimeout(() => setSelectedShow(null), 300);
    if (window.history.state?.modal === 'tv') {
      window.history.back();
    }
  }, []);

  const closeAllModals = useCallback(() => {
    setIsMovieModalOpen(false);
    setIsTVModalOpen(false);
  }, []);

  return (
    <MediaContext.Provider value={{
      selectedMovie,
      isMovieModalOpen,
      openMovieModal,
      closeMovieModal,
      forceCloseMovieModal,
      selectedShow,
      isTVModalOpen,
      openTVModal,
      closeTVModal,
      forceCloseTVModal,
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
