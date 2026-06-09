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

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const getCurrentPath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const enterFullscreen = () => {
  const target = document.documentElement as FullscreenElement;
  const requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen;
  if (!requestFullscreen) return;

  try {
    const result = requestFullscreen.call(target);
    void Promise.resolve(result).catch(() => undefined);
  } catch {
    // Some TV browsers only allow fullscreen on their native player surface.
  }
};

const exitFullscreen = () => {
  const fullscreenDocument = document as FullscreenDocument;
  if (!document.fullscreenElement && !fullscreenDocument.webkitFullscreenElement) return;

  try {
    const result = document.exitFullscreen
      ? document.exitFullscreen()
      : fullscreenDocument.webkitExitFullscreen?.();
    void Promise.resolve(result).catch(() => undefined);
  } catch {
    // Ignore unsupported fullscreen exits on embedded TV browsers.
  }
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [videoState, setVideoState] = useState<ExtendedVideoState>(initialVideoState);
  const [episodeContext, setEpisodeContext] = useState<TVEpisodeContext | null>(null);
  const [animeResolve, setAnimeResolve] = useState<AnimeResolve | null>(null);

  const isOpenRef = useRef(false);
  const playerPathRef = useRef<string | null>(null);
  useEffect(() => { isOpenRef.current = videoState.isOpen; }, [videoState.isOpen]);

  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
  };

  useEffect(() => {
    const handler = () => {
      if (!isOpenRef.current) return;

      const playerPath = playerPathRef.current;
      if (playerPath && getCurrentPath() !== playerPath) {
        window.history.pushState(window.history.state ?? {}, '', playerPath);
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
    playerPathRef.current = getCurrentPath();
    enterFullscreen();

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
    playerPathRef.current = getCurrentPath();
    enterFullscreen();
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

  const stepEpisode = useCallback(async (delta: 1 | -1) => {
    // Anime mode → walk animeResolve.episodes
    if (videoState.mode === 'anime' && animeResolve && videoState.animeEpisodeId) {
      const idx = animeResolve.episodes.findIndex(e => e.id === videoState.animeEpisodeId);
      const targetIdx = idx + delta;
      if (idx === -1 || targetIdx < 0 || targetIdx >= animeResolve.episodes.length) return;
      const target = animeResolve.episodes[targetIdx];
      const showName = videoState.title.split(' - ')[0];
      await addToHistory({
        id: videoState.mediaId,
        media_type: 'tv',
        title: showName,
        poster_path: episodeContext?.posterPath || '',
        season_number: videoState.seasonNumber,
        episode_number: target.number,
      });
      notifyHistoryUpdate();
      setVideoState(prev => ({
        ...prev,
        episodeNumber: target.number,
        episodeName: target.title || `Episode ${target.number}`,
        title: `${showName} - ${target.title || `Episode ${target.number}`}`,
        animeEpisodeId: target.id,
        animeHasDub: target.hasDub,
      }));
      return;
    }

    // Iframe mode → TMDB episode list
    if (!episodeContext || !videoState.episodeNumber) return;
    const currentIdx = episodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );
    const targetIdx = currentIdx + delta;
    if (currentIdx === -1 || targetIdx < 0 || targetIdx >= episodeContext.episodes.length) return;
    const target = episodeContext.episodes[targetIdx];
    await addToHistory({
      id: episodeContext.showId,
      media_type: 'tv',
      title: episodeContext.showName,
      poster_path: episodeContext.posterPath || '',
      season_number: episodeContext.seasonNumber,
      episode_number: target.episode_number,
    });
    notifyHistoryUpdate();
    setVideoState(prev => ({
      ...prev,
      title: `${episodeContext.showName} - ${target.name}`,
      episodeNumber: target.episode_number,
      episodeName: target.name,
    }));
  }, [episodeContext, videoState, animeResolve]);

  const nextEpisode = useCallback(() => stepEpisode(1), [stepEpisode]);
  const previousEpisode = useCallback(() => stepEpisode(-1), [stepEpisode]);

  const switchAnimeCategory = useCallback((category: 'sub' | 'dub') => {
    setVideoState(prev => ({ ...prev, animeCategory: category }));
  }, []);

  const fallbackToIframe = useCallback(() => {
    setVideoState(prev => ({ ...prev, mode: 'iframe' }));
  }, []);

  const closePlayer = useCallback(() => {
    setVideoState(prev => ({ ...prev, isOpen: false }));
    setEpisodeContext(null);
    setAnimeResolve(null);
    playerPathRef.current = null;
    exitFullscreen();
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
