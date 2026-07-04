import { useEffect } from 'react';
import { useSearchAnime } from '@/hooks/use-anilist';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import LoadingSpinner from '@/components/LoadingSpinner';
import SoudanimeCard from '@/components/SoudanimeCard';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { UseInfiniteQueryResult } from '@tanstack/react-query';
import { AniListRecentResponse } from '@/lib/anilist';

interface InfiniteAnimePageProps {
  title: string;
  icon: React.ElementType;
  useQueryHook: () => UseInfiniteQueryResult<AniListRecentResponse, Error>;
}

const InfiniteAnimePage = ({ title, icon: Icon, useQueryHook }: InfiniteAnimePageProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useQueryHook();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchAnime(debouncedSearch);

  useEffect(() => {
    const handleScroll = () => {
      if (debouncedSearch) return;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, debouncedSearch]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <p className="text-red-500">Failed to load {title}. Please try again later.</p>
      </div>
    );
  }

  const allAnime = data.pages.flatMap((page) => page.data);

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
      <Seo
        title={`${title} — Anime | SoudFlex`}
        description={`Browse ${title.toLowerCase()} on SoudFlex. Stream subbed and dubbed episodes and discover new series.`}
      />
      <div className="bg-background text-foreground pb-20">
        <main className="container mx-auto px-5 md:px-12 pt-28 space-y-8 relative z-10">
          
          {debouncedSearch ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Search Results for "{debouncedSearch}"
              </h2>
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : searchResults?.data?.length ? (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6">
                  {searchResults.data.map((anime, i) => (
                    <SoudanimeCard key={`${anime.id}-${i}`} anime={anime} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No anime found.</p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
                <Icon className="w-8 h-8 text-orange-500" />
                {title}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6">
                {allAnime.map((anime, i) => (
                  <SoudanimeCard key={`${anime.id}-${i}`} anime={anime} />
                ))}
              </div>
              
              {isFetchingNextPage && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </Layout>
  );
};

export default InfiniteAnimePage;
