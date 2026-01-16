import { useQuery } from '@tanstack/react-query';
import { 
  getTrendingMovies, 
  getIndianMovies, 
  getEnglishMovies, 
  getOtherMovies, 
  getTrendingTVShows, 
  getIndianTVShows, 
  getEnglishTVShows,
  searchMovies,
  searchTVShows
} from '@/lib/tmdb';

// --- Movies Hooks ---

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => getTrendingMovies(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useIndianMovies = () => {
  return useQuery({
    queryKey: ['movies', 'indian'],
    queryFn: () => getIndianMovies(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useEnglishMovies = () => {
  return useQuery({
    queryKey: ['movies', 'english'],
    queryFn: () => getEnglishMovies(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useOtherMovies = () => {
  return useQuery({
    queryKey: ['movies', 'other'],
    queryFn: () => getOtherMovies(),
    staleTime: 1000 * 60 * 60,
  });
};

// --- TV Shows Hooks ---

export const useTrendingTVShows = () => {
  return useQuery({
    queryKey: ['tv', 'trending'],
    queryFn: () => getTrendingTVShows(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useIndianTVShows = () => {
  return useQuery({
    queryKey: ['tv', 'indian'],
    queryFn: () => getIndianTVShows(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useEnglishTVShows = () => {
  return useQuery({
    queryKey: ['tv', 'english'],
    queryFn: () => getEnglishTVShows(),
    staleTime: 1000 * 60 * 60,
  });
};

// --- Search Hooks ---

export const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { movies: [], tvShows: [] };
      const [movies, tvShows] = await Promise.all([
        searchMovies(query),
        searchTVShows(query)
      ]);
      return { 
        movies: movies.results || [], 
        tvShows: tvShows.results || [] 
      };
    },
    enabled: !!query, // Only run if query exists
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
