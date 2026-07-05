import InfiniteAnimePage from '@/components/InfiniteAnimePage';
import { useNewAnime } from '@/hooks/use-jikan';
import { Sparkles } from 'lucide-react';

const AnimeNew = () => {
  return (
    <InfiniteAnimePage
      title="New Releases"
      icon={Sparkles}
      useQueryHook={useNewAnime}
    />
  );
};

export default AnimeNew;
