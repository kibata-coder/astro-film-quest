import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Movie } from '@/lib/tmdb';
import { getHybridRecommendations } from '@/lib/recommendations';
import MovieCard from './MovieCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ForYouSectionProps {
  onMovieClick: (movie: Movie) => void;
}

const ForYouSection = ({ onMovieClick }: ForYouSectionProps) => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const recs = await getHybridRecommendations();
      setMovies(recs);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is logged in
    if (user) {
      fetchRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

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
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchRecommendations}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
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
              <div key={movie.id} className="w-[150px] md:w-[200px] flex-none">
                <MovieCard 
                  movie={movie} 
                  onClick={onMovieClick} 
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="text-center py-8 bg-muted/10 rounded-xl border border-white/5">
          <p className="text-muted-foreground">
            Watch a few movies to help us learn what you like!
          </p>
        </div>
      )}
    </section>
  );
};

export default ForYouSection;
