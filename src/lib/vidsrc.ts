// Multi-provider streaming fallback. Each provider is an independent mirror —
// when one doesn't host a particular title, users can switch via the player UI.

export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number) => string;
  tv: (tmdbId: number, season: number, episode: number) => string;
}

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc',
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: 'vidsrc-to',
    name: 'VidSrc.to',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'embed-su',
    name: 'Embed.su',
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vsembed',
    name: 'VsEmbed',
    movie: (id) => `https://vsembed.su/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id, s, e) => `https://vsembed.su/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

const safeIndex = (i: number) =>
  Math.max(0, Math.min(PROVIDERS.length - 1, Number.isFinite(i) ? i : 0));

export const getMovieEmbedUrl = (tmdbId: number, providerIndex = 0): string => {
  return PROVIDERS[safeIndex(providerIndex)].movie(tmdbId);
};

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  providerIndex = 0
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  if (season !== undefined && episode !== undefined) {
    return provider.tv(tmdbId, season, episode);
  }
  // Fallback to first episode if season/episode not provided
  return provider.tv(tmdbId, 1, 1);
};
