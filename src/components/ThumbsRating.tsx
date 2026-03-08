import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';

interface ThumbsRatingProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

interface RatingCounts {
  likes: number;
  dislikes: number;
}

const ThumbsRating = ({ mediaId, mediaType }: ThumbsRatingProps) => {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<1 | -1 | null>(null);
  const [counts, setCounts] = useState<RatingCounts>({ likes: 0, dislikes: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCounts();
    if (user) fetchUserRating();
    else setUserRating(null);
  }, [mediaId, mediaType, user]);

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (error || !data) return;
    setCounts({
      likes: data.filter(r => r.rating === 1).length,
      dislikes: data.filter(r => r.rating === -1).length,
    });
  };

  const fetchUserRating = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .eq('user_id', user.id)
      .maybeSingle();

    setUserRating(data?.rating as 1 | -1 | null);
  };

  const handleRate = async (rating: 1 | -1) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setLoading(true);
    try {
      if (userRating === rating) {
        // Remove rating
        await supabase
          .from('ratings')
          .delete()
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .eq('user_id', user.id);
        setUserRating(null);
        setCounts(prev => ({
          ...prev,
          likes: rating === 1 ? prev.likes - 1 : prev.likes,
          dislikes: rating === -1 ? prev.dislikes - 1 : prev.dislikes,
        }));
      } else {
        // Upsert rating
        const { error } = await supabase
          .from('ratings')
          .upsert(
            {
              user_id: user.id,
              media_id: mediaId,
              media_type: mediaType,
              rating,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,media_id,media_type' }
          );
        if (error) throw error;

        const prevRating = userRating;
        setUserRating(rating);
        setCounts(prev => ({
          likes: prev.likes + (rating === 1 ? 1 : 0) - (prevRating === 1 ? 1 : 0),
          dislikes: prev.dislikes + (rating === -1 ? 1 : 0) - (prevRating === -1 ? 1 : 0),
        }));
      }
    } catch (err) {
      console.error('Rating error:', err);
      toast({ title: 'Failed to save rating', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (n: number) => (n > 0 ? n.toLocaleString() : '');

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleRate(1)}
        className={`gap-1.5 px-2.5 ${userRating === 1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <ThumbsUp className={`w-4 h-4 ${userRating === 1 ? 'fill-current' : ''}`} />
        <span className="text-xs">{formatCount(counts.likes)}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleRate(-1)}
        className={`gap-1.5 px-2.5 ${userRating === -1 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <ThumbsDown className={`w-4 h-4 ${userRating === -1 ? 'fill-current' : ''}`} />
        <span className="text-xs">{formatCount(counts.dislikes)}</span>
      </Button>
    </div>
  );
};

export default ThumbsRating;
