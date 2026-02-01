import { 
  Film, Globe, Clapperboard, Sparkles, Tv, LucideIcon,
  Sword, Compass, Laugh, Theater, Ghost, Rocket, 
  Heart, Eye, Siren, Briefcase, ShieldAlert 
} from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import ScrollableSection from '@/components/ScrollableSection';
import LazySection from '@/components/LazySection';
import LatestSection from '@/components/LatestSection';
import { 
  useTrendingMovies,
  useIndianMovies, 
  useEnglishMovies, 
  useOtherMovies,
  useTrendingTVShows,
  useIndianTVShows,
  useEnglishTVShows,
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
  useDataHook: () => { data: any; isLoading: boolean };
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

const DynamicSection = ({ title, icon, useDataHook, onItemClick, isTrending = false }: DynamicSectionProps) => {
  const { data, isLoading } = useDataHook();
  const items = data?.results?.slice(0, 15) || [];

  const Content = (
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

  if (isTrending) {
    if (isLoading) return <SectionSkeleton />;
    if (!items.length) return null;
    return Content;
  }

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : items.length ? (
        Content
      ) : null}
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

// 2. Language Sections (Keep these just in case)
export const IndianMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Indian Movies" icon={Film} useDataHook={useIndianMovies} onItemClick={onMovieClick} />
);
export const EnglishMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="English Movies" icon={Clapperboard} useDataHook={useEnglishMovies} onItemClick={onMovieClick} />
);
export const OtherMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="International Movies" icon={Globe} useDataHook={useOtherMovies} onItemClick={onMovieClick} />
);

// 3. Genre Sections
export const ActionMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Action" icon={Sword} useDataHook={useActionMovies} onItemClick={onMovieClick} />
);
export const AdventureMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Adventure" icon={Compass} useDataHook={useAdventureMovies} onItemClick={onMovieClick} />
);
export const ComedyMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Comedy" icon={Laugh} useDataHook={useComedyMovies} onItemClick={onMovieClick} />
);
export const DramaMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Drama" icon={Theater} useDataHook={useDramaMovies} onItemClick={onMovieClick} />
);
export const HorrorMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Horror" icon={Ghost} useDataHook={useHorrorMovies} onItemClick={onMovieClick} />
);
export const SciFiMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Science Fiction" icon={Rocket} useDataHook={useSciFiMovies} onItemClick={onMovieClick} />
);
export const FantasyMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Fantasy" icon={Sparkles} useDataHook={useFantasyMovies} onItemClick={onMovieClick} />
);
export const RomanceMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Romance" icon={Heart} useDataHook={useRomanceMovies} onItemClick={onMovieClick} />
);
export const ThrillerMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Thriller & Suspense" icon={Eye} useDataHook={useThrillerMovies} onItemClick={onMovieClick} />
);
export const WesternMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Western" icon={ShieldAlert} useDataHook={useWesternMovies} onItemClick={onMovieClick} />
);
export const CrimeMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="Crime" icon={Briefcase} useDataHook={useCrimeMovies} onItemClick={onMovieClick} />
);
export const WarMoviesSection = ({ onMovieClick }: MovieSectionProps) => (
  <DynamicSection title="War" icon={Siren} useDataHook={useWarMovies} onItemClick={onMovieClick} />
);

export { LatestSection };
