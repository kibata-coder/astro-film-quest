import { useState, lazy, Suspense } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchMedia, useTrendingMovies } from '@/hooks/use-media';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import MovieGrid from '@/components/MovieGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import Footer from '@/components/Footer';
import ScrollableSection from '@/components/ScrollableSection';
import MediaCard from '@/components/MediaCard';
import { Tv } from 'lucide-react';
import { addToHistory } from '@/lib/watchHistory';

// Lazy load heavy components for better performance
const MovieModal = lazy(() => import('@/components/MovieModal'));
const TVShowModal = lazy(() => import('@/components/TVShowModal'));
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));
import {
  IndianMoviesSection,
  EnglishMoviesSection,
  OtherMoviesSection,
  TrendingTVSection,
  IndianTVSection,
  EnglishTVSection,
  LatestSection,
  TrendingMoviesSection
} from '@/components/sections/MovieSections';
import { Movie, TVShow, Episode, getTVShowSeasonDetails } from '@/lib/tmdb';

interface VideoState {
  isOpen: boolean;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
}

interface TVEpisodeContext {
  showId: number;
  showName: string;
  seasonNumber: number;
  episodes: Episode[];
  posterPath: string | null;
  backdropPath: string | null;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTVShow, setSelectedTVShow] = useState<TVShow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTVModalOpen, setIsTVModalOpen] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>({
    isOpen: false,
    title: '',
    mediaId: 0,
    mediaType: 'movie'
  });
  const [tvEpisodeContext, setTvEpisodeContext] = useState<TVEpisodeContext | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Queries
  const { data: searchResults, isLoading: isSearchLoading } = useSearchMedia(debouncedSearch);
  const { data: trendingData } = useTrendingMovies();
  const trendingMovies = trendingData?.results || [];

  // Helper to dispatch history update event
  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleTVShowClick = (show: TVShow) => {
    setSelectedTVShow(show);
    setIsTVModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  const handleCloseTVModal = () => {
    setIsTVModalOpen(false);
    setTimeout(() => setSelectedTVShow(null), 300);
  };

  const handlePlayMovie = async () => {
    if (!selectedMovie) return;
    await addToHistory({
      id: selectedMovie.id,
      media_type: 'movie',
      title: selectedMovie.title,
      poster_path: selectedMovie.poster_path || '',
    });
    notifyHistoryUpdate();
    setIsModalOpen(false);
    setVideoState({
      isOpen: true,
      title: selectedMovie.title,
      mediaId: selectedMovie.id,
      mediaType: 'movie'
    });
  };

  const handlePlayTVShow = async (
    showId: number,
    showName: string,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string,
    posterPath: string | null
  ) => {
    await addToHistory({
      id: showId,
      media_type: 'tv',
      title: showName,
      poster_path: posterPath || '',
      season_number: seasonNumber,
      episode_number: episodeNumber,
    });
    notifyHistoryUpdate();
    setIsTVModalOpen(false);

    // Fetch episode list for navigation
    try {
      const seasonDetails = await getTVShowSeasonDetails(showId, seasonNumber);
      setTvEpisodeContext({
        showId,
        showName,
        seasonNumber,
        episodes: seasonDetails.episodes || [],
        posterPath,
        backdropPath: selectedTVShow?.backdrop_path || null,
      });
    } catch (error) {
      console.error('Failed to fetch season details:', error);
      setTvEpisodeContext(null);
    }

    setVideoState({
      isOpen: true,
      title: `${showName} - ${episodeName}`,
      mediaId: showId,
      mediaType: 'tv',
      seasonNumber,
      episodeNumber,
      episodeName
    });
  };

  const handleNextEpisode = async () => {
    if (!tvEpisodeContext || !videoState.episodeNumber) return;

    const currentEpIndex = tvEpisodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );

    if (currentEpIndex === -1 || currentEpIndex >= tvEpisodeContext.episodes.length - 1) return;

    const nextEpisode = tvEpisodeContext.episodes[currentEpIndex + 1];

    await addToHistory({
      id: tvEpisodeContext.showId,
      media_type: 'tv',
      title: tvEpisodeContext.showName,
      poster_path: tvEpisodeContext.posterPath || '',
      season_number: tvEpisodeContext.seasonNumber,
      episode_number: nextEpisode.episode_number,
    });
    notifyHistoryUpdate();

    setVideoState(prev => ({
      ...prev,
      title: `${tvEpisodeContext.showName} - ${nextEpisode.name}`,
      episodeNumber: nextEpisode.episode_number,
      episodeName: nextEpisode.name
    }));
  };

  const handlePreviousEpisode = async () => {
    if (!tvEpisodeContext || !videoState.episodeNumber) return;

    const currentEpIndex = tvEpisodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );

    if (currentEpIndex <= 0) return;

    const prevEpisode = tvEpisodeContext.episodes[currentEpIndex - 1];

    await addToHistory({
      id: tvEpisodeContext.showId,
      media_type: 'tv',
      title: tvEpisodeContext.showName,
      poster_path: tvEpisodeContext.posterPath || '',
      season_number: tvEpisodeContext.seasonNumber,
      episode_number: prevEpisode.episode_number,
    });
    notifyHistoryUpdate();

    setVideoState(prev => ({
      ...prev,
      title: `${tvEpisodeContext.showName} - ${prevEpisode.name}`,
      episodeNumber: prevEpisode.episode_number,
      episodeName: prevEpisode.name
    }));
  };

  const handleHeroPlay = async (movie: Movie) => {
    await addToHistory({
      id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path || '',
    });
    notifyHistoryUpdate();
    setVideoState({
      isOpen: true,
      title: movie.title,
      mediaId: movie.id,
      mediaType: 'movie'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      {debouncedSearch ? (
        <main className="pt-24 px-4 md:px-12 pb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            Search Results for "{debouncedSearch}"
          </h2>
          {isSearchLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {searchResults?.movies.length ? (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Movies</h3>
                  <MovieGrid movies={searchResults.movies} onMovieClick={handleMovieClick} />
                </div>
              ) : null}

              {searchResults?.tvShows.length ? (
                <ScrollableSection title="TV Shows" icon={Tv}>
                  {searchResults.tvShows.map((show) => (
                    <MediaCard
                      key={show.id}
                      item={show}
                      onClick={() => handleTVShowClick(show)}
                    />
                  ))}
                </ScrollableSection>
              ) : null}

              {!searchResults?.movies.length && !searchResults?.tvShows.length && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    No results found. Try a different search term.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      ) : (
        <>
          {/* Hero Banner */}
          <HeroBanner
            movies={trendingMovies}
            onPlay={handleHeroPlay}
            onInfo={handleMovieClick}
          />

          <main className="px-4 md:px-12 pb-12 -mt-24 relative z-10">
            <div className="space-y-4">
              <ContinueWatchingSection />

              <TrendingMoviesSection onMovieClick={handleMovieClick} />
              <TrendingTVSection onShowClick={handleTVShowClick} />
              <IndianMoviesSection onMovieClick={handleMovieClick} />
              <EnglishMoviesSection onMovieClick={handleMovieClick} />
              <IndianTVSection onShowClick={handleTVShowClick} />
              <LatestSection onMovieClick={handleMovieClick} />
              <OtherMoviesSection onMovieClick={handleMovieClick} />
              <EnglishTVSection onShowClick={handleTVShowClick} />
            </div>
          </main>

          <Footer />
        </>
      )}

      <Suspense fallback={null}>
        <MovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPlay={handlePlayMovie}
        />

        <TVShowModal
          show={selectedTVShow}
          isOpen={isTVModalOpen}
          onClose={handleCloseTVModal}
          onPlay={handlePlayTVShow}
        />

        <VideoPlayer
          isOpen={videoState.isOpen}
          onClose={() => {
            setVideoState(p => ({ ...p, isOpen: false }));
            setTvEpisodeContext(null);
          }}
          {...videoState}
          totalEpisodes={tvEpisodeContext?.episodes.length}
          onNextEpisode={handleNextEpisode}
          onPreviousEpisode={handlePreviousEpisode}
        />
      </Suspense>
    </div>
  );
};

export default Index;
