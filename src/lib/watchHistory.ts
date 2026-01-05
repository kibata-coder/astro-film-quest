import { z } from 'zod';

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

// Schema for validating watch history items from localStorage
const WatchHistoryItemSchema = z.object({
  mediaType: z.enum(['movie', 'tv']),
  mediaId: z.number().int().positive(),
  title: z.string().max(500),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  timestamp: z.number().int().positive(),
  seasonNumber: z.number().int().min(0).max(100).optional(),
  episodeNumber: z.number().int().min(1).max(1000).optional(),
  episodeName: z.string().max(500).optional(),
});

// Sanitize string to prevent XSS (strips HTML tags)
const sanitizeString = (str: string): string => {
  return str.replace(/<[^>]*>/g, '').trim();
};

// Validate image path to ensure it's a valid TMDB path
const validateImagePath = (path: string | null): string | null => {
  if (!path) return null;
  // TMDB paths start with / and contain only alphanumeric, dash, underscore, and dot
  if (!/^\/[a-zA-Z0-9_\-\.]+$/.test(path)) {
    return null;
  }
  return path;
};

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each item and filter out invalid ones
    return parsed
      .map((item: unknown) => {
        try {
          return WatchHistoryItemSchema.parse(item);
        } catch {
          return null;
        }
      })
      .filter((item): item is WatchHistoryItem => item !== null);
  } catch {
    return [];
  }
};

export const saveToWatchHistory = (item: Omit<WatchHistoryItem, 'timestamp'>): void => {
  try {
    // Validate and sanitize input
    if (!Number.isInteger(item.mediaId) || item.mediaId < 1) {
      console.error('Invalid mediaId');
      return;
    }
    
    if (item.mediaType !== 'movie' && item.mediaType !== 'tv') {
      console.error('Invalid mediaType');
      return;
    }
    
    const history = getWatchHistory();
    
    // Remove existing entry for the same media
    const filteredHistory = history.filter(
      (h) => !(h.mediaId === item.mediaId && h.mediaType === item.mediaType)
    );
    
    // Sanitize and validate the new item
    const newItem: WatchHistoryItem = {
      mediaType: item.mediaType,
      mediaId: item.mediaId,
      title: sanitizeString(item.title || 'Unknown').slice(0, 500),
      posterPath: validateImagePath(item.posterPath),
      backdropPath: validateImagePath(item.backdropPath),
      timestamp: Date.now(),
      ...(item.seasonNumber !== undefined && { seasonNumber: Math.min(Math.max(0, Math.floor(item.seasonNumber)), 100) }),
      ...(item.episodeNumber !== undefined && { episodeNumber: Math.min(Math.max(1, Math.floor(item.episodeNumber)), 1000) }),
      ...(item.episodeName !== undefined && { episodeName: sanitizeString(item.episodeName).slice(0, 500) }),
    };
    
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save watch history:', error);
  }
};

export const removeFromWatchHistory = (mediaId: number, mediaType: 'movie' | 'tv'): void => {
  try {
    // Validate input
    if (!Number.isInteger(mediaId) || mediaId < 1) {
      console.error('Invalid mediaId');
      return;
    }
    
    if (mediaType !== 'movie' && mediaType !== 'tv') {
      console.error('Invalid mediaType');
      return;
    }
    
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