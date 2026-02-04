import { z } from 'zod';

// Documentation specifies these domains: vidsrc-embed.ru , vidsrc-embed.su , vidsrcme.su , vsrc.su
// We will use vidsrc-embed.ru as the primary based on your examples.
const VIDSRC_BASE_URL = 'https://vidsrc-embed.ru';

// Schema definitions remain useful for the "Latest" API
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

// --- API: Latest Listings ---

export const getLatestMovies = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    // Endpoint: https://vidsrc-embed.ru/movies/latest/page-PAGE_NUMBER.json
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
    // Endpoint: https://vidsrc-embed.ru/tvshows/latest/page-PAGE_NUMBER.json
    const response = await fetch(`${VIDSRC_BASE_URL}/tvshows/latest/page-${page}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest TV shows');
    const data = await response.json();
    return validateAndExtractItems(data, 'tv');
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
};

// --- API: Embed URLs ---

export const getMovieEmbedUrl = (tmdbId: number): string => {
  // Endpoint: https://vidsrc-embed.ru/embed/movie?tmdb={id}
  // Autoplay enabled by default per docs (autoplay=1 is default)
  return `${VIDSRC_BASE_URL}/embed/movie?tmdb=${tmdbId}`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season?: number, episode?: number): string => {
  // Endpoint: https://vidsrc-embed.ru/embed/tv?tmdb={id}&season={s}&episode={e}
  if (season !== undefined && episode !== undefined) {
    return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  }
  // Fallback if season/episode missing (Show landing page)
  return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}`;
};
