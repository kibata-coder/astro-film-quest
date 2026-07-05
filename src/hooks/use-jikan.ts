import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getRecentAnime, getPopularAnime, searchAnime, getAnimeDetails, getAnimeEpisodes, getNewAnime, getSeasonalAnime } from '@/lib/jikan';

export const useRecentAnime = () => {
  return useInfiniteQuery({
    queryKey: ['jikan', 'recent'],
    queryFn: ({ pageParam = 1 }) => getRecentAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useSearchAnime = (searchQuery: string) => {
  return useQuery({
    queryKey: ['jikan', 'search', searchQuery],
    queryFn: () => searchAnime(searchQuery, 1, 24),
    enabled: !!searchQuery,
  });
};

export const useAnimeSeries = (id: number | null) => {
  return useQuery({
    queryKey: ['jikan', 'series', id],
    queryFn: () => (id ? getAnimeDetails(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
};

export const useAnimeEpisodes = (id: number | null) => {
  return useInfiniteQuery({
    queryKey: ['jikan', 'episodes', id],
    queryFn: ({ pageParam = 1 }) => (id ? getAnimeEpisodes(id, pageParam) : Promise.reject('No ID')),
    initialPageParam: 1,
    enabled: !!id,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const usePopularAnime = () => {
  return useInfiniteQuery({
    queryKey: ['jikan', 'popular'],
    queryFn: ({ pageParam = 1 }) => getPopularAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useNewAnime = () => {
  return useInfiniteQuery({
    queryKey: ['jikan', 'new'],
    queryFn: ({ pageParam = 1 }) => getNewAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useSeasonalAnime = () => {
  return useInfiniteQuery({
    queryKey: ['jikan', 'seasonal'],
    queryFn: ({ pageParam = 1 }) => getSeasonalAnime(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};
