const VIDSRC_EMBED_BASE_URL = 'https://vsembed.ru';

// --- Embed URLs (docs-aligned path format) ---

export const getMovieEmbedUrl = (tmdbId: number): string => {
  return `${VIDSRC_EMBED_BASE_URL}/embed/movie?tmdb=${tmdbId}&autoplay=1`;
};

export const getTVShowEmbedUrl = (tmdbId: number, season?: number, episode?: number): string => {
  if (season !== undefined && episode !== undefined) {
    return `${VIDSRC_EMBED_BASE_URL}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
  }

  return `${VIDSRC_EMBED_BASE_URL}/embed/tv?tmdb=${tmdbId}`;
};
