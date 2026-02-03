import { supabase } from '@/integrations/supabase/client';

export interface WatchHistoryItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  season_number?: number;
  episode_number?: number;
  last_watched: number;
  progress: number; // 0 to 1 (percentage)
  duration: number; // Seconds
  completed: boolean; // True if > 80%
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

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data.map(item => ({
      id: item.media_id,
      media_type: item.media_type as 'movie' | 'tv',
      title: item.title,
      poster_path: item.poster_path || '',
      season_number: item.season_number || undefined,
      episode_number: item.episode_number || undefined,
      last_watched: new Date(item.updated_at).getTime(),
      progress: item.progress || 0,
      duration: item.duration || 0,
      completed: (item.progress || 0) > 0.8
    }));
  }
  return getLocalHistory();
};

// THE OTT SIGNAL COLLECTOR
export const saveWatchProgress = async (
  item: {
    id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path: string;
    season_number?: number;
    episode_number?: number;
  },
  secondsWatched: number,
  totalDuration: number
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Calculate Progress (0.0 - 1.0)
  const progress = totalDuration > 0 ? Math.min(secondsWatched / totalDuration, 1) : 0;
  const isCompleted = progress > 0.8; // THE 80% RULE

  if (user) {
    // Save to Cloud
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
        progress: progress,
        duration: totalDuration,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, media_id, media_type'
      });
      
    if (error) console.error('Error saving progress:', error);
  } else {
    // Save to LocalStorage
    const history = getLocalHistory();
    // Remove existing entry for this movie
    const filtered = history.filter((i) => i.id !== item.id || i.media_type !== item.media_type);
    
    const newItem: WatchHistoryItem = {
      ...item,
      last_watched: Date.now(),
      progress,
      duration: totalDuration,
      completed: isCompleted
    };

    const newHistory = [newItem, ...filtered].slice(0, 20);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  }
};

export const addToHistory = async (item: Omit<WatchHistoryItem, 'last_watched' | 'progress' | 'duration' | 'completed'>) => {
  // Backwards compatibility wrapper
  return saveWatchProgress(item, 0, 0); 
};

// HELPER FOR RECOMMENDER ENGINE
export const getUserSignals = async () => {
  return getWatchHistory();
};
