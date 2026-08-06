import { useEffect, useState } from 'react';
import { WatchHistoryItem, getWatchHistory, removeFromHistory, clearAllHistory } from '@/lib/watchHistory';
import { toast } from 'sonner';
import { X, Play } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getImageUrl, getMovieDetails, getTVShowDetails, Movie, TVShow } from '@/lib/tmdb';
import { useMedia } from '@/features/shared';
import { isAnimeMedia } from '@/lib/anime';

const POSTER_CACHE_KEY = 'poster-cache-v1';
const ANIME_CACHE_KEY = 'anime-cache-v1';

const loadCache = (key: string): Map<string, any> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const obj = JSON.parse(raw);
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
};

const posterCache = loadCache(POSTER_CACHE_KEY);
const animeCache = loadCache(ANIME_CACHE_KEY);
let savePending = false;
const persistCache = () => {
  if (savePending) return;
  savePending = true;
  setTimeout(() => {
    savePending = false;
    try {
      const pObj: Record<string, any> = {};
      posterCache.forEach((v, k) => { pObj[k] = v; });
      localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(pObj));
      
      const aObj: Record<string, any> = {};
      animeCache.forEach((v, k) => { aObj[k] = v; });
      localStorage.setItem(ANIME_CACHE_KEY, JSON.stringify(aObj));
    } catch {
      /* quota or serialization error ignore */
    }
  }, 500);
};

/**
 * One TMDB detail fetch per title, shared by both the poster and the anime
 * lookup. Previously each of those fetched details separately, so a history of
 * N items cost 2N requests; concurrent section instances doubled it again.
 * In-flight promises are deduped so simultaneous callers await the same request.
 */
const inFlight = new Map<string, Promise<{ poster: string | null; isAnime: boolean }>>();

const resolveDetails = (
  id: number,
  mediaType: 'movie' | 'tv' | 'anime'
): Promise<{ poster: string | null; isAnime: boolean }> => {
  const key = `${mediaType}-${id}`;

  // Fully cached: no network at all.
  if (posterCache.has(key) && animeCache.has(key)) {
    return Promise.resolve({
      poster: posterCache.get(key) ?? null,
      isAnime: animeCache.get(key) ?? false,
    });
  }

  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    try {
      const details =
        mediaType === 'movie' ? await getMovieDetails(id) : await getTVShowDetails(id);
      const poster = (details as any)?.poster_path ?? null;
      const isAnime = isAnimeMedia(details);
      posterCache.set(key, poster);
      animeCache.set(key, isAnime);
      persistCache();
      return { poster, isAnime };
    } catch {
      posterCache.set(key, null);
      animeCache.set(key, false);
      persistCache();
      return { poster: null, isAnime: false };
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);
  return request;
};

/** Anime status from data we already hold, without touching the network. */
const knownIsAnime = (item: WatchHistoryItem): boolean | undefined => {
  if (item.media_type === 'anime') return true;
  if (typeof item.is_anime === 'boolean') return item.is_anime;
  const key = `${item.media_type}-${item.id}`;
  return animeCache.has(key) ? animeCache.get(key) ?? false : undefined;
};

const matchesFilter = (
  item: WatchHistoryItem,
  isAnime: boolean,
  filterType?: 'movie' | 'tv' | 'anime' | 'soudflex'
): boolean => {
  switch (filterType) {
    case 'anime':
      return isAnime || item.media_type === 'anime';
    case 'movie':
      return item.media_type === 'movie' && !isAnime;
    case 'tv':
      return item.media_type === 'tv' && !isAnime;
    case 'soudflex':
      return !isAnime && item.media_type !== 'anime';
    default:
      return true;
  }
};


interface ContinueWatchingSectionProps {
  filterType?: 'movie' | 'tv' | 'anime' | 'soudflex';
  title?: string;
}

const ContinueWatchingSection = ({ filterType, title = 'Continue Watching' }: ContinueWatchingSectionProps = {}) => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const { openMovieModal, openTVModal } = useMedia();

  /**
   * Two phases so the row paints immediately:
   *  1. Render everything we can classify from the DB column or local cache.
   *  2. Resolve only the genuinely unknown items in the background, then patch
   *     the list and write both poster and anime flag back in one upsert.
   */
  const loadHistory = async () => {
    const data = await getWatchHistory();

    const unresolved: WatchHistoryItem[] = [];
    const firstPass = data.filter((item) => {
      const known = knownIsAnime(item);
      if (known === undefined) {
        unresolved.push(item);
        // Unknown items are optimistically shown on unfiltered rows only, so a
        // movie never flashes into the Anime row before it is classified.
        return filterType === undefined;
      }
      return matchesFilter(item, known, filterType);
    });

    setHistory(firstPass);

    if (unresolved.length === 0) return;

    // Phase 2 — background resolution, deduped and parallel.
    const resolved = await Promise.all(
      unresolved.map(async (item) => ({
        item,
        ...(await resolveDetails(item.id, item.media_type)),
      }))
    );

    const keyOf = (i: WatchHistoryItem) => `${i.media_type}-${i.id}`;
    const resolvedByKey = new Map(resolved.map((r) => [keyOf(r.item), r]));

    // Re-derive the whole list now that every item is classified.
    setHistory(
      data
        .map((item) => {
          const hit = resolvedByKey.get(keyOf(item));
          if (!hit) return item;
          return {
            ...item,
            is_anime: hit.isAnime,
            poster_path: item.poster_path || hit.poster || '',
          };
        })
        .filter((item) => matchesFilter(item, knownIsAnime(item) ?? false, filterType))
    );

    // Persist what we learned so the next visit needs no TMDB calls at all.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = resolved.map(({ item, poster, isAnime }) => ({
      user_id: user.id,
      media_id: item.id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path || poster || null,
      is_anime: isAnime,
      season_number: item.season_number ?? null,
      episode_number: item.episode_number ?? null,
      progress: item.progress,
      duration: Math.round(item.duration),
      updated_at: new Date(item.last_watched).toISOString(),
    }));

    if (rows.length > 0) {
      await supabase
        .from('watch_history')
        .upsert(rows as any, { onConflict: 'user_id, media_id, media_type' });
    }
  };


  useEffect(() => {
    loadHistory();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadHistory();
    });

    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener('watch-history-updated', handleHistoryUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('watch-history-updated', handleHistoryUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleRemove = async (e: React.MouseEvent, item: WatchHistoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    const previousHistory = history;
    setHistory(prev => prev.filter(i => !(i.id === item.id && i.media_type === item.media_type)));
    try {
      await removeFromHistory(item.id, item.media_type);
      toast.success(`Removed "${item.title}" from history`);
    } catch {
      setHistory(previousHistory);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleClearAll = async () => {
    await clearAllHistory();
    setHistory([]);
    window.dispatchEvent(new Event('watch-history-updated'));
  };

  const handleItemClick = (item: WatchHistoryItem) => {
    if (item.media_type === 'anime') {
      window.location.href = `/anime/${item.id}`;
      return;
    }
    
    if (item.media_type === 'movie') {
      // Create a compatible Movie object from the history item
      const movie: Movie = {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        // Provide defaults for fields missing in history but required by Movie type
        backdrop_path: '',
        overview: '',
        release_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        original_language: 'en',
        original_title: item.title,
        video: false,
        adult: false,
        genre_ids: []
      } as unknown as Movie;
      
      openMovieModal(movie);
    } else {
      const show: TVShow = {
        id: item.id,
        name: item.title,
        poster_path: item.poster_path,
        backdrop_path: '',
        overview: '',
        first_air_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        original_language: 'en',
        original_name: item.title,
        origin_country: [],
        genre_ids: []
      } as unknown as TVShow;

      openTVModal(show, {
        initialSeason: item.season_number ?? undefined,
        initialEpisode: item.episode_number ?? undefined,
      });
    }
  };

  if (history.length === 0) return null;

  return (
    <section className="py-8 md:py-10">
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear watch history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all items from your Continue Watching list. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {history.map((item) => {
          const posterUrl = getImageUrl(item.poster_path, 'w300');
          
          return (
            <div 
              key={`${item.media_type}-${item.id}`} 
              className="flex-shrink-0 w-36 md:w-44 cursor-pointer group relative"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                {posterUrl || item.media_type === 'anime' ? (
                  <img
                    src={item.media_type === 'anime' && item.poster_path ? item.poster_path : posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center px-2">
                    {item.title}
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary" fill="currentColor" />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-2 right-2 p-1.5 bg-background/60 hover:bg-destructive rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  title="Remove from history"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Episode Badge for TV Shows and Anime */}
                {(item.media_type === 'tv' || item.media_type === 'anime') && item.episode_number && (
                  <div className="absolute bottom-2 right-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    {item.media_type === 'tv' && item.season_number ? `S${item.season_number} ` : ''}E{item.episode_number}
                  </div>
                )}
                
                {/* Time reached label */}
                {item.progress > 0 && item.duration > 0 && (
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Stopped at {(() => {
                      const s = Math.floor(item.progress * item.duration);
                      const h = Math.floor(s / 3600);
                      const m = Math.floor((s % 3600) / 60);
                      return h > 0 ? `${h}h ${m}m` : `${m}m`;
                    })()}
                  </div>
                )}

                {/* Progress Bar */}
                {item.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              
              <p className="mt-2 text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.media_type}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
