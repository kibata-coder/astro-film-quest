import { 
  Film, Globe, Clapperboard, Sparkles, Tv, LucideIcon, Flame,
  Sword, Compass, Laugh, Theater, Ghost, Rocket, 
  Heart, Eye, Siren, Briefcase, ShieldAlert 
} from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import ScrollableSection from '@/components/ScrollableSection';
import LazySection from '@/components/LazySection';
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

// --- Generic Component ---

interface DynamicSectionProps {
  title: string;
  icon: LucideIcon;
  useDataHook: (enabled?: boolean) => { data: any; isLoading: boolean };
  onItemClick?: (item: any) => void;
  isTrending?: boolean;
}

const SectionSkeleton = () => (
  <div className="mb-10 md:mb-14">
    <div className="h-7 w-48 bg-muted rounded animate-pulse mb-5 md:mb-6" />
    <div className="flex gap-3 md:gap-5 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-40 md:w-48">
          <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          <div className="mt-3 h-4 bg-muted rounded animate-pulse" />
          <div className="mt-2 h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

// Inner component that actually calls the hook with enabled flag
const DynamicSectionInner = ({ title, icon, useDataHook, onItemClick, enabled }: DynamicSectionProps & { enabled: boolean }) => {
  const { data, isLoading } = useDataHook(enabled);
  const items = data?.results?.slice(0, 15) || [];

  if (isLoading || !enabled) return <SectionSkeleton />;
  if (!items.length) return null;

  return (
    <ScrollableSection title={title} icon={icon}>
      {items.map((item: any) => (
        <MediaCard 
          key={item.id} 
          item={item} 
          onClick={() => onItemClick?.(item)} 
        />
      ))}
    </ScrollableSection>
  );
};

const DynamicSection = ({ title, icon, useDataHook, onItemClick, isTrending = false }: DynamicSectionProps) => {
  // Trending sections always eager. Other sections still use LazySection
  // for the visual placeholder, but we trigger data fetching immediately so
  // cards render as soon as react-query resolves — previously the
  // IntersectionObserver could skip sections that never intersected on
  // short viewports, leaving the home page with only the trending row.
  if (isTrending) {
    return <DynamicSectionInner title={title} icon={icon} useDataHook={useDataHook} onItemClick={onItemClick} enabled={true} />;
  }

  return (
    <LazySection>
      {() => (
        <DynamicSectionInner title={title} icon={icon} useDataHook={useDataHook} onItemClick={onItemClick} enabled={true} />
      )}
    </LazySection>
  );
};

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

// 4. Genre Sections — factory to avoid 12 duplicate component bodies
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
