import axios from 'axios';

const BASE_URL = 'https://anikotoapi.site';

export interface AnikotoAnime {
  id: number;
  title: string;
  poster?: string;
  description?: string;
  terms_by_type?: Record<string, string[]>;
  // Add other fields as discovered from the API response
}

export interface AnikotoEpisode {
  id: number;
  number: number;
  title?: string;
  embed_url?: {
    sub?: string;
    dub?: string;
  };
}

export interface AnikotoSeriesResponse {
  ok: boolean;
  data: {
    anime: AnikotoAnime;
    episodes: AnikotoEpisode[];
  };
}

export interface AnikotoRecentResponse {
  ok: boolean;
  data: AnikotoAnime[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_next: boolean;
  };
}

export const getRecentAnime = async (page = 1, perPage = 20): Promise<AnikotoRecentResponse> => {
  const response = await axios.get(`${BASE_URL}/recent-anime`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

export const getAnimeSeries = async (id: number): Promise<AnikotoSeriesResponse> => {
  const response = await axios.get(`${BASE_URL}/series/${id}`);
  return response.data;
};
