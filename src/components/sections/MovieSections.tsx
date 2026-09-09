import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Film, Globe, Clapperboard, Sparkles, Tv, LucideIcon, Flame,
  Sword, Compass, Laugh, Theater, Ghost, Rocket, 
  Heart, Eye, Siren, Briefcase, ShieldAlert 
} from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import ScrollableSection from '@/components/ScrollableSection';
import { 
  useTrendingMovies,
  useIndianMovies, 
  useEnglishMovies, 
  useOtherMovies,
  useTrendingTVShows,
  useIndianTVShows,
  useEnglishTVShows,
  useAnimeTVShows,
  useAnimeMovies,
  // Genres
  useActionMovies, useAdventureMovies, useComedyMovies, useDramaMovies, 
  useHorrorMovies, useSciFiMovies, useFantasyMovies, useRomanceMovies, 
  useThrillerMovies, useWesternMovies, useCrimeMovies, useWarMovies 
} from '@/hooks/use-media';
import { Movie, TVShow } from '@/lib/tmdb';
import { isTvDevice } from '@/hooks/useTvNavigation';

// Detect once at module init — never changes during a session
const IS_TV = isTvDevice();
// TVs get fewer cards (less DOM, faster render) and tighter lazy-load margin
const MAX_CARDS = IS_TV ? 8 : 15;
const LAZY_MARGIN = IS_TV ? '0px' : '300px';

// --- Generic Component ---

interface DynamicSectionProps {
  title: string;
  icon: LucideIcon;
  useDataHook: (enabled?: boolean) => { data: any; isLoading: boolean };
  onItemClick?: (item: any) => void;
  isTrending?: boolean;
}

// On TV: static grey box instead of CPU-burning animate-pulse skeletons
const SectionSkeleton = () => (
  <div className="mb-10 md:mb-14">
    <div className={`h-7 w-48 bg-muted rounded mb-5 md:mb-6 ${IS_TV ? '' : 'animate-pulse'}`} />
    <div className="flex gap-3 md:gap-5 overflow-hidden">
      {Array.from({ length: IS_TV ? 4 : 6 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-40 md:w-48">
          <div className={`aspect-[2/3] rounded-lg bg-muted ${IS_TV ? '' : 'animate-pulse'}`} />
          <div className={`mt-3 h-4 bg-muted rounded ${IS_TV ? '' : 'animate-pulse'}`} />
          <div className={`mt-2 h-3 w-16 bg-muted rounded ${IS_TV ? '' : 'animate-pulse'}`} />
        </div>
      ))}
    </div>
  </div>
);

// Inner component that actually calls the hook with enabled flag
const DynamicSectionInner = memo(({ title, icon, useDataHook, onItemClick, enabled, isTrending }: DynamicSectionProps & { enabled: boolean }) => {
  const { data, isLoading } = useDataHook(enabled);
  const items = data?.results?.slice(0, MAX_CARDS) || [];

  const handleCardClick = useCallback((item: any) => {
    onItemClick?.(item);
  }, [onItemClick]);

  if (isLoading || !enabled) return <SectionSkeleton />;
  if (!items.length) return null;

  return (
    <ScrollableSection title={title} icon={icon}>
      {items.map((item: any, index: number) => (
        <MediaCard 
          key={item.id} 
          item={item} 
          onClick={handleCardClick} 
          rank={isTrending && index < 10 ? index + 1 : undefined}
        />
      ))}
    </ScrollableSection>
  );
});

DynamicSectionInner.displayName = 'DynamicSectionInner';

const DynamicSection = memo(({ title, icon, useDataHook, onItemClick, isTrending }: DynamicSectionProps) => {
  const [isVisible, setIsVisible] = useState(!!isTrending);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTrending || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: LAZY_MARGIN }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isTrending, isVisible]);

  return (
    <div ref={sectionRef}>
      <DynamicSectionInner 
        title={title} 
        icon={icon} 
        useDataHook={useDataHook} 
        onItemClick={onItemClick} 
        enabled={isVisible} 
        isTrending={isTrending} 
      />
    </div>
  );
});

DynamicSection.displayName = 'DynamicSection';

// --- Exported Sections ---

interface MovieSectionProps {
  onMovieClick?: (movie: Movie) => void;
}
interface TVSectionProps {
  onShowClick?: (show: TVShow) => void;
}

// 1. Core Sections
export const TrendingMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Trending Now" icon={Sparkles} useDataHook={useTrendingMovies} onItemClick={onMovieClick} isTrending={true} />
);
export const TrendingTVSection = ({ onShowClick }: TVSectionProps) => (
  <DynamicSection title="Trending TV Shows" icon={Tv} useDataHook={useTrendingTVShows} onItemClick={onShowClick} isTrending={true} />
);

// 2. Language Sections (Movies)
export const IndianMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Indian Movies" icon={Film} useDataHook={useIndianMovies} onItemClick={onMovieClick} />
);
export const EnglishMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="English Movies" icon={Clapperboard} useDataHook={useEnglishMovies} onItemClick={onMovieClick} />
);
export const OtherMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="International Movies" icon={Globe} useDataHook={useOtherMovies} onItemClick={onMovieClick} />
);

// 3. Language Sections (TV Shows)
export const IndianTVSection = ({ onShowClick }: TVSectionProps) => (
  <DynamicSection title="Indian TV Shows" icon={Tv} useDataHook={useIndianTVShows} onItemClick={onShowClick} />
);
export const EnglishTVSection = ({ onShowClick }: TVSectionProps) => (
  <DynamicSection title="English TV Shows" icon={Tv} useDataHook={useEnglishTVShows} onItemClick={onShowClick} />
);

// Anime
export const AnimeTVSection = ({ onShowClick }: TVSectionProps) => (
  <DynamicSection title="Anime Series" icon={Flame} useDataHook={useAnimeTVShows} onItemClick={onShowClick} />
);
export const AnimeMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Anime Movies" icon={Flame} useDataHook={useAnimeMovies} onItemClick={onMovieClick} />
);

// 4. Genre Sections factory to avoid 12 duplicate component bodies
const makeGenreSection = (
  title: string,
  icon: LucideIcon,
  useDataHook: (enabled?: boolean) => { data: any; isLoading: boolean },
) => ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title={title} icon={icon} useDataHook={useDataHook} onItemClick={onMovieClick} />
);

export const ActionMoviesSection    = makeGenreSection('Action',             Sword,        useActionMovies);
export const AdventureMoviesSection = makeGenreSection('Adventure',          Compass,      useAdventureMovies);
export const ComedyMoviesSection    = makeGenreSection('Comedy',             Laugh,        useComedyMovies);
export const DramaMoviesSection     = makeGenreSection('Drama',              Theater,      useDramaMovies);
export const HorrorMoviesSection    = makeGenreSection('Horror',             Ghost,        useHorrorMovies);
export const SciFiMoviesSection     = makeGenreSection('Science Fiction',    Rocket,       useSciFiMovies);
export const FantasyMoviesSection   = makeGenreSection('Fantasy',            Sparkles,     useFantasyMovies);
export const RomanceMoviesSection   = makeGenreSection('Romance',            Heart,        useRomanceMovies);
export const ThrillerMoviesSection  = makeGenreSection('Thriller & Suspense',Eye,          useThrillerMovies);
export const WesternMoviesSection   = makeGenreSection('Western',            ShieldAlert,  useWesternMovies);
export const CrimeMoviesSection     = makeGenreSection('Crime',              Briefcase,    useCrimeMovies);
export const WarMoviesSection       = makeGenreSection('War',                Siren,        useWarMovies);
