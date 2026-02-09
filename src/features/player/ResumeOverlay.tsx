import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getProgressForMedia } from '@/lib/watchHistory';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';

interface ResumeOverlayProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  isVisible: boolean;
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const ResumeOverlay = ({ mediaId, mediaType, isVisible }: ResumeOverlayProps) => {
  const [timeReached, setTimeReached] = useState<string>('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShow(false);
      return;
    }

    const loadProgress = async () => {
      const p = await getProgressForMedia(mediaId, mediaType);
      if (p > 0.01 && p < 0.95) {
        try {
          let durationMin = 0;
          if (mediaType === 'movie') {
            const details = await getMovieDetails(mediaId);
            durationMin = details.runtime || 0;
          } else {
            const details = await getTVShowDetails(mediaId);
            durationMin = details.episode_run_time?.[0] || 45;
          }
          const totalSeconds = durationMin * 60;
          const watchedSeconds = p * totalSeconds;
          setTimeReached(formatTime(watchedSeconds));
        } catch {
          setTimeReached(`${Math.round(p * 100)}%`);
        }
        setShow(true);
        const timer = setTimeout(() => setShow(false), 10000);
        return () => clearTimeout(timer);
      }
    };
    loadProgress();
  }, [mediaId, mediaType, isVisible]);

  if (!show || !timeReached) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-background/80 backdrop-blur-md px-5 py-3 rounded-xl border border-border/30 flex items-center gap-3 shadow-lg">
        <Clock className="w-5 h-5 text-primary shrink-0" />
        <div className="text-sm">
          <p className="text-foreground font-medium">
            You stopped at <span className="text-primary font-bold">{timeReached}</span>
          </p>
          <p className="text-muted-foreground text-xs">Use the player's seek bar to jump ahead</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeOverlay;
