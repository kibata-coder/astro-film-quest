// Streaming providers — updated to include 4 consistent servers.
export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number, title?: string) => string;
  tv: (tmdbId: number, season: number, episode: number, title?: string) => string;
}

// Helper function to cleanly convert "My Hero Academia" into "my-hero-academia"
const convertToSlug = (text?: string): string => {
  if (!text) return 'anime';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Convert spaces to hyphens
    .replace(/-+/g, '-');         // Avoid consecutive double hyphens
};

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc',
    name: 'Server 1 (Recommended)',
    movie: (id: number) => `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) => `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 2 (second option)',
    movie: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: number, s: number, e: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidfun',
    name: 'Server 3 (Last option)',
    movie: (id: number) => `https://vidnest.fun/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidnest.fun/tv/${id}/${s}/${e}`,
  },
  {
    id: 'anikoto',
    // Marketing name that shows up consistently everywhere to announce your anime focus!
    name: 'Server 4 (Only for Anime)',
    movie: (id: number, title?: string) => `https://anikototv.to/watch/${convertToSlug(title)}/movie`,
    tv: (id: number, s: number, e: number, title?: string) => `https://anikototv.to/watch/${convertToSlug(title)}/ep-${e}`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

const safeIndex = (i: number) =>
  Math.max(0, Math.min(PROVIDERS.length - 1, Number.isFinite(i) ? i : 0));

export const getMovieEmbedUrl = (tmdbId: number, providerIndex = 0, title?: string): string =>
  PROVIDERS[safeIndex(providerIndex)].movie(tmdbId, title);

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  providerIndex = 0,
  title?: string
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  return provider.tv(tmdbId, season ?? 1, episode ?? 1, title);
};
