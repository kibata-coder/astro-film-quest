import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookmarks } from '@/lib/bookmarks';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MediaCard from '@/components/MediaCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Movie, TVShow } from '@/lib/tmdb';

const MyList = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', session?.user?.id],
    queryFn: getBookmarks,
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-4 md:px-12 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your bookmarks.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-3xl font-bold mb-8">My List</h1>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {bookmarks.map((item) => {
              // Transform bookmark data to match MediaCard props
              const mediaItem = {
                id: item.media_id,
                title: item.title, // For movies
                name: item.title,  // For TV shows (using title field from DB)
                poster_path: item.poster_path,
                vote_average: 0, // Not stored in bookmarks
                release_date: '',
                first_air_date: '',
              };

              return (
                <div key={`${item.media_type}-${item.media_id}`} onClick={() => {
                    // Navigate to home with query params to open modal (simplest approach without duplicating modal logic)
                    // Or ideally, duplicate the Modal logic here if you want it to open on this page.
                    // For now, let's just log or implement basic navigation if your app supports /movie/:id
                    console.log("Clicked", item);
                }}>
                   {/* We wrap MediaCard to handle the click visually, 
                       but functionality relies on your Modal logic. 
                       For a quick fix, just displaying them is the first step. */}
                  <MediaCard 
                    item={mediaItem as any} 
                    onClick={() => {
                        // A simple way to handle this without copying 500 lines of code
                        // is to just alert or (better) reuse the Modals if you extract them to a Layout.
                        // For now, let's keep it simple:
                    }}
                  />
                </div>
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

      <Footer />
    </div>
  );
};

export default MyList;
