// Anime utility functions for MegaPlay integration

const JIKAN_API_BASE = 'https://api.jikan.moe/v4/anime';

/**
 * Searches the Jikan API by title and returns the MAL ID of the best match.
 * Uses a timeout to prevent hanging.
 */
export async function getMalIdByTitle(title: string, mediaType: 'tv' | 'movie'): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Clean up title for better search results (e.g. removing dates or extra tags if any)
    const cleanTitle = title.split(' (')[0].trim();
    
    // Add type filter based on mediaType
    const typeQuery = mediaType === 'movie' ? '&type=movie' : '&type=tv';
    
    const url = `${JIKAN_API_BASE}?q=${encodeURIComponent(cleanTitle)}&limit=3${typeQuery}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (data && data.data && data.data.length > 0) {
      // Return the most relevant exact match or the first one
      return data.data[0].mal_id;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get MAL ID:', error);
    return null;
  }
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
