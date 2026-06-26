import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Tv, Users } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { useMedia } from '@/features/shared';
import { useVideoPlayer } from '@/features/player';
import { useAuth } from '@/features/auth';
import { FeedCustomizer } from '@/components/FeedCustomizer';
import SignUpPrompt from '@/components/SignUpPrompt';
import SoudSportBanner from '@/components/SoudSportBanner';
import {
  TrendingMoviesSection, TrendingTVSection,
  AnimeTVSection, AnimeMoviesSection,
  ActionMoviesSection, AdventureMoviesSection, ComedyMoviesSection,
  DramaMoviesSection, HorrorMoviesSection, SciFiMoviesSection,
  FantasyMoviesSection, RomanceMoviesSection, ThrillerMoviesSection,
  WesternMoviesSection, CrimeMoviesSection, WarMoviesSection
} from '@/components/sections/MovieSections';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

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
              {searchResults?.people?.length ? (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> People</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {searchResults.people.slice(0, 12).map((p) => (
                      <Link
                        key={p.id}
                        to={`/person/${p.id}`}
                        className="flex-shrink-0 w-28 md:w-32 group"
                      >
                        <div className="aspect-square rounded-full overflow-hidden bg-muted">
                          {p.profile_path ? (
                            <img src={getImageUrl(p.profile_path, 'w300')} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Users className="h-8 w-8" /></div>
                          )}
                        </div>
                        <p className="mt-2 text-xs md:text-sm font-medium text-center truncate group-hover:text-primary">{p.name}</p>
                        {p.known_for_department && (
                          <p className="text-[10px] text-muted-foreground text-center truncate">{p.known_for_department}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              {searchResults?.movies.length ? <div className="mb-8"><h3 className="text-lg font-medium mb-4">Movies</h3><MovieGrid movies={searchResults.movies} onMovieClick={openMovieModal} /></div> : null}
              {searchResults?.tvShows.length ? <ScrollableSection title="TV Shows" icon={Tv}>{searchResults.tvShows.map((show) => <MediaCard key={show.id} item={show} onClick={() => openTVModal(show)} />)}</ScrollableSection> : null}
              {!searchResults?.movies.length && !searchResults?.tvShows.length && !searchResults?.people?.length && <div className="text-center py-20"><p className="text-muted-foreground text-lg">No results found.</p></div>}
            </>
          )}
        </main>
      ) : (
        <>
          <SignUpPrompt />
          <HeroBanner movies={trendingMovies} onPlay={playMovie} onInfo={openMovieModal} />
          <SoudSportBanner />
          <main className="px-5 md:px-16 pb-16 mt-6 md:mt-8 relative z-10">
            <div className="space-y-6 md:space-y-10">
              {user && (
                <div className="flex justify-end mb-2">
                  <FeedCustomizer preferences={preferences} onToggle={toggleSection} />
                </div>
              )}
              <ContinueWatchingSection />

              <SectionErrorBoundary sectionName="For You">
                <ForYouSection onMovieClick={openMovieModal} />
              </SectionErrorBoundary>

              <SectionErrorBoundary sectionName="Trending Movies">
                <TrendingMoviesSection onMovieClick={openMovieModal} />
              </SectionErrorBoundary>

              <SectionErrorBoundary sectionName="Anime Series">
                <AnimeTVSection onShowClick={openTVModal} />
              </SectionErrorBoundary>

              <SectionErrorBoundary sectionName="Anime Movies">
                <AnimeMoviesSection onMovieClick={openMovieModal} />
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
