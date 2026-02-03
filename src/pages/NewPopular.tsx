import Layout from '@/components/Layout';
import LatestSection from '@/components/LatestSection';
import { useMedia } from '@/features/shared';
import { Sparkles } from 'lucide-react';

const NewPopular = () => {
  const { openMovieModal, openTVModal } = useMedia();

  return (
    <Layout>
      <main className="pt-24 px-5 md:px-16 pb-16 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            New & Popular
          </h1>
          <p className="text-muted-foreground">The latest movies and TV shows added to our collection.</p>
        </div>
        <LatestSection onMovieClick={openMovieModal} onTVShowClick={openTVModal} />
      </main>
    </Layout>
  );
};

export default NewPopular;
