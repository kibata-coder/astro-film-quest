import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
}

const VideoPlayer = ({ isOpen, onClose, movieTitle }: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  // Demo video URL (Big Buck Bunny)
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      const timer = setTimeout(() => {
        setIsConnecting(false);
        setIsPlaying(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isConnecting && videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [isConnecting, isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-background"
      onMouseMove={handleMouseMove}
    >
      {isConnecting ? (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center">
            <p className="text-xl font-medium mb-2">Connecting...</p>
            <p className="text-muted-foreground">{movieTitle}</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onClick={handlePlayPause}
          />

          {/* Controls overlay */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="absolute top-4 left-4">
              <h2 className="text-xl font-semibold">{movieTitle}</h2>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent">
              {/* Progress bar */}
              <div
                className="w-full h-1 bg-secondary/50 rounded-full cursor-pointer mb-4 group"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-primary rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 fill-current" />
                    )}
                  </button>

                  <button
                    onClick={handleMute}
                    className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-6 h-6" />
                  ) : (
                    <Maximize className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
