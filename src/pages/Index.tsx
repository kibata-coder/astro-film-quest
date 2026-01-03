import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Header from '@/components/Header';
import MovieGrid from '@/components/MovieGrid';
import MovieModal from '@/components/MovieModal';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Movie, getTrendingMovies, searchMovies } from '@/lib/tmdb';

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = debouncedSearch
        ? await searchMovies(debouncedSearch)
        : await getTrendingMovies();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  const handlePlay = () => {
    setIsModalOpen(false);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      <main className="pt-24 px-4 md:px-12 pb-12">
        {/* Section title */}
        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          {debouncedSearch ? `Search Results for "${debouncedSearch}"` : 'Trending This Week'}
        </h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : movies.length > 0 ? (
          <MovieGrid movies={movies} onMovieClick={handleMovieClick} />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {debouncedSearch
                ? 'No movies found. Try a different search term.'
                : 'No trending movies available.'}
            </p>
          </div>
        )}
      </main>

      {/* Movie Detail Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlay={handlePlay}
      />

      {/* Video Player */}
      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
        movieTitle={selectedMovie?.title || ''}
      />
    </div>
  );
};

export default Index;
