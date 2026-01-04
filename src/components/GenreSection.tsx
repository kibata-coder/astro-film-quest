import { Film } from 'lucide-react';
import { getImageUrl, Movie } from '@/lib/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface GenreSectionProps {
  title: string;
  icon: LucideIcon;
  movies: Movie[];
  isLoading: boolean;
  onMovieClick: (movie: Movie) => void;
}

const GenreSection = ({ title, icon: Icon, movies, isLoading, onMovieClick }: GenreSectionProps) => {
  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div
      onClick={() => onMovieClick(movie)}
      className="flex-shrink-0 w-32 md:w-40 cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
        {movie.poster_path ? (
          <img
            src={getImageUrl(movie.poster_path, 'w300') || ''}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>
      <p className="text-sm font-medium truncate">{movie.title}</p>
      <p className="text-xs text-muted-foreground">
        {movie.release_date?.slice(0, 4) || 'N/A'}
      </p>
    </div>
  );

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-32 md:w-40">
      <Skeleton className="aspect-[2/3] rounded-lg mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <p className="text-muted-foreground">No movies available</p>
        )}
      </div>
    </section>
  );
};

export default GenreSection;
