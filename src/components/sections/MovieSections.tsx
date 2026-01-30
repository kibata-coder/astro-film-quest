import { Film, Globe, Clapperboard, Sparkles, Tv } from 'lucide-react';
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
  useEnglishTVShows 
} from '@/hooks/use-media';
import { Movie, TVShow } from '@/lib/tmdb';

interface SectionProps {
  onMovieClick?: (movie: Movie) => void;
  onShowClick?: (show: TVShow) => void;
}

// Skeleton for section loading
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

// --- Movie Sections ---

export const TrendingMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useTrendingMovies();
  const movies = data?.results?.slice(0, 15) || [];

  if (isLoading) return <SectionSkeleton />;
  if (!movies.length) return null;

  return (
    <ScrollableSection title="Trending Now" icon={Sparkles}>
      {movies.map((movie) => (
        <MediaCard 
          key={movie.id} 
          item={movie} 
          onClick={() => onMovieClick?.(movie)} 
        />
      ))}
    </ScrollableSection>
  );
};

export const IndianMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useIndianMovies();
  const movies = data?.results?.slice(0, 15) || [];

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : movies.length ? (
        <ScrollableSection title="Indian Movies" icon={Film}>
          {movies.map((movie) => (
            <MediaCard 
              key={movie.id} 
              item={movie} 
              onClick={() => onMovieClick?.(movie)} 
            />
          ))}
        </ScrollableSection>
      ) : null}
    </LazySection>
  );
};

export const EnglishMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useEnglishMovies();
  const movies = data?.results?.slice(0, 15) || [];

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : movies.length ? (
        <ScrollableSection title="English Movies" icon={Clapperboard}>
          {movies.map((movie) => (
            <MediaCard 
              key={movie.id} 
              item={movie} 
              onClick={() => onMovieClick?.(movie)} 
            />
          ))}
        </ScrollableSection>
      ) : null}
    </LazySection>
  );
};

export const OtherMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useOtherMovies();
  const movies = data?.results?.slice(0, 15) || [];

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : movies.length ? (
        <ScrollableSection title="International Movies" icon={Globe}>
          {movies.map((movie) => (
            <MediaCard 
              key={movie.id} 
              item={movie} 
              onClick={() => onMovieClick?.(movie)} 
            />
          ))}
        </ScrollableSection>
      ) : null}
    </LazySection>
  );
};

// --- TV Show Sections ---

export const TrendingTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useTrendingTVShows();
  const shows = data?.results?.slice(0, 15) || [];

  if (isLoading) return <SectionSkeleton />;
  if (!shows.length) return null;

  return (
    <ScrollableSection title="Trending TV Shows" icon={Tv}>
      {shows.map((show) => (
        <MediaCard 
          key={show.id} 
          item={show} 
          onClick={() => onShowClick?.(show)} 
        />
      ))}
    </ScrollableSection>
  );
};

export const IndianTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useIndianTVShows();
  const shows = data?.results?.slice(0, 15) || [];

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : shows.length ? (
        <ScrollableSection title="Indian TV Shows" icon={Tv}>
          {shows.map((show) => (
            <MediaCard 
              key={show.id} 
              item={show} 
              onClick={() => onShowClick?.(show)} 
            />
          ))}
        </ScrollableSection>
      ) : null}
    </LazySection>
  );
};

export const EnglishTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useEnglishTVShows();
  const shows = data?.results?.slice(0, 15) || [];

  return (
    <LazySection>
      {isLoading ? (
        <SectionSkeleton />
      ) : shows.length ? (
        <ScrollableSection title="English TV Shows" icon={Tv}>
          {shows.map((show) => (
            <MediaCard 
              key={show.id} 
              item={show} 
              onClick={() => onShowClick?.(show)} 
            />
          ))}
        </ScrollableSection>
      ) : null}
    </LazySection>
  );
};

// Re-export LatestSection
export { LatestSection };
