import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Server, Maximize, Minimize } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Handle Fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

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
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    
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
            className="w-full h-full border-0" 
            allowFullScreen 
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media" 
            referrerPolicy="no-referrer-when-downgrade" 
          />
          
          {/* Top Right Controls: Fullscreen + Close */}
          <div className={`absolute top-4 right-4 flex items-center gap-3 z-50 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="rounded-full w-10 h-10 bg-black/40 hover:bg-black/60 text-white hover:text-white backdrop-blur-sm border border-white/10"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>

            <Button 
              onClick={handleClose} 
              className="rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-red-500/80 text-white border border-white/10 backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Server Switcher - Lifted up to avoid bottom collision */}
          <div className={`absolute left-0 right-0 flex justify-center gap-4 transition-all duration-300 z-40 pointer-events-none ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${isTVShow && totalEpisodes ? 'bottom-32' : 'bottom-20'}`}>
            <div className={`bg-black/60 backdrop-blur-sm p-1.5 rounded-full flex gap-2 border border-white/10 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <Button variant={server === 'vidsrc' ? "default" : "ghost"} size="sm" onClick={() => setServer('vidsrc')} className="h-8 rounded-full px-4 text-xs font-medium"><Server className="w-3 h-3 mr-2" />Server 1</Button>
              <Button variant={server === 'superembed' ? "default" : "ghost"} size="sm" onClick={() => setServer('superembed')} className="h-8 rounded-full px-4 text-xs font-medium"><Server className="w-3 h-3 mr-2" />Server 2</Button>
            </div>
          </div>

          {/* Episode Navigation Overlay - Lifted with pb-16 to reveal native controls */}
          {isTVShow && totalEpisodes && (
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-16 pt-20 px-4 transition-all duration-300 pointer-events-none z-30 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={onPreviousEpisode} 
                  disabled={isFirstEpisode} 
                  className={`flex items-center gap-2 text-white hover:bg-white/10 disabled:opacity-30 h-12 px-6 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <ChevronLeft className="w-6 h-6" /><span className="hidden sm:inline font-medium">Previous</span>
                </Button>
                
                <div className="text-center flex-1 px-4 text-white">
                  <p className="text-xs sm:text-sm text-white/60 font-medium uppercase tracking-wider mb-1">Season {seasonNumber} • Episode {episodeNumber}</p>
                  <p className="font-bold text-base sm:text-lg truncate max-w-[200px] sm:max-w-md mx-auto leading-tight">{episodeName}</p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={onNextEpisode} 
                  disabled={isLastEpisode} 
                  className={`flex items-center gap-2 text-white hover:bg-white/10 disabled:opacity-30 h-12 px-6 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <span className="hidden sm:inline font-medium">Next</span><ChevronRight className="w-6 h-6" />
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
