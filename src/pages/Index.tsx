import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchMedia } from '@/hooks/use-media';
import Header from '@/components/Header';
import MovieGrid from '@/components/MovieGrid';
import MovieModal from '@/components/MovieModal';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import TVShowSection from '@/components/TVShowSection';
import TVShowModal from '@/components/TVShowModal';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import { 
  IndianMoviesSection, 
  EnglishMoviesSection, 
  OtherMoviesSection, 
  TrendingTVSection, 
  IndianTVSection, 
  EnglishTVSection,
  LatestSection
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

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      <main className="pt-24 px-4 md:px-12 pb-12">
        {debouncedSearch ? (
          <>
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
                  <TVShowSection
                    title="TV Shows"
                    shows={searchResults.tvShows}
                    isLoading={false}
                    onShowClick={handleTVShowClick}
                  />
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
          </>
        ) : (
          <div className="space-y-8">
            <ContinueWatchingSection
              items={watchHistory}
              onItemClick={handleContinueWatchingClick}
              onRemove={(id, type) => {
                removeFromWatchHistory(id, type);
                setWatchHistory(getWatchHistory());
              }}
            />

            <IndianMoviesSection onMovieClick={handleMovieClick} />
            <TrendingTVSection onShowClick={handleTVShowClick} />
            <LatestSection onMovieClick={handleMovieClick} />
            <EnglishMoviesSection onMovieClick={handleMovieClick} />
            <IndianTVSection onShowClick={handleTVShowClick} />
            <OtherMoviesSection onMovieClick={handleMovieClick} />
            <EnglishTVSection onShowClick={handleTVShowClick} />
          </div>
        )}
      </main>

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
