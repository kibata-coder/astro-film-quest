import { useState } from 'react';
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { LucideIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import MediaGrid from '@/components/MediaGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useSearchMedia } from '@/hooks/use-media';
import { useDebounce } from '@/hooks/use-debounce';
import type { Movie, TVShow } from '@/lib/tmdb';

interface PagedResponse<T> {
  results?: T[];
  page?: number;
  total_pages?: number;
}

interface InfiniteMediaPageProps<T extends Movie | TVShow> {
  title: string;
  icon: LucideIcon;
  queryKey: QueryKey;
  fetchPage: (page: number) => Promise<PagedResponse<T>>;
  onItemClick: (item: T) => void;
  /** Pick which side of search results to display ('movies' | 'tvShows'). */
  searchKind: 'movies' | 'tvShows';
}

/**
 * Generic listing page with infinite pagination + search overlay.
 * Used by Anime + AnimeMovies (and future single-list pages).
 */
function InfiniteMediaPage<T extends Movie | TVShow>({
  title,
  icon: Icon,
  queryKey,
  fetchPage,
  onItemClick,
  searchKind,
}: InfiniteMediaPageProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchMedia(debouncedSearch);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => fetchPage(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage.page ?? 1;
      const total = lastPage.total_pages ?? 1;
      return page < total ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 30,
    enabled: !debouncedSearch,
  });

  const items = (data?.pages.flatMap((p) => p.results || []) || []) as T[];
  const searchItems = (searchResults?.[searchKind] ?? []) as unknown as T[];

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
      <main className="container mx-auto px-5 md:px-8 pt-28 pb-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Icon className="text-primary" /> {title}
        </h1>

        {debouncedSearch ? (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results for "{debouncedSearch}"</h2>
            {isSearching ? (
              <LoadingSpinner />
            ) : searchItems.length ? (
              <MediaGrid items={searchItems} onItemClick={onItemClick} />
            ) : (
              <p className="text-muted-foreground">No results found.</p>
            )}
          </section>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <MediaGrid items={items} onItemClick={onItemClick} />
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
}

export default InfiniteMediaPage;
