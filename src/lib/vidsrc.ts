// Streaming providers — simplified to exactly two options as requested.
//
// API reference:
// Vidsrc Docs: https://vidsrcme.su/embed/movie?tmdb=ID
// Superembed Docs: https://multiembed.mov/directstream.php?video_id=ID&tmdb=1

export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number) => string;
  tv: (tmdbId: number, season: number, episode: number) => string;
}

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc',
    name: 'Server 1 (Vidsrc)',
    // Uses standard Vidsrc URL formatting
    movie: (id: number) => 
      `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) => 
      `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 2 (Superembed)',
    // Uses the Superembed VIP Player endpoint for fast HLS streaming & fewer ads
    movie: (id: number) => 
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id: number, s: number, e: number) => 
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
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
