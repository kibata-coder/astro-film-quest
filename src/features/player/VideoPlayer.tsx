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
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

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
    <div className="fixed inset-0 z-[100] bg-background" onMouseMove={handleMouseMove} onTouchStart={() => setShowControls(true)}>
      {isConnecting ? (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center">
            <p className="text-xl font-medium mb-2">Connecting to {server === 'vidsrc' ? 'Server 1' : 'Server 2'}...</p>
            <p className="text-muted-foreground">{title}</p>
          </div>
        </div>
      ) : (
        <>
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media" referrerPolicy="no-referrer-when-downgrade" />
          <button onClick={handleClose} className={`absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-all z-10 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}><X className="w-6 h-6" /></button>
          
          <div className={`absolute left-0 right-0 flex justify-center gap-4 transition-all duration-300 z-20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${isTVShow && totalEpisodes ? 'bottom-24' : 'bottom-8'}`}>
            <div className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full flex gap-2 border border-white/10">
              <Button variant={server === 'vidsrc' ? "default" : "ghost"} size="sm" onClick={() => setServer('vidsrc')} className="h-8 rounded-full px-4 text-xs font-medium"><Server className="w-3 h-3 mr-2" />Server 1 (Fast)</Button>
              <Button variant={server === 'superembed' ? "default" : "ghost"} size="sm" onClick={() => setServer('superembed')} className="h-8 rounded-full px-4 text-xs font-medium"><Server className="w-3 h-3 mr-2" />Server 2 (Backup)</Button>
            </div>
          </div>

          {isTVShow && totalEpisodes && (
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-4 py-6 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Button variant="ghost" size="lg" onClick={onPreviousEpisode} disabled={isFirstEpisode} className="flex items-center gap-2 text-foreground hover:bg-foreground/10 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /><span className="hidden sm:inline">Previous</span></Button>
                <div className="text-center flex-1 px-4"><p className="text-sm text-muted-foreground">Season {seasonNumber} • Episode {episodeNumber} of {totalEpisodes}</p><p className="text-foreground font-medium truncate max-w-xs sm:max-w-md mx-auto">{episodeName}</p></div>
                <Button variant="ghost" size="lg" onClick={onNextEpisode} disabled={isLastEpisode} className="flex items-center gap-2 text-foreground hover:bg-foreground/10 disabled:opacity-30"><span className="hidden sm:inline">Next</span><ChevronRight className="w-5 h-5" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
