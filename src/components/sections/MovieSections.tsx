import { Film, Globe, Clapperboard } from 'lucide-react';
import GenreSection from '@/components/GenreSection';
import TVShowSection from '@/components/TVShowSection';
import LatestSection from '@/components/LatestSection';
import { 
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

export const IndianMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useIndianMovies();
  return (
    <GenreSection
      title="Indian Movies"
      icon={Film}
      movies={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onMovieClick={onMovieClick!}
    />
  );
};

export const EnglishMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useEnglishMovies();
  return (
    <GenreSection
      title="English Movies"
      icon={Clapperboard}
      movies={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onMovieClick={onMovieClick!}
    />
  );
};

export const OtherMoviesSection = ({ onMovieClick }: SectionProps) => {
  const { data, isLoading } = useOtherMovies();
  return (
    <GenreSection
      title="International Movies"
      icon={Globe}
      movies={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onMovieClick={onMovieClick!}
    />
  );
};

export const TrendingTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useTrendingTVShows();
  return (
    <TVShowSection
      title="Trending TV Shows"
      shows={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onShowClick={onShowClick!}
    />
  );
};

export const IndianTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useIndianTVShows();
  return (
    <TVShowSection
      title="Indian TV Shows"
      shows={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onShowClick={onShowClick!}
    />
  );
};

export const EnglishTVSection = ({ onShowClick }: SectionProps) => {
  const { data, isLoading } = useEnglishTVShows();
  return (
    <TVShowSection
      title="English TV Shows"
      shows={data?.results?.slice(0, 10) || []}
      isLoading={isLoading}
      onShowClick={onShowClick!}
    />
  );
};

export { LatestSection };
