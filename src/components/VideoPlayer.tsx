import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  // New props for episode navigation
  totalEpisodes?: number;
  episodeName?: string;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
}

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
  onPreviousEpisode
}: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const embedUrl = mediaType === 'tv' && seasonNumber && episodeNumber
    ? `https://vidsrc-embed.ru/embed/tv?tmdb=${mediaId}&s=${seasonNumber}&e=${episodeNumber}&autoplay=1`
    : `https://vidsrc-embed.ru/embed/movie?tmdb=${mediaId}&autoplay=1`;

  const isFirstEpisode = episodeNumber === 1;
  const isLastEpisode = episodeNumber === totalEpisodes;

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mediaId, seasonNumber, episodeNumber]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (!isOpen || isConnecting) return;

    const startHideTimer = () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    startHideTimer();

    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isOpen, isConnecting, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (!isOpen) return null;

  const isTVShow = mediaType === 'tv' && seasonNumber && episodeNumber;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background"
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowControls(true)}
    >
      {isConnecting ? (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center">
            <p className="text-xl font-medium mb-2">Connecting...</p>
            <p className="text-muted-foreground">{title}</p>
            {isTVShow && (
              <p className="text-sm text-muted-foreground">S{seasonNumber} E{episodeNumber}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-all z-10 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Episode Navigation Controls - Only for TV shows */}
          {isTVShow && totalEpisodes && (
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-4 py-6 transition-all duration-300 ${
                showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                {/* Previous Episode Button */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onPreviousEpisode}
                  disabled={isFirstEpisode}
                  className="flex items-center gap-2 text-foreground hover:bg-foreground/10 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Current Episode Info */}
                <div className="text-center flex-1 px-4">
                  <p className="text-sm text-muted-foreground">
                    Season {seasonNumber} • Episode {episodeNumber} of {totalEpisodes}
                  </p>
                  {episodeName && (
                    <p className="text-foreground font-medium truncate max-w-xs sm:max-w-md mx-auto">
                      {episodeName}
                    </p>
                  )}
                </div>

                {/* Next Episode Button */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onNextEpisode}
                  disabled={isLastEpisode}
                  className="flex items-center gap-2 text-foreground hover:bg-foreground/10 disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
