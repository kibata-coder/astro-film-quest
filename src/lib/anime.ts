import { supabase } from '@/integrations/supabase/client';

export interface AnimeEpisode {
  id: string;
  number: number;
  title?: string;
  hasDub?: boolean;
}

export interface AnimeResolve {
  provider: string;
  anilistId?: number;
  episodes: AnimeEpisode[];
}

export interface AnimeSource {
  url: string;
  quality: string; // e.g. "1080p", "auto"
  isM3U8?: boolean;
}

export interface AnimeSubtitle {
  url: string;
  lang: string;
}

export interface AnimeStream {
  sources: AnimeSource[];
  subtitles: AnimeSubtitle[];
  headers: { Referer?: string };
}

const RESOLVE_TIMEOUT_MS = 4000;

/** Race a promise against a timeout. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Resolves a TMDB id to a Consumet/HiAnime mapping with episode list.
 * Returns null on timeout, error, or empty episodes — caller falls back to Vidsrc iframe.
 */
export async function resolveAnime(
  tmdbId: number | string,
  mediaType: 'tv' | 'movie',
): Promise<AnimeResolve | null> {
  try {
    const res = await withTimeout(
      supabase.functions.invoke('anime-resolve', {
        body: { tmdbId: String(tmdbId), mediaType },
      }),
      RESOLVE_TIMEOUT_MS,
    );
    const { data, error } = res as { data: AnimeResolve | null; error: unknown };
    if (error || !data?.episodes?.length) return null;
    return data;
  } catch {
    return null;
  }
}

/** Fetch streaming sources for a given Consumet episode id. */
export async function getAnimeStream(
  episodeId: string,
  category: 'sub' | 'dub',
): Promise<AnimeStream | null> {
  try {
    const { data, error } = await supabase.functions.invoke('anime-stream', {
      body: { episodeId, category },
    });
    if (error || !data?.sources?.length) return null;
    return data as AnimeStream;
  } catch {
    return null;
  }
}

/** Wrap a stream/subtitle URL with our hls-proxy so headers (Referer) can be injected. */
export function buildProxyUrl(streamUrl: string, referer?: string): string {
  const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hls-proxy`;
  const params = new URLSearchParams({ url: streamUrl });
  if (referer) params.set('ref', referer);
  return `${base}?${params.toString()}`;
}

/** Anime detection heuristic used across the app. */
export function isAnimeMedia(item: {
  original_language?: string;
  genre_ids?: number[];
  genres?: { id: number }[];
}): boolean {
  if (item.original_language !== 'ja') return false;
  const ids = item.genre_ids ?? item.genres?.map((g) => g.id) ?? [];
  return ids.includes(16);
}
