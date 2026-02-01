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
  searchTVShows,
  // Genres
  getActionMovies, getAdventureMovies, getComedyMovies, getDramaMovies, 
  getHorrorMovies, getSciFiMovies, getFantasyMovies, getRomanceMovies, 
  getThrillerMovies, getWesternMovies, getCrimeMovies, getWarMovies 
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
    staleTime: 1000 * 60 * 60,
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

// --- Genre Hooks (Cached for 1 hour) ---
export const useActionMovies = () => useQuery({ queryKey: ['movies', 'genre_action'], queryFn: () => getActionMovies(), staleTime: 3600000 });
export const useAdventureMovies = () => useQuery({ queryKey: ['movies', 'genre_adventure'], queryFn: () => getAdventureMovies(), staleTime: 3600000 });
export const useComedyMovies = () => useQuery({ queryKey: ['movies', 'genre_comedy'], queryFn: () => getComedyMovies(), staleTime: 3600000 });
export const useDramaMovies = () => useQuery({ queryKey: ['movies', 'genre_drama'], queryFn: () => getDramaMovies(), staleTime: 3600000 });
export const useHorrorMovies = () => useQuery({ queryKey: ['movies', 'genre_horror'], queryFn: () => getHorrorMovies(), staleTime: 3600000 });
export const useSciFiMovies = () => useQuery({ queryKey: ['movies', 'genre_scifi'], queryFn: () => getSciFiMovies(), staleTime: 3600000 });
export const useFantasyMovies = () => useQuery({ queryKey: ['movies', 'genre_fantasy'], queryFn: () => getFantasyMovies(), staleTime: 3600000 });
export const useRomanceMovies = () => useQuery({ queryKey: ['movies', 'genre_romance'], queryFn: () => getRomanceMovies(), staleTime: 3600000 });
export const useThrillerMovies = () => useQuery({ queryKey: ['movies', 'genre_thriller'], queryFn: () => getThrillerMovies(), staleTime: 3600000 });
export const useWesternMovies = () => useQuery({ queryKey: ['movies', 'genre_western'], queryFn: () => getWesternMovies(), staleTime: 3600000 });
export const useCrimeMovies = () => useQuery({ queryKey: ['movies', 'genre_crime'], queryFn: () => getCrimeMovies(), staleTime: 3600000 });
export const useWarMovies = () => useQuery({ queryKey: ['movies', 'genre_war'], queryFn: () => getWarMovies(), staleTime: 3600000 });

// --- Search Hooks ---

export const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { movies: [], tvShows: [] };
      
      const results = await Promise.allSettled([
        searchMovies(query),
        searchTVShows(query)
      ]);

      const movies = results[0].status === 'fulfilled' ? results[0].value.results || [] : [];
      const tvShows = results[1].status === 'fulfilled' ? results[1].value.results || [] : [];

      return { movies, tvShows };
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 1,
  });
};
