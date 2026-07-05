import { Flame, PlayCircle } from 'lucide-react';
import Seo from '@/components/Seo';
import { useTrendingAnime, useSearchAnime } from '@/hooks/use-anilist';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import LoadingSpinner from '@/components/LoadingSpinner';
import SoudanimeCard from '@/components/SoudanimeCard';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';

const Anime = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useTrendingAnime();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchAnime(debouncedSearch);

  // Infinite scroll for the recent anime only if not searching
  useEffect(() => {
    const handleScroll = () => {
      if (debouncedSearch) return; // Disable infinite scroll during search
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <p className="text-red-500">Failed to load anime. Please try again later.</p>
      </div>
    );
  }

  const allAnime = data.pages.flatMap((page) => page.media);
  const heroAnime = allAnime.slice(0, 5); // Use first 5 for hero
  const recentAnime = allAnime.slice(5);

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
      <Seo
        title="Anime — Watch Subbed & Dubbed Series | SoudFlex"
        description="Stream the latest anime series and movies with Sub or Dub. Browse recent releases, popular titles, and seasonal picks on SoudFlex."
        canonicalPath="/anime"
      />
      <div className="bg-background text-foreground pb-20">
      
      {debouncedSearch ? (
        <main className="container mx-auto px-5 md:px-12 pt-28 space-y-8 relative z-10">
          <h2 className="text-2xl font-bold mb-4">
            Search Results for "{debouncedSearch}"
          </h2>
          {isSearching ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : debouncedSearch.length < 3 ? (
            <p className="text-muted-foreground text-center py-10">Please enter at least 3 characters to search.</p>
          ) : searchResults?.media?.length ? (
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6">
              {searchResults.media.map((anime, i) => (
                <SoudanimeCard key={`${anime.id}-${i}`} anime={anime} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">No anime found for "{debouncedSearch}".</p>
          )}
        </main>
      ) : (
        <>
        {/* Hero Section */}
        {heroAnime.length > 0 && (
        <div id="seasonal" className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
          <div className="absolute inset-0 bg-black">
            <img 
              src={heroAnime[0].coverImage?.large} 
              alt={heroAnime[0].title.english || heroAnime[0].title.romaji}
              className="w-full h-full object-cover opacity-60 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-5 md:px-12 flex gap-8 items-center">
              <div className="hidden md:block w-1/4 shrink-0">
                <img 
                  src={heroAnime[0].coverImage?.large} 
                  alt={heroAnime[0].title.english || heroAnime[0].title.romaji}
                  className="w-full rounded-2xl shadow-2xl border-4 border-orange-500/20"
                />
              </div>
              <div className="max-w-2xl space-y-6">
                <div id="popular" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 text-sm font-bold tracking-wider uppercase border border-orange-500/50">
                  <Flame className="w-4 h-4" />
                  Trending Now
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  {heroAnime[0].title.english || heroAnime[0].title.romaji}
                </h1>
                {heroAnime[0].genres && (
                  <div className="flex gap-2 flex-wrap">
                    {heroAnime[0].genres.slice(0, 4).map((g, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                {heroAnime[0].description && (
                  <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-4 max-w-xl">
                    {heroAnime[0].description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <div className="pt-4">
                  <Link 
                    to={`/anime/${heroAnime[0].id}`}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.6)]"
                  >
                    <PlayCircle className="w-6 h-6" />
                    Watch Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <main id="new" className="container mx-auto px-5 md:px-12 mt-12 space-y-12 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
            Latest Updates
          </h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6">
            {recentAnime.map((anime, i) => (
              <SoudanimeCard key={`${anime.id}-${i}`} anime={anime} />
            ))}
          </div>
        </div>

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}
        </main>
        </>
      )}
      </div>
    </Layout>
  );
};

export default Anime;
