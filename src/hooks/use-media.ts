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
  searchPeople,
  getAnimeTVShows,
  getAnimeMovies,
  getPersonDetails,
  getPersonCombinedCredits,
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
    staleTime: 1000 * 60 * 5,
  });
};

export const useIndianMovies = (enabled = true) => {
  return useQuery({
    queryKey: ['movies', 'indian'],
    queryFn: () => getIndianMovies(),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
};

export const useEnglishMovies = (enabled = true) => {
  return useQuery({
    queryKey: ['movies', 'english'],
    queryFn: () => getEnglishMovies(),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
};

export const useOtherMovies = (enabled = true) => {
  return useQuery({
    queryKey: ['movies', 'other'],
    queryFn: () => getOtherMovies(),
    staleTime: 1000 * 60 * 60,
    enabled,
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

export const useIndianTVShows = (enabled = true) => {
  return useQuery({
    queryKey: ['tv', 'indian'],
    queryFn: () => getIndianTVShows(),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
};

export const useEnglishTVShows = (enabled = true) => {
  return useQuery({
    queryKey: ['tv', 'english'],
    queryFn: () => getEnglishTVShows(),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
};

// --- Anime + Genre Hooks (factory keeps each as a stable, individually-named hook) ---
const ONE_HOUR = 1000 * 60 * 60;

const makeListHook = <T,>(key: readonly string[], fn: () => Promise<T>) =>
  (enabled = true) =>
    // Wrap fn so react-query's QueryFunctionContext isn't forwarded as
    // the `page` argument (TMDB rejects it with "Invalid page").
    useQuery({ queryKey: [...key], queryFn: () => fn(), staleTime: ONE_HOUR, enabled });

export const useAnimeTVShows = makeListHook(['tv', 'anime'], getAnimeTVShows);
export const useAnimeMovies = makeListHook(['movies', 'anime'], getAnimeMovies);

export const useActionMovies     = makeListHook(['movies', 'genre_action'],    getActionMovies);
export const useAdventureMovies  = makeListHook(['movies', 'genre_adventure'], getAdventureMovies);
export const useComedyMovies     = makeListHook(['movies', 'genre_comedy'],    getComedyMovies);
export const useDramaMovies      = makeListHook(['movies', 'genre_drama'],     getDramaMovies);
export const useHorrorMovies     = makeListHook(['movies', 'genre_horror'],    getHorrorMovies);
export const useSciFiMovies      = makeListHook(['movies', 'genre_scifi'],     getSciFiMovies);
export const useFantasyMovies    = makeListHook(['movies', 'genre_fantasy'],   getFantasyMovies);
export const useRomanceMovies    = makeListHook(['movies', 'genre_romance'],   getRomanceMovies);
export const useThrillerMovies   = makeListHook(['movies', 'genre_thriller'],  getThrillerMovies);
export const useWesternMovies    = makeListHook(['movies', 'genre_western'],   getWesternMovies);
export const useCrimeMovies      = makeListHook(['movies', 'genre_crime'],     getCrimeMovies);
export const useWarMovies        = makeListHook(['movies', 'genre_war'],       getWarMovies);

// --- Search Hooks ---
// react-query passes an AbortSignal that fires when the query key changes
// (e.g. user keeps typing). Propagating it cancels in-flight TMDB requests.

export const useSearchMedia = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async ({ signal }) => {
      if (!query) return { movies: [], tvShows: [] };

      const results = await Promise.allSettled([
        searchMovies(query, 1, signal),
        searchTVShows(query, 1, signal),
      ]);

      const movies = results[0].status === 'fulfilled' ? results[0].value.results || [] : [];
      const tvShows = results[1].status === 'fulfilled' ? results[1].value.results || [] : [];

      return { movies, tvShows };
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 1,
  });
};
