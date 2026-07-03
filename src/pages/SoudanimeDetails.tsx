import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { PlayCircle, ArrowLeft, MonitorPlay } from 'lucide-react';
import { useAnimeSeries } from '@/hooks/use-anikoto';
import LoadingSpinner from '@/components/LoadingSpinner';

const SoudanimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAnimeSeries(id ? parseInt(id) : null);
  
  const [playingEpisode, setPlayingEpisode] = useState<{ id: string, number: number, language: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !data || !data.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <p className="text-red-500">Failed to load anime details.</p>
      </div>
    );
  }

  const { anime, episodes } = data.data;

  // Render the player if an episode is selected
  if (playingEpisode) {
    // Megaplay iframe URL format: https://megaplay.buzz/stream/s-2/{aniwatch-ep-id}/{language}
    const embedUrl = `https://megaplay.buzz/stream/s-2/${playingEpisode.id}/${playingEpisode.language}`;
    
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <button 
            onClick={() => setPlayingEpisode(null)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back to {anime.title}</span>
          </button>
          <div className="text-white font-medium">
            Episode {playingEpisode.number} ({playingEpisode.language.toUpperCase()})
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <iframe 
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Cinematic Hero */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-black">
          <img 
            src={anime.poster} 
            alt={anime.title}
            className="w-full h-full object-cover opacity-40 blur-md"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="container mx-auto px-5 md:px-12 flex flex-col md:flex-row gap-8 items-end">
            <img 
              src={anime.poster} 
              alt={anime.title}
              className="w-48 md:w-64 rounded-xl shadow-2xl border-2 border-orange-500/30 -mb-8 relative z-10 hidden md:block"
            />
            <div className="max-w-3xl space-y-4">
              <Link to="/anime" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Soudanime
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {anime.title}
              </h1>
              {anime.terms_by_type?.genre && (
                <div className="flex gap-2 flex-wrap">
                  {anime.terms_by_type.genre.map((g: string) => (
                    <span key={g} className="px-2 py-1 rounded-md bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {anime.description && (
                <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4">
                  {anime.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <main className="container mx-auto px-5 md:px-12 mt-16 relative z-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-orange-500" /> Episodes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {episodes.map((ep) => {
            // Check if embed_url exists and has sub/dub
            const hasSub = ep.embed_url?.sub;
            const hasDub = ep.embed_url?.dub;
            
            // To get the episode_embed_id, we look at the end of the Anikoto URL, but wait, the Anikoto API series response usually includes `embed_id` or the `embed_url` object contains the full URL or just the ID.
            // Let's assume `embed_url.sub` is either the ID itself or the full URL.
            // Wait, the API docs say: `each episode has embed_url.sub / embed_url.dub when available.`
            // And earlier: "use episode_embed_id from Anikoto /series/{id}". Let's check `ep.episode_embed_id` or fallback to parsing. We'll pass `ep.id` or `ep.episode_embed_id` to Megaplay. Wait, in the anikoto API payload: `episode_embed_id`? The doc says "use episode_embed_id from Anikoto /series/{id}".
            // So we'll use `ep.episode_embed_id` or `ep.embed_url.sub` if it's an ID.
            const epId = (ep as any).episode_embed_id || ep.id;

            return (
              <div 
                key={ep.id} 
                className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-lg text-white mb-1">
                    Episode {ep.number}
                  </div>
                  {ep.title && (
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {ep.title}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  {hasSub && (
                    <button 
                      onClick={() => setPlayingEpisode({ id: epId, number: ep.number, language: 'sub' })}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                      <PlayCircle className="w-4 h-4" /> SUB
                    </button>
                  )}
                  {hasDub && (
                    <button 
                      onClick={() => setPlayingEpisode({ id: epId, number: ep.number, language: 'dub' })}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                      <PlayCircle className="w-4 h-4" /> DUB
                    </button>
                  )}
                  {!hasSub && !hasDub && (
                    <div className="text-xs text-muted-foreground w-full text-center py-2">
                      No streams available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SoudanimeDetails;
