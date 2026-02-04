import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMovieEmbedUrl, getTVShowEmbedUrl, SERVER_OPTIONS, type ServerType } from '@/lib/vidsrc';
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
  server: ServerType;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  onChangeServer?: (server: ServerType) => void;
}

const VideoPlayer = ({ 
  isOpen, onClose, title, mediaId, mediaType, seasonNumber, episodeNumber, 
  totalEpisodes, episodeName, server, onNextEpisode, onPreviousEpisode, onChangeServer
}: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showServerMenu, setShowServerMenu] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mediaId) {
      const fetchDuration = async () => {
        try {
          if (mediaType === 'movie') {
            const details = await getMovieDetails(mediaId);
            durationRef.current = (details.runtime || 0) * 60;
          } else if (mediaType === 'tv') {
            const details = await getTVShowDetails(mediaId);
            const epRuntime = details.episode_run_time?.[0] || 45;
            durationRef.current = epRuntime * 60;
          }
        } catch (e) {
          console.error("Could not fetch runtime", e);
          durationRef.current = 7200;
        }
      };
      fetchDuration();
      startTimeRef.current = Date.now();
    }
  }, [isOpen, mediaId, mediaType]);

  const handleClose = () => {
    if (startTimeRef.current > 0 && durationRef.current > 0) {
      const timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;
      saveWatchProgress(
        { id: mediaId, media_type: mediaType, title: title, poster_path: "", season_number: seasonNumber, episode_number: episodeNumber },
        timeSpentSeconds, durationRef.current
      );
    }
    onClose();
  };

  const embedUrl = mediaType === 'tv' && seasonNumber && episodeNumber
    ? getTVShowEmbedUrl(mediaId, seasonNumber, episodeNumber, server)
    : getMovieEmbedUrl(mediaId, server);

  const isFirstEpisode = episodeNumber === 1;
  const isLastEpisode = episodeNumber === totalEpisodes;

  useEffect(() => {
    if (!isOpen) { startTimeRef.current = 0; }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      setShowServerMenu(false);
      const timer = setTimeout(() => setIsConnecting(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mediaId, seasonNumber, episodeNumber, server]);

  useEffect(() => {
    if (!isOpen || isConnecting) return;
    const startHideTimer = () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    };
    startHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [isOpen, isConnecting, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!isOpen) return null;
  const isTVShow = mediaType === 'tv' && seasonNumber && episodeNumber;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black" 
      onMouseMove={handleMouseMove} 
      onTouchStart={() => setShowControls(true)}
    >
      {isConnecting ? (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-white">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center">
            <p className="text-xl font-medium mb-2">Connecting to Server...</p>
            <p className="text-white/60">{title}</p>
          </div>
        </div>
      ) : (
        <>
          <iframe 
            src={embedUrl} 
            className="w-full h-full border-0 absolute inset-0 z-0" 
            allowFullScreen={true}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media" 
            referrerPolicy="origin" 
          />
          
          {/* TOP LEFT: Title Info */}
          <div className={`absolute top-4 left-4 z-50 flex flex-col gap-3 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 max-w-[80vw] text-left pointer-events-auto">
                <h2 className="text-white font-bold text-sm md:text-base truncate">{title}</h2>
                {isTVShow && (
                  <p className="text-white/70 text-xs md:text-sm truncate">
                    S{seasonNumber} E{episodeNumber}: {episodeName}
                  </p>
                )}
             </div>
          </div>

          {/* TOP RIGHT: Server Selector & Close Button */}
          <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Server Selector */}
            <div className="relative">
              <Button 
                onClick={() => setShowServerMenu(!showServerMenu)} 
                className="rounded-full px-3 h-10 bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-sm transition-colors pointer-events-auto flex items-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" />
                <span className="text-sm">{SERVER_OPTIONS.find(s => s.value === server)?.label}</span>
              </Button>
              
              {showServerMenu && (
                <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden pointer-events-auto">
                  {SERVER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChangeServer?.(option.value);
                        setShowServerMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                        server === option.value ? 'text-primary bg-white/5' : 'text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button 
              onClick={handleClose} 
              className="rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-red-500/80 text-white border border-white/10 backdrop-blur-sm transition-colors pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* CENTER SIDES: Navigation */}
          {isTVShow && totalEpisodes && (
            <>
              {/* Previous Button */}
              <div className={`absolute top-1/2 left-4 -translate-y-1/2 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onPreviousEpisode} 
                  disabled={isFirstEpisode} 
                  className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white disabled:opacity-0 pointer-events-auto"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              </div>

              {/* Next Button */}
              <div className={`absolute top-1/2 right-4 -translate-y-1/2 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onNextEpisode} 
                  disabled={isLastEpisode} 
                  className="rounded-full w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white disabled:opacity-0 pointer-events-auto"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
