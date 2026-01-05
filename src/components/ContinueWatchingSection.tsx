import { X, Play } from 'lucide-react';
import { WatchHistoryItem, removeFromWatchHistory } from '@/lib/watchHistory';
import { getImageUrl } from '@/lib/tmdb';

interface ContinueWatchingSectionProps {
  items: WatchHistoryItem[];
  onItemClick: (item: WatchHistoryItem) => void;
  onRemove: (mediaId: number, mediaType: 'movie' | 'tv') => void;
}

const ContinueWatchingSection = ({ items, onItemClick, onRemove }: ContinueWatchingSectionProps) => {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Continue Watching</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div
            key={`${item.mediaType}-${item.mediaId}`}
            className="relative flex-shrink-0 w-40 group cursor-pointer"
          >
            <div
              onClick={() => onItemClick(item)}
              className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted"
            >
              {item.posterPath ? (
                <img
                  src={getImageUrl(item.posterPath, 'w300') || ''}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-primary" fill="currentColor" />
              </div>
              
              {/* Media type badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-medium">
                {item.mediaType === 'tv' ? 'TV' : 'Movie'}
              </div>
            </div>
            
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.mediaId, item.mediaType);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mt-2">
              <p className="text-sm font-medium truncate">{item.title}</p>
              {item.mediaType === 'tv' && item.seasonNumber && item.episodeNumber && (
                <p className="text-xs text-muted-foreground">
                  S{item.seasonNumber} E{item.episodeNumber}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
