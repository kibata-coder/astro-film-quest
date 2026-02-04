import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMovieEmbedUrl, getTVShowEmbedUrl, type StreamingServer } from '@/lib/vidsrc';
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

const VideoPlayer = ({ 
  isOpen, onClose, title, mediaId, mediaType, seasonNumber, episodeNumber, 
  totalEpisodes, episodeName, onNextEpisode, onPreviousEpisode
}: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [server, setServer] = useState<StreamingServer>('vidsrc');
  
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
    if (!isOpen) { setServer('vidsrc'); startTimeRef.current = 0; }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
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
            <p className="text-xl font-medium mb-2">Connecting to {server === 'vidsrc' ? 'Server 1' : 'Server 2'}...</p>
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
            referrerPolicy="no-referrer-when-downgrade" 
          />
          
          {/* TOP LEFT: Title & Server Switcher 
            (Moved to the top so the bottom is 100% clear)
          */}
          <div className={`absolute top-4 left-4 z-50 flex flex-col gap-3 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 max-w-[80vw] text-left pointer-events-auto">
                <h2 className="text-white font-bold text-sm md:text-base truncate">{title}</h2>
                {isTVShow && (
                  <p className="text-white/70 text-xs md:text-sm truncate">
                    S{seasonNumber} E{episodeNumber}: {episodeName}
                  </p>
                )}
             </div>

             <div className="flex gap-2 pointer-events-auto self-start">
               <div className="bg-black/60 backdrop-blur-sm p-1 rounded-full flex gap-1 border border-white/10">
                 <Button 
                    variant={server === 'vidsrc' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setServer('vidsrc')} 
                    className="h-7 rounded-full px-3 text-[10px] md:text-xs font-medium"
                 >
                   <Server className="w-3 h-3 mr-1.5" />Server 1
                 </Button>
                 <Button 
                    variant={server === 'superembed' ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setServer('superembed')} 
                    className="h-7 rounded-full px-3 text-[10px] md:text-xs font-medium"
                 >
                   <Server className="w-3 h-3 mr-1.5" />Server 2
                 </Button>
               </div>
             </div>
          </div>

          {/* TOP RIGHT: Close Button Only 
            (Removed custom fullscreen button so you use the native one)
          */}
          <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Button 
              onClick={handleClose} 
              className="rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-red-500/80 text-white border border-white/10 backdrop-blur-sm transition-colors pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* CENTER SIDES: Navigation 
            (Absolutely positioned individually to avoid any container blocking the bottom)
          */}
          {isTVShow && totalEpisodes && (
            <>
              {/* Previous Button - Left Center */}
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

              {/* Next Button - Right Center */}
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
