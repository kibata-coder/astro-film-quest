import { Sparkles, RefreshCw } from 'lucide-react';
import { Movie } from '@/lib/tmdb';
import { getHybridRecommendations } from '@/lib/recommendations';
import { MovieCard } from '@/features/movies';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ForYouSectionProps {
  onMovieClick: (movie: Movie) => void;
}

const ForYouSection = ({ onMovieClick }: ForYouSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: movies = [], isLoading, isFetching } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => getHybridRecommendations(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['recommendations', user?.id] });
  };

  if (!user) return null;

  return (
    <section className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Top Picks For You
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isFetching} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[150px] md:min-w-[200px] aspect-[2/3] rounded-lg bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {movies.map((movie) => (
              <div key={movie.id} className="w-[130px] sm:w-40 md:w-48 flex-none">
                <MovieCard movie={movie} onClick={() => onMovieClick(movie)} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="text-center py-8 bg-muted/10 rounded-xl border border-border/50">
          <p className="text-muted-foreground">Watch a few movies to help us learn what you like!</p>
        </div>
      )}
    </section>
  );
};
export default ForYouSection;
