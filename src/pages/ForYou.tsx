import Layout from '@/components/Layout';
import ForYouSection from '@/components/ForYouSection';
import { useMedia } from '@/contexts/MediaContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ForYou = () => {
  const { openMovieModal } = useMedia();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="pt-32 px-4 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
          <Sparkles className="w-16 h-16 text-yellow-400" />
          <h1 className="text-3xl font-bold">Personalized Recommendations</h1>
          <p className="text-muted-foreground max-w-md">Sign in to track your watch history and get movies picked just for you.</p>
          <Button onClick={openAuthModal} size="lg" className="font-semibold">Sign In to Discover</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="pt-24 px-5 md:px-16 pb-16 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">For You</span>
          </h1>
          <p className="text-muted-foreground">Movies selected based on your watching habits (High engagement {'>'} 80%).</p>
        </div>
        <ForYouSection onMovieClick={openMovieModal} />
      </main>
    </Layout>
  );
};
export default ForYou;
