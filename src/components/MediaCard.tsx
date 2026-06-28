import { useState, memo } from 'react';
import { Play, Star, Film, Tv } from 'lucide-react';
import { getImageUrl, Movie, TVShow } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

type MediaItem = Movie | TVShow;

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  showBadge?: boolean;
  className?: string;
  rank?: number;
}

const isMovie = (item: MediaItem): item is Movie => 'title' in item;

const MediaCard = memo(({ item, onClick, showBadge = true, className, rank }: MediaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = isMovie(item) ? item.title : item.name;
  const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
  const year = releaseDate?.slice(0, 4) || 'N/A';
  const posterUrl = getImageUrl(item.poster_path, 'w300');
  const rating = item.vote_average;

  return (
    <div
      onClick={() => onClick(item)}
      className={cn(
        'flex-shrink-0 w-[130px] sm:w-40 md:w-48 cursor-pointer group relative',
        className,
      )}
    >
      {/* aspect-[2/3] reserves space → no CLS even before the image loads */}
      <div className={cn("relative aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform duration-300 group-hover:scale-105", rank ? "ml-6 sm:ml-8" : "")}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={title}
            // Native browser lazy-loading + async decode keep low-end devices responsive.
            loading="lazy"
            decoding="async"
            // @ts-expect-error fetchpriority is valid HTML
            fetchpriority="low"
            width={300}
            height={450}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300 md:group-hover:scale-105 md:transition-transform',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {isMovie(item) ? (
              <Film className="w-10 h-10 text-muted-foreground" />
            ) : (
              <Tv className="w-10 h-10 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground text-center px-2 line-clamp-2">
              {title}
            </span>
          </div>
        )}

        {showBadge && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}

        {showBadge && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-medium">
            {isMovie(item) ? 'Movie' : 'TV'}
          </div>
        )}

        {/* Hover overlay — pointer-events:none keeps it cheap on touch devices */}
        <div className="hidden md:flex absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-primary/90">
              <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-sm font-medium">View Details</span>
          </div>
        </div>
      </div>

      {rank && (
        <span 
          className="absolute left-[-15px] sm:left-[-20px] bottom-[-5px] sm:bottom-[-10px] text-[100px] sm:text-[140px] font-black leading-none tracking-tighter z-10 pointer-events-none select-none text-background" 
          style={{ 
            WebkitTextStroke: '3px hsl(var(--foreground))',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {rank}
        </span>
      )}

      {/* Info section below poster */}
      <div className={cn("mt-2 space-y-1", rank ? "ml-6 sm:ml-8" : "")}>
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{year}</span>
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
