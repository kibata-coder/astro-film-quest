import { useEffect, useState } from 'react';
import { WatchHistoryItem, getWatchHistory, removeFromHistory } from '@/lib/watchHistory';
import { X, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl } from '@/lib/tmdb';

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
    <section className="py-6">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Continue Watching</h2>
      
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {history.map((item) => {
          const posterUrl = getImageUrl(item.poster_path, 'w300');
          
          return (
            <div 
              key={`${item.media_type}-${item.id}`} 
              className="flex-shrink-0 w-32 md:w-40 cursor-pointer group relative"
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
