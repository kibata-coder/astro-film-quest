import { Suspense, lazy, ReactNode, memo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMedia } from '@/features/shared';
import { useVideoPlayer } from '@/features/player';
import { useAuth, AuthModal } from '@/features/auth';

const MovieModal = lazy(() => import('@/features/movies/MovieModal'));
const TVShowModal = lazy(() => import('@/features/tv/TVShowModal'));
const VideoPlayer = lazy(() => import('@/features/player/VideoPlayer'));

interface LayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  showFooter?: boolean;
}

const Layout = memo(({ children, onSearch, searchQuery, showFooter = true }: LayoutProps) => {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const {
    selectedMovie,
    isMovieModalOpen,
    openMovieModal,
    openTVModal,
    closeMovieModal,
    forceCloseMovieModal,
    selectedShow,
    isTVModalOpen,
    closeTVModal,
    forceCloseTVModal,
  } = useMedia();
  const {
    videoState,
    episodeContext,
    playMovie,
    playEpisode,
    nextEpisode,
    previousEpisode,
    closePlayer,
    changeServer,
  } = useVideoPlayer();

  const handlePlayMovie = async () => {
    if (selectedMovie) {
      forceCloseMovieModal();
      await playMovie(selectedMovie);
    }
  };

  const handlePlayTVShow = async (
    showId: number,
    showName: string,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string,
    posterPath: string | null
  ) => {
    if (selectedShow) {
      forceCloseTVModal();
      await playEpisode(selectedShow, seasonNumber, episodeNumber, episodeName);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={onSearch} searchQuery={searchQuery} />
      
      {children}
      
      {showFooter && <Footer />}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      <Suspense fallback={null}>
        <MovieModal
          movie={selectedMovie}
          isOpen={isMovieModalOpen && !videoState.isOpen}
          onClose={closeMovieModal}
          onPlay={handlePlayMovie}
          onSelectMovie={openMovieModal}
        />

        <TVShowModal
          show={selectedShow}
          isOpen={isTVModalOpen && !videoState.isOpen}
          onClose={closeTVModal}
          onPlay={handlePlayTVShow}
          onSelectShow={openTVModal}
        />

        <VideoPlayer
          isOpen={videoState.isOpen}
          onClose={closePlayer}
          title={videoState.title}
          mediaId={videoState.mediaId}
          mediaType={videoState.mediaType}
          seasonNumber={videoState.seasonNumber}
          episodeNumber={videoState.episodeNumber}
          episodeName={videoState.episodeName}
          server={videoState.server}
          totalEpisodes={episodeContext?.episodes.length}
          onNextEpisode={nextEpisode}
          onPreviousEpisode={previousEpisode}
          onChangeServer={changeServer}
        />
      </Suspense>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
