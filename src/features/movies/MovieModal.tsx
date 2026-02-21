import { useState, useEffect } from 'react';
import { X, Play, Check, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  getMovieRecommendations,
} from '@/lib/tmdb';
import { checkIsBookmarked, toggleBookmark } from '@/lib/bookmarks';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

const MovieModal = ({ movie, isOpen, onClose, onPlay, onSelectMovie }: MovieModalProps) => {
  const isMobile = useIsMobile();
  const [details, setDetails] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [providers, setProviders] = useState<WatchProvider[] | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [movie?.id]);

  useEffect(() => {
    if (movie && isOpen) {
      setIsLoading(true);
      
      checkIsBookmarked(movie.id, 'movie').then(setIsBookmarked);

      Promise.all([
        getMovieDetails(movie.id),
        getMovieCredits(movie.id),
        getMovieVideos(movie.id),
        getWatchProviders(movie.id),
        getMovieRecommendations(movie.id),
      ])
        .then(([movieDetails, credits, videos, watchProviders, recommendedMovies]) => {
          setDetails(movieDetails);
          setCast((credits as unknown as { cast: Cast[] }).cast?.slice(0, 6) || []);
          
          const officialTrailer = videos.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          setTrailer(officialTrailer || null);
          
          setProviders(watchProviders?.flatrate || null);
          setRecommendations(recommendedMovies.results?.slice(0, 10) || []);
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
    <div className="relative bg-background h-full overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Hero media - show trailer on desktop, backdrop on mobile */}
      <div className="relative w-full">
        {!isMobile && trailer ? (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : backdropUrl ? (
          <div className="aspect-video w-full">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Title & actions below the image */}
      <div className="px-5 md:px-6 -mt-16 relative z-10">
        <h2 className="text-xl md:text-3xl font-bold mb-3">{movie.title}</h2>
        <div className="flex gap-3 mb-5">
          <Button
            onClick={onPlay}
            size={isMobile ? "default" : "lg"}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            Play
          </Button>
          <Button
            variant="secondary"
            size={isMobile ? "default" : "lg"}
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
            className="gap-2"
          >
            {isBookmarked ? (
              <>
                <Check className="w-4 h-4" />
                In List
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                My List
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="px-5 md:px-6 pb-8 space-y-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="match-score font-semibold">{matchScore}% Match</span>
                  <span className="text-muted-foreground">{year}</span>
                  {runtime && <span className="text-muted-foreground">{runtime}</span>}
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed">{movie.overview}</p>
              </div>

              <div className="space-y-3">
                {cast.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Cast: </span>
                    <span className="text-xs">{cast.map((c) => c.name).join(', ')}</span>
                  </div>
                )}
                {details?.genres && details.genres.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Genres: </span>
                    <span className="text-xs">{details.genres.map((g) => g.name).join(', ')}</span>
                  </div>
                )}
                {providers && providers.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Where to Watch:</span>
                    <div className="flex gap-2 flex-wrap">
                      {providers.map((p) => (
                        <img
                          key={p.provider_id}
                          src={getImageUrl(p.logo_path, 'w300') || ''}
                          alt={p.provider_name}
                          title={p.provider_name}
                          className="w-8 h-8 rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <h3 className="text-base font-semibold mb-3">More Like This</h3>
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex space-x-3 pr-4">
                    {recommendations.map((recMovie) => (
                      <button
                        key={recMovie.id}
                        onClick={() => onSelectMovie && onSelectMovie(recMovie)}
                        className="w-[120px] md:w-[150px] flex-none group relative transition-transform hover:scale-105 focus:outline-none"
                      >
                        <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted mb-1.5 relative">
                          {recMovie.poster_path ? (
                            <img
                              src={getImageUrl(recMovie.poster_path, 'w300') || ''}
                              alt={recMovie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
                              {recMovie.title}
                            </div>
                          )}
                        </div>
                        <div className="whitespace-normal">
                          <h4 className="text-xs font-medium leading-tight line-clamp-2 text-left">
                            {recMovie.title}
                          </h4>
                        </div>
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="h-[92vh] p-0 border-0 rounded-t-xl overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Content />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 bg-background max-h-[90vh]">
        <ScrollArea className="h-[90vh]">
           <Content />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;
