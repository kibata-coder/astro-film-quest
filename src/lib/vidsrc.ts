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
    id: 'vidsrc',
    name: 'Server 1 (Recommended)',
    // Uses standard Vidsrc URL formatting
    movie: (id: number) => 
      `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) => 
      `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 2 ( second option)',
    // Uses the highly reliable standard root multiembed endpoint
    movie: (id: number) => 
      `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: number, s: number, e: number) => 
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidfun',
    name: 'Server 3 (Last option)',
    // Uses Vidnest's clean URL path format (no query parameters needed)
    movie: (id: number) => 
      `https://vidnest.fun/movie/${id}`,
    tv: (id: number, s: number, e: number) => 
      `https://vidnest.fun/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-wtf',
    name: 'Server 4 (VidSrc WTF)',
    movie: (id: number) => `https://vidsrc.wtf/embed/movie?tmdb=${id}`,
    tv: (id: number, s: number, e: number) => `https://vidsrc.wtf/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'autoembed',
    name: 'Server 5 (Autoembed)',
    movie: (id: number) => `https://autoembed.cc/embed/player.php?id=${id}`,
    tv: (id: number, s: number, e: number) => `https://autoembed.cc/embed/player.php?id=${id}&s=${s}&e=${e}`,
  },
  {
    id: 'embedmaster',
    name: 'Server 6 (EmbedMaster)',
    movie: (id: number) => `https://embedmaster.link/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://embedmaster.link/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidfast',
    name: 'Server 7 (VidFast)',
    movie: (id: number) => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tv: (id: number, s: number, e: number) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'apiplayer',
    name: 'Server 8 (API Player)',
    movie: (id: number) => `https://apiplayer.ru/embed/movie?tmdb=${id}`,
    tv: (id: number, s: number, e: number) => `https://apiplayer.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'mostream',
    name: 'Server 9 (MoStream)',
    movie: (id: number) => `https://mostream.us/embed?tmdb=${id}`,
    tv: (id: number, s: number, e: number) => `https://mostream.us/embed?tmdb=${id}&s=${s}&e=${e}`,
  },
  {
    id: 'streamrip',
    name: 'Server 10 (Streamrip)',
    movie: (id: number) => `https://streamrip-website-production.up.railway.app/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://streamrip-website-production.up.railway.app/tv/${id}/${s}/${e}`,
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
