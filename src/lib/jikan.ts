import axios from 'axios';

const JIKAN_URL = 'https://api.jikan.moe/v4';

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  score: number | null;
  genres: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

// Ensure delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestTime = 0;
const MIN_DELAY = 333; // ~3 requests per second limit for Jikan

const fetchWithRateLimit = async <T>(url: string, params: any = {}): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_DELAY) {
    await delay(MIN_DELAY - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
  
  const response = await axios.get<T>(`${JIKAN_URL}${url}`, { params });
  return response.data;
};

export const getRecentAnime = async (page = 1, limit = 20): Promise<JikanResponse<JikanAnime[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime[]>>('/seasons/now', { page, limit });
};

export const getPopularAnime = async (page = 1, limit = 20): Promise<JikanResponse<JikanAnime[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime[]>>('/top/anime', { page, limit });
};

export const getNewAnime = async (page = 1, limit = 20): Promise<JikanResponse<JikanAnime[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime[]>>('/seasons/upcoming', { page, limit });
};

export const getSeasonalAnime = async (page = 1, limit = 20): Promise<JikanResponse<JikanAnime[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime[]>>('/seasons/now', { page, limit });
};

export const searchAnime = async (q: string, page = 1, limit = 20): Promise<JikanResponse<JikanAnime[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime[]>>('/anime', { q, page, limit, order_by: 'popularity', sort: 'desc' });
};

export const getAnimeDetails = async (id: number): Promise<JikanResponse<JikanAnime>> => {
  return fetchWithRateLimit<JikanResponse<JikanAnime>>(`/anime/${id}`);
};

export interface JikanEpisode {
  mal_id: number;
  url: string | null;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  duration: number | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

export const getAnimeEpisodes = async (id: number, page = 1): Promise<JikanResponse<JikanEpisode[]>> => {
  return fetchWithRateLimit<JikanResponse<JikanEpisode[]>>(`/anime/${id}/episodes`, { page });
};
