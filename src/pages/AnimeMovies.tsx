import { Flame } from 'lucide-react';
import InfiniteMediaPage from '@/components/InfiniteMediaPage';
import { useMedia } from '@/features/shared';
import { getAnimeMovies, type Movie } from '@/lib/tmdb';

const AnimeMovies = () => {
  const { openMovieModal } = useMedia();
  return (
    <InfiniteMediaPage<Movie>
      title="Anime Movies"
      icon={Flame}
      queryKey={['anime', 'movies', 'infinite']}
      fetchPage={getAnimeMovies}
      onItemClick={openMovieModal}
      searchKind="movies"
    />
  );
};

export default AnimeMovies;
