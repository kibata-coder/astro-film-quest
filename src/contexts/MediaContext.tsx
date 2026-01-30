import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

  const openMovieModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
  }, []);

  const closeMovieModal = useCallback(() => {
    setIsMovieModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  }, []);

  const openTVModal = useCallback((show: TVShow) => {
    setSelectedShow(show);
    setIsTVModalOpen(true);
  }, []);

  const closeTVModal = useCallback(() => {
    setIsTVModalOpen(false);
    setTimeout(() => setSelectedShow(null), 300);
  }, []);

  const closeAllModals = useCallback(() => {
    closeMovieModal();
    closeTVModal();
  }, [closeMovieModal, closeTVModal]);

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
