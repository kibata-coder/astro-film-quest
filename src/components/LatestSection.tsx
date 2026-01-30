import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Film, Tv } from 'lucide-react';
import { getLatestMovies, getLatestTVShows } from '@/lib/vidsrc';
import { getMovieDetails, getTVShowDetails, getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { Skeleton } from '@/components/ui/skeleton';

interface LatestSectionProps {
  onMovieClick: (movie: Movie) => void;
  onTVShowClick?: (show: TVShow) => void;
}

// Fetch and transform latest movies with TMDB details
const fetchLatestMovies = async (): Promise<Movie[]> => {
  const vidsrcMovies = await getLatestMovies(1);
  
  const results = await Promise.allSettled(
    vidsrcMovies.slice(0, 10).map(async (item) => {
      const tmdbId = parseInt(item.tmdb_id, 10);
      if (isNaN(tmdbId)) throw new Error('Invalid ID');
      const details = await getMovieDetails(tmdbId);
      return details as Movie;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<Movie> => r.status === 'fulfilled')
    .map(r => r.value);
};

// Fetch and transform latest TV shows with TMDB details
const fetchLatestTVShows = async (): Promise<TVShow[]> => {
  const vidsrcTVShows = await getLatestTVShows(1);
  
  const results = await Promise.allSettled(
    vidsrcTVShows.slice(0, 10).map(async (item) => {
      const tmdbId = parseInt(item.tmdb_id, 10);
      if (isNaN(tmdbId)) throw new Error('Invalid ID');
      const details = await getTVShowDetails(tmdbId);
      return {
        id: details.id,
        name: details.name,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        vote_average: details.vote_average,
        first_air_date: details.first_air_date,
        overview: details.overview,
      } as TVShow;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<TVShow> => r.status === 'fulfilled')
    .map(r => r.value);
};

const MovieCard = memo(({ movie, onClick }: { movie: Movie; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex-shrink-0 w-36 md:w-44 cursor-pointer group"
  >
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
      {movie.poster_path ? (
        <img
          src={getImageUrl(movie.poster_path, 'w300') || ''}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
    </div>
    <p className="text-sm font-medium truncate">{movie.title}</p>
    <p className="text-xs text-muted-foreground">
      {movie.release_date?.slice(0, 4) || 'N/A'}
    </p>
  </div>
));

MovieCard.displayName = 'LatestMovieCard';

const TVCard = memo(({ show, onClick }: { show: TVShow; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex-shrink-0 w-36 md:w-44 cursor-pointer group"
  >
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
      {show.poster_path ? (
        <img
          src={getImageUrl(show.poster_path, 'w300') || ''}
          alt={show.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Tv className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
    </div>
    <p className="text-sm font-medium truncate">{show.name}</p>
    <p className="text-xs text-muted-foreground">
      {show.first_air_date?.slice(0, 4) || 'N/A'}
    </p>
  </div>
));

TVCard.displayName = 'LatestTVCard';

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 md:w-44">
    <Skeleton className="aspect-[2/3] rounded-lg mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-3 w-16" />
  </div>
);

const LatestSection = memo(({ onMovieClick, onTVShowClick }: LatestSectionProps) => {
  const { data: latestMovies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ['latest-movies'],
    queryFn: fetchLatestMovies,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: latestTVShows = [], isLoading: isLoadingTV } = useQuery({
    queryKey: ['latest-tvshows'],
    queryFn: fetchLatestTVShows,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="space-y-10 md:space-y-12 mt-14 md:mt-16">
      {/* Latest Movies */}
      <section>
        <div className="flex items-center gap-2 mb-5 md:mb-6">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold">Latest Added Movies</h2>
        </div>
        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {isLoadingMovies ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : latestMovies.length > 0 ? (
            latestMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => onMovieClick(movie)} 
              />
            ))
          ) : (
            <p className="text-muted-foreground">No latest movies available</p>
          )}
        </div>
      </section>

      {/* Latest TV Shows */}
      <section>
        <div className="flex items-center gap-2 mb-5 md:mb-6">
          <Tv className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold">Latest Added TV Shows</h2>
        </div>
        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {isLoadingTV ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : latestTVShows.length > 0 ? (
            latestTVShows.map((show) => (
              <TVCard 
                key={show.id} 
                show={show} 
                onClick={() => onTVShowClick?.(show)} 
              />
            ))
          ) : (
            <p className="text-muted-foreground">No latest TV shows available</p>
          )}
        </div>
      </section>
    </div>
  );
});

LatestSection.displayName = 'LatestSection';

export default LatestSection;
