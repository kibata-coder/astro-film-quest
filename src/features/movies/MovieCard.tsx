import { Movie, getImageUrl } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  const posterUrl = getImageUrl(movie.poster_path, 'w300');

  return (
    <div
      className="movie-card aspect-[2/3] bg-card rounded-md"
      onClick={() => onClick(movie)}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
          <span className="text-muted-foreground text-sm text-center px-2">
            {movie.title}
          </span>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
