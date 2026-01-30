import { useState, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Movie } from '@/lib/tmdb';
import { useSearchMedia } from '@/hooks/use-media';
import { useDebounce } from '@/hooks/use-debounce';
import MediaCard from '@/components/MediaCard';
import { addToHistory } from '@/lib/watchHistory';
import {
  TrendingMoviesSection,
  IndianMoviesSection,
  EnglishMoviesSection,
  OtherMoviesSection,
} from '@/components/sections/MovieSections';

const MovieModal = lazy(() => import('@/components/MovieModal'));
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));

interface VideoState {
  isOpen: boolean;
  title: string;
  mediaId: number;
  mediaType: 'movie';
}

const Movies = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoState, setVideoState] = useState<VideoState>({
    isOpen: false,
    title: '',
    mediaId: 0,
    mediaType: 'movie'
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchMedia(debouncedSearch);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  const handlePlayMovie = async () => {
    if (!selectedMovie) return;
    await addToHistory({
      id: selectedMovie.id,
      media_type: 'movie',
      title: selectedMovie.title,
      poster_path: selectedMovie.poster_path || '',
    });
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
    setIsModalOpen(false);
    setVideoState({
      isOpen: true,
      title: selectedMovie.title,
      mediaId: selectedMovie.id,
      mediaType: 'movie'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Movies</h1>

        {debouncedSearch ? (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Search Results for "{debouncedSearch}"
            </h2>
            {isSearching ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 md:w-44">
                    <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : searchResults?.movies?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.movies.map((movie) => (
                  <MediaCard
                    key={movie.id}
                    item={movie}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No movies found.</p>
            )}
          </section>
        ) : (
          <>
            <TrendingMoviesSection onMovieClick={handleMovieClick} />
            <IndianMoviesSection onMovieClick={handleMovieClick} />
            <EnglishMoviesSection onMovieClick={handleMovieClick} />
            <OtherMoviesSection onMovieClick={handleMovieClick} />
          </>
        )}
      </main>

      <Footer />

      <Suspense fallback={null}>
        <MovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPlay={handlePlayMovie}
        />

        <VideoPlayer
          isOpen={videoState.isOpen}
          onClose={() => setVideoState(p => ({ ...p, isOpen: false }))}
          {...videoState}
        />
      </Suspense>
    </div>
  );
};

export default Movies;
