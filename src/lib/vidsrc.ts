// Streaming providers — updated to include 3 reliable servers.
//
// API reference:
// Server 1 Docs: https://vidsrc-embed.ru/embed/movie?tmdb=ID  (official vidsrc embed API)
//   Supports: tmdb, ds_lang (default subtitle language, ISO 639-1), sub_url, autoplay
// Server 2 Docs: https://multiembed.mov/?video_id=ID&tmdb=1
// Server 3 Docs: https://vidnest.fun/movie/[TMDB_ID]

export interface StreamProvider {
  id: string;
  name: string;
  /** supportsLang: true if ds_lang can be appended to its embed URL */
  supportsLang: boolean;
  movie: (tmdbId: number, dsLang?: string) => string;
  tv: (tmdbId: number, season: number, episode: number, dsLang?: string) => string;
}

// Helper: append &ds_lang=xx only when the server supports it and a language is given
const withLang = (base: string, dsLang?: string) =>
  dsLang ? `${base}&ds_lang=${dsLang}` : base;

const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc',
    name: 'Server 1 (Mauiii)',
    supportsLang: true,
    // Official Vidsrc embed API — documented at vidsrc-embed.ru
    // ds_lang selects the default subtitle/caption track on load
    movie: (id, dsLang) =>
      withLang(`https://vidsrc-embed.ru/embed/movie?tmdb=${id}`, dsLang),
    tv: (id, s, e, dsLang) =>
      withLang(`https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`, dsLang),
  },
  {
    id: 'superembed',
    name: 'Server 2 (Moana)',
    supportsLang: false,
    // Uses the highly reliable standard root multiembed endpoint
    movie: (id) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidfun',
    name: 'Server 3 (Hobbit)',
    supportsLang: false,
    // Uses Vidnest's clean URL path format (no query parameters needed)
    movie: (id) =>
      `https://vidnest.fun/movie/${id}`,
    tv: (id, s, e) =>
      `https://vidnest.fun/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-wtf',
    name: 'Server 4 (Dora)',
    supportsLang: false,
    movie: (id) => `https://vidsrc.wtf/1/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.wtf/1/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: 'Server 5 (Po)',
    supportsLang: false,
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: 'embedmaster',
    name: 'Server 6 (Iron Man)',
    supportsLang: false,
    movie: (id) => `https://embedmaster.link/movie/${id}`,
    tv: (id, s, e) => `https://embedmaster.link/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidfast',
    name: 'Server 7 (Gipsy Danger)',
    supportsLang: false,
    movie: (id) => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'apiplayer',
    name: 'Server 8 (Master Chifu)',
    supportsLang: true,
    // apiplayer mirrors the vidsrc embed API and also accepts ds_lang
    movie: (id, dsLang) =>
      withLang(`https://apiplayer.ru/embed/movie?tmdb=${id}`, dsLang),
    tv: (id, s, e, dsLang) =>
      withLang(`https://apiplayer.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`, dsLang),
  },
  {
    id: 'mostream',
    name: 'Server 9 (Thor)',
    supportsLang: false,
    movie: (id) => `https://mostream.us/embed?tmdb=${id}`,
    tv: (id, s, e) => `https://mostream.us/embed?tmdb=${id}&s=${s}&e=${e}`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

// Safely defaults to Server 1 if an invalid index is somehow passed
const safeIndex = (i: number) =>
  Math.max(0, Math.min(PROVIDERS.length - 1, Number.isFinite(i) ? i : 0));

export const getMovieEmbedUrl = (
  tmdbId: number,
  providerIndex = 0,
  dsLang?: string
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  return provider.movie(tmdbId, provider.supportsLang ? dsLang : undefined);
};

export const getTVShowEmbedUrl = (
  tmdbId: number,
  season?: number,
  episode?: number,
  providerIndex = 0,
  dsLang?: string
): string => {
  const provider = PROVIDERS[safeIndex(providerIndex)];
  return provider.tv(
    tmdbId,
    season ?? 1,
    episode ?? 1,
    provider.supportsLang ? dsLang : undefined
  );
};
