import { useQuery } from '@tanstack/react-query';
import { getBookmarks } from '@/lib/bookmarks';
import Layout from '@/components/Layout';
import MediaCard from '@/components/MediaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/features/auth';
import { useMedia } from '@/features/shared';
import type { Movie, TVShow } from '@/lib/tmdb';

const MyList = () => {
  const { user, openAuthModal } = useAuth();
  const { openMovieModal, openTVModal } = useMedia();

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  const handleItemClick = (item: any) => {
    if (item.media_type === 'movie') {
      openMovieModal({
        id: item.media_id,
        title: item.title,
        poster_path: item.poster_path,
        vote_average: 0,
        release_date: '',
        overview: '',
        backdrop_path: null,
      } as Movie);
    } else {
      openTVModal({
        id: item.media_id,
        name: item.title,
        poster_path: item.poster_path,
        vote_average: 0,
        first_air_date: '',
        overview: '',
        backdrop_path: null,
      } as TVShow);
    }
  };

  if (!user) {
    return (
      <Layout>
        <main className="pt-24 px-4 md:px-12 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your bookmarks.
          </p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-3xl font-bold mb-8">My List</h1>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {bookmarks.map((item) => {
              const mediaItem = {
                id: item.media_id,
                title: item.title,
                name: item.title,
                poster_path: item.poster_path,
                vote_average: 0,
                release_date: '',
                first_air_date: '',
              };

              return (
                <MediaCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={mediaItem as any}
                  onClick={() => handleItemClick(item)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              You haven't added any movies or shows to your list yet.
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default MyList;
