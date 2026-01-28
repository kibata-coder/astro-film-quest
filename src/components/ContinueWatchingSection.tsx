import { useEffect, useState } from 'react';
import { WatchHistoryItem, getWatchHistory, removeFromHistory } from '@/lib/watchHistory';
import MovieCard from './MovieCard';
import TVShowCard from './TVShowCard';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ContinueWatchingSection = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

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

  if (history.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={`${item.media_type}-${item.id}`} className="relative group">
            {item.media_type === 'movie' ? (
              <MovieCard
                id={item.id}
                title={item.title}
                poster_path={item.poster_path}
                release_date=""
                vote_average={0}
              />
            ) : (
              <TVShowCard
                id={item.id}
                title={item.title}
                poster_path={item.poster_path}
                vote_average={0}
              />
            )}
            
            {/* Remove Button */}
            <button
              onClick={(e) => handleRemove(e, item)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
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
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
