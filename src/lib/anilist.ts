import axios from 'axios';

const ANILIST_URL = 'https://graphql.anilist.co';

export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english?: string;
  };
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage?: string;
  description?: string;
  genres?: string[];
  episodes?: number;
  status?: string;
  nextAiringEpisode?: {
    episode: number;
  };
  streamingEpisodes?: {
    title: string;
    thumbnail: string;
    url?: string;
  }[];
}

export interface AniListRecentResponse {
  ok: boolean;
  data: AniListAnime[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    has_next: boolean;
  };
}

export const getRecentAnime = async (page = 1, perPage = 20): Promise<AniListRecentResponse> => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          description
          genres
          episodes
          status
          nextAiringEpisode {
            episode
          }
        }
      }
    }
  `;

  const response = await axios.post(ANILIST_URL, {
    query,
    variables: { page, perPage },
  });

  const pageData = response.data.data.Page;

  return {
    ok: true,
    data: pageData.media,
    pagination: {
      page: pageData.pageInfo.currentPage,
      per_page: pageData.pageInfo.perPage,
      total: pageData.pageInfo.total,
      has_next: pageData.pageInfo.hasNextPage,
    },
  };
};

export const searchAnime = async (search: string, page = 1, perPage = 20): Promise<AniListRecentResponse> => {
  const query = `
    query ($page: Int, $perPage: Int, $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          description
          genres
          episodes
          status
          nextAiringEpisode {
            episode
          }
        }
      }
    }
  `;

  const response = await axios.post(ANILIST_URL, {
    query,
    variables: { search, page, perPage },
  });

  const pageData = response.data.data.Page;

  return {
    ok: true,
    data: pageData.media,
    pagination: {
      page: pageData.pageInfo.currentPage,
      per_page: pageData.pageInfo.perPage,
      total: pageData.pageInfo.total,
      has_next: pageData.pageInfo.hasNextPage,
    },
  };
};

export const getAnimeSeries = async (id: number): Promise<{ ok: boolean; data: AniListAnime }> => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          extraLarge
        }
        bannerImage
        description
        genres
        episodes
        status
        nextAiringEpisode {
          episode
        }
        streamingEpisodes {
          title
          thumbnail
        }
      }
    }
  `;

  const response = await axios.post(ANILIST_URL, {
    query,
    variables: { id },
  });

  return {
    ok: true,
    data: response.data.data.Media,
  };
};
