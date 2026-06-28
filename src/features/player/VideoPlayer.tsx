import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Server, Subtitles, Loader2, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMovieEmbedUrl, getTVShowEmbedUrl, getProviders } from '@/lib/vidsrc';
import { searchSubtitles, getSubtitleProxyUrl, SubtitleResult } from '@/lib/subtitles';
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
}

const PROVIDER_STORAGE_KEY = 'soudflex.preferredProvider';

const SUBTITLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
];

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
}: VideoPlayerProps) => {
  const providers = getProviders();
  const [providerIdx, setProviderIdx] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
    const n = stored ? parseInt(stored, 10) : 0;
    return Number.isFinite(n) && n >= 0 && n < providers.length ? n : 0;
  });
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // ── Subtitle state ──────────────────────────────────────────────────────────
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [subLang, setSubLang] = useState('en');
  const [subtitles, setSubtitles] = useState<SubtitleResult[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedSubFileId, setSelectedSubFileId] = useState<number | null>(null);
  const [activeSubUrl, setActiveSubUrl] = useState<string | null>(null);
  const [applyingSubId, setApplyingSubId] = useState<number | null>(null);

  // ── Provider sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n) && n >= 0 && n < providers.length) {
          setProviderIdx(n);
        }
      }
    }
  }, [isOpen, providers.length]);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // ── Duration fetch ──────────────────────────────────────────────────────────
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
      } catch {
        durationRef.current = 7200;
      }
    };
    fetchDuration();
    startTimeRef.current = Date.now();
  }, [isOpen, mediaId, mediaType]);

  useEffect(() => {
    if (!isOpen) startTimeRef.current = 0;
  }, [isOpen]);

  // ── Keyboard handler ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, mediaId, mediaType, title, seasonNumber, episodeNumber]);

  // ── Reset subtitle state when media changes ─────────────────────────────────
  useEffect(() => {
    setActiveSubUrl(null);
    setSelectedSubFileId(null);
    setSubtitles([]);
    setShowSubPanel(false);
  }, [mediaId, seasonNumber, episodeNumber]);

  // ── Subtitle search ─────────────────────────────────────────────────────────
  const handleOpenSubPanel = useCallback(async () => {
    setShowSubPanel(true);
    if (subtitles.length > 0) return; // already loaded for this lang
    setSubLoading(true);
    try {
      const type = mediaType === 'tv' ? 'episode' : 'movie';
      const results = await searchSubtitles({
        tmdbId: mediaId,
        type,
        language: subLang,
        season: seasonNumber,
        episode: episodeNumber,
      });
      setSubtitles(results);
    } finally {
      setSubLoading(false);
    }
  }, [mediaId, mediaType, subLang, seasonNumber, episodeNumber, subtitles.length]);

  const handleLangChange = async (lang: string) => {
    setSubLang(lang);
    setSubtitles([]);
    setSubLoading(true);
    try {
      const type = mediaType === 'tv' ? 'episode' : 'movie';
      const results = await searchSubtitles({
        tmdbId: mediaId,
        type,
        language: lang,
        season: seasonNumber,
        episode: episodeNumber,
      });
      setSubtitles(results);
    } finally {
      setSubLoading(false);
    }
  };

  // ── Apply a subtitle to vidsrc via sub_url ──────────────────────────────────
  const handleSelectSubtitle = async (sub: SubtitleResult) => {
    if (applyingSubId === sub.file_id) return;
    setApplyingSubId(sub.file_id);
    try {
      const proxyUrl = await getSubtitleProxyUrl(sub.file_id);
      if (!proxyUrl) throw new Error('No proxy URL');
      setActiveSubUrl(proxyUrl);
      setSelectedSubFileId(sub.file_id);
      setShowSubPanel(false);
    } catch (err) {
      console.error('[subtitle select]', err);
    } finally {
      setApplyingSubId(null);
    }
  };

  const handleDisableSubtitles = () => {
    setActiveSubUrl(null);
    setSelectedSubFileId(null);
    setShowSubPanel(false);
  };

  // ── Close ───────────────────────────────────────────────────────────────────
  const handleClose = () => {
    if (startTimeRef.current > 0 && durationRef.current > 0) {
      const timeSpentSeconds = (Date.now() - startTimeRef.current) / 1000;
      saveWatchProgress(
        {
          id: mediaId,
          media_type: mediaType,
          title,
          poster_path: '',
          season_number: seasonNumber,
          episode_number: episodeNumber,
        },
        timeSpentSeconds,
        durationRef.current
      );
    }
    onClose();
  };

  // ── Build embed URL (with optional sub_url injected) ─────────────────────────
  const buildEmbedUrl = () => {
    let base =
      mediaType === 'tv' && seasonNumber && episodeNumber
        ? getTVShowEmbedUrl(mediaId, seasonNumber, episodeNumber, providerIdx)
        : getMovieEmbedUrl(mediaId, providerIdx);

    if (activeSubUrl && providerIdx === 0) {
      // Only inject sub_url for Server 1 (vidsrcme.su) — it supports the parameter
      const separator = base.includes('?') ? '&' : '?';
      base += `${separator}sub_url=${encodeURIComponent(activeSubUrl)}&ds_lang=${subLang}`;
    }
    return base;
  };

  const embedUrl = buildEmbedUrl();
  const isTVShow = mediaType === 'tv' && seasonNumber && episodeNumber;
  const isFirstEpisode = episodeNumber === 1;
  const isLastEpisode = episodeNumber === totalEpisodes;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          {isTVShow && (
            <p className="truncate text-xs text-muted-foreground">
              S{seasonNumber} E{episodeNumber}: {episodeName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Server selector */}
          <Select
            value={String(providerIdx)}
            onValueChange={(v) => {
              const idx = Number(v);
              setProviderIdx(idx);
              try { window.localStorage.setItem(PROVIDER_STORAGE_KEY, String(idx)); } catch {}
            }}
          >
            <SelectTrigger className="h-8 gap-1.5 w-[155px] text-xs bg-background border-border/60">
              <Server className="w-3 h-3 shrink-0" />
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent className="z-[9999]" position="popper" sideOffset={8}>
              {providers.map((p, i) => (
                <SelectItem key={p.id} value={String(i)} className="text-xs cursor-pointer">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subtitle button — only for Server 1 which supports sub_url */}
          {providerIdx === 0 && (
            <Button
              variant={activeSubUrl ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 relative"
              onClick={handleOpenSubPanel}
              aria-label="Subtitles"
              title={activeSubUrl ? 'Subtitles active — click to change' : 'Add subtitles'}
            >
              <Subtitles className="h-4 w-4" />
              {activeSubUrl && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          )}

          {isTVShow && totalEpisodes && (
            <>
              <Button variant="ghost" size="icon" onClick={onPreviousEpisode} disabled={isFirstEpisode} aria-label="Previous episode">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onNextEpisode} disabled={isLastEpisode} aria-label="Next episode">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close player">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Video area ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 bg-black">
        <iframe
          key={`${mediaId}-${seasonNumber ?? 'm'}-${episodeNumber ?? 'm'}-${providerIdx}-${activeSubUrl ?? 'nosub'}`}
          src={embedUrl}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          allowFullScreen
        />

        {/* ── Subtitle panel (slides in from the right) ─────────────────────── */}
        {showSubPanel && (
          <div className="absolute inset-y-0 right-0 z-20 flex flex-col w-80 bg-background/95 backdrop-blur border-l border-border shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Subtitles className="w-4 h-4" />
                Subtitles
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSubPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Language selector */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" /> Language
              </div>
              <Select value={subLang} onValueChange={handleLangChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {SUBTITLE_LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code} className="text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subtitle list */}
            <div className="flex-1 overflow-y-auto">
              {/* Disable option */}
              {activeSubUrl && (
                <button
                  className="w-full text-left px-4 py-2.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors border-b border-border/40"
                  onClick={handleDisableSubtitles}
                >
                  ✕ Turn off subtitles
                </button>
              )}

              {subLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching subtitles…
                </div>
              ) : subtitles.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground px-4">
                  No subtitles found for this language.
                  <br />Try a different language above.
                </div>
              ) : (
                subtitles.map((sub) => {
                  const isActive = selectedSubFileId === sub.file_id;
                  const isApplying = applyingSubId === sub.file_id;
                  return (
                    <button
                      key={sub.id}
                      className={`w-full text-left px-4 py-3 border-b border-border/30 transition-colors flex items-start gap-2 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-accent/50 text-foreground'
                      }`}
                      onClick={() => handleSelectSubtitle(sub)}
                      disabled={isApplying}
                    >
                      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                        {isApplying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isActive ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {sub.file_name || sub.release || `Subtitle #${sub.file_id}`}
                        </p>
                        {sub.hi && (
                          <span className="text-[10px] text-muted-foreground">Hearing impaired</span>
                        )}
                        {sub.uploader && (
                          <p className="text-[10px] text-muted-foreground truncate">by {sub.uploader}</p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <p className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border">
              Powered by OpenSubtitles · Server 1 only
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
