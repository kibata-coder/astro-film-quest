import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { getTVShowSeasonDetails } from '@/lib/tmdb';
import { addToHistory } from '@/lib/watchHistory';
import type { Movie, TVShow } from '@/lib/tmdb';
import type { VideoState, TVEpisodeContext, ServerType } from '@/types/media';

interface VideoPlayerContextType {
  videoState: VideoState;
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
  closePlayer: () => void;
  changeServer: (server: ServerType) => void;
}

const initialVideoState: VideoState = {
  isOpen: false,
  title: '',
  mediaId: 0,
  mediaType: 'movie',
  server: 'vidsrc',
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [videoState, setVideoState] = useState<VideoState>(initialVideoState);
  const [episodeContext, setEpisodeContext] = useState<TVEpisodeContext | null>(null);

  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
  };

  // Handle Browser Back Button for Player
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If the state is not 'player', close the player
      if (!event.state || !event.state.player) {
        if (videoState.isOpen) {
           setVideoState(prev => ({ ...prev, isOpen: false }));
           setEpisodeContext(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [videoState.isOpen]);

  const playMovie = useCallback(async (movie: Movie) => {
    await addToHistory({
      id: movie.id,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path || '',
    });
    notifyHistoryUpdate();

    // Push player state
    window.history.pushState({ player: true }, '', window.location.pathname);

    setVideoState(prev => ({
      ...prev,
      isOpen: true,
      title: movie.title,
      mediaId: movie.id,
      mediaType: 'movie',
    }));
  }, []);

  const playEpisode = useCallback(async (
    show: TVShow,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string
  ) => {
    await addToHistory({
      id: show.id,
      media_type: 'tv',
      title: show.name,
      poster_path: show.poster_path || '',
      season_number: seasonNumber,
      episode_number: episodeNumber,
    });
    notifyHistoryUpdate();

    try {
      const seasonDetails = await getTVShowSeasonDetails(show.id, seasonNumber);
      setEpisodeContext({
        showId: show.id,
        showName: show.name,
        seasonNumber,
        episodes: seasonDetails.episodes || [],
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path || null,
      });
    } catch (error) {
      console.error('Failed to fetch season details:', error);
      setEpisodeContext(null);
    }

    // Push player state
    window.history.pushState({ player: true }, '', window.location.pathname);

    setVideoState(prev => ({
      ...prev,
      isOpen: true,
      title: `${show.name} - ${episodeName}`,
      mediaId: show.id,
      mediaType: 'tv',
      seasonNumber,
      episodeNumber,
      episodeName,
    }));
  }, []);

  const nextEpisode = useCallback(async () => {
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
  }, [episodeContext, videoState.episodeNumber]);

  const previousEpisode = useCallback(async () => {
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
  }, [episodeContext, videoState.episodeNumber]);

  const closePlayer = useCallback(() => {
    // Use history back to close if appropriate
    if (window.history.state?.player) {
      window.history.back();
    } else {
      setVideoState(prev => ({ ...prev, isOpen: false }));
      setEpisodeContext(null);
    }
  }, []);

  const changeServer = useCallback((server: ServerType) => {
    setVideoState(prev => ({ ...prev, server }));
  }, []);

  return (
    <VideoPlayerContext.Provider value={{
      videoState,
      episodeContext,
      playMovie,
      playEpisode,
      nextEpisode,
      previousEpisode,
      closePlayer,
      changeServer,
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
