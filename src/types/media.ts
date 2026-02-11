import type { Movie, TVShow, Episode } from '@/lib/tmdb';

export type { Movie, TVShow, Episode };

export interface VideoState {
  isOpen: boolean;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
}

export interface TVEpisodeContext {
  showId: number;
  showName: string;
  seasonNumber: number;
  episodes: Episode[];
  posterPath: string | null;
  backdropPath: string | null;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}
