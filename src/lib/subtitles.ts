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

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';
const OS_API_KEY = 'sG1Aq1gNe8GfSRYEnzxfXM5lE4jz5dkm';

const headers = {
  'Api-Key': OS_API_KEY,
  'Content-Type': 'application/json',
  'User-Agent': 'SoudFlex v1.0',
};

/**
 * Search for subtitles for a movie or TV episode.
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
    tmdb_id: String(tmdbId),
    type,
    languages: language,
    order_by: 'download_count',
    order_direction: 'desc',
  });
  
  if (type === 'episode' && season != null && episode != null) {
    qs.set('season_number', String(season));
    qs.set('episode_number', String(episode));
  }

  try {
    const res = await fetch(`${OPENSUBTITLES_API}/subtitles?${qs}`, { headers });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();
    
    return (data.data || []).map((item: any) => {
      const attrs = item.attributes || {};
      const file = (attrs.files || [])[0] || {};
      return {
        id: item.id,
        file_id: file.file_id,
        file_name: file.file_name || attrs.release || 'Unknown',
        language: attrs.language,
        hi: attrs.hearing_impaired,
        download_count: attrs.download_count,
        release: attrs.release,
        uploader: attrs.uploader?.name || '',
      };
    }).filter((s: any) => s.file_id);
  } catch (err) {
    console.error('[subtitles] search error:', err);
    return [];
  }
}

/**
 * Gets the direct download URL for a subtitle file
 */
export async function getSubtitleProxyUrl(fileId: number): Promise<string | null> {
  try {
    const dlRes = await fetch(`${OPENSUBTITLES_API}/download`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ file_id: Number(fileId) }),
    });
    
    if (!dlRes.ok) throw new Error(`Download link failed: ${dlRes.status}`);
    const dlData = await dlRes.json();
    
    // OpenSubtitles download links have CORS enabled, so we can pass them directly to vidsrc!
    return dlData.link || null;
  } catch (err) {
    console.error('[subtitles] get proxy url error:', err);
    return null;
  }
}
