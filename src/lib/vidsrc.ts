import { z } from 'zod';

const VIDSRC_BASE_URL = 'https://vidsrc-embed.ru';

// Schema for validating external API responses
const VidsrcItemSchema = z.object({
  tmdb_id: z.union([z.string(), z.number()]).transform(val => String(val)),
  imdb_id: z.string().max(20).default(''),
  title: z.string().max(500).default('Unknown'),
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

// Validate page parameter
const validatePage = (page: number): number => {
  if (!Number.isInteger(page) || page < 1 || page > 100) {
    throw new Error('Invalid page parameter');
  }
  return page;
};

// Sanitize string to prevent XSS (strips HTML tags)
const sanitizeString = (str: string): string => {
  return str.replace(/<[^>]*>/g, '').trim();
};

// Parse and validate external API response
const parseVidsrcResponse = (data: unknown, type: 'movie' | 'tv'): VidsrcItem[] => {
  try {
    const parsed = VidsrcResponseSchema.parse(data);
    const items = Array.isArray(parsed) ? parsed : (parsed.result ?? []);
    
    return items.map(item => ({
      tmdb_id: item.tmdb_id,
      imdb_id: item.imdb_id,
      title: sanitizeString(item.title),
      type: type,
    }));
  } catch (error) {
    console.error('Failed to validate vidsrc response:', error);
    return [];
  }
};

export const getLatestMovies = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const validPage = validatePage(page);
    const response = await fetch(`${VIDSRC_BASE_URL}/movies/latest/page-${validPage}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest movies');
    const data = await response.json();
    return parseVidsrcResponse(data, 'movie');
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
};

export const getLatestTVShows = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const validPage = validatePage(page);
    const response = await fetch(`${VIDSRC_BASE_URL}/tvshows/latest/page-${validPage}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest TV shows');
    const data = await response.json();
    return parseVidsrcResponse(data, 'tv');
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
};

// Validate TMDB ID
const validateTmdbId = (tmdbId: number): number => {
  if (!Number.isInteger(tmdbId) || tmdbId < 1 || tmdbId > 999999999) {
    throw new Error('Invalid TMDB ID');
  }
  return tmdbId;
};

// Validate season/episode numbers
const validateEpisodeParams = (season?: number, episode?: number): { season?: number; episode?: number } => {
  if (season !== undefined) {
    if (!Number.isInteger(season) || season < 0 || season > 100) {
      throw new Error('Invalid season number');
    }
  }
  if (episode !== undefined) {
    if (!Number.isInteger(episode) || episode < 1 || episode > 1000) {
      throw new Error('Invalid episode number');
    }
  }
  return { season, episode };
};

export const getMovieEmbedUrl = (tmdbId: number): string => {
  const validId = validateTmdbId(tmdbId);
  return `${VIDSRC_BASE_URL}/embed/movie?tmdb=${validId}&autoplay=1`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season?: number, episode?: number): string => {
  const validId = validateTmdbId(tmdbId);
  const validParams = validateEpisodeParams(season, episode);
  
  if (validParams.season !== undefined && validParams.episode !== undefined) {
    return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${validId}&season=${validParams.season}&episode=${validParams.episode}&autoplay=1`;
  }
  return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${validId}`;
};