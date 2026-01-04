import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  movieId: number;
}

const VideoPlayer = ({ isOpen, onClose, movieTitle, movieId }: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);

  const embedUrl = `https://vidsrc-embed.su/embed/movie?tmdb=${movieId}&autoplay=1`;

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      const timer = setTimeout(() => {
        setIsConnecting(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background">
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
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            referrerPolicy="no-referrer"
          />

          {/* Close button - more prominent */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-full bg-destructive hover:bg-destructive/80 transition-colors z-10 shadow-lg"
            title="Close player"
          >
            <X className="w-6 h-6 text-destructive-foreground" />
          </button>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
