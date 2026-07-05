import { supabase } from '@/integrations/supabase/client';

export interface SubtitleResult {
  id: string;
  file_id: number;
  file_name: string;
  language: string;
  hi: boolean;
  download_count: number;
  release: string;
  uploader: string;
}

/**
 * Search for subtitles for a movie or TV episode.
 * Proxied through the `subtitles` edge function so the OpenSubtitles API key
 * stays server-side.
 */
export async function searchSubtitles(params: {
  tmdbId: number;
  type: 'movie' | 'episode';
  language?: string;
  season?: number;
  episode?: number;
}): Promise<SubtitleResult[]> {
  const { tmdbId, type, language = 'en', season, episode } = params;

  const qs = new URLSearchParams({
    action: 'search',
    tmdb_id: String(tmdbId),
    type,
    language,
  });

  if (type === 'episode' && season != null && episode != null) {
    qs.set('season', String(season));
    qs.set('episode', String(episode));
  }

  try {
    const { data, error } = await supabase.functions.invoke(`subtitles?${qs}`, {
      method: 'GET',
    });
    if (error) throw error;
    return (data?.results as SubtitleResult[]) || [];
  } catch (err) {
    console.error('[subtitles] search error:', err);
    return [];
  }
}

/**
 * Gets the direct download URL for a subtitle file. Routed through the
 * `subtitles` edge function so the API key stays server-side.
 */
export async function getSubtitleProxyUrl(fileId: number): Promise<string | null> {
  try {
    const qs = new URLSearchParams({
      action: 'download',
      file_id: String(fileId),
    });
    const { data, error } = await supabase.functions.invoke(`subtitles?${qs}`, {
      method: 'GET',
    });
    if (error) throw error;
    return (data?.link as string) || null;
  } catch (err) {
    console.error('[subtitles] get proxy url error:', err);
    return null;
  }
}
