// src/features/player/VideoPlayer.tsx

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMovieEmbedUrl, getTVShowEmbedUrl, getProviders } from '@/lib/vidsrc';
import { saveWatchProgress } from '@/lib/watchHistory';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  totalEpisodes?: number;
  episodeName?: string;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  anilistId?: number;
}

const PROVIDER_STORAGE_KEY = 'soudflex.preferredProvider';

const VideoPlayer = ({
  isOpen,
  onClose,
  title,
  mediaId,
  mediaType,
  seasonNumber,
  episodeNumber,
  totalEpisodes,
  episodeName,
  onNextEpisode,
  onPreviousEpisode,
  anilistId,
}: VideoPlayerProps) => {
  const providers = getProviders();
  const [providerIdx, setProviderIdx] = useState<number>(0);
  const [audioTrack, setAudioTrack] = useState<'sub' | 'dub'>('sub');

  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const animoTimeRef = useRef<number>(0);
  const animoDurationRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        // SAFETY: Prevents Server 4 from silently hiding and executing Server 1 if anilistId is missing
        if (n === 3 && !anilistId) {
          setProviderIdx(0); 
        } else if (Number.isFinite(n) && n >= 0 && n < providers.length) {
          setProviderIdx(n);
        }
      }
    }
  }, [isOpen, providers.length, anilistId]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mediaId) return;
    const fetchDuration = async () => {
      try {
        if (mediaType === 'movie') {
          const details = await getMovieDetails(mediaId);
          durationRef.current = (details.runtime || 0) * 60;
          return;
        }
        const details = await getTVShowDetails(mediaId);
        durationRef.current = (details.episode_run_time?.[0] || 45) * 60;
      } catch (error) {
        console.error('Could not fetch runtime', error);
        durationRef.current = 7200;
      }
    };
    fetchDuration();
    startTimeRef.current = Date.now();
  }, [isOpen, mediaId, mediaType]);

  useEffect(() => {
    if (!isOpen) {
      startTimeRef.current = 0;
      animoTimeRef.current = 0;
      animoDurationRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { return; }
      }
      if (data && typeof data === 'object') {
        if (data.event === 'complete' && onNextEpisode && episodeNumber !== totalEpisodes) {
          onNextEpisode();
        } else if (data.event === 'time') {
          if (typeof data.time === 'number') animoTimeRef.current = data.time;
          if (typeof data.duration === 'number') animoDurationRef.current = data.duration;
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onNextEpisode, episodeNumber, totalEpisodes]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleClose = () => {
    let timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;
    let duration = durationRef.current;

    if (animoTimeRef.current > 0) {
      timeSpentSeconds = animoTimeRef.current;
      if (animoDurationRef.current > 0) duration = animoDurationRef.current;
    }

    if (startTimeRef.current > 0 && duration > 0) {
      saveWatchProgress(
        { id: mediaId, media_type: mediaType, title, poster_path: '', season_number: seasonNumber, episode_number: episodeNumber },
        timeSpentSeconds,
        duration
      );
    }
    onClose();
  };

  const embedUrl = mediaType === 'tv' && seasonNumber && episodeNumber
      ? getTVShowEmbedUrl(mediaId, seasonNumber, episodeNumber, providerIdx, title, anilistId, audioTrack)
      : getMovieEmbedUrl(mediaId, providerIdx, title, anilistId, audioTrack);

  const isTVShow = mediaType === 'tv' && seasonNumber && episodeNumber;
  const isFirstEpisode = episodeNumber === 1;
  const isLastEpisode = episodeNumber === totalEpisodes;
  const showNextEpisodeButton = isTVShow && totalEpisodes && !isLastEpisode && onNextEpisode;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0f0f0f]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#0f0f0f]/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/80">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
          {isTVShow && <p className="truncate text-xs text-white/60">S{seasonNumber} E{episodeNumber}: {episodeName}</p>}
        </div>

        <div className="flex items-center gap-1">
          <select
            value={providerIdx}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setProviderIdx(val);
              if (typeof window !== 'undefined') window.localStorage.setItem(PROVIDER_STORAGE_KEY, val.toString());
            }}
            className="mr-3 h-7 cursor-pointer rounded-md border border-white/20 bg-black/40 px-2 text-xs text-white/80 outline-none transition-colors hover:border-white/40 hover:text-white focus:ring-1 focus:ring-[#2563eb]"
          >
            {providers.map((p, idx) => {
              if (p.id === '4animo' && !anilistId) return null;
              return <option key={p.id} value={idx} className="bg-[#0f0f0f] text-white">{p.name}</option>;
            })}
          </select>

          {anilistId && providerIdx === 3 && (
            <div className="mr-2 flex overflow-hidden rounded-full border border-white/20 bg-black/40 text-xs">
              <button type="button" onClick={() => setAudioTrack('sub')} className={`px-3 py-1 transition-colors ${audioTrack === 'sub' ? 'bg-[#2563eb] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>SUB</button>
              <button type="button" onClick={() => setAudioTrack('dub')} className={`px-3 py-1 transition-colors ${audioTrack === 'dub' ? 'bg-[#2563eb] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>DUB</button>
            </div>
          )}

          {isTVShow && totalEpisodes && (
            <>
              <Button variant="ghost" size="icon" onClick={onPreviousEpisode} disabled={isFirstEpisode} className="text-white hover:bg-white/10 hover:text-white"><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={onNextEpisode} disabled={isLastEpisode} className="text-white hover:bg-white/10 hover:text-white"><ChevronRight className="h-5 w-5" /></Button>
            </>
          )}

          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="relative flex-1 bg-black">
        {/* CHANGED: referrerPolicy is now 'origin' so 4Animo knows it's an iframe embed and doesn't block it! */}
        <iframe
          key={`${mediaId}-${seasonNumber ?? 'm'}-${episodeNumber ?? 'm'}-${providerIdx}-${audioTrack}`}
          src={embedUrl}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          allowFullScreen={true}
          allowfullscreen="true"
          referrerPolicy="origin" 
        />
        {showNextEpisodeButton && (
          <Button size="lg" onClick={onNextEpisode} className="absolute bottom-20 right-6 gap-2 rounded-full bg-white px-6 font-semibold text-black shadow-lg hover:bg-white/90">
            <SkipForward className="h-5 w-5" /> Next Episode
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
