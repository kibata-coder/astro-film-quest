// src/lib/vidsrc.ts

export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number, title?: string, anilistId?: number, type?: 'sub' | 'dub') => string;
  tv: (tmdbId: number, season: number, episode: number, title?: string, anilistId?: number, type?: 'sub' | 'dub') => string;
}

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc',
    name: 'Server 1 (Recommended)',
    movie: (id: number) => `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number) => `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
  {
    id: 'superembed',
    name: 'Server 2 (Second option)',
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
    id: '4animo',
    name: 'Server 4 (Only for Anime)',
    // If an AniList ID exists, we use the 4Animo API (episode 1 for movies). If not, fallback to Server 1 securely.
    movie: (id: number, title?: string, anilistId?: number, type?: 'sub' | 'dub') => 
      anilistId
        ? `https://cdn.4animo.xyz/embed/hd-1/ani/${anilistId}/1/${type || 'sub'}?k=1&autoPlay=1&skipIntro=1&skipOutro=1`
        : `https://vidsrcme.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id: number, s: number, e: number, title?: string, anilistId?: number, type?: 'sub' | 'dub') => 
      anilistId
        ? `https://cdn.4animo.xyz/embed/hd-1/ani/${anilistId}/${e}/${type || 'sub'}?k=1&autoPlay=1&skipIntro=1&skipOutro=1`
        : `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

// Helper to ensure we don't crash if an invalid index is passed
const safeIndex = (i: number) =>
  Math.max(0, Math.min(PROVIDERS.length - 1, Number.isFinite(i) ? i : 0));

export const getMovieEmbedUrl = (tmdbId: number, providerIndex = 0, title?: string, anilistId?: number, type?: 'sub' | 'dub'): string =>
  PROVIDERS[safeIndex(providerIndex)].movie(tmdbId, title, anilistId, type);

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  providerIndex = 0,
  title?: string,
  anilistId?: number,
  type?: 'sub' | 'dub'
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  return provider.tv(tmdbId, season ?? 1, episode ?? 1, title, anilistId, type);
};
