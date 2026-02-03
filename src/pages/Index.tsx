import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchMedia, useTrendingMovies } from '@/hooks/use-media';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import { MovieGrid } from '@/features/movies';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContinueWatchingSection from '@/components/ContinueWatchingSection';
import ScrollableSection from '@/components/ScrollableSection';
import MediaCard from '@/components/MediaCard';
import SectionErrorBoundary from '@/components/SectionErrorBoundary';
import ForYouSection from '@/components/ForYouSection';
import { Tv } from 'lucide-react';
import { useMedia } from '@/features/shared';
import { useVideoPlayer } from '@/features/player';
import { useAuth } from '@/features/auth';
import { FeedCustomizer } from '@/components/FeedCustomizer';
import {
  TrendingMoviesSection, TrendingTVSection, LatestSection,
  ActionMoviesSection, AdventureMoviesSection, ComedyMoviesSection,
  DramaMoviesSection, HorrorMoviesSection, SciFiMoviesSection,
  FantasyMoviesSection, RomanceMoviesSection, ThrillerMoviesSection,
  WesternMoviesSection, CrimeMoviesSection, WarMoviesSection
} from '@/components/sections/MovieSections';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { openMovieModal, openTVModal } = useMedia();
  const { playMovie } = useVideoPlayer();
  const { user } = useAuth();
  const { preferences, loading: prefsLoading, toggleSection } = useUserPreferences();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchMedia(debouncedSearch);
  const { data: trendingData } = useTrendingMovies();
  const trendingMovies = trendingData?.results || [];

  return (
    <Layout onSearch={setSearchQuery} searchQuery={searchQuery} showFooter={!debouncedSearch}>
      {debouncedSearch ? (
        <main className="pt-24 px-4 md:px-12 pb-12">
           <h2 className="text-xl md:text-2xl font-semibold mb-6">Search Results for "{debouncedSearch}"</h2>
          {isSearchLoading ? <LoadingSpinner /> : (
            <>
              {searchResults?.movies.length ? <div className="mb-8"><h3 className="text-lg font-medium mb-4">Movies</h3><MovieGrid movies={searchResults.movies} onMovieClick={openMovieModal} /></div> : null}
              {searchResults?.tvShows.length ? <ScrollableSection title="TV Shows" icon={Tv}>{searchResults.tvShows.map((show) => <MediaCard key={show.id} item={show} onClick={() => openTVModal(show)} />)}</ScrollableSection> : null}
              {!searchResults?.movies.length && !searchResults?.tvShows.length && <div className="text-center py-20"><p className="text-muted-foreground text-lg">No results found.</p></div>}
            </>
          )}
        </main>
      ) : (
        <>
          <HeroBanner movies={trendingMovies} onPlay={playMovie} onInfo={openMovieModal} />
          <main className="px-5 md:px-16 pb-16 -mt-20 md:-mt-32 relative z-10">
            <div className="space-y-6 md:space-y-10">
              <div className="flex items-center justify-between mb-4">
                <ContinueWatchingSection />
                {user && <div className="hidden md:block pt-8"><FeedCustomizer preferences={preferences} onToggle={toggleSection} /></div>}
              </div>
              
              {user && <div className="md:hidden flex justify-end -mt-4 mb-4"><FeedCustomizer preferences={preferences} onToggle={toggleSection} /></div>}

              <SectionErrorBoundary sectionName="For You">
                <ForYouSection onMovieClick={openMovieModal} />
              </SectionErrorBoundary>

              <SectionErrorBoundary sectionName="Trending Movies">
                <TrendingMoviesSection onMovieClick={openMovieModal} />
              </SectionErrorBoundary>

              {!prefsLoading && (
                <>
                  {preferences.action && <SectionErrorBoundary sectionName="Action"><ActionMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.adventure && <SectionErrorBoundary sectionName="Adventure"><AdventureMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.comedy && <SectionErrorBoundary sectionName="Comedy"><ComedyMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.drama && <SectionErrorBoundary sectionName="Drama"><DramaMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.scifi && <SectionErrorBoundary sectionName="Sci-Fi"><SciFiMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.fantasy && <SectionErrorBoundary sectionName="Fantasy"><FantasyMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.horror && <SectionErrorBoundary sectionName="Horror"><HorrorMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.thriller && <SectionErrorBoundary sectionName="Thriller"><ThrillerMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.romance && <SectionErrorBoundary sectionName="Romance"><RomanceMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.crime && <SectionErrorBoundary sectionName="Crime"><CrimeMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.western && <SectionErrorBoundary sectionName="Western"><WesternMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  {preferences.war && <SectionErrorBoundary sectionName="War"><WarMoviesSection onMovieClick={openMovieModal} /></SectionErrorBoundary>}
                  
                  <SectionErrorBoundary sectionName="Latest">
                    <LatestSection onMovieClick={openMovieModal} onTVShowClick={openTVModal} />
                  </SectionErrorBoundary>
                  <SectionErrorBoundary sectionName="Trending TV">
                    <TrendingTVSection onShowClick={openTVModal} />
                  </SectionErrorBoundary>
                </>
              )}
            </div>
          </main>
        </>
      )}
    </Layout>
  );
};

export default Index;
