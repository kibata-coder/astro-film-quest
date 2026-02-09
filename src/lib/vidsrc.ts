import { z } from 'zod';

// Server 1: Vidsrc - vidsrc-embed.ru
const VIDSRC_BASE_URL = 'https://vidsrc-embed.ru';

// Server 2: SuperEmbed/MultiEmbed - multiembed.mov
const SUPEREMBED_BASE_URL = 'https://multiembed.mov';

export type ServerType = 'vidsrc' | 'superembed';

// Schema definitions for the "Latest" API
const VidsrcItemSchema = z.object({
  tmdb_id: z.string(),
  imdb_id: z.string(),
  title: z.string(),
  type: z.enum(['movie', 'tv']).optional(),
});

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

// --- API: Latest Listings (Vidsrc only) ---

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

// --- Server 1: Vidsrc Embed URLs ---

const getVidsrcMovieUrl = (tmdbId: number): string => {
  return `${VIDSRC_BASE_URL}/embed/movie?tmdb=${tmdbId}&autoplay=1`;
};

const getVidsrcTVShowUrl = (tmdbId: number, season?: number, episode?: number): string => {
  if (season !== undefined && episode !== undefined) {
    return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
  }
  return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}`;
};

// --- Server 2: SuperEmbed/MultiEmbed Embed URLs (VIP directstream) ---

const getSuperembedMovieUrl = (tmdbId: number): string => {
  return `${SUPEREMBED_BASE_URL}/directstream.php?video_id=${tmdbId}&tmdb=1`;
};

const getSuperembedTVShowUrl = (tmdbId: number, season?: number, episode?: number): string => {
  if (season !== undefined && episode !== undefined) {
    return `${SUPEREMBED_BASE_URL}/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
  }
  return `${SUPEREMBED_BASE_URL}/directstream.php?video_id=${tmdbId}&tmdb=1&s=1&e=1`;
};

// --- Public API: Get Embed URLs based on Server Selection ---

export const getMovieEmbedUrl = (tmdbId: number, server: ServerType = 'vidsrc'): string => {
  switch (server) {
    case 'superembed':
      return getSuperembedMovieUrl(tmdbId);
    case 'vidsrc':
    default:
      return getVidsrcMovieUrl(tmdbId);
  }
};

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  server: ServerType = 'vidsrc'
): string => {
  switch (server) {
    case 'superembed':
      return getSuperembedTVShowUrl(tmdbId, season, episode);
    case 'vidsrc':
    default:
      return getVidsrcTVShowUrl(tmdbId, season, episode);
  }
};

// Server display names
export const SERVER_OPTIONS: { value: ServerType; label: string }[] = [
  { value: 'vidsrc', label: 'Server 1' },
  { value: 'superembed', label: 'Server 2' },
];
