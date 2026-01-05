import { useState, useEffect, useCallback } from 'react';
import { Film, Globe, Clapperboard } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import Header from '@/components/Header';
import MovieGrid from '@/components/MovieGrid';
import MovieModal from '@/components/MovieModal';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import LatestSection from '@/components/LatestSection';
import GenreSection from '@/components/GenreSection';
import TVShowSection from '@/components/TVShowSection';
import TVShowModal from '@/components/TVShowModal';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import { 
  Movie, 
  TVShow,
  getTrendingMovies, 
  searchMovies,
  searchTVShows,
  getIndianMovies, 
  getEnglishMovies, 
  getOtherMovies,
  getTrendingTVShows,
  getIndianTVShows,
  getEnglishTVShows
} from '@/lib/tmdb';
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
  posterPath?: string | null;
}

const Index = () => {
  // Movies state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [indianMovies, setIndianMovies] = useState<Movie[]>([]);
  const [englishMovies, setEnglishMovies] = useState<Movie[]>([]);
  const [otherMovies, setOtherMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingIndian, setIsLoadingIndian] = useState(true);
  const [isLoadingEnglish, setIsLoadingEnglish] = useState(true);
  const [isLoadingOther, setIsLoadingOther] = useState(true);
  
  // TV Shows state
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [indianTVShows, setIndianTVShows] = useState<TVShow[]>([]);
  const [englishTVShows, setEnglishTVShows] = useState<TVShow[]>([]);
  const [isLoadingTV, setIsLoadingTV] = useState(true);
  const [isLoadingIndianTV, setIsLoadingIndianTV] = useState(true);
  const [isLoadingEnglishTV, setIsLoadingEnglishTV] = useState(true);
  
  // Continue Watching state
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  
  // Search and modal state
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

  // Load watch history on mount
  useEffect(() => {
    setWatchHistory(getWatchHistory());
  }, []);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      if (debouncedSearch) {
        const [movieData, tvData] = await Promise.all([
          searchMovies(debouncedSearch),
          searchTVShows(debouncedSearch)
        ]);
        setMovies(movieData.results || []);
        setTVShows(tvData.results || []);
      } else {
        const data = await getTrendingMovies();
        setMovies(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  const fetchGenreMovies = useCallback(async () => {
    Promise.all([
      getIndianMovies().then(data => {
        setIndianMovies(data.results?.slice(0, 10) || []);
        setIsLoadingIndian(false);
      }),
      getEnglishMovies().then(data => {
        setEnglishMovies(data.results?.slice(0, 10) || []);
        setIsLoadingEnglish(false);
      }),
      getOtherMovies().then(data => {
        setOtherMovies(data.results?.slice(0, 10) || []);
        setIsLoadingOther(false);
      })
    ]).catch(error => {
      console.error('Error fetching genre movies:', error);
    });
  }, []);

  const fetchTVShows = useCallback(async () => {
    Promise.all([
      getTrendingTVShows().then(data => {
        setTVShows(data.results?.slice(0, 10) || []);
        setIsLoadingTV(false);
      }),
      getIndianTVShows().then(data => {
        setIndianTVShows(data.results?.slice(0, 10) || []);
        setIsLoadingIndianTV(false);
      }),
      getEnglishTVShows().then(data => {
        setEnglishTVShows(data.results?.slice(0, 10) || []);
        setIsLoadingEnglishTV(false);
      })
    ]).catch(error => {
      console.error('Error fetching TV shows:', error);
    });
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchGenreMovies();
    fetchTVShows();
  }, [fetchGenreMovies, fetchTVShows]);

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
    
    // Save to watch history
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
    // Save to watch history
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

  const handleCloseVideoPlayer = () => {
    setVideoState(prev => ({ ...prev, isOpen: false }));
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

  const handleRemoveFromHistory = (mediaId: number, mediaType: 'movie' | 'tv') => {
    removeFromWatchHistory(mediaId, mediaType);
    setWatchHistory(getWatchHistory());
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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {movies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Movies</h3>
                    <MovieGrid movies={movies} onMovieClick={handleMovieClick} />
                  </div>
                )}
                {tvShows.length > 0 && (
                  <TVShowSection
                    title="TV Shows"
                    shows={tvShows}
                    isLoading={false}
                    onShowClick={handleTVShowClick}
                  />
                )}
                {movies.length === 0 && tvShows.length === 0 && (
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
            {/* Continue Watching */}
            <ContinueWatchingSection
              items={watchHistory}
              onItemClick={handleContinueWatchingClick}
              onRemove={handleRemoveFromHistory}
            />

            {/* Indian Movies */}
            <GenreSection
              title="Indian Movies"
              icon={Film}
              movies={indianMovies}
              isLoading={isLoadingIndian}
              onMovieClick={handleMovieClick}
            />

            {/* Trending TV Shows */}
            <TVShowSection
              title="Trending TV Shows"
              shows={tvShows}
              isLoading={isLoadingTV}
              onShowClick={handleTVShowClick}
            />

            {/* Latest Added Section */}
            <LatestSection onMovieClick={handleMovieClick} />

            {/* English Movies */}
            <GenreSection
              title="English Movies"
              icon={Clapperboard}
              movies={englishMovies}
              isLoading={isLoadingEnglish}
              onMovieClick={handleMovieClick}
            />

            {/* Indian TV Shows */}
            <TVShowSection
              title="Indian TV Shows"
              shows={indianTVShows}
              isLoading={isLoadingIndianTV}
              onShowClick={handleTVShowClick}
            />

            {/* Other International Movies */}
            <GenreSection
              title="International Movies"
              icon={Globe}
              movies={otherMovies}
              isLoading={isLoadingOther}
              onMovieClick={handleMovieClick}
            />

            {/* English TV Shows */}
            <TVShowSection
              title="English TV Shows"
              shows={englishTVShows}
              isLoading={isLoadingEnglishTV}
              onShowClick={handleTVShowClick}
            />
          </div>
        )}
      </main>

      {/* Movie Detail Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlay={handlePlayMovie}
      />

      {/* TV Show Modal */}
      <TVShowModal
        show={selectedTVShow}
        isOpen={isTVModalOpen}
        onClose={handleCloseTVModal}
        onPlay={handlePlayTVShow}
      />

      {/* Video Player */}
      <VideoPlayer
        isOpen={videoState.isOpen}
        onClose={handleCloseVideoPlayer}
        title={videoState.title}
        mediaId={videoState.mediaId}
        mediaType={videoState.mediaType}
        seasonNumber={videoState.seasonNumber}
        episodeNumber={videoState.episodeNumber}
      />
    </div>
  );
};

export default Index;
