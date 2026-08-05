import { Suspense, lazy, ReactNode, memo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useMedia } from '@/features/shared';
import { useVideoPlayer } from '@/features/player';
import { useAuth, AuthModal } from '@/features/auth';
import SignUpPrompt from '@/components/SignUpPrompt';

const MovieModal = lazy(() => import('@/features/movies/MovieModal'));
const TVShowModal = lazy(() => import('@/features/tv/TVShowModal'));
const VideoPlayer = lazy(() => import('@/features/player/VideoPlayer'));
const MegaPlayPlayer = lazy(() => import('@/features/player/MegaPlayPlayer'));

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
    tvModalOptions,
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
    fallbackToIframe,
    closePlayer,
  } = useVideoPlayer();

  const handlePlayMovie = () => {
    if (selectedMovie) {
      playMovie(selectedMovie);
      forceCloseMovieModal(true);
    }
  };

  const handlePlayTVShow = (
    showId: number,
    showName: string,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string,
    posterPath: string | null
  ) => {
    if (selectedShow) {
      playEpisode(selectedShow, seasonNumber, episodeNumber, episodeName);
      forceCloseTVModal(true);
    }
  };
  const showMovieModal = isMovieModalOpen && !videoState.isOpen;
  const showTVModal = isTVModalOpen && !videoState.isOpen;


  // ── Player slot ──
  const renderPlayer = () => {
    if (!videoState.isOpen) return null;

    if (videoState.mode === 'resolving') {
      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">Loading anime stream…</p>
        </div>
      );
    }

    if (videoState.mode === 'megaplay' && videoState.malId) {
      const currentIdx = episodeContext?.episodes.findIndex(e => e.episode_number === videoState.episodeNumber) ?? -1;
      const hasPrev = currentIdx > 0;
      const hasNext = episodeContext ? currentIdx >= 0 && currentIdx < episodeContext.episodes.length - 1 : false;
      return (
        <MegaPlayPlayer
          malId={videoState.malId}
          mediaId={videoState.mediaId}
          mediaType={videoState.mediaType}
          seasonNumber={videoState.seasonNumber}
          episodeNumber={videoState.episodeNumber}
          title={videoState.title.split(' - ')[0]}
          subtitle={
            videoState.mediaType === 'tv' && videoState.episodeNumber
              ? `S${videoState.seasonNumber ?? 1} E${videoState.episodeNumber} · ${videoState.episodeName ?? ''}`
              : undefined
          }
          onClose={closePlayer}
          onNext={hasNext ? nextEpisode : undefined}
          onPrev={hasPrev ? previousEpisode : undefined}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      );
    }

    return (
      <VideoPlayer
        isOpen
        onClose={closePlayer}
        title={videoState.title}
        mediaId={videoState.mediaId}
        mediaType={videoState.mediaType}
        seasonNumber={videoState.seasonNumber}
        episodeNumber={videoState.episodeNumber}
        episodeName={videoState.episodeName}
        totalEpisodes={episodeContext?.episodes.length}
        onNextEpisode={nextEpisode}
        onPreviousEpisode={previousEpisode}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={onSearch} searchQuery={searchQuery} />

      {children}

      {showFooter && <Footer />}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <SignUpPrompt />

      {/* Each lazy chunk is only requested once its surface is actually opened,
          so a plain browse never downloads modal or player code. */}
      <Suspense fallback={null}>
        {showMovieModal && (
          <MovieModal
            movie={selectedMovie}
            isOpen
            onClose={closeMovieModal}
            onPlay={handlePlayMovie}
            onSelectMovie={openMovieModal}
          />
        )}

        {showTVModal && (
          <TVShowModal
            show={selectedShow}
            isOpen
            onClose={closeTVModal}
            onPlay={handlePlayTVShow}
            onSelectShow={openTVModal}
            initialSeason={tvModalOptions?.initialSeason}
            initialEpisode={tvModalOptions?.initialEpisode}
          />
        )}

        {renderPlayer()}
      </Suspense>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
