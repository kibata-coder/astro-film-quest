import { getImageUrl } from '@/lib/tmdb';
import type { TVShow } from '@/lib/tmdb';

interface TVShowCardProps {
  show: TVShow;
  onClick: (show: TVShow) => void;
}

const TVShowCard = ({ show, onClick }: TVShowCardProps) => {
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';
  const posterUrl = getImageUrl(show.poster_path, 'w300');

  return (
    <div
      onClick={() => onClick(show)}
      className="flex-shrink-0 w-40 cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={show.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        
        {/* Rating badge */}
        {show.vote_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-medium">
            ★ {show.vote_average.toFixed(1)}
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-sm font-medium">View Details</span>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-sm font-medium truncate">{show.name}</p>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </div>
  );
};

export default TVShowCard;
