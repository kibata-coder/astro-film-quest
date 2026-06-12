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
    name: 'Server 1 (Big Server)',
    // Uses standard Vidsrc URL formatting
    movie: (id: number) => 
      `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) => 
      `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 2 (Mini Servers)',
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
