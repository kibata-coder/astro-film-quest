import { supabase } from '@/integrations/supabase/client';

export interface WatchHistoryItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  season_number?: number;
  episode_number?: number;
  last_watched: number;
  progress: number;
  duration: number;
  completed: boolean;
}

const LOCAL_STORAGE_KEY = 'watch-history';

const getLocalHistory = (): WatchHistoryItem[] => {
  const history = localStorage.getItem(LOCAL_STORAGE_KEY);
  return history ? JSON.parse(history) : [];
};

export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return [];

    return data.map(item => ({
      id: item.media_id,
      media_type: item.media_type as 'movie' | 'tv',
      title: item.title,
      poster_path: item.poster_path || '',
      season_number: item.season_number || undefined,
      episode_number: item.episode_number || undefined,
      last_watched: new Date(item.updated_at).getTime(),
      progress: item.progress || 0,
      duration: 0,
      completed: (item.progress || 0) > 0.8
    }));
  }
  return getLocalHistory();
};

export const saveWatchProgress = async (
  item: { id: number; media_type: 'movie' | 'tv'; title: string; poster_path: string; season_number?: number; episode_number?: number; },
  secondsWatched: number,
  totalDuration: number
) => {
  const { data: { user } } = await supabase.auth.getUser();
  const progress = totalDuration > 0 ? Math.min(secondsWatched / totalDuration, 1) : 0;
  const isCompleted = progress > 0.8;

  if (user) {
    await supabase.from('watch_history').upsert({
      user_id: user.id,
      media_id: item.id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      season_number: item.season_number,
      episode_number: item.episode_number,
      progress: progress,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, media_id, media_type' });
  } else {
    const history = getLocalHistory();
    const filtered = history.filter((i) => i.id !== item.id || i.media_type !== item.media_type);
    const newItem: WatchHistoryItem = { ...item, last_watched: Date.now(), progress, duration: totalDuration, completed: isCompleted };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newItem, ...filtered].slice(0, 20)));
  }
};

export const removeFromHistory = async (id: number, mediaType: 'movie' | 'tv') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('watch_history').delete().eq('media_id', id).eq('media_type', mediaType);
  } else {
    const history = getLocalHistory();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.filter(i => !(i.id === id && i.media_type === mediaType))));
  }
};

export const addToHistory = async (item: Omit<WatchHistoryItem, 'last_watched' | 'progress' | 'duration' | 'completed'>) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check if entry already exists - if so, don't overwrite progress
    const { data: existing } = await supabase
      .from('watch_history')
      .select('progress')
      .eq('user_id', user.id)
      .eq('media_id', item.id)
      .eq('media_type', item.media_type)
      .maybeSingle();

    // Only insert/update if no existing entry or entry has no progress
    if (!existing || existing.progress === 0) {
      await supabase.from('watch_history').upsert({
        user_id: user.id,
        media_id: item.id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
        season_number: item.season_number,
        episode_number: item.episode_number,
        progress: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, media_id, media_type' });
    } else {
      // Just update the timestamp to bring it to top
      await supabase.from('watch_history')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('media_id', item.id)
        .eq('media_type', item.media_type);
    }
  } else {
    // Local storage fallback
    const history = getLocalHistory();
    const existingItem = history.find(i => i.id === item.id && i.media_type === item.media_type);
    
    if (existingItem) {
      // Move to top without resetting progress
      const filtered = history.filter(i => !(i.id === item.id && i.media_type === item.media_type));
      existingItem.last_watched = Date.now();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([existingItem, ...filtered].slice(0, 20)));
    } else {
      const newItem: WatchHistoryItem = { ...item, last_watched: Date.now(), progress: 0, duration: 0, completed: false };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newItem, ...history].slice(0, 20)));
    }
  }
};

export const getUserSignals = async () => getWatchHistory();
