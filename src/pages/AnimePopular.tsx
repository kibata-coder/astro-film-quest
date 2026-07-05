import InfiniteAnimePage from '@/components/InfiniteAnimePage';
import { usePopularAnime } from '@/hooks/use-jikan';
import { Flame } from 'lucide-react';

const AnimePopular = () => {
  return (
    <InfiniteAnimePage
      title="Popular Anime"
      icon={Flame}
      useQueryHook={usePopularAnime}
    />
  );
};

export default AnimePopular;
