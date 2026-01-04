const VIDSRC_BASE_URL = 'https://vidsrc-embed.ru';

export interface VidsrcItem {
  tmdb_id: number;
  imdb_id: string;
  title: string;
  type?: 'movie' | 'tv';
}

export const getLatestMovies = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/movies/latest/page-${page}.json`);
    if (!response.ok) throw new Error('Failed to fetch latest movies');
    const data = await response.json();
    return Array.isArray(data) ? data.map((item: VidsrcItem) => ({ ...item, type: 'movie' as const })) : [];
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
    return Array.isArray(data) ? data.map((item: VidsrcItem) => ({ ...item, type: 'tv' as const })) : [];
  } catch (error) {
    console.error('Error fetching latest TV shows:', error);
    return [];
  }
};

export const getMovieEmbedUrl = (tmdbId: number): string => {
  return `${VIDSRC_BASE_URL}/embed/movie?tmdb=${tmdbId}&autoplay=1`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season?: number, episode?: number): string => {
  if (season !== undefined && episode !== undefined) {
    return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
  }
  return `${VIDSRC_BASE_URL}/embed/tv?tmdb=${tmdbId}`;
};
