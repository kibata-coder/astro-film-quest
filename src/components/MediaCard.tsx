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
}

const isMovie = (item: MediaItem): item is Movie => {
  return 'title' in item;
};

const MediaCard = memo(({ item, onClick, showBadge = true, className }: MediaCardProps) => {
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
        "flex-shrink-0 w-36 md:w-44 cursor-pointer group",
        className
      )}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
        {/* Placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Image */}
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
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

        {/* Rating Badge */}
        {showBadge && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Media Type Badge */}
        {showBadge && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-medium">
            {isMovie(item) ? 'Movie' : 'TV'}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-primary/90">
              <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-sm font-medium">View Details</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </div>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
