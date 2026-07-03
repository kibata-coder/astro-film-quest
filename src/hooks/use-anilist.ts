import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getRecentAnime, getAnimeSeries } from '@/lib/anilist';

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

export const useAnimeSeries = (id: number | null) => {
  return useQuery({
    queryKey: ['anilist', 'series', id],
    queryFn: () => (id ? getAnimeSeries(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
};
