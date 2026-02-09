import { useEffect, useState } from 'react';
import { WatchHistoryItem, getWatchHistory, removeFromHistory } from '@/lib/watchHistory';
import { X, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { useMedia } from '@/features/shared';

const ContinueWatchingSection = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { openMovieModal, openTVModal } = useMedia();

  const loadHistory = async () => {
    const data = await getWatchHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();

    // Listen for auth changes to reload history (e.g., user signs in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadHistory();
    });

    // Listen for custom event if you trigger it elsewhere
    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener('watch-history-updated', handleHistoryUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('watch-history-updated', handleHistoryUpdate);
    };
  }, []);

  const handleRemove = async (e: React.MouseEvent, item: WatchHistoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromHistory(item.id, item.media_type);
    loadHistory(); // Reload after delete
  };

  const handleItemClick = (item: WatchHistoryItem) => {
    if (item.media_type === 'movie') {
      // Create a compatible Movie object from the history item
      const movie: Movie = {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        // Provide defaults for fields missing in history but required by Movie type
        backdrop_path: '',
        overview: '',
        release_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        original_language: 'en',
        original_title: item.title,
        video: false,
        adult: false,
        genre_ids: []
      } as unknown as Movie;
      
      openMovieModal(movie);
    } else {
      // Create a compatible TVShow object from the history item
      const show: TVShow = {
        id: item.id,
        name: item.title, // History stores 'title', TVShow uses 'name'
        poster_path: item.poster_path,
        // Provide defaults for fields missing in history but required by TVShow type
        backdrop_path: '',
        overview: '',
        first_air_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        original_language: 'en',
        original_name: item.title,
        origin_country: [],
        genre_ids: []
      } as unknown as TVShow;

      openTVModal(show);
    }
  };

  if (history.length === 0) return null;

  return (
    <section className="py-8 md:py-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-6">Continue Watching</h2>
      
      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {history.map((item) => {
          const posterUrl = getImageUrl(item.poster_path, 'w300');
          
          return (
            <div 
              key={`${item.media_type}-${item.id}`} 
              className="flex-shrink-0 w-36 md:w-44 cursor-pointer group relative"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center px-2">
                    {item.title}
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary" fill="currentColor" />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-2 right-2 p-1.5 bg-background/60 hover:bg-destructive rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  title="Remove from history"
                >
                  <X className="w-4 h-4" />
                </button>
                
              {/* Episode Badge for TV Shows */}
                {item.media_type === 'tv' && item.season_number && (
                  <div className="absolute bottom-2 right-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    S{item.season_number} E{item.episode_number}
                  </div>
                )}
                
                {/* Progress percentage label */}
                {item.progress > 0 && (
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(item.progress * 100)}% watched
                  </div>
                )}

                {/* Progress Bar */}
                {item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              
              <p className="mt-2 text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.media_type}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
