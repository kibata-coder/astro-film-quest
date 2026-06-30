import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { getTVShowSeasonDetails } from '@/lib/tmdb';
import { addToHistory } from '@/lib/watchHistory';
import { getMalIdByTitle, isAnimeMedia } from '@/lib/anime';
import type { Movie, TVShow } from '@/lib/tmdb';
import type { VideoState, TVEpisodeContext } from '@/types/media';

type PlayerMode = 'iframe' | 'resolving' | 'megaplay';

interface ExtendedVideoState extends VideoState {
  mode: PlayerMode;
  malId?: number;
}

interface VideoPlayerContextType {
  videoState: ExtendedVideoState;
  episodeContext: TVEpisodeContext | null;
  playMovie: (movie: Movie) => Promise<void>;
  playEpisode: (
    show: TVShow,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string
  ) => Promise<void>;
  nextEpisode: () => Promise<void>;
  previousEpisode: () => Promise<void>;
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

  const isOpenRef = useRef(false);
  useEffect(() => { isOpenRef.current = videoState.isOpen; }, [videoState.isOpen]);

  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
  };

  useEffect(() => {
    // SHIELD 1: The Hash Guard (Stops the player from crashing)
    const handlePopState = () => {
      if (window.location.hash === '#player') return;
      if (window.history.state?.player) return;
      
      if (isOpenRef.current) {
        setVideoState(prev => ({ ...prev, isOpen: false }));
        setEpisodeContext(null);
      }
    };

    // SHIELD 2: The Hijack Blocker (Stops the ad from opening)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpenRef.current) {
        e.preventDefault();
        e.returnValue = ''; // Required by the browser engine to block the ad redirect
        return '';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const playMovie = useCallback(async (movie: Movie) => {
    // Append #player to the URL path
    window.history.pushState({ player: true }, '', window.location.pathname + '#player');

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
      setVideoState({
        isOpen: true,
        title: movie.title,
        mediaId: movie.id,
        mediaType: 'movie',
        mode: 'resolving',
      });

      const malId = await getMalIdByTitle(movie.title, 'movie');
      if (malId) {
        setVideoState({
          isOpen: true,
          title: movie.title,
          mediaId: movie.id,
          mediaType: 'movie',
          mode: 'megaplay',
          malId: malId,
        });
        return;
      }
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
    // Append #player to the URL path
    window.history.pushState({ player: true }, '', window.location.pathname + '#player');
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

    // Background: load TMDB season details
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

      const malId = await getMalIdByTitle(show.name, 'tv');
      if (malId) {
        setVideoState({
          isOpen: true,
          title: `${show.name} - ${episodeName}`,
          mediaId: show.id,
          mediaType: 'tv',
          seasonNumber,
          episodeNumber,
          episodeName,
          mode: 'megaplay',
          malId: malId,
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
  }, [episodeContext, videoState]);

  const nextEpisode = useCallback(() => stepEpisode(1), [stepEpisode]);
  const previousEpisode = useCallback(() => stepEpisode(-1), [stepEpisode]);

  const fallbackToIframe = useCallback(() => {
    setVideoState(prev => ({ ...prev, mode: 'iframe' }));
  }, []);

  const closePlayer = useCallback(() => {
    isOpenRef.current = false;
    
    setVideoState(prev => ({ ...prev, isOpen: false }));
    setEpisodeContext(null);

    if (window.history.state?.player || window.location.hash === '#player') {
      window.history.back();
    }
  }, []);

  return (
    <VideoPlayerContext.Provider value={{
      videoState,
      episodeContext,
      playMovie,
      playEpisode,
      nextEpisode,
      previousEpisode,
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
