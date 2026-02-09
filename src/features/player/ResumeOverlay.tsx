import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getProgressForMedia } from '@/lib/watchHistory';

interface ResumeOverlayProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  isVisible: boolean;
}

const ResumeOverlay = ({ mediaId, mediaType, isVisible }: ResumeOverlayProps) => {
  const [progress, setProgress] = useState<number>(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShow(false);
      return;
    }

    const loadProgress = async () => {
      const p = await getProgressForMedia(mediaId, mediaType);
      if (p > 0.01 && p < 0.95) {
        setProgress(p);
        setShow(true);
        const timer = setTimeout(() => setShow(false), 5000);
        return () => clearTimeout(timer);
      }
    };
    loadProgress();
  }, [mediaId, mediaType, isVisible]);

  if (!show || progress === 0) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-background/80 backdrop-blur-md px-5 py-3 rounded-xl border border-border/30 flex items-center gap-3 shadow-lg">
        <Clock className="w-5 h-5 text-primary shrink-0" />
        <div className="text-sm">
          <p className="text-foreground font-medium">
            You were at <span className="text-primary font-bold">{Math.round(progress * 100)}%</span>
          </p>
          <p className="text-muted-foreground text-xs">Use the player's seek bar to jump ahead</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeOverlay;
