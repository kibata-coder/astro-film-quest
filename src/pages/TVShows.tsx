import { useState, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TVShow, Episode, getTVShowSeasonDetails } from '@/lib/tmdb';
import { useSearchMedia } from '@/hooks/use-media';
import { useDebounce } from '@/hooks/use-debounce';
import MediaCard from '@/components/MediaCard';
import { addToHistory } from '@/lib/watchHistory';
import {
  TrendingTVSection,
  IndianTVSection,
  EnglishTVSection,
} from '@/components/sections/MovieSections';

const TVShowModal = lazy(() => import('@/components/TVShowModal'));
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));

interface VideoState {
  isOpen: boolean;
  title: string;
  mediaId: number;
  mediaType: 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
}

interface TVEpisodeContext {
  showId: number;
  showName: string;
  seasonNumber: number;
  episodes: Episode[];
  posterPath: string | null;
}

const TVShows = () => {
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoState, setVideoState] = useState<VideoState>({
    isOpen: false,
    title: '',
    mediaId: 0,
    mediaType: 'tv'
  });
  const [tvEpisodeContext, setTvEpisodeContext] = useState<TVEpisodeContext | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: isSearching } = useSearchMedia(debouncedSearch);

  const handleShowClick = (show: TVShow) => {
    setSelectedShow(show);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedShow(null), 300);
  };

  const handlePlayTVShow = async (
    showId: number,
    showName: string,
    seasonNumber: number,
    episodeNumber: number,
    episodeName: string,
    posterPath: string | null
  ) => {
    await addToHistory({
      id: showId,
      media_type: 'tv',
      title: showName,
      poster_path: posterPath || '',
      season_number: seasonNumber,
      episode_number: episodeNumber,
    });
    window.dispatchEvent(new CustomEvent('watch-history-updated'));
    setIsModalOpen(false);

    try {
      const seasonDetails = await getTVShowSeasonDetails(showId, seasonNumber);
      setTvEpisodeContext({
        showId,
        showName,
        seasonNumber,
        episodes: seasonDetails.episodes || [],
        posterPath,
      });
    } catch (error) {
      console.error('Failed to fetch season details:', error);
      setTvEpisodeContext(null);
    }

    setVideoState({
      isOpen: true,
      title: `${showName} - ${episodeName}`,
      mediaId: showId,
      mediaType: 'tv',
      seasonNumber,
      episodeNumber,
      episodeName
    });
  };

  const handleNextEpisode = async () => {
    if (!tvEpisodeContext || !videoState.episodeNumber) return;
    const currentEpIndex = tvEpisodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );
    if (currentEpIndex === -1 || currentEpIndex >= tvEpisodeContext.episodes.length - 1) return;

    const nextEpisode = tvEpisodeContext.episodes[currentEpIndex + 1];
    await addToHistory({
      id: tvEpisodeContext.showId,
      media_type: 'tv',
      title: tvEpisodeContext.showName,
      poster_path: tvEpisodeContext.posterPath || '',
      season_number: tvEpisodeContext.seasonNumber,
      episode_number: nextEpisode.episode_number,
    });
    window.dispatchEvent(new CustomEvent('watch-history-updated'));

    setVideoState(prev => ({
      ...prev,
      title: `${tvEpisodeContext.showName} - ${nextEpisode.name}`,
      episodeNumber: nextEpisode.episode_number,
      episodeName: nextEpisode.name
    }));
  };

  const handlePreviousEpisode = async () => {
    if (!tvEpisodeContext || !videoState.episodeNumber) return;
    const currentEpIndex = tvEpisodeContext.episodes.findIndex(
      ep => ep.episode_number === videoState.episodeNumber
    );
    if (currentEpIndex <= 0) return;

    const prevEpisode = tvEpisodeContext.episodes[currentEpIndex - 1];
    await addToHistory({
      id: tvEpisodeContext.showId,
      media_type: 'tv',
      title: tvEpisodeContext.showName,
      poster_path: tvEpisodeContext.posterPath || '',
      season_number: tvEpisodeContext.seasonNumber,
      episode_number: prevEpisode.episode_number,
    });
    window.dispatchEvent(new CustomEvent('watch-history-updated'));

    setVideoState(prev => ({
      ...prev,
      title: `${tvEpisodeContext.showName} - ${prevEpisode.name}`,
      episodeNumber: prevEpisode.episode_number,
      episodeName: prevEpisode.name
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">TV Shows</h1>

        {debouncedSearch ? (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Search Results for "{debouncedSearch}"
            </h2>
            {isSearching ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 md:w-44">
                    <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : searchResults?.tvShows?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.tvShows.map((show) => (
                  <MediaCard
                    key={show.id}
                    item={show}
                    onClick={() => handleShowClick(show)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No TV shows found.</p>
            )}
          </section>
        ) : (
          <>
            <TrendingTVSection onShowClick={handleShowClick} />
            <IndianTVSection onShowClick={handleShowClick} />
            <EnglishTVSection onShowClick={handleShowClick} />
          </>
        )}
      </main>

      <Footer />

      <Suspense fallback={null}>
        <TVShowModal
          show={selectedShow}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPlay={handlePlayTVShow}
        />

        <VideoPlayer
          isOpen={videoState.isOpen}
          onClose={() => {
            setVideoState(p => ({ ...p, isOpen: false }));
            setTvEpisodeContext(null);
          }}
          {...videoState}
          totalEpisodes={tvEpisodeContext?.episodes.length}
          onNextEpisode={handleNextEpisode}
          onPreviousEpisode={handlePreviousEpisode}
        />
      </Suspense>
    </div>
  );
};

export default TVShows;
