import { Link } from 'react-router-dom';
import type { AnikotoAnime } from '@/lib/anikoto';

interface SoudanimeCardProps {
  anime: AnikotoAnime;
}

const SoudanimeCard = ({ anime }: SoudanimeCardProps) => {
  return (
    <Link 
      to={`/anime/${anime.id}`} 
      className="group relative flex flex-col gap-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 w-[160px] md:w-[200px] shrink-0"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted/20 border border-border shadow-sm">
        {anime.poster ? (
          <img 
            src={anime.poster} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground text-sm font-medium">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
          {anime.title}
        </h3>
        {anime.terms_by_type?.genre && anime.terms_by_type.genre.length > 0 && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {anime.terms_by_type.genre.join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
};

export default SoudanimeCard;
