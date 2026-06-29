import { useState, useEffect, useRef } from 'react';
import { X, Play, Star, Calendar, Tv, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBackdropUrl, getImageUrl, getTVShowDetails, getTVShowSeasonDetails, getTVShowRecommendations } from '@/lib/tmdb';
import type { TVShow, TVShowDetails, Episode } from '@/lib/tmdb';
import { checkIsBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { isAnimeMedia, resolveAnime, type AnimeResolve } from '@/lib/anime';
import { getProviders } from '@/lib/vidsrc';
import ThumbsRating from '@/components/ThumbsRating';
import AddToCollectionDialog from '@/components/AddToCollectionDialog';

interface TVShowModalProps {
  show: TVShow | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (showId: number, showName: string, seasonNumber: number, episodeNumber: number, episodeName: string, posterPath: string | null) => void;
  onSelectShow?: (show: TVShow) => void;
  initialSeason?: number;
  initialEpisode?: number;
}

const PROVIDER_STORAGE_KEY = 'soudflex.preferredProvider';

const TVShowModal = ({ show, isOpen, onClose, onPlay, onSelectShow, initialSeason, initialEpisode }: TVShowModalProps) => {
  const isMobile = useIsMobile();
  const [details, setDetails] = useState<TVShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedEpisode, setHighlightedEpisode] = useState<number | undefined>(undefined);
  const episodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [animeResolve, setAnimeResolve] = useState<AnimeResolve | null>(null);

  const isAnime = show ? isAnimeMedia(show as unknown as Parameters<typeof isAnimeMedia>[0]) : false;

  // Server selection interception state
  const [showServerDialog, setShowServerDialog] = useState(false);
  // Temporarily store play arguments while the user picks a server
  const [pendingPlayArgs, setPendingPlayArgs] = useState<any>(null);
  const streamProviders = getProviders();

  const handlePlayClick = (showId: number, showName: string, seasonNumber: number, episodeNumber: number, episodeName: string, posterPath: string | null) => {
    setPendingPlayArgs({ showId, showName, seasonNumber, episodeNumber, episodeName, posterPath });
    setShowServerDialog(true);
  };

  const handleServerSelect = (index: number) => {
    try {
      window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(index));
    } catch {}
    setShowServerDialog(false);
    if (pendingPlayArgs) {
      onPlay(
        pendingPlayArgs.showId,
        pendingPlayArgs.showName,
        pendingPlayArgs.seasonNumber,
        pendingPlayArgs.episodeNumber,
        pendingPlayArgs.episodeName,
        pendingPlayArgs.posterPath
      );
      setPendingPlayArgs(null);
    }
  };

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [show?.id]);

  useEffect(() => {
    if (show && isOpen) {
      setIsLoading(true);
      checkIsBookmarked(show.id, 'tv').then(setIsBookmarked);

      Promise.all([
        getTVShowDetails(show.id),
        getTVShowRecommendations(show.id)
      ])
        .then(([data, recs]) => {
          setDetails(data);
          if (initialSeason !== undefined) {
            setSelectedSeason(initialSeason);
          } else if (data.seasons && data.seasons.length > 0) {
            const firstRegularSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
            setSelectedSeason(firstRegularSeason.season_number);
          }
          setRecommendations(recs.results?.slice(0, 10) || []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [show, isOpen]);

  useEffect(() => {
    if (!show || !isOpen) {
      setAnimeResolve(null);
      return;
    }
    if (!isAnimeMedia(show as unknown as Parameters<typeof isAnimeMedia>[0])) {
      setAnimeResolve(null);
      return;
    }
    let cancelled = false;
    resolveAnime(show.id, 'tv').then((r) => {
      if (!cancelled) setAnimeResolve(r);
    });
    return () => { cancelled = true; };
  }, [show, isOpen]);

  useEffect(() => {
    if (show && selectedSeason >= 0) {
      getTVShowSeasonDetails(show.id, selectedSeason)
        .then((data) => {
          const eps = data.episodes || [];
          setEpisodes(eps);
          if (initialEpisode !== undefined && selectedSeason === initialSeason) {
            setHighlightedEpisode(initialEpisode);
            setTimeout(() => {
              episodeRefs.current[initialEpisode]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          } else {
            setHighlightedEpisode(undefined);
          }
        })
        .catch(console.error);
    }
  }, [show, selectedSeason, initialSeason, initialEpisode]);

  const handleBookmark = async () => {
    if (!show) return;
    setIsBookmarkLoading(true);
    const newState = await toggleBookmark(
      show.id,
      'tv',
      show.name,
      show.poster_path
    );
    setIsBookmarked(newState);
    setIsBookmarkLoading(false);
  };

  if (!show) return null;

  const backdropUrl = getBackdropUrl(show.backdrop_path);
  const posterUrl = getImageUrl(show.poster_path, 'w300');
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A';
  const seasons = details?.seasons?.filter(s => s.season_number > 0) || [];

  const Content = () => (
    <div className="relative bg-background h-full overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full">
        <div className="w-full h-[220px] md:h-[280px] overflow-hidden bg-black">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={show.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="px-5 md:px-6 -mt-12 relative z-10">
        <div className="flex gap-4 items-end">
          {!isMobile && posterUrl && (
            <img
              src={posterUrl}
              alt={show.name}
              className="w-24 rounded-lg shadow-lg flex-shrink-0 -mt-8"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold">{show.name}</h2>
              {isAnime && (
                <Badge variant="default" className="text-[10px] uppercase">Anime</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {year}
              </span>
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {details?.number_of_seasons && (
                <span className="flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5" />
                  {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-1">
          <Button
            onClick={() => {
              const resumeEp = initialEpisode !== undefined
                ? episodes?.find(e => e.episode_number === initialEpisode)
                : undefined;
              const ep = resumeEp || episodes?.[0];
              if (ep && show) {
                handlePlayClick(show.id, show.name, selectedSeason, ep.episode_number, ep.name || `Episode ${ep.episode_number}`, show.poster_path);
              }
            }}
            size={isMobile ? "default" : "lg"}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            {initialEpisode !== undefined && selectedSeason === initialSeason ? 'Resume' : 'Play'}
          </Button>

          <Button
            variant="secondary"
            size={isMobile ? "default" : "lg"}
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
            className="gap-2"
          >
            {isBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isBookmarked ? 'In List' : 'My List'}
          </Button>
          <ThumbsRating mediaId={show.id} mediaType="tv" />
          <AddToCollectionDialog mediaId={show.id} mediaType="tv" title={show.name} posterPath={show.poster_path} />
        </div>
      </div>

      <div className="px-5 md:px-6 pb-8 mt-4 space-y-5">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {show.overview || 'No description available.'}
        </p>

        {seasons.length > 0 && (
          <Select
            value={String(selectedSeason)}
            onValueChange={(val) => setSelectedSeason(Number(val))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.season_number} value={String(season.season_number)}>
                  Season {season.season_number} ({season.episode_count} eps)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div>
          <h3 className="text-base font-semibold mb-3">Episodes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-md border border-border/50 bg-muted/20 p-3">
            {episodes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No episodes available.</p>
            ) : (
              episodes.map((episode) => {
                const animeEp = animeResolve?.episodes.find(e => e.number === episode.episode_number);
                const displayName = animeEp?.title || episode.name;
                return (
                <div
                  key={episode.id}
                  ref={(el) => { episodeRefs.current[episode.episode_number] = el; }}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePlayClick(
                    show.id,
                    show.name,
                    selectedSeason,
                    episode.episode_number,
                    displayName,
                    show.poster_path
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePlayClick(show.id, show.name, selectedSeason, episode.episode_number, displayName, show.poster_path);
                    }
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors border cursor-pointer ${
                    highlightedEpisode === episode.episode_number
                      ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                      : 'bg-background hover:bg-muted/80 border-border/50'
                  }`}
                >
                  <div className="flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
                    {episode.still_path ? (
                      <img
                        src={getImageUrl(episode.still_path, 'w300') || ''}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {episode.episode_number}. {displayName}
                      </p>
                      {animeEp && (
                        <>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">SUB</Badge>
                          {animeEp.hasDub && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">DUB</Badge>
                          )}
                        </>
                      )}
                    </div>
                    {episode.overview && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-primary/20 hover:text-primary flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayClick(show.id, show.name, selectedSeason, episode.episode_number, displayName, show.poster_path);
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h3 className="text-base font-semibold mb-3">More Like This</h3>
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex space-x-3 pr-4">
                {recommendations.map((recShow) => (
                  <button
                    key={recShow.id}
                    onClick={() => onSelectShow && onSelectShow(recShow)}
                    className="w-[120px] md:w-[150px] flex-none group relative transition-transform hover:scale-105 focus:outline-none"
                  >
                    <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted mb-1.5 relative">
                      {recShow.poster_path ? (
                        <img
                          src={getImageUrl(recShow.poster_path, 'w300') || ''}
                          alt={recShow.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
                          {recShow.name}
                        </div>
                      )}
                    </div>
                    <div className="whitespace-normal">
                      <h4 className="text-xs font-medium leading-tight line-clamp-2 text-left">
                        {recShow.name}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
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
        <SheetContent side="bottom" className="h-[92vh] p-0 border-0 rounded-t-xl overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Content />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background border-border max-h-[90vh]">
        <ScrollArea className="h-[90vh]">
          <Content />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TVShowModal;
