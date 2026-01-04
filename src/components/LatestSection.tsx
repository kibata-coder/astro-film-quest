import { useState, useEffect } from 'react';
import { Film, Tv } from 'lucide-react';
import { getLatestMovies, getLatestTVShows, VidsrcItem } from '@/lib/vidsrc';
import { getMovieDetails, getImageUrl, Movie } from '@/lib/tmdb';
import { Skeleton } from '@/components/ui/skeleton';

interface LatestSectionProps {
  onMovieClick: (movie: Movie) => void;
}

const LatestSection = ({ onMovieClick }: LatestSectionProps) => {
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [latestTVShows, setLatestTVShows] = useState<VidsrcItem[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingTV, setIsLoadingTV] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      // Fetch latest movies from Vidsrc
      const vidsrcMovies = await getLatestMovies(1);
      
      // Get details for first 10 movies from TMDB
      const movieDetails = await Promise.all(
        vidsrcMovies.slice(0, 10).map(async (item) => {
          try {
            const details = await getMovieDetails(item.tmdb_id);
            return details as Movie;
          } catch {
            return null;
          }
        })
      );
      
      setLatestMovies(movieDetails.filter((m): m is Movie => m !== null));
      setIsLoadingMovies(false);

      // Fetch latest TV shows
      const tvShows = await getLatestTVShows(1);
      setLatestTVShows(tvShows.slice(0, 10));
      setIsLoadingTV(false);
    };

    fetchLatest();
  }, []);

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

  const TVCard = ({ item }: { item: VidsrcItem }) => (
    <div className="flex-shrink-0 w-32 md:w-40 cursor-pointer group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2 flex items-center justify-center">
        <Tv className="w-8 h-8 text-muted-foreground" />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
            TV Show
          </span>
        </div>
      </div>
      <p className="text-sm font-medium truncate">{item.title}</p>
      <p className="text-xs text-muted-foreground">TMDB: {item.tmdb_id}</p>
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
    <div className="space-y-8 mt-12">
      {/* Latest Movies */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold">Latest Added Movies</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {isLoadingMovies ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : latestMovies.length > 0 ? (
            latestMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          ) : (
            <p className="text-muted-foreground">No latest movies available</p>
          )}
        </div>
      </section>

      {/* Latest TV Shows */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold">Latest Added TV Shows</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {isLoadingTV ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : latestTVShows.length > 0 ? (
            latestTVShows.map((item) => (
              <TVCard key={item.tmdb_id} item={item} />
            ))
          ) : (
            <p className="text-muted-foreground">No latest TV shows available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default LatestSection;
