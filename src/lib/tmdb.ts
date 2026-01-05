import { supabase } from '@/integrations/supabase/client';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'original') => {
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

async function callTMDB<T>(endpoint: string, params?: Record<string, string | number>): Promise<TMDBResponse<T> & T> {
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { endpoint, params }
  });

  if (error) {
    console.error('TMDB API error:', error);
    throw error;
  }

  return data;
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
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

// TV Show types
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
}

export const getTrendingMovies = async (page = 1) => {
  return callTMDB<Movie>('/trending/movie/week', { page });
};

export const searchMovies = async (query: string, page = 1) => {
  return callTMDB<Movie>('/search/movie', { query, page });
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

// Indian movies (Hindi, Tamil, Telugu, Malayalam, Kannada)
export const getIndianMovies = async (page = 1) => {
  return callTMDB<Movie>('/discover/movie', {
    page,
    with_original_language: 'hi|ta|te|ml|kn',
    sort_by: 'popularity.desc'
  });
};

// English movies
export const getEnglishMovies = async (page = 1) => {
  return callTMDB<Movie>('/discover/movie', {
    page,
    with_original_language: 'en',
    sort_by: 'popularity.desc'
  });
};

// Other languages (excluding Indian and English)
export const getOtherMovies = async (page = 1) => {
  return callTMDB<Movie>('/discover/movie', {
    page,
    without_original_language: 'en,hi,ta,te,ml,kn',
    sort_by: 'popularity.desc'
  });
};

// TV Show API functions
export const getTrendingTVShows = async (page = 1) => {
  return callTMDB<TVShow>('/trending/tv/week', { page });
};

export const searchTVShows = async (query: string, page = 1) => {
  return callTMDB<TVShow>('/search/tv', { query, page });
};

export const getTVShowDetails = async (tvId: number): Promise<TVShowDetails> => {
  return callTMDB<TVShowDetails>(`/tv/${tvId}`);
};

export const getTVShowSeasonDetails = async (tvId: number, seasonNumber: number) => {
  return callTMDB<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
};

// Indian TV shows
export const getIndianTVShows = async (page = 1) => {
  return callTMDB<TVShow>('/discover/tv', {
    page,
    with_original_language: 'hi|ta|te|ml|kn',
    sort_by: 'popularity.desc'
  });
};

// English TV shows
export const getEnglishTVShows = async (page = 1) => {
  return callTMDB<TVShow>('/discover/tv', {
    page,
    with_original_language: 'en',
    sort_by: 'popularity.desc'
  });
};

// Other TV shows
export const getOtherTVShows = async (page = 1) => {
  return callTMDB<TVShow>('/discover/tv', {
    page,
    without_original_language: 'en,hi,ta,te,ml,kn',
    sort_by: 'popularity.desc'
  });
};
