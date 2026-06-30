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
    name: 'Server 1 (Cpt Jack Sparrow)',
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
    id: 'vidapi-ru',
    name: 'Server 3 (Moana)',
    movie: (id: number) => 
      `https://vaplayer.ru/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => 
      `https://vaplayer.ru/embed/tv/${id}/${s}/${e}`,
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
    id: 'autoembed',
    name: 'Server 9 (Thor)',
    movie: (id: number) => `https://autoembed.co/movie/tmdb/${id}`,
    tv: (id: number, s: number, e: number) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    id: 'xpass',
    name: 'Server 10 (Hulk)',
    movie: (id: number) => `https://play.xpass.top/e/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://play.xpass.top/e/tv/${id}/${s}/${e}`,
  },
  {
    id: 'videasy',
    name: 'Server 11 (Groot)',
    movie: (id: number) => `https://player.videasy.net/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'spencer',
    name: 'Server 12 (Thanos)',
    movie: (id: number) => `https://spencerdevs.xyz/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://spencerdevs.xyz/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidrock',
    name: 'Server 13 (Loki)',
    movie: (id: number) => `https://vidrock.ru/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidrock.ru/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidapi',
    name: 'Server 14 (Black panther)',
    movie: (id: number) => `https://vidapi.xyz/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidapi.xyz/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'nontongo',
    name: 'Server 15 (Black Widow)',
    movie: (id: number) => 
      `https://www.NontonGo.win/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => 
      `https://www.NontonGo.win/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'nhdapi',
    name: 'Server 16 (Kingslayer)',
    movie: (id: number) => 
      `https://nhdapi.com/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => 
      `https://nhdapi.com/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidking',
    name: 'Server 17 (Jon Snow)',
    movie: (id: number) => `https://www.vidking.net/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrcto',
    name: 'Server 18 (Hoddor)',
    movie: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'streamflix',
    name: 'Server 19 (Mother of Dragons 🐦‍🔥)',
    movie: (id: number) => `https://streamflix.to/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://streamflix.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidzee',
    name: 'Server 20 (Arya Stark)',
    movie: (id: number) => `https://player.vidzee.wtf/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}`,
  },
];

export const getProviders = (): StreamProvider[] => PROVIDERS;

export const getAnimeProviders = (): StreamProvider[] => [
  {
    id: 'naruto',
    name: 'Server Naruto',
    movie: () => '', // Intercepted by MegaPlayPlayer
    tv: () => '', // Intercepted by MegaPlayPlayer
  }
];
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
