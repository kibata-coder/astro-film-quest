import { useState, useEffect } from 'react';
import { X, Play, Star, Calendar, Tv, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { getBackdropUrl, getImageUrl, getTVShowDetails, getTVShowSeasonDetails, getTVShowRecommendations } from '@/lib/tmdb';
import type { TVShow, TVShowDetails, Episode } from '@/lib/tmdb';
import { checkIsBookmarked, toggleBookmark } from '@/lib/bookmarks';

interface TVShowModalProps {
  show: TVShow | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (showId: number, showName: string, seasonNumber: number, episodeNumber: number, episodeName: string, posterPath: string | null) => void;
  onSelectShow?: (show: TVShow) => void;
}

const TVShowModal = ({ show, isOpen, onClose, onPlay, onSelectShow }: TVShowModalProps) => {
  const isMobile = useIsMobile();
  const [details, setDetails] = useState<TVShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

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
          if (data.seasons && data.seasons.length > 0) {
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
    if (show && selectedSeason >= 0) {
      getTVShowSeasonDetails(show.id, selectedSeason)
        .then((data) => {
          setEpisodes(data.episodes || []);
        })
        .catch(console.error);
    }
  }, [show, selectedSeason]);

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

      {/* Backdrop */}
      <div className="relative w-full">
        <div className="aspect-video w-full">
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

      {/* Title & meta */}
      <div className="px-5 md:px-6 -mt-16 relative z-10">
        <div className="flex gap-4 items-start">
          {!isMobile && posterUrl && (
            <img
              src={posterUrl}
              alt={show.name}
              className="w-24 rounded-lg shadow-lg flex-shrink-0 -mt-8"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-3xl font-bold mb-2">{show.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
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
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
            className="flex-shrink-0 gap-1"
          >
            {isBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isBookmarked ? 'In List' : 'My List'}
          </Button>
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

        {/* Episodes */}
        <div>
          <h3 className="text-base font-semibold mb-3">Episodes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-md border border-border/50 bg-muted/20 p-3">
            {episodes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No episodes available.</p>
            ) : (
              episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-background hover:bg-muted/80 transition-colors border border-border/50"
                >
                  <div className="flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
                    {episode.still_path ? (
                      <img
                        src={getImageUrl(episode.still_path, 'w300') || ''}
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {episode.episode_number}. {episode.name}
                    </p>
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
                    onClick={() => onPlay(
                      show.id,
                      show.name,
                      selectedSeason,
                      episode.episode_number,
                      episode.name,
                      show.poster_path
                    )}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border max-h-[90vh]">
        <ScrollArea className="h-[90vh]">
          <Content />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TVShowModal;
