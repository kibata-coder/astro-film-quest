import { useState, useEffect } from 'react';
import { X, Play, Star, Calendar, Tv, Plus, Check } from 'lucide-react'; // Added Plus, Check
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBackdropUrl, getImageUrl, getTVShowDetails, getTVShowSeasonDetails } from '@/lib/tmdb';
import type { TVShow, TVShowDetails, Episode } from '@/lib/tmdb';
import { checkIsBookmarked, toggleBookmark } from '@/lib/bookmarks'; // Import helpers

interface TVShowModalProps {
  show: TVShow | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (showId: number, showName: string, seasonNumber: number, episodeNumber: number, episodeName: string, posterPath: string | null) => void;
}

const TVShowModal = ({ show, isOpen, onClose, onPlay }: TVShowModalProps) => {
  const [details, setDetails] = useState<TVShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    if (show && isOpen) {
      setIsLoading(true);
      
      // Check bookmark status
      checkIsBookmarked(show.id, 'tv').then(setIsBookmarked);

      getTVShowDetails(show.id)
        .then((data) => {
          setDetails(data);
          if (data.seasons && data.seasons.length > 0) {
            const firstRegularSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
            setSelectedSeason(firstRegularSeason.season_number);
          }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border">
        {/* Backdrop */}
        <div className="relative h-48 md:h-64">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={show.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 -mt-20 relative">
          <div className="flex gap-6">
            {/* Poster */}
            <div className="hidden md:block flex-shrink-0 w-32">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={show.name}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] rounded-lg bg-muted" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold mb-2">{show.name}</h2>
                
                {/* Bookmark Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                  className="ml-2"
                >
                  {isBookmarked ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {isBookmarked ? 'In List' : 'My List'}
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {year}
                </span>
                {show.vote_average > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {show.vote_average.toFixed(1)}
                  </span>
                )}
                {details?.number_of_seasons && (
                  <span className="flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {show.overview || 'No description available.'}
              </p>

              {/* Season selector */}
              {seasons.length > 0 && (
                <div className="mb-4">
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
                </div>
              )}
            </div>
          </div>

          {/* Episodes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Episodes</h3>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {episodes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No episodes available.</p>
                ) : (
                  episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0 w-24 aspect-video rounded overflow-hidden bg-muted">
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
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {episode.overview}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onPlay(
                          show.id,
                          show.name,
                          selectedSeason,
                          episode.episode_number,
                          episode.name,
                          show.poster_path
                        )}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TVShowModal;
