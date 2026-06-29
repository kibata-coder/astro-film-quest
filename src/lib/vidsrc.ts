// Streaming providers — updated to include 3 reliable servers.
//
// API reference:
// Server 1 Docs: https://vidsrcme.su/embed/movie?tmdb=ID
// Server 2 Docs: https://multiembed.mov/?video_id=ID&tmdb=1
// Server 3 Docs: https://vidnest.fun/movie/[TMDB_ID]

export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number) => string;
  tv: (tmdbId: number, season: number, episode: number) => string;
}

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidlink',
    name: 'Server 1 (Cpt Jack Sparrow) (the OG server)',
    // VidLink is incredibly fast, has 4k, and flawless built-in subtitles
    movie: (id: number) => `https://vidlink.pro/movie/${id}?autoplay=true`,
    tv: (id: number, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true`,
  },
  {
    id: 'vidsrc',
    name: 'Server 2 (Mauiii)(fixing subtitles issue)',
    movie: (id: number) =>
      `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) =>
      `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 3 (Moana)',
    movie: (id: number) => 
      `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: number, s: number, e: number) => 
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidfun',
    name: 'Server 4 (Hobbit)(recommended after jack sparrow)',
    movie: (id: number) => 
      `https://vidnest.fun/movie/${id}`,
    tv: (id: number, s: number, e: number) => 
      `https://vidnest.fun/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-wtf',
    name: 'Server 5 (Dora)',
    movie: (id: number) => `https://vidsrc.wtf/1/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidsrc.wtf/1/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: 'Server 6 (Po)',
    movie: (id: number) => `https://www.2embed.cc/embed/${id}`,
    tv: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'embedmaster',
    name: 'Server 7 (Iron Man)',
    movie: (id: number) => `https://embedmaster.link/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://embedmaster.link/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidfast',
    name: 'Server 8 (Gipsy Danger)',
    movie: (id: number) => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tv: (id: number, s: number, e: number) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'apiplayer',
    name: 'Server 9 (Master Chifu)',
    movie: (id: number) => `https://apiplayer.ru/embed/movie?tmdb=${id}`,
    tv: (id: number, s: number, e: number) => `https://apiplayer.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'autoembed',
    name: 'Server 10 (Thor)',
    movie: (id: number) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'xpass',
    name: 'Server 11 (Hulk)',
    movie: (id: number) => `https://play.xpass.top/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://play.xpass.top/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'videasy',
    name: 'Server 12 (Groot)',
    movie: (id: number) => `https://player.videasy.net/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'spencer',
    name: 'Server 13 (Thanos)',
    movie: (id: number) => `https://spencerdevs.xyz/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://spencerdevs.xyz/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidrock',
    name: 'Server 14 (Loki)',
    movie: (id: number) => `https://vidrock.ru/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidrock.ru/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidapi',
    name: 'Server 15 (Ant-Man)',
    movie: (id: number) => `https://vidapi.xyz/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidapi.xyz/embed/tv/${id}/${s}/${e}`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

// Safely defaults to Server 1 if an invalid index is somehow passed
const safeIndex = (i: number) =>
  Math.max(0, Math.min(PROVIDERS.length - 1, Number.isFinite(i) ? i : 0));

export const getMovieEmbedUrl = (tmdbId: number, providerIndex = 0): string =>
  PROVIDERS[safeIndex(providerIndex)].movie(tmdbId);

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  providerIndex = 0
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  return provider.tv(tmdbId, season ?? 1, episode ?? 1);
};
