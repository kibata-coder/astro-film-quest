import InfiniteAnimePage from '@/components/InfiniteAnimePage';
import { useUpcomingAnime } from '@/hooks/use-anilist';
import { Sparkles } from 'lucide-react';

const AnimeNew = () => {
  return (
    <InfiniteAnimePage
      title="New Releases"
      icon={Sparkles}
      useQueryHook={useUpcomingAnime}
    />
  );
};

export default AnimeNew;
