import { supabase } from '@/integrations/supabase/client';

export interface WatchHistoryItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  season_number?: number;
  episode_number?: number;
  last_watched: number; // timestamp
}

const LOCAL_STORAGE_KEY = 'watch-history';

// Helper to get local history
const getLocalHistory = (): WatchHistoryItem[] => {
  const history = localStorage.getItem(LOCAL_STORAGE_KEY);
  return history ? JSON.parse(history) : [];
};

export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    // Map Supabase format to App format
    return data.map(item => ({
      id: item.media_id,
      media_type: item.media_type as 'movie' | 'tv',
      title: item.title,
      poster_path: item.poster_path || '',
      season_number: item.season_number || undefined,
      episode_number: item.episode_number || undefined,
      last_watched: new Date(item.updated_at).getTime(),
    }));
  }

  // Fallback to LocalStorage
  return getLocalHistory();
};

export const addToHistory = async (item: Omit<WatchHistoryItem, 'last_watched'>) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Save to Supabase
    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: user.id,
        media_id: item.id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
        season_number: item.season_number,
        episode_number: item.episode_number,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, media_id, media_type'
      });

    if (error) console.error('Error saving history to cloud:', error);
  } else {
    // Save to LocalStorage
    const history = getLocalHistory();
    const newHistory = [
      { ...item, last_watched: Date.now() },
      ...history.filter((i) => i.id !== item.id || i.media_type !== item.media_type),
    ].slice(0, 20); // Keep last 20 items

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  }
};

export const removeFromHistory = async (id: number, mediaType: 'movie' | 'tv') => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('watch_history')
      .delete()
      .eq('media_id', id)
      .eq('media_type', mediaType);
  } else {
    const history = getLocalHistory();
    const newHistory = history.filter(
      (item) => !(item.id === id && item.media_type === mediaType)
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  }
};
