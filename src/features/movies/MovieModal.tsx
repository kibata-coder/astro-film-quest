import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Check, Plus, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

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
import { isAnimeMedia } from '@/lib/anime';
import { useMedia } from '@/features/shared';
import { getProviders } from '@/lib/vidsrc';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import ThumbsRating from '@/components/ThumbsRating';
import AddToCollectionDialog from '@/components/AddToCollectionDialog';

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

const PROVIDER_STORAGE_KEY = 'soudflex.preferredProvider';

const getTrailerScore = (video: Video) => {
  const name = video.name.toLowerCase();
  let score = 0;

  if (video.site === 'YouTube') score += 20;
  if (video.type === 'Trailer') score += 40;
  if (video.official) score += 30;
  if (name.includes('official trailer')) score += 20;
  else if (name.includes('trailer')) score += 10;

  if (name.includes('teaser')) score -= 10;
  if (name.includes('clip')) score -= 20;
  if (name.includes('short')) score -= 40;
  if (name.includes('vertical')) score -= 40;

  score += Math.min(video.size ?? 0, 1080) / 100;

  return score;
};

const getPreferredTrailer = (videos: Video[]) =>
  [...videos]
    .filter((video) => video.site === 'YouTube')
    .sort((a, b) => getTrailerScore(b) - getTrailerScore(a))
    .find((video) => getTrailerScore(video) > 0) || null;

const MovieModal = ({ movie, isOpen, onClose, onPlay, onSelectMovie }: MovieModalProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { forceCloseMovieModal } = useMedia();
  const [details, setDetails] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [providers, setProviders] = useState<WatchProvider[] | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [showServerDialog, setShowServerDialog] = useState(false);
  const streamProviders = getProviders();

  // ALWAYS OPEN THE DIALOG (NO BYPASS)
  const handlePlayClick = () => {
    setShowServerDialog(true);
  };

  const handleServerSelect = (index: number) => {
    const selectedProvider = streamProviders[index];
    const isAnime = isAnimeMedia(movie as unknown as Parameters<typeof isAnimeMedia>[0]);

    // INTERCEPTION GUARD: Block Server 4 if they try to click it on a normal movie
    if (selectedProvider?.id === 'anikoto' && !isAnime) {
      toast({
        variant: "destructive",
        title: "Anime Server Only",
        description: "This server is exclusive to Japanese Anime streams. Please pick Server 1, 2, or 3 for standard movies!",
      });
      return;
    }

    try {
      window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(index));
    } catch {}
    setShowServerDialog(false);
    onPlay();
  };

  useEffect(() => {
    setIsMuted(true);
  }, [movie?.id]);

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
          setTrailer(getPreferredTrailer(videos));
          
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

      <div className="relative w-full">
        {trailer ? (
          <div className="w-full aspect-video overflow-hidden bg-black relative">
            <iframe
              key={`${trailer.key}-${isMuted ? 'm' : 'u'}`}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
            <button
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                if (!next) {
                  toast({
                    title: 'Unmuting trailer',
                    description: "If you don't hear sound, click the video first, then unmute again.",
                  });
                }
              }}
              className="absolute top-4 right-16 z-30 flex items-center gap-2 px-3 py-2 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg transition-colors text-sm font-medium"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Mute</span>
                </>
              )}
            </button>
          </div>
        ) : backdropUrl ? (
          <div className="w-full aspect-video overflow-hidden bg-black">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted" />
        )}
      </div>

      <div className="px-5 md:px-6 pt-5 relative z-10">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <h2 className="text-xl md:text-2xl font-bold">{movie.title}</h2>
          {isAnimeMedia(movie as unknown as Parameters<typeof isAnimeMedia>[0]) && (
            <Badge variant="default" className="text-[10px] uppercase">Anime</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          
          <Button
            onClick={handlePlayClick}
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
          <ThumbsRating mediaId={movie.id} mediaType="movie" />
          <AddToCollectionDialog mediaId={movie.id} mediaType="movie" title={movie.title} posterPath={movie.poster_path} />
        </div>
      </div>

      <div className="px-5 md:px-6 pb-8 space-y-4">
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
                    <span className="text-xs">
                      {cast.map((c, i) => (
                        <span key={c.id}>
                          <button
                            type="button"
                            onClick={() => { forceCloseMovieModal(); navigate(`/person/${c.id}`); }}
                            className="hover:text-primary hover:underline focus:outline-none focus:text-primary"
                          >
                            {c.name}
                          </button>
                          {i < cast.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
                {details?.genres && details.genres.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Genres: </span>
                    <span className="text-xs">{details.genres.map((g) => g.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Server Selection Interception Popup */}
      <Dialog open={showServerDialog} onOpenChange={setShowServerDialog}>
        <DialogContent className="sm:max-w-3xl bg-slate-950/70 backdrop-blur-xl border-white/10 z-[200] shadow-2xl overflow-hidden p-0">
          <div className="p-6 space-y-5">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">Select a Server</h3>
              <p className="text-sm text-muted-foreground text-center">
                Choose a streaming server to start playing. If the video ever buffers or doesn't load, you can always try switching servers!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-2 pb-2">
              {streamProviders.map((provider, index) => (
                <button
                  key={provider.id}
                  onClick={() => handleServerSelect(index)}
                  className="relative flex items-center w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center p-2 mr-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Play className="w-4 h-4 ml-0.5 text-foreground/80 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors text-left break-words flex-1 pr-6">
                    {provider.name}
                  </span>
                  
                  {index === 0 && (
                    <div className="absolute top-0 right-0 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white rounded-bl-xl rounded-tr-xl transition-colors">
                      Recommended
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="h-screen w-screen max-w-none p-0 border-0 rounded-none overflow-hidden">
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
