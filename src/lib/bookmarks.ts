import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const checkIsBookmarked = async (mediaId: number, mediaType: 'movie' | 'tv') => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .maybeSingle();

  return !!data;
};

export const toggleBookmark = async (
  mediaId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  posterPath: string | null
): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    toast({
      title: "Login Required",
      description: "Please login to bookmark movies and shows.",
      variant: "destructive",
    });
    return false;
  }

  const isBookmarked = await checkIsBookmarked(mediaId, mediaType);

  if (isBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark.",
        variant: "destructive",
      });
      return true;
    }
    
    toast({ description: "Removed from your list" });
    return false;
  } else {
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: session.user.id,
        media_id: mediaId,
        media_type: mediaType,
        title: title,
        poster_path: posterPath
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add bookmark.",
        variant: "destructive",
      });
      return false;
    }

    toast({ description: "Added to your list" });
    return true;
  }
};

// ADD THIS NEW FUNCTION
export const getBookmarks = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  return data || [];
};
