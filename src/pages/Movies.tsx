import { useState } from 'react';
import Layout from '@/components/Layout';
import { useSearchMedia } from '@/hooks/use-media';
import { useDebounce } from '@/hooks/use-debounce';
import MediaCard from '@/components/MediaCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useMedia } from '@/contexts/MediaContext';
import {
  TrendingMoviesSection,
  IndianMoviesSection,
  EnglishMoviesSection,
  OtherMoviesSection,
} from '@/components/sections/MovieSections';

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchMedia(debouncedSearch);
  const { openMovieModal } = useMedia();

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
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
                    onClick={() => openMovieModal(movie)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No movies found.</p>
            )}
          </section>
        ) : (
          <>
            <ErrorBoundary>
              <TrendingMoviesSection onMovieClick={openMovieModal} />
            </ErrorBoundary>
            <ErrorBoundary>
              <IndianMoviesSection onMovieClick={openMovieModal} />
            </ErrorBoundary>
            <ErrorBoundary>
              <EnglishMoviesSection onMovieClick={openMovieModal} />
            </ErrorBoundary>
            <ErrorBoundary>
              <OtherMoviesSection onMovieClick={openMovieModal} />
            </ErrorBoundary>
          </>
        )}
      </main>
    </Layout>
  );
};

export default Movies;
