import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const providers = getProviders();
  const [providerIdx, setProviderIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
    const n = stored ? parseInt(stored, 10) : 0;
    return Number.isFinite(n) && n >= 0 && n < providers.length ? n : 0;
  });
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setIsConnecting(true);
    const timer = setTimeout(() => setIsConnecting(false), 1200);

    return () => clearTimeout(timer);
  }, [isOpen, mediaId, seasonNumber, episodeNumber, providerIdx]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, mediaId, mediaType, title, seasonNumber, episodeNumber]);

  const handleProviderChange = (value: string) => {
    const idx = parseInt(value, 10);
    if (!Number.isFinite(idx)) return;
    setProviderIdx(idx);
    try {
      window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(idx));
    } catch {
      // ignore quota / privacy errors
    }
  };

  const handleClose = () => {
    if (startTimeRef.current > 0 && durationRef.current > 0) {
      const timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;

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
        durationRef.current
      );
    }

    onClose();
  };

  const embedUrl =
    mediaType === 'tv' && seasonNumber && episodeNumber
      ? getTVShowEmbedUrl(mediaId, seasonNumber, episodeNumber, providerIdx)
      : getMovieEmbedUrl(mediaId, providerIdx);

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

        <div className="flex items-center gap-1">
          <Select value={String(providerIdx)} onValueChange={handleProviderChange}>
            <SelectTrigger
              className="h-8 w-auto gap-1 border-border/60 bg-transparent px-2 text-xs"
              aria-label="Select streaming server"
            >
              <SelectValue placeholder="Server" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p, i) => (
                <SelectItem key={p.id} value={String(i)} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(embedUrl, '_blank', 'noopener,noreferrer')}
            aria-label="Open stream in new tab"
            title="Open in new tab"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>

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

      <div className="relative flex-1">
        {isConnecting ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="loading-spinner h-12 w-12" />
            <div>
              <p className="text-base font-medium text-foreground">Connecting stream...</p>
              <p className="text-sm text-muted-foreground">
                {title} · {providers[providerIdx].name}
              </p>
            </div>
          </div>
        ) : (
          <>
            <iframe
              key={`${mediaId}-${seasonNumber ?? 'm'}-${episodeNumber ?? 'm'}-${providerIdx}`}
              src={embedUrl}
              className="h-full w-full border-0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
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
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
