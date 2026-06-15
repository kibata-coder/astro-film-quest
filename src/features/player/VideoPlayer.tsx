import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMovieEmbedUrl, getTVShowEmbedUrl, getProviders } from '@/lib/vidsrc';
import { saveWatchProgress } from '@/lib/watchHistory';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  totalEpisodes?: number;
  episodeName?: string;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  anilistId?: number;
}

const PROVIDER_STORAGE_KEY = 'soudflex.preferredProvider';

const VideoPlayer = ({
  isOpen,
  onClose,
  title,
  mediaId,
  mediaType,
  seasonNumber,
  episodeNumber,
  totalEpisodes,
  episodeName,
  onNextEpisode,
  onPreviousEpisode,
  anilistId,
}: VideoPlayerProps) => {
  const providers = getProviders();
  const [providerIdx, setProviderIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
    const n = stored ? parseInt(stored, 10) : 0;
    return Number.isFinite(n) && n >= 0 && n < providers.length ? n : 0;
  });
  
  const [audioTrack, setAudioTrack] = useState<'sub' | 'dub'>('sub');
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  
  // 4Animo Exact Progress Tracking Refs
  const animoTimeRef = useRef<number>(0);
  const animoDurationRef = useRef<number>(0);

  // Safety Fallback: If user tries to load Server 4 on a non-anime, force fallback to Server 1
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const currentProvider = providers[providerIdx];
      if (currentProvider?.id === '4animo' && !anilistId) {
        setProviderIdx(0);
      }
    }
  }, [isOpen, providerIdx, anilistId, providers]);

  // Player Events: Listen for 4Animo postMessage broadcasts (Auto-next & Progress)
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { return; }
      }

      if (data && typeof data === 'object') {
        if (data.event === 'complete') {
          // Trigger Auto-Next instantly when episode ends
          if (mediaType === 'tv' && totalEpisodes && episodeNumber !== totalEpisodes && onNextEpisode) {
            onNextEpisode();
          }
        } else if (data.event === 'time') {
          // Sync exact watch time directly from the 4Animo iframe
          if (typeof data.time === 'number') animoTimeRef.current = data.time;
          if (typeof data.duration === 'number') animoDurationRef.current = data.duration;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, mediaType, totalEpisodes, episodeNumber, onNextEpisode]);

  // Standard setup listeners
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n) && n >= 0 && n < providers.length) {
          setProviderIdx(n);
        }
      }
    }
  }, [isOpen, providers.length]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mediaId) return;

    const fetchDuration = async () => {
      try {
        if (mediaType === 'movie') {
          const details = await getMovieDetails(mediaId);
          durationRef.current = (details.runtime || 0) * 60;
          return;
        }
        const details = await getTVShowDetails(mediaId);
        durationRef.current = (details.episode_run_time?.[0] || 45) * 60;
      } catch (error) {
        console.error('Could not fetch runtime', error);
        durationRef.current = 7200;
      }
    };

    fetchDuration();
    startTimeRef.current = Date.now();
  }, [isOpen, mediaId, mediaType]);

  useEffect(() => {
    if (!isOpen) {
      startTimeRef.current = 0;
      animoTimeRef.current = 0;
      animoDurationRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, mediaId, mediaType, title, seasonNumber, episodeNumber]);

  const handleClose = () => {
    let timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;
    let duration = durationRef.current;

    // Override local timer with exact 4Animo tracking data if present
    if (animoTimeRef.current > 0) {
      timeSpentSeconds = animoTimeRef.current;
      if (animoDurationRef.current > 0) duration = animoDurationRef.current;
    }

    if (startTimeRef.current > 0 && duration > 0) {
      saveWatchProgress(
        {
          id: mediaId,
          media_type: mediaType,
          title,
          poster_path: '',
          season_number: seasonNumber,
          episode_number: episodeNumber,
        },
        timeSpentSeconds,
        duration
      );
    }

    // Reset tracking blocks for next play session
    animoTimeRef.current = 0;
    animoDurationRef.current = 0;
    onClose();
  };

  const embedUrl =
    mediaType === 'tv' && seasonNumber && episodeNumber
      ? getTVShowEmbedUrl(mediaId, seasonNumber, episodeNumber, providerIdx, title, anilistId, audioTrack)
      : getMovieEmbedUrl(mediaId, providerIdx, title, anilistId, audioTrack);

  const isTVShow = mediaType === 'tv' && seasonNumber && episodeNumber;
  const isFirstEpisode = episodeNumber === 1;
  const isLastEpisode = episodeNumber === totalEpisodes;
  const showNextEpisodeButton = isTVShow && totalEpisodes && !isLastEpisode && onNextEpisode;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          {isTVShow && (
            <p className="truncate text-xs text-muted-foreground">
              S{seasonNumber} E{episodeNumber}: {episodeName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Server Selector Dropdown */}
          <select
            value={providerIdx}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              setProviderIdx(idx);
              window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(idx));
            }}
            className="rounded bg-secondary text-secondary-foreground px-2 py-1 text-xs font-medium border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {providers.map((p, index) => {
              // Hide Server 4 dynamically if the current media is NOT an anime
              if (p.id === '4animo' && !anilistId) return null;
              return (
                <option key={p.id} value={index}>
                  {p.name}
                </option>
              );
            })}
          </select>

          {/* SUB / DUB Toggle Selection Component (Only shown for anime) */}
          {anilistId && (
            <div className="flex overflow-hidden rounded border border-border bg-secondary/50 text-xs">
              <button
                type="button"
                onClick={() => setAudioTrack('sub')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  audioTrack === 'sub'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                SUB
              </button>
              <button
                type="button"
                onClick={() => setAudioTrack('dub')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  audioTrack === 'dub'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                DUB
              </button>
            </div>
          )}

          {isTVShow && totalEpisodes && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPreviousEpisode}
                disabled={isFirstEpisode}
                aria-label="Previous episode"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextEpisode}
                disabled={isLastEpisode}
                aria-label="Next episode"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close player">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 bg-black">
        {/* NO iframe sandbox attribute used to preserve full messaging and encryption contexts */}
        <iframe
          key={`${mediaId}-${seasonNumber ?? 'm'}-${episodeNumber ?? 'm'}-${providerIdx}-${audioTrack}`}
          src={embedUrl}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          allowFullScreen={true}
          allowfullscreen="true"
          referrerPolicy="no-referrer"
        />
        {showNextEpisodeButton && (
          <Button
            size="lg"
            onClick={onNextEpisode}
            className="absolute bottom-20 right-6 gap-2 rounded-full bg-white px-6 font-semibold text-black shadow-lg hover:bg-white/90"
          >
            <SkipForward className="h-5 w-5" />
            Next Episode
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
