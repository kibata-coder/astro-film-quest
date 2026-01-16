import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchMedia, useTrendingMovies } from '@/hooks/use-media';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import MovieGrid from '@/components/MovieGrid';
import MovieModal from '@/components/MovieModal';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import TVShowModal from '@/components/TVShowModal';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import Footer from '@/components/Footer';
import ScrollableSection from '@/components/ScrollableSection';
import MediaCard from '@/components/MediaCard';
import { Tv } from 'lucide-react';
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
import { Movie, TVShow } from '@/lib/tmdb';
import { 
  WatchHistoryItem, 
  getWatchHistory, 
  saveToWatchHistory, 
  removeFromWatchHistory
} from '@/lib/watchHistory';

interface VideoState {
  isOpen: boolean;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
}

const Index = () => {
  // State
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
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

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Queries
  const { data: searchResults, isLoading: isSearchLoading } = useSearchMedia(debouncedSearch);
  const { data: trendingData } = useTrendingMovies();
  const trendingMovies = trendingData?.results || [];
  
  // Load watch history
  useEffect(() => {
    setWatchHistory(getWatchHistory());
  }, []);

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

  const handlePlayMovie = () => {
    if (!selectedMovie) return;
    saveToWatchHistory({
      mediaType: 'movie',
      mediaId: selectedMovie.id,
      title: selectedMovie.title,
      posterPath: selectedMovie.poster_path,
      backdropPath: selectedMovie.backdrop_path,
    });
    setWatchHistory(getWatchHistory());
    setIsModalOpen(false);
    setVideoState({
      isOpen: true,
      title: selectedMovie.title,
      mediaId: selectedMovie.id,
      mediaType: 'movie'
    });
  };

  const handlePlayTVShow = (
    showId: number, 
    showName: string, 
    seasonNumber: number, 
    episodeNumber: number, 
    episodeName: string,
    posterPath: string | null
  ) => {
    saveToWatchHistory({
      mediaType: 'tv',
      mediaId: showId,
      title: showName,
      posterPath: posterPath,
      backdropPath: selectedTVShow?.backdrop_path || null,
      seasonNumber,
      episodeNumber,
      episodeName,
    });
    setWatchHistory(getWatchHistory());
    setIsTVModalOpen(false);
    setVideoState({
      isOpen: true,
      title: `${showName} - ${episodeName}`,
      mediaId: showId,
      mediaType: 'tv',
      seasonNumber,
      episodeNumber
    });
  };

  const handleContinueWatchingClick = (item: WatchHistoryItem) => {
    if (item.mediaType === 'tv' && item.seasonNumber && item.episodeNumber) {
      setVideoState({
        isOpen: true,
        title: item.title,
        mediaId: item.mediaId,
        mediaType: 'tv',
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber
      });
    } else {
      setVideoState({
        isOpen: true,
        title: item.title,
        mediaId: item.mediaId,
        mediaType: 'movie'
      });
    }
  };

  const handleHeroPlay = (movie: Movie) => {
    saveToWatchHistory({
      mediaType: 'movie',
      mediaId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
    });
    setWatchHistory(getWatchHistory());
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
              <ContinueWatchingSection
                items={watchHistory}
                onItemClick={handleContinueWatchingClick}
                onRemove={(id, type) => {
                  removeFromWatchHistory(id, type);
                  setWatchHistory(getWatchHistory());
                }}
              />

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
        onClose={() => setVideoState(p => ({ ...p, isOpen: false }))}
        {...videoState}
      />
    </div>
  );
};

export default Index;
