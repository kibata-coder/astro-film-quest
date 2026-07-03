import InfiniteAnimePage from '@/components/InfiniteAnimePage';
import { useSeasonalAnime } from '@/hooks/use-anilist';
import { Compass } from 'lucide-react';

const AnimeSeasonal = () => {
  const getSeasonName = () => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return 'Winter';
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    return 'Fall';
  };

  const year = new Date().getFullYear();

  return (
    <InfiniteAnimePage
      title={`${getSeasonName()} ${year} Anime`}
      icon={Compass}
      useQueryHook={useSeasonalAnime}
    />
  );
};

export default AnimeSeasonal;
