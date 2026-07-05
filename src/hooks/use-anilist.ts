import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  getTrendingAnime, 
  getPopularAnime, 
  getUpcomingAnime, 
  getSeasonalAnime, 
  searchAnime, 
  getAnimeDetails 
} from '@/lib/anilist';

export const useTrendingAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'trending'],
    queryFn: ({ pageParam = 1 }) => getTrendingAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageInfo.hasNextPage) {
        return lastPage.pageInfo.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const usePopularAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'popular'],
    queryFn: ({ pageParam = 1 }) => getPopularAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageInfo.hasNextPage) {
        return lastPage.pageInfo.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useUpcomingAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'upcoming'],
    queryFn: ({ pageParam = 1 }) => getUpcomingAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageInfo.hasNextPage) {
        return lastPage.pageInfo.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useSeasonalAnime = () => {
  return useInfiniteQuery({
    queryKey: ['anilist', 'seasonal'],
    queryFn: ({ pageParam = 1 }) => getSeasonalAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageInfo.hasNextPage) {
        return lastPage.pageInfo.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useSearchAnime = (searchQuery: string) => {
  return useQuery({
    queryKey: ['anilist', 'search', searchQuery],
    queryFn: () => searchAnime(searchQuery, 1, 24),
    enabled: !!searchQuery && searchQuery.length >= 3,
  });
};

export const useAnimeSeries = (id: number | null) => {
  return useQuery({
    queryKey: ['anilist', 'series', id],
    queryFn: () => (id ? getAnimeDetails(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
};
