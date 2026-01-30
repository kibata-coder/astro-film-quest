import { useState, useEffect } from 'react';
import { X, Play, Info, Check, Plus } from 'lucide-react'; // Added Check, Plus
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Movie,
  Cast,
  Video,
  WatchProvider,
  getBackdropUrl,
  getImageUrl,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getWatchProviders,
} from '@/lib/tmdb';
import { checkIsBookmarked, toggleBookmark } from '@/lib/bookmarks'; // Import our new helpers
import LoadingSpinner from './LoadingSpinner';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

const MovieModal = ({ movie, isOpen, onClose, onPlay }: MovieModalProps) => {
  const isMobile = useIsMobile();
  const [details, setDetails] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [providers, setProviders] = useState<WatchProvider[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New State for Bookmark
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    if (movie && isOpen) {
      setIsLoading(true);
      
      // Check bookmark status
      checkIsBookmarked(movie.id, 'movie').then(setIsBookmarked);

      Promise.all([
        getMovieDetails(movie.id),
        getMovieCredits(movie.id),
        getMovieVideos(movie.id),
        getWatchProviders(movie.id),
      ])
        .then(([movieDetails, credits, videos, watchProviders]) => {
          setDetails(movieDetails);
          setCast((credits as unknown as { cast: Cast[] }).cast?.slice(0, 6) || []);
          
          const officialTrailer = videos.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          setTrailer(officialTrailer || null);
          
          setProviders(watchProviders?.flatrate || null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movie, isOpen]);

  const handleBookmark = async () => {
    if (!movie) return;
    setIsBookmarkLoading(true);
    const newState = await toggleBookmark(
      movie.id,
      'movie',
      movie.title,
      movie.poster_path
    );
    setIsBookmarked(newState);
    setIsBookmarkLoading(false);
  };

  if (!movie) return null;

  const matchScore = Math.round(movie.vote_average * 10);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path);

  const Content = () => (
    <div className="relative bg-background overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Hero Section */}
      <div className="relative aspect-video w-full">
        {trailer ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-fade-bottom pointer-events-none" />
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">{movie.title}</h2>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onPlay}
              variant="secondary"
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play
            </Button>
            
            {/* Bookmark Button */}
            <Button
              variant="secondary"
              size="lg"
              className="bg-secondary/80 hover:bg-secondary"
              onClick={handleBookmark}
              disabled={isBookmarkLoading}
            >
              {isBookmarked ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  In List
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  My List
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left column - Main info */}
            <div className="md:col-span-2 space-y-4">
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm">
                <span className="match-score font-semibold">{matchScore}% Match</span>
                <span className="text-muted-foreground">{year}</span>
                {runtime && <span className="text-muted-foreground">{runtime}</span>}
              </div>

              {/* Overview */}
              <p className="text-foreground/90 leading-relaxed">{movie.overview}</p>
            </div>

            {/* Right column - Cast & Providers */}
            <div className="space-y-4">
              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Cast: </span>
                  <span className="text-sm">
                    {cast.map((c) => c.name).join(', ')}
                  </span>
                </div>
              )}

              {/* Genres */}
              {details?.genres && details.genres.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Genres: </span>
                  <span className="text-sm">
                    {details.genres.map((g) => g.name).join(', ')}
                  </span>
                </div>
              )}

              {/* Watch Providers */}
              {providers && providers.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm block mb-2">
                    Where to Watch:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {providers.map((p) => (
                      <img
                        key={p.provider_id}
                        src={getImageUrl(p.logo_path, 'w300') || ''}
                        alt={p.provider_name}
                        title={p.provider_name}
                        className="w-10 h-10 rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="h-full p-0 border-0">
          <Content />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-background">
        <Content />
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;
