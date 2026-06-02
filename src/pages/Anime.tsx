import { Flame } from 'lucide-react';
import InfiniteMediaPage from '@/components/InfiniteMediaPage';
import { useMedia } from '@/features/shared';
import { getAnimeTVShows, type TVShow } from '@/lib/tmdb';

const Anime = () => {
  const { openTVModal } = useMedia();
  return (
    <InfiniteMediaPage<TVShow>
      title="Anime"
      icon={Flame}
      queryKey={['anime', 'tv', 'infinite']}
      fetchPage={getAnimeTVShows}
      onItemClick={openTVModal}
      searchKind="tvShows"
    />
  );
};

export default Anime;
