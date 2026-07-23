import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PlayCircle, ArrowLeft, MonitorPlay, Download } from 'lucide-react';
import { useAnimeSeries } from '@/hooks/use-anilist';
import LoadingSpinner from '@/components/LoadingSpinner';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { useAuth } from '@/features/auth';
import { saveWatchProgress } from '@/lib/watchHistory';

const SoudanimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, isError } = useAnimeSeries(id ? parseInt(id) : null);
  const { user } = useAuth();
  
  const [playingEpisode, setPlayingEpisode] = useState<{ number: number, language: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeRange, setActiveRange] = useState<[number, number] | null>(null);

  // Helper to parse episode number from title
  const parseEpisodeNumber = (title: string): number | null => {
    // Matches "Episode 123", "Episode 123 - ...", "Ep 123", "Ep. 123"
    const match = title.match(/(?:Episode|Ep\.?)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    
    // Fallback: match any standalone number in the title
    const numMatch = title.match(/\b(\d+)\b/);
    if (numMatch) return parseInt(numMatch[1], 10);
    
    return null;
  };

  // Extract all parsed episode numbers from streamingEpisodes to find the maximum
  const streamingEpisodeNumbers = anime?.streamingEpisodes
    ? anime.streamingEpisodes
        .map(ep => parseEpisodeNumber(ep.title))
        .filter((num): num is number => num !== null)
    : [];

  const maxStreamingEpisode = streamingEpisodeNumbers.length > 0
    ? Math.max(...streamingEpisodeNumbers)
    : 0;

  // Total episodes: check nextAiringEpisode (ongoing), episodes (finished), or the max parsed episode
  const nextAiring = anime?.nextAiringEpisode?.episode;
  const currentCount = nextAiring ? nextAiring - 1 : null;

  const episodeCount = anime?.episodes || currentCount || maxStreamingEpisode || 12;

  // Generate ranges of 100 episodes
  const TAB_SIZE = 100;
  const ranges: [number, number][] = [];
  for (let i = 1; i <= episodeCount; i += TAB_SIZE) {
    const end = Math.min(i + TAB_SIZE - 1, episodeCount);
    ranges.push([i, end]);
  }

  // Synchronize activeRange when ranges or sortOrder changes
  useEffect(() => {
    if (ranges.length > 0) {
      if (sortOrder === 'desc') {
        setActiveRange(ranges[ranges.length - 1]);
      } else {
        setActiveRange(ranges[0]);
      }
    } else {
      setActiveRange(null);
    }
  }, [episodeCount, sortOrder]);

  // Get list of episode numbers to render
  let renderedEpisodes: number[] = [];
  if (activeRange) {
    const [start, end] = activeRange;
    for (let i = start; i <= end; i++) {
      renderedEpisodes.push(i);
    }
  } else {
    for (let i = 1; i <= episodeCount; i++) {
      renderedEpisodes.push(i);
    }
  }

  if (sortOrder === 'desc') {
    renderedEpisodes.reverse();
  }

  // Helper to extract episode info
  const getEpisodeInfo = (epNum: number) => {
    if (!anime?.streamingEpisodes) return null;
    return anime.streamingEpisodes.find(ep => parseEpisodeNumber(ep.title) === epNum) || null;
  };

  // Handle player messages for saving progress
  useEffect(() => {
    if (!playingEpisode || !anime) return;

    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      if (data && (data.channel === 'megacloud' || data.type === 'watching-log' || data.event)) {
        if (data.type === 'watching-log' && data.currentTime && data.duration) {
          saveWatchProgress(
            {
              id: anime.id,
              media_type: 'anime',
              title: anime.title.english || anime.title.romaji,
              poster_path: anime.coverImage?.large || '',
              episode_number: playingEpisode.number,
            },
            data.currentTime,
            data.duration
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playingEpisode, anime]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (isError || !anime) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
          <p className="text-red-500">Failed to load anime details.</p>
        </div>
      </Layout>
    );
  }

  // Render the player if an episode is selected
  if (playingEpisode) {
    // We use idMal for Megaplay streaming
    const embedUrl = `https://megaplay.buzz/stream/mal/${anime.idMal}/${playingEpisode.number}/${playingEpisode.language}`;
    
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
            src={anime.coverImage?.large} 
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
              className="w-full rounded-xl shadow-2xl border-2 border-orange-500/30 -mb-8 relative z-10 hidden md:block"
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
                  {anime.genres.map((g, index) => (
                    <span key={index} className="px-2 py-1 rounded-md bg-white/10 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-orange-500" /> Episodes
          </h2>
          
          <div className="flex bg-muted/40 rounded-lg p-0.5 border border-border self-start sm:self-auto">
            <button
              onClick={() => setSortOrder('desc')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                sortOrder === 'desc'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                sortOrder === 'asc'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Oldest First
            </button>
          </div>
        </div>

        {/* Range Tabs */}
        {ranges.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {(sortOrder === 'desc' ? [...ranges].reverse() : ranges).map((range) => {
              const isActive = activeRange && activeRange[0] === range[0] && activeRange[1] === range[1];
              return (
                <button
                  key={`${range[0]}-${range[1]}`}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-card border border-border text-gray-400 hover:text-white hover:border-orange-500/50'
                  }`}
                >
                  {range[0]} - {range[1]}
                </button>
              );
            })}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {renderedEpisodes.map((epNum) => {
            const epInfo = getEpisodeInfo(epNum);
            let displayTitle = `Episode ${epNum}`;
            
            if (epInfo && epInfo.title) {
              displayTitle = epInfo.title;
            }

            return (
              <div 
                key={epNum} 
                className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group hover:border-orange-500/50 transition-colors shadow-sm"
              >
                {/* Episode Thumbnail */}
                <div className="relative aspect-video w-full bg-muted/20">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    {epInfo && epInfo.thumbnail ? (
                      <img src={epInfo.thumbnail} alt={displayTitle} className="w-full h-full object-cover" />
                    ) : (
                      <MonitorPlay className="w-6 h-6" />
                    )}
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                    EP {epNum}
                  </div>
                  {/* Play overlay icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/20">
                     <PlayCircle className="w-8 h-8 text-white shadow-xl rounded-full" />
                  </div>
                </div>

                <div className="p-2 flex flex-col flex-1">
                  <h3 className="font-semibold text-xs text-white mb-2 line-clamp-1" title={displayTitle}>
                    {displayTitle}
                  </h3>
                  
                  <div className="flex gap-1.5 mt-auto">
                    <button 
                      onClick={() => setPlayingEpisode({ number: epNum, language: 'sub' })}
                      className="flex-1 flex items-center justify-center gap-1 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white py-1 px-1.5 rounded-md text-[10px] font-bold transition-all border border-orange-500/20 hover:border-orange-500"
                    >
                      <PlayCircle className="w-3 h-3" /> SUB
                    </button>
                    <button 
                      onClick={() => setPlayingEpisode({ number: epNum, language: 'dub' })}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white py-1 px-1.5 rounded-md text-[10px] font-bold transition-all border border-blue-500/20 hover:border-blue-500"
                    >
                      <PlayCircle className="w-3 h-3" /> DUB
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
