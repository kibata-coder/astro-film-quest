import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getRecentAnime, getAnimeSeries, searchAnime, getAnimeList } from '@/lib/anilist';

export const useRecentAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'recent'],
    queryFn: ({ pageParam = 1 }) => getRecentAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

export const useSearchAnime = (searchQuery: string) => {
  return useQuery({
    queryKey: ['anilist', 'search', searchQuery],
    queryFn: () => searchAnime(searchQuery, 1, 30),
    enabled: !!searchQuery,
  });
};

export const useAnimeSeries = (id: number | null) => {
  return useQuery({
    queryKey: ['anilist', 'series', id],
    queryFn: () => (id ? getAnimeSeries(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
};

export const usePopularAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'popular'],
    queryFn: ({ pageParam = 1 }) => getAnimeList('POPULARITY_DESC', undefined, undefined, pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

export const useNewAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'new'],
    queryFn: ({ pageParam = 1 }) => getAnimeList('START_DATE_DESC', undefined, undefined, pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

export const useSeasonalAnime = () => {
  const season = getCurrentSeason();
  const year = new Date().getFullYear();
  
  return useInfiniteQuery({
    queryKey: ['anilist', 'seasonal', season, year],
    queryFn: ({ pageParam = 1 }) => getAnimeList('POPULARITY_DESC', season, year, pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};
