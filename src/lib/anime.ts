// Anime utility functions for MegaPlay integration

/**
 * Searches the AniList API by title and returns the MAL ID of the best match.
 * Uses a timeout to prevent hanging.
 */
export async function getMalIdByTitle(title: string, mediaType: 'tv' | 'movie'): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Clean up title for better search results (e.g. removing dates or extra tags if any)
    const cleanTitle = title.split(' (')[0].trim();
    
    const query = `
      query ($search: String, $format: MediaFormat) {
        Media(search: $search, format: $format, type: ANIME, sort: POPULARITY_DESC) {
          idMal
        }
      }
    `;
    
    const format = mediaType === 'movie' ? 'MOVIE' : 'TV';

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: cleanTitle, format }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (data && data.data && data.data.Media && data.data.Media.idMal) {
      return data.data.Media.idMal;
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
} | null | undefined): boolean {
  if (!item) return false;
  if (item.original_language !== 'ja') return false;
  const ids = item.genre_ids ?? item.genres?.map((g) => g.id) ?? [];
  return ids.includes(16);
}
