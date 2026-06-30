import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveWatchProgress } from '@/lib/watchHistory';

interface MegaPlayPlayerProps {
  malId: number;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const MegaPlayPlayer = ({
  malId,
  mediaId,
  mediaType,
  seasonNumber,
  episodeNumber,
  title,
  subtitle,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: MegaPlayPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  // Auto-hide controls
  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return;
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // MegaPlay Event Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      // Handle MegaPlay events
      if (data && (data.channel === 'megacloud' || data.type === 'watching-log' || data.event)) {
        if (data.event === 'complete' && hasNext && onNext) {
          onNext();
        }
        
        if (data.type === 'watching-log' && data.currentTime && data.duration) {
          saveWatchProgress(
            {
              id: mediaId,
              media_type: mediaType,
              title: title,
              poster_path: '', // Might not have poster here
              season_number: seasonNumber,
              episode_number: episodeNumber,
            },
            data.currentTime,
            data.duration
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [mediaId, mediaType, title, seasonNumber, episodeNumber, hasNext, onNext]);

  const iframeSrc = `https://megaplay.buzz/stream/mal/${malId}/${episodeNumber || 1}/sub`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <div className="relative flex-1 overflow-hidden bg-black">
        <iframe
          src={iframeSrc}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        ></iframe>

        {/* Top bar */}
        <div
          className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 transition-opacity ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
              {subtitle && <p className="truncate text-xs text-white/70">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {(hasPrev || hasNext) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  aria-label="Previous"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Next"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaPlayPlayer;
