import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAnimeStream, buildProxyUrl, type AnimeStream } from '@/lib/anime';

interface AnimePlayerProps {
  episodeId: string;
  initialCategory?: 'sub' | 'dub';
  title: string;
  subtitle?: string; // e.g. "S1 E3"
  hasDub?: boolean;
  onClose: () => void;
  onFallback?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const formatTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
};

const AnimePlayer = ({
  episodeId,
  initialCategory = 'sub',
  title,
  subtitle,
  hasDub,
  onClose,
  onFallback,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: AnimePlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const restoreTimeRef = useRef<number>(0);

  const [category, setCategory] = useState<'sub' | 'dub'>(initialCategory);
  const [stream, setStream] = useState<AnimeStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // --- Load stream (fires when episodeId or category changes) ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAnimeStream(episodeId, category)
      .then((s) => {
        if (cancelled) return;
        if (!s || !s.sources?.length) {
          setError('No playable source found.');
          setLoading(false);
          return;
        }
        setStream(s);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load stream.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [episodeId, category]);

  // --- Attach hls.js when stream is ready ---
  useEffect(() => {
    if (!stream) return;
    const video = videoRef.current;
    if (!video) return;

    // Pick highest-quality source (fallback to first)
    const sorted = [...stream.sources].sort((a, b) => {
      const pa = parseInt(a.quality) || 0;
      const pb = parseInt(b.quality) || 0;
      return pb - pa;
    });
    const primary = sorted[0];
    const proxiedUrl = buildProxyUrl(primary.url, stream.headers?.Referer);

    // Tear down previous hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const useNative = video.canPlayType('application/vnd.apple.mpegurl');

    const onLoadedMeta = () => {
      if (restoreTimeRef.current > 0) {
        video.currentTime = restoreTimeRef.current;
        restoreTimeRef.current = 0;
      }
      video.play().catch(() => {});
      setLoading(false);
    };

    video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });

    if (useNative && !primary.url.includes('.m3u8')) {
      // Direct mp4 (rare)
      video.src = proxiedUrl;
    } else if (useNative) {
      video.src = proxiedUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hlsRef.current = hls;
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          console.error('hls.js fatal error', data);
          setError('Playback error. Falling back…');
        }
      });
    } else {
      setError('Your browser does not support HLS playback.');
      setLoading(false);
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [stream]);

  // --- Video element listeners ---
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onDur = () => setDuration(v.duration || 0);
    const onVol = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('durationchange', onDur);
    v.addEventListener('volumechange', onVol);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('durationchange', onDur);
      v.removeEventListener('volumechange', onVol);
    };
  }, []);

  // --- Fullscreen tracking ---
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // --- Auto-hide controls ---
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [showControls]);

  // --- Keyboard ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return;
        onClose();
      }
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    showControls();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    showControls();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = parseFloat(e.target.value);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) {
      console.error('fullscreen failed', err);
    }
  };

  const switchCategory = (next: 'sub' | 'dub') => {
    if (next === category) return;
    const v = videoRef.current;
    restoreTimeRef.current = v?.currentTime ?? 0;
    setCategory(next);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* Video */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
        >
          {stream?.subtitles?.map((s, i) => (
            <track
              key={`${s.lang}-${i}`}
              kind="subtitles"
              srcLang={s.lang.slice(0, 2).toLowerCase()}
              label={s.lang}
              src={buildProxyUrl(s.url, stream.headers?.Referer)}
              default={s.lang.toLowerCase().includes('english')}
            />
          ))}
        </video>

        {/* Loading overlay */}
        {loading && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-foreground">{error}</p>
            <div className="flex gap-2">
              {onFallback && (
                <Button onClick={onFallback} variant="default">
                  Use fallback player
                </Button>
              )}
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div
          className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 transition-opacity ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
              {subtitle && <p className="truncate text-xs text-white/70">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasDub && (
              <div className="mr-2 flex overflow-hidden rounded-full border border-white/20 bg-black/40 text-xs">
                <button
                  onClick={() => switchCategory('sub')}
                  className={`px-3 py-1 transition-colors ${
                    category === 'sub'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  SUB
                </button>
                <button
                  onClick={() => switchCategory('dub')}
                  className={`px-3 py-1 transition-colors ${
                    category === 'dub'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  DUB
                </button>
              </div>
            )}

            {(hasPrev || hasNext) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-6 transition-opacity ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Scrubber */}
          <div className="flex items-center gap-3">
            <span className="w-12 text-xs tabular-nums text-white/80">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Seek"
              />
            </div>
            <span className="w-12 text-right text-xs tabular-nums text-white/80">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} aria-label="Play/Pause">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="group flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} aria-label="Mute">
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden w-20 cursor-pointer accent-primary sm:block"
                aria-label="Volume"
              />
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimePlayer;
