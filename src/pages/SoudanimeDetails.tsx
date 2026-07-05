import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { PlayCircle, ArrowLeft, MonitorPlay } from 'lucide-react';
import { useAnimeSeries } from '@/hooks/use-anilist';
import LoadingSpinner from '@/components/LoadingSpinner';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';

const SoudanimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAnimeSeries(id ? parseInt(id) : null);
  
  const [playingEpisode, setPlayingEpisode] = useState<{ number: number, language: string } | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (isError || !data || !data.ok) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
          <p className="text-red-500">Failed to load anime details.</p>
        </div>
      </Layout>
    );
  }

  const anime = data.data;

  // Render the player if an episode is selected
  if (playingEpisode) {
    // Megaplay iframe URL format for anilist: https://megaplay.buzz/stream/ani/{anilistId}/{episodeNumber}/{language}
    const embedUrl = `https://megaplay.buzz/stream/ani/${anime.id}/${playingEpisode.number}/${playingEpisode.language}`;
    
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <button 
            onClick={() => setPlayingEpisode(null)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back to {anime.title.english || anime.title.romaji}</span>
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

  // Calculate episode count
  let episodeCount = 12; // Fallback
  if (anime.episodes) {
    episodeCount = anime.episodes;
  } else if (anime.nextAiringEpisode) {
    episodeCount = Math.max(1, anime.nextAiringEpisode.episode - 1);
  } else if (anime.streamingEpisodes && anime.streamingEpisodes.length > 0) {
    episodeCount = anime.streamingEpisodes.length;
  }
  
  const episodesList = Array.from({ length: episodeCount }, (_, i) => i + 1);

  // Helper to extract episode info
  const getEpisodeInfo = (epNum: number) => {
    if (!anime.streamingEpisodes) return null;
    const match = anime.streamingEpisodes.find(ep => 
      ep.title.startsWith(`Episode ${epNum} -`) || 
      ep.title === `Episode ${epNum}`
    );
    // If not perfectly matched by number but index aligns
    if (!match && anime.streamingEpisodes[epNum - 1]) {
      return anime.streamingEpisodes[epNum - 1];
    }
    return match;
  };

  return (
    <Layout>
      <Seo
        title={`${anime.title.english || anime.title.romaji} — Watch Anime | SoudFlex`}
        description={(anime.description || `Watch ${anime.title.english || anime.title.romaji} episodes subbed and dubbed on SoudFlex.`).replace(/<[^>]+>/g, '').slice(0, 160)}
      />
      <div className="bg-background text-foreground pb-20">
      {/* Cinematic Hero */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-black">
          <img 
            src={anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large} 
            alt={anime.title.english || anime.title.romaji}
            className="w-full h-full object-cover opacity-40 blur-md"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="container mx-auto px-5 md:px-12 flex flex-col md:flex-row gap-8 items-end">
            <img 
              src={anime.coverImage?.large} 
              alt={anime.title.english || anime.title.romaji}
              className="w-48 md:w-64 rounded-xl shadow-2xl border-2 border-orange-500/30 -mb-8 relative z-10 hidden md:block"
            />
            <div className="max-w-3xl space-y-4">
              <Link to="/anime" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Soudanime
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {anime.title.english || anime.title.romaji}
              </h1>
              {anime.genres && (
                <div className="flex gap-2 flex-wrap">
                  {anime.genres.map((g: string) => (
                    <span key={g} className="px-2 py-1 rounded-md bg-white/10 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {anime.description && (
                <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4">
                  {anime.description.replace(/<[^>]*>/g, '')}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {episodesList.map((epNum) => {
            const epInfo = getEpisodeInfo(epNum);
            let displayTitle = `Episode ${epNum}`;
            let hasCustomTitle = false;
            
            if (epInfo && epInfo.title) {
              const cleaned = epInfo.title.replace(/^Episode \d+ - /, '').trim();
              if (cleaned && cleaned !== `Episode ${epNum}`) {
                displayTitle = cleaned;
                hasCustomTitle = true;
              }
            }

            return (
              <div 
                key={epNum} 
                className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group hover:border-orange-500/50 transition-colors shadow-sm"
              >
                {/* Episode Thumbnail */}
                <div className="relative aspect-video w-full bg-muted/20">
                  {epInfo?.thumbnail ? (
                    <img 
                      src={epInfo.thumbnail} 
                      alt={displayTitle} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <MonitorPlay className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                    EP {epNum}
                  </div>
                  {/* Play overlay icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/20">
                     <PlayCircle className="w-12 h-12 text-white shadow-xl rounded-full" />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm md:text-base text-white mb-4 line-clamp-2" title={displayTitle}>
                    {displayTitle}
                  </h3>
                  
                  <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => setPlayingEpisode({ number: epNum, language: 'sub' })}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-orange-500/20 hover:border-orange-500"
                  >
                    <PlayCircle className="w-4 h-4" /> SUB
                  </button>
                  <button 
                    onClick={() => setPlayingEpisode({ number: epNum, language: 'dub' })}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-blue-500/20 hover:border-blue-500"
                  >
                    <PlayCircle className="w-4 h-4" /> DUB
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </main>
    </div>
    </Layout>
  );
};

export default SoudanimeDetails;
