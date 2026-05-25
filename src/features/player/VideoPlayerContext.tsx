import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { getTVShowSeasonDetails } from '@/lib/tmdb';
import { addToHistory } from '@/lib/watchHistory';
import { resolveAnime, isAnimeMedia, type AnimeResolve } from '@/lib/anime';
import type { Movie, TVShow } from '@/lib/tmdb';
import type { VideoState, TVEpisodeContext } from '@/types/media';

type PlayerMode = 'iframe' | 'anime' | 'resolving';

interface ExtendedVideoState extends VideoState {
  mode: PlayerMode;
  animeEpisodeId?: string;
  animeCategory?: 'sub' | 'dub';
  animeHasDub?: boolean;
}

interface VideoPlayerContextType {
  videoState: ExtendedVideoState;
  episodeContext: TVEpisodeContext | null;
  animeResolve: AnimeResolve | null;
  playMovie: (movie: Movie) => Promise<void>;
  playEpisode: (
    show: TVShow,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string
  ) => Promise<void>;
  nextEpisode: () => Promise<void>;
  previousEpisode: () => Promise<void>;
  switchAnimeCategory: (category: 'sub' | 'dub') => void;
  fallbackToIframe: () => void;
  closePlayer: () => void;
}

const initialVideoState: ExtendedVideoState = {
  isOpen: false,
  title: '',
  mediaId: 0,
  mediaType: 'movie',
  mode: 'iframe',
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [videoState, setVideoState] = useState<ExtendedVideoState>(initialVideoState);
  const [episodeContext, setEpisodeContext] = useState<TVEpisodeContext | null>(null);
  const [animeResolve, setAnimeResolve] = useState<AnimeResolve | null>(null);

  const isOpenRef = useRef(false);
  useEffect(() => { isOpenRef.current = videoState.isOpen; }, [videoState.isOpen]);

  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
  };

  useEffect(() => {
    const handler = () => {
      if (window.history.state?.player) return;
      if (isOpenRef.current) {
        setVideoState(prev => ({ ...prev, isOpen: false }));
        setEpisodeContext(null);
        setAnimeResolve(null);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const findAnimeEpisodeId = (resolve: AnimeResolve, episodeNumber: number) => {
    const match = resolve.episodes.find(e => e.number === episodeNumber);
    return match ?? resolve.episodes[0];
  };

  const playMovie = useCallback(async (movie: Movie) => {
    window.history.pushState({ player: true }, '', window.location.pathname);

    // Fire-and-forget history
    addToHistory({
      id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path || '',
    })
      .then(notifyHistoryUpdate)
      .catch((e) => console.error('addToHistory failed', e));

    if (isAnimeMedia(movie)) {
      // Show resolving state immediately
      setVideoState({
        isOpen: true,
        title: movie.title,
        mediaId: movie.id,
        mediaType: 'movie',
        mode: 'resolving',
      });
      setAnimeResolve(null);

      const resolved = await resolveAnime(movie.id, 'movie');
      if (resolved && resolved.episodes.length > 0) {
        const ep = resolved.episodes[0];
        setAnimeResolve(resolved);
        setVideoState({
          isOpen: true,
          title: movie.title,
          mediaId: movie.id,
          mediaType: 'movie',
          mode: 'anime',
          animeEpisodeId: ep.id,
          animeCategory: 'sub',
          animeHasDub: ep.hasDub,
        });
        return;
      }
      // Fall through to iframe
    }

    setVideoState({
      isOpen: true,
      title: movie.title,
      mediaId: movie.id,
      mediaType: 'movie',
      mode: 'iframe',
    });
  }, []);

  const playEpisode = useCallback(async (
    show: TVShow,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string
  ) => {
    window.history.pushState({ player: true }, '', window.location.pathname);
    setEpisodeContext(null);

    addToHistory({
      id: show.id,
      media_type: 'tv',
      title: show.name,
      poster_path: show.poster_path || '',
      season_number: seasonNumber,
      episode_number: episodeNumber,
    })
      .then(notifyHistoryUpdate)
      .catch((e) => console.error('addToHistory failed', e));

    // Background: load TMDB season details (used for non-anime next/prev)
    getTVShowSeasonDetails(show.id, seasonNumber)
      .then((seasonDetails) => {
        setEpisodeContext({
          showId: show.id,
          showName: show.name,
          seasonNumber,
          episodes: seasonDetails.episodes || [],
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path || null,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch season details:', error);
        setEpisodeContext(null);
      });

    if (isAnimeMedia(show)) {
      setVideoState({
        isOpen: true,
        title: `${show.name} - ${episodeName}`,
        mediaId: show.id,
        mediaType: 'tv',
        seasonNumber,
        episodeNumber,
        episodeName,
        mode: 'resolving',
      });
      setAnimeResolve(null);

      const resolved = await resolveAnime(show.id, 'tv');
      if (resolved && resolved.episodes.length > 0) {
        const ep = findAnimeEpisodeId(resolved, episodeNumber);
        setAnimeResolve(resolved);
        setVideoState({
          isOpen: true,
          title: `${show.name} - ${ep.title || episodeName}`,
          mediaId: show.id,
          mediaType: 'tv',
          seasonNumber,
          episodeNumber: ep.number,
          episodeName: ep.title || episodeName,
          mode: 'anime',
          animeEpisodeId: ep.id,
          animeCategory: 'sub',
          animeHasDub: ep.hasDub,
        });
        return;
      }
    }

    setVideoState({
      isOpen: true,
      title: `${show.name} - ${episodeName}`,
      mediaId: show.id,
      mediaType: 'tv',
      seasonNumber,
      episodeNumber,
      episodeName,
      mode: 'iframe',
    });
  }, []);

  const nextEpisode = useCallback(async () => {
    // Anime mode → walk animeResolve.episodes
    if (videoState.mode === 'anime' && animeResolve && videoState.animeEpisodeId) {
      const idx = animeResolve.episodes.findIndex(e => e.id === videoState.animeEpisodeId);
      if (idx === -1 || idx >= animeResolve.episodes.length - 1) return;
      const next = animeResolve.episodes[idx + 1];
      await addToHistory({
        id: videoState.mediaId,
        media_type: 'tv',
        title: videoState.title.split(' - ')[0],
        poster_path: episodeContext?.posterPath || '',
        season_number: videoState.seasonNumber,
        episode_number: next.number,
      });
      notifyHistoryUpdate();
      setVideoState(prev => ({
        ...prev,
        episodeNumber: next.number,
        episodeName: next.title || `Episode ${next.number}`,
        title: `${prev.title.split(' - ')[0]} - ${next.title || `Episode ${next.number}`}`,
        animeEpisodeId: next.id,
        animeHasDub: next.hasDub,
      }));
      return;
    }

    // Iframe mode → existing TMDB logic
    if (!episodeContext || !videoState.episodeNumber) return;
    const currentEpIndex = episodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );
    if (currentEpIndex === -1 || currentEpIndex >= episodeContext.episodes.length - 1) return;
    const nextEp = episodeContext.episodes[currentEpIndex + 1];
    await addToHistory({
      id: episodeContext.showId,
      media_type: 'tv',
      title: episodeContext.showName,
      poster_path: episodeContext.posterPath || '',
      season_number: episodeContext.seasonNumber,
      episode_number: nextEp.episode_number,
    });
    notifyHistoryUpdate();
    setVideoState(prev => ({
      ...prev,
      title: `${episodeContext.showName} - ${nextEp.name}`,
      episodeNumber: nextEp.episode_number,
      episodeName: nextEp.name,
    }));
  }, [episodeContext, videoState, animeResolve]);

  const previousEpisode = useCallback(async () => {
    if (videoState.mode === 'anime' && animeResolve && videoState.animeEpisodeId) {
      const idx = animeResolve.episodes.findIndex(e => e.id === videoState.animeEpisodeId);
      if (idx <= 0) return;
      const prev = animeResolve.episodes[idx - 1];
      await addToHistory({
        id: videoState.mediaId,
        media_type: 'tv',
        title: videoState.title.split(' - ')[0],
        poster_path: episodeContext?.posterPath || '',
        season_number: videoState.seasonNumber,
        episode_number: prev.number,
      });
      notifyHistoryUpdate();
      setVideoState(prevState => ({
        ...prevState,
        episodeNumber: prev.number,
        episodeName: prev.title || `Episode ${prev.number}`,
        title: `${prevState.title.split(' - ')[0]} - ${prev.title || `Episode ${prev.number}`}`,
        animeEpisodeId: prev.id,
        animeHasDub: prev.hasDub,
      }));
      return;
    }

    if (!episodeContext || !videoState.episodeNumber) return;
    const currentEpIndex = episodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );
    if (currentEpIndex <= 0) return;
    const prevEp = episodeContext.episodes[currentEpIndex - 1];
    await addToHistory({
      id: episodeContext.showId,
      media_type: 'tv',
      title: episodeContext.showName,
      poster_path: episodeContext.posterPath || '',
      season_number: episodeContext.seasonNumber,
      episode_number: prevEp.episode_number,
    });
    notifyHistoryUpdate();
    setVideoState(prev => ({
      ...prev,
      title: `${episodeContext.showName} - ${prevEp.name}`,
      episodeNumber: prevEp.episode_number,
      episodeName: prevEp.name,
    }));
  }, [episodeContext, videoState, animeResolve]);

  const switchAnimeCategory = useCallback((category: 'sub' | 'dub') => {
    setVideoState(prev => ({ ...prev, animeCategory: category }));
  }, []);

  const fallbackToIframe = useCallback(() => {
    setVideoState(prev => ({ ...prev, mode: 'iframe' }));
  }, []);

  const closePlayer = useCallback(() => {
    if (window.history.state?.player) {
      window.history.back();
    } else {
      setVideoState(prev => ({ ...prev, isOpen: false }));
      setEpisodeContext(null);
      setAnimeResolve(null);
    }
  }, []);

  return (
    <VideoPlayerContext.Provider value={{
      videoState,
      episodeContext,
      animeResolve,
      playMovie,
      playEpisode,
      nextEpisode,
      previousEpisode,
      switchAnimeCategory,
      fallbackToIframe,
      closePlayer,
    }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
}
