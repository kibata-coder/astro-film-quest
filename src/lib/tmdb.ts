import { supabase } from '@/integrations/supabase/client';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const TMDB_FN_URL = `${SUPABASE_URL}/functions/v1/tmdb`;

export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Default to w1280 (not 'original') — multi-MB backdrops kill mobile bandwidth.
export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

interface TMDBResponse<T> {
  results?: T[];
  page?: number;
  total_pages?: number;
  total_results?: number;
  [key: string]: unknown;
}

async function callTMDB<T>(
  endpoint: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<TMDBResponse<T> & T> {
  // Use cacheable GET so the browser HTTP cache (and any CDN in front of the
  // edge function) can serve repeats instantly. The edge function also
  // caches in-memory per isolate. AbortSignal cancels in-flight requests
  // (e.g. when a debounced search query supersedes a previous one).
  try {
    const qs = new URLSearchParams({ endpoint });
    if (params) qs.set('params', JSON.stringify(params));

    const res = await fetch(`${TMDB_FN_URL}?${qs.toString()}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      signal,
    });
    if (!res.ok) throw new Error(`TMDB ${endpoint} ${res.status}`);
    return await res.json();
  } catch (err) {
    // Propagate aborts so react-query treats them as cancellations, not errors
    if ((err as { name?: string })?.name === 'AbortError') throw err;
    console.warn('TMDB GET failed, falling back to invoke', err);
    const { data, error } = await supabase.functions.invoke('tmdb', {
      body: { endpoint, params },
    });
    if (error) throw error;
    return data;
  }
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
  } | null;
}

export interface Collection {
  id: number;
  name: string;
  parts: Movie[];
}

export interface Person {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path: string | null;
  known_for_department?: string;
  popularity?: number;
  also_known_as?: string[];
}

export interface PersonCredit {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  overview?: string;
  popularity?: number;
  character?: string;
  job?: string;
  department?: string;
  credit_id: string;
}

export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  known_for?: Array<{ title?: string; name?: string; media_type: string }>;
  popularity?: number;
}
export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}


export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  size?: number;
  published_at?: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  number_of_seasons?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface TVShowDetails extends TVShow {
  seasons: Season[];
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  episode_run_time?: number[];
}

// --- BASIC FETCHERS ---

export const getTrendingMovies = async (page = 1) => {
  return callTMDB<Movie>('/trending/movie/week', { page });
};

export const searchMovies = async (query: string, page = 1, signal?: AbortSignal) => {
  return callTMDB<Movie>('/search/movie', { query, page }, signal);
};

export const getMovieDetails = async (movieId: number) => {
  return callTMDB<Movie>(`/movie/${movieId}`);
};

export const getMovieCredits = async (movieId: number) => {
  return callTMDB<{ cast: Cast[] }>(`/movie/${movieId}/credits`);
};

export const getMovieVideos = async (movieId: number) => {
  const data = await callTMDB<Video>(`/movie/${movieId}/videos`);
  return data.results || [];
};

export const getWatchProviders = async (movieId: number) => {
  const data = await callTMDB<{ results: Record<string, { flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }> }>(`/movie/${movieId}/watch/providers`);
  return data.results?.US || null;
};

// --- DISCOVER HELPERS ---

const INDIAN_LANGS = 'hi|ta|te|ml|kn';
const NON_INDIAN_EN_LANGS = 'en,hi,ta,te,ml,kn';

const discoverMovie = (params: Record<string, string | number>, page = 1) =>
  callTMDB<Movie>('/discover/movie', { page, sort_by: 'popularity.desc', ...params });

const discoverTV = (params: Record<string, string | number>, page = 1) =>
  callTMDB<TVShow>('/discover/tv', { page, sort_by: 'popularity.desc', ...params });

export const getIndianMovies = (page = 1) => discoverMovie({ with_original_language: INDIAN_LANGS }, page);
export const getEnglishMovies = (page = 1) => discoverMovie({ with_original_language: 'en' }, page);
export const getOtherMovies = (page = 1) => discoverMovie({ without_original_language: NON_INDIAN_EN_LANGS }, page);

export const getTrendingTVShows = async (page = 1) => {
  return callTMDB<TVShow>('/trending/tv/week', { page });
};

export const searchTVShows = async (query: string, page = 1, signal?: AbortSignal) => {
  return callTMDB<TVShow>('/search/tv', { query, page }, signal);
};

export const getTVShowDetails = async (tvId: number): Promise<TVShowDetails> => {
  return callTMDB<TVShowDetails>(`/tv/${tvId}`);
};

export const getTVShowSeasonDetails = async (tvId: number, seasonNumber: number) => {
  return callTMDB<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
};

export const getIndianTVShows = (page = 1) => discoverTV({ with_original_language: INDIAN_LANGS }, page);
export const getEnglishTVShows = (page = 1) => discoverTV({ with_original_language: 'en' }, page);
export const getOtherTVShows = (page = 1) => discoverTV({ without_original_language: NON_INDIAN_EN_LANGS }, page);

// --- ANIME FETCHERS (Animation genre + Japanese original audio) ---

export const getAnimeTVShows = (page = 1) => discoverTV({ with_genres: '16', with_original_language: 'ja' }, page);
export const getAnimeMovies = (page = 1) => discoverMovie({ with_genres: '16', with_original_language: 'ja' }, page);

// --- GENRE FETCHERS ---

const GENRE_IDS = {
  action: '28', adventure: '12', comedy: '35', drama: '18',
  horror: '27', scifi: '878', fantasy: '14', romance: '10749',
  thriller: '53', western: '37', crime: '80', war: '10752',
} as const;

const byGenre = (id: string) => (page = 1) => discoverMovie({ with_genres: id }, page);

export const getActionMovies = byGenre(GENRE_IDS.action);
export const getAdventureMovies = byGenre(GENRE_IDS.adventure);
export const getComedyMovies = byGenre(GENRE_IDS.comedy);
export const getDramaMovies = byGenre(GENRE_IDS.drama);
export const getHorrorMovies = byGenre(GENRE_IDS.horror);
export const getSciFiMovies = byGenre(GENRE_IDS.scifi);
export const getFantasyMovies = byGenre(GENRE_IDS.fantasy);
export const getRomanceMovies = byGenre(GENRE_IDS.romance);
export const getThrillerMovies = byGenre(GENRE_IDS.thriller);
export const getWesternMovies = byGenre(GENRE_IDS.western);
export const getCrimeMovies = byGenre(GENRE_IDS.crime);
export const getWarMovies = byGenre(GENRE_IDS.war);

// --- DISCOVER WITH FILTERS ---

export interface DiscoverFilters {
  genre?: string;
  year?: string;
  rating?: string;
  language?: string;
  sortBy?: string;
  page?: number;
}

const buildDiscoverParams = (
  filters: DiscoverFilters,
  dateField: 'primary_release_date' | 'first_air_date',
): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    sort_by: filters.sortBy || 'popularity.desc',
    page: filters.page || 1,
  };
  if (filters.genre) params.with_genres = filters.genre;
  if (filters.year) {
    params[`${dateField}.gte`] = `${filters.year}-01-01`;
    params[`${dateField}.lte`] = `${filters.year}-12-31`;
  }
  if (filters.rating) params['vote_average.gte'] = filters.rating;
  if (filters.language) params.with_original_language = filters.language;
  return params;
};

export const discoverMovies = (filters: DiscoverFilters = {}) =>
  callTMDB<Movie>('/discover/movie', buildDiscoverParams(filters, 'primary_release_date'));

export const discoverTVShows = (filters: DiscoverFilters = {}) =>
  callTMDB<TVShow>('/discover/tv', buildDiscoverParams(filters, 'first_air_date'));

// --- SMART RECOMMENDATION ENGINE ---

export const getMovieRecommendations = async (movieId: number) => {
  try {
    let results: Movie[] = [];
    const movie = await callTMDB<Movie>(`/movie/${movieId}`);

    if (movie.belongs_to_collection) {
      const collection = await callTMDB<Collection>(`/collection/${movie.belongs_to_collection.id}`);
      if (collection.parts && collection.parts.length > 0) {
        results = collection.parts.filter(p => p.id !== movieId);
      }
    }

    if (results.length === 0) {
      const similar = await callTMDB<Movie>(`/movie/${movieId}/similar`);
      results = similar.results || [];
    }

    results = results.filter(m => m.poster_path && (m.vote_average > 5.0 || m.vote_count === 0));

    if (results.length === 0) {
      const recs = await callTMDB<Movie>(`/movie/${movieId}/recommendations`);
      return recs;
    }

    return { results: results, page: 1, total_pages: 1, total_results: results.length };
  } catch (error) {
    console.error("Smart recommendation error:", error);
    return callTMDB<Movie>(`/movie/${movieId}/recommendations`);
  }
};

export const getTVShowRecommendations = async (tvId: number) => {
  try {
    const similar = await callTMDB<TVShow>(`/tv/${tvId}/similar`);
    let results = similar.results || [];
    results = results.filter(show => show.poster_path && (show.vote_average > 5.0 || show.vote_count === 0));

    if (results.length === 0) return callTMDB<TVShow>(`/tv/${tvId}/recommendations`);

    return { results: results, page: 1, total_pages: 1, total_results: results.length };
  } catch (e) {
    console.warn('Failed to fetch similar shows', e);
    return callTMDB<TVShow>(`/tv/${tvId}/recommendations`);
  }
};
