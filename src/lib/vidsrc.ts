import { z } from 'zod';

const VIDSRC_BASE_URL = 'https://vidsrc-embed.ru';

// 1. Define the Server Type
export type StreamingServer = 'vidsrc' | 'superembed';

// Zod schema for validating individual items from the API
const VidsrcItemSchema = z.object({
  tmdb_id: z.string(),
  imdb_id: z.string(),
  title: z.string(),
  type: z.enum(['movie', 'tv']).optional(),
});

// Schema for the API response (can be array directly or wrapped in result)
const VidsrcResponseSchema = z.union([
  z.object({ result: z.array(VidsrcItemSchema) }),
  z.array(VidsrcItemSchema),
]);

export interface VidsrcItem {
  tmdb_id: string;
  imdb_id: string;
  title: string;
  type?: 'movie' | 'tv';
}

// Helper function to safely validate and extract items from API response
const validateAndExtractItems = (data: unknown, mediaType: 'movie' | 'tv'): VidsrcItem[] => {
  try {
    const validated = VidsrcResponseSchema.parse(data);
    const items = Array.isArray(validated) ? validated : validated.result;
    return items.map((item): VidsrcItem => ({
      tmdb_id: item.tmdb_id,
      imdb_id: item.imdb_id,
      title: item.title,
      type: mediaType,
    }));
  } catch (validationError) {
    console.error('API response validation failed:', validationError);
    return [];
  }
};

export const getLatestMovies = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/movies/latest/page-${page}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest movies');
    const data = await response.json();
    return validateAndExtractItems(data, 'movie');
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
};

export const getLatestTVShows = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/tvshows/latest/page-${page}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest TV shows');
    const data = await response.json();
    return validateAndExtractItems(data, 'tv');
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
};

// 2. Updated URL Generators with Server Support
export const getMovieEmbedUrl = (tmdbId: number, server: StreamingServer = 'vidsrc'): string => {
  if (server === 'superembed') {
    return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
  }
  // Default to VidSrc
  return `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season?: number, episode?: number, server: StreamingServer = 'vidsrc'): string => {
  if (server === 'superembed') {
    if (season !== undefined && episode !== undefined) {
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    }
    return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
  }
  
  // Default to VidSrc
  if (season !== undefined && episode !== undefined) {
    return `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  }
  return `https://vidsrc.net/embed/tv?tmdb=${tmdbId}`;
};
