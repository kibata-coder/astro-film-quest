import axios from 'axios';

const ANILIST_URL = 'https://graphql.anilist.co';

export interface AnilistTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface AnilistCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface AnilistAnime {
  id: number;
  idMal: number | null;
  title: AnilistTitle;
  coverImage: AnilistCoverImage;
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  genres: string[];
  averageScore: number | null;
  seasonYear: number | null;
  season: string | null;
  status: string;
  nextAiringEpisode?: {
    episode: number;
  } | null;
  streamingEpisodes?: {
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }[];
}

export interface AnilistPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AnilistPage {
  pageInfo: AnilistPageInfo;
  media: AnilistAnime[];
}

const fetchAnilist = async (query: string, variables: any = {}) => {
  try {
    const response = await axios.post(ANILIST_URL, { query, variables });
    return response.data.data;
  } catch (error) {
    console.error('Anilist API Error:', error);
    throw error;
  }
};

const animeFragment = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large medium color }
  bannerImage
  description
  episodes
  genres
  averageScore
  seasonYear
  season
  status
  nextAiringEpisode {
    episode
  }
`;

export const getTrendingAnime = async (page = 1, perPage = 20): Promise<AnilistPage> => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${animeFragment}
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { page, perPage });
  return data.Page;
};

export const getPopularAnime = async (page = 1, perPage = 20): Promise<AnilistPage> => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${animeFragment}
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { page, perPage });
  return data.Page;
};

export const getUpcomingAnime = async (page = 1, perPage = 20): Promise<AnilistPage> => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) {
          ${animeFragment}
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { page, perPage });
  return data.Page;
};

export const getSeasonalAnime = async (page = 1, perPage = 20): Promise<AnilistPage> => {
  const currentMonth = new Date().getMonth();
  let season = 'WINTER';
  if (currentMonth >= 2 && currentMonth <= 4) season = 'SPRING';
  else if (currentMonth >= 5 && currentMonth <= 7) season = 'SUMMER';
  else if (currentMonth >= 8 && currentMonth <= 10) season = 'FALL';
  
  const seasonYear = new Date().getFullYear();

  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${animeFragment}
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { page, perPage, season, seasonYear });
  return data.Page;
};

export const searchAnime = async (search: string, page = 1, perPage = 20): Promise<AnilistPage> => {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total perPage currentPage lastPage hasNextPage }
        media(search: $search, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${animeFragment}
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { search, page, perPage });
  return data.Page;
};

export const getAnimeDetails = async (id: number): Promise<AnilistAnime> => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${animeFragment}
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { id });
  return data.Media;
};
