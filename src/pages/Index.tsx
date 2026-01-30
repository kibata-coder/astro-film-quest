import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchMedia, useTrendingMovies } from '@/hooks/use-media';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import MovieGrid from '@/components/MovieGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import ScrollableSection from '@/components/ScrollableSection';
import MediaCard from '@/components/MediaCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Tv } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import { useVideoPlayer } from '@/contexts/VideoPlayerContext';
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { openMovieModal, openTVModal } = useMedia();
  const { playMovie } = useVideoPlayer();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchMedia(debouncedSearch);
  const { data: trendingData } = useTrendingMovies();
  const trendingMovies = trendingData?.results || [];

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery} showFooter={!debouncedSearch}>
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
                  <MovieGrid movies={searchResults.movies} onMovieClick={openMovieModal} />
                </div>
              ) : null}

              {searchResults?.tvShows.length ? (
                <ScrollableSection title="TV Shows" icon={Tv}>
                  {searchResults.tvShows.map((show) => (
                    <MediaCard
                      key={show.id}
                      item={show}
                      onClick={() => openTVModal(show)}
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
          <HeroBanner
            movies={trendingMovies}
            onPlay={playMovie}
            onInfo={openMovieModal}
          />

          <main className="px-5 md:px-16 pb-16 -mt-20 md:-mt-32 relative z-10">
            <div className="space-y-6 md:space-y-10">
              <ContinueWatchingSection />

              <ErrorBoundary>
                <TrendingMoviesSection onMovieClick={openMovieModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <TrendingTVSection onShowClick={openTVModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <IndianMoviesSection onMovieClick={openMovieModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <EnglishMoviesSection onMovieClick={openMovieModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <IndianTVSection onShowClick={openTVModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <LatestSection onMovieClick={openMovieModal} onTVShowClick={openTVModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <OtherMoviesSection onMovieClick={openMovieModal} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <EnglishTVSection onShowClick={openTVModal} />
              </ErrorBoundary>
            </div>
          </main>
        </>
      )}
    </Layout>
  );
};

export default Index;
