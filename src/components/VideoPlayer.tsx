import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
}

const VideoPlayer = ({ isOpen, onClose, title, mediaId, mediaType, seasonNumber, episodeNumber }: VideoPlayerProps) => {
  const [isConnecting, setIsConnecting] = useState(true);

  // Security Note: We construct the URL carefully.
  // vidsrc-embed.ru is a third-party service. We cannot control its content,
  // but we can control how it behaves in our app using the iframe sandbox.
  const embedUrl = mediaType === 'tv' && seasonNumber && episodeNumber
    ? `https://vidsrc-embed.ru/embed/tv?tmdb=${mediaId}&season=${seasonNumber}&episode=${episodeNumber}&autoplay=1`
    : `https://vidsrc-embed.ru/embed/movie?tmdb=${mediaId}&autoplay=1`;

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
            <p className="text-muted-foreground">{title}</p>
            {mediaType === 'tv' && seasonNumber && episodeNumber && (
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
            // SECURITY FIX: Sandbox restricts the iframe from opening popups or redirecting the page.
            // 'allow-forms' 'allow-scripts' 'allow-same-origin' are needed for the player to work.
            // DO NOT add 'allow-popups' or 'allow-top-navigation'.
            sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
