import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import MediaCard from '@/components/MediaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useMedia } from '@/features/shared';
import { useSearchMedia } from '@/hooks/use-media';
import { useDebounce } from '@/hooks/use-debounce';
import { getAnimeMovies, Movie } from '@/lib/tmdb';
import { Flame } from 'lucide-react';

const AnimeMovies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchMedia(debouncedSearch);
  const { openMovieModal } = useMedia();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['anime', 'movies', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getAnimeMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = (lastPage.page ?? 1);
      const total = (lastPage.total_pages ?? 1);
      return page < total ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 30,
    enabled: !debouncedSearch,
  });

  const movies: Movie[] = data?.pages.flatMap((p) => p.results || []) || [];

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
      <main className="container mx-auto px-5 md:px-8 pt-28 pb-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Flame className="text-primary" /> Anime Movies
        </h1>

        {debouncedSearch ? (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results for "{debouncedSearch}"</h2>
            {isSearching ? (
              <LoadingSpinner />
            ) : searchResults?.movies?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.movies.map((movie) => (
                  <MediaCard key={movie.id} item={movie} onClick={() => openMovieModal(movie)} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No results found.</p>
            )}
          </section>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MediaCard key={movie.id} item={movie} onClick={() => openMovieModal(movie)} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="secondary"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  );
};

export default AnimeMovies;
