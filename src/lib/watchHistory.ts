export interface WatchHistoryItem {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  timestamp: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
}

const STORAGE_KEY = 'watch_history';
const MAX_HISTORY_ITEMS = 20;

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveToWatchHistory = (item: Omit<WatchHistoryItem, 'timestamp'>): void => {
  try {
    const history = getWatchHistory();
    
    // Remove existing entry for the same media
    const filteredHistory = history.filter(
      (h) => !(h.mediaId === item.mediaId && h.mediaType === item.mediaType)
    );
    
    // Add new entry at the beginning
    const newItem: WatchHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };
    
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save watch history:', error);
  }
};

export const removeFromWatchHistory = (mediaId: number, mediaType: 'movie' | 'tv'): void => {
  try {
    const history = getWatchHistory();
    const filteredHistory = history.filter(
      (h) => !(h.mediaId === mediaId && h.mediaType === mediaType)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Failed to remove from watch history:', error);
  }
};

export const clearWatchHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear watch history:', error);
  }
};
