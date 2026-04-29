// Streaming providers — all mirrors of the same Vidsrc API on different domains.
// Users can switch between them in the player UI if one isn't responding.
//
// API reference (per user-provided docs):
//   /embed/movie?tmdb=ID
//   /embed/tv?tmdb=ID&season=S&episode=E
// Optional: autoplay=1, autonext=1, ds_lang=xx

export interface StreamProvider {
  id: string;
  name: string;
  movie: (tmdbId: number) => string;
  tv: (tmdbId: number, season: number, episode: number) => string;
}

const buildMovie = (host: string) => (id: number) =>
  `https://${host}/embed/movie?tmdb=${id}&autoplay=1`;

const buildTv = (host: string) => (id: number, s: number, e: number) =>
  `https://${host}/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1&autonext=1`;

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vsembed-su',
    name: 'Server 1',
    movie: buildMovie('vsembed.su'),
    tv: buildTv('vsembed.su'),
  },
  {
    id: 'vidsrc-embed-su',
    name: 'Server 2',
    movie: buildMovie('vidsrc-embed.su'),
    tv: buildTv('vidsrc-embed.su'),
  },
  {
    id: 'vidsrcme-su',
    name: 'Server 3',
    movie: buildMovie('vidsrcme.su'),
    tv: buildTv('vidsrcme.su'),
  },
  {
    id: 'vsrc-su',
    name: 'Server 4',
    movie: buildMovie('vsrc.su'),
    tv: buildTv('vsrc.su'),
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

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
