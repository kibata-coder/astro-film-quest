import { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { getTimelineById, TimelineItem } from '@/lib/timelines';
import { getWatchHistory, saveWatchProgress, removeFromHistory, WatchHistoryItem } from '@/lib/watchHistory';
import { useMedia } from '@/features/shared';
import { ArrowLeft, Clock, Calendar, CheckCircle, Circle, Play, Film, Tv, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/tmdb';

const TimelinePage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const franchise = id ? getTimelineById(id) : undefined;
  const { openMovieModal, openTVModal } = useMedia();

  const [orderMode, setOrderMode] = useState<'chronological' | 'release'>('chronological');
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Load history
  useEffect(() => {
    getWatchHistory().then(setHistory).catch(console.error);

    const onUpdate = () => {
      getWatchHistory().then(setHistory).catch(console.error);
    };
    window.addEventListener('watch-history-updated', onUpdate);
    return () => window.removeEventListener('watch-history-updated', onUpdate);
  }, []);

  // Set of completed media IDs
  const watchedSet = useMemo(() => {
    return new Set(
      history
        .filter((h) => h.completed || h.progress > 0.5)
        .map((h) => h.id)
    );
  }, [history]);

  // Sort items according to active order mode
  const sortedItems = useMemo(() => {
    if (!franchise) return [];
    const items = [...franchise.items];
    if (orderMode === 'chronological') {
      return items.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
    }
    return items.sort((a, b) => a.releaseOrder - b.releaseOrder);
  }, [franchise, orderMode]);

  const totalCount = franchise?.items.length || 0;
  const watchedCount = useMemo(() => {
    if (!franchise) return 0;
    return franchise.items.filter((item) => watchedSet.has(item.id)).length;
  }, [franchise, watchedSet]);

  const percentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  // Toggle watched status manually
  const toggleItemWatched = async (e: React.MouseEvent, item: TimelineItem) => {
    e.stopPropagation();
    const isWatched = watchedSet.has(item.id);
    if (isWatched) {
      await removeFromHistory(item.id, item.media_type);
    } else {
      await saveWatchProgress(
        {
          id: item.id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
        },
        1000,
        1000
      );
    }
    window.dispatchEvent(new Event('watch-history-updated'));
  };

  // Launch modal on card click
  const handleItemClick = (item: TimelineItem) => {
    if (item.media_type === 'movie') {
      openMovieModal({
        id: item.id,
        title: item.title,
        overview: '',
        poster_path: item.poster_path,
        backdrop_path: null,
        release_date: `${item.year}-01-01`,
        vote_average: 8.0,
        vote_count: 100,
      });
    } else {
      openTVModal({
        id: item.id,
        name: item.title,
        overview: '',
        poster_path: item.poster_path,
        backdrop_path: null,
        first_air_date: `${item.year}-01-01`,
        vote_average: 8.0,
        vote_count: 100,
      });
    }
  };

  if (!franchise) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
          <p className="text-muted-foreground text-lg">Timeline not found.</p>
          <Link to="/timelines" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Timelines
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title={`${franchise.name} Timeline Story Order Guide | SoudFlex`}
        description={franchise.description}
        canonicalPath={`/timeline/${franchise.id}`}
      />

      {/* ── Hero Banner ── */}
      <div className="relative pt-24 pb-12 px-5 md:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src={franchise.bannerUrl}
            alt={franchise.name}
            className="w-full h-full object-cover opacity-35 blur-md"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <Link
            to="/timelines"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> All Timelines
          </Link>

          <h1 className="text-3xl md:text-5xl font-black mb-3">{franchise.name} Timeline</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed mb-6">
            {franchise.description}
          </p>

          {/* Controls + Progress Bar */}
          <div className="p-5 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Order mode switch */}
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border self-start">
                <button
                  onClick={() => setOrderMode('chronological')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderMode === 'chronological'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Story Chronological
                </button>
                <button
                  onClick={() => setOrderMode('release')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    orderMode === 'release'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Release Date
                </button>
              </div>

              {/* Watched score */}
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>{watchedCount} / {totalCount} Completed</span>
                <span className="text-muted-foreground">({percentage}%)</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: franchise.accentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline Track ── */}
      <main className="px-5 md:px-16 pb-24 max-w-4xl mx-auto relative">
        <div className="relative border-l-2 border-primary/30 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 pt-4">
          {sortedItems.map((item, index) => {
            const isWatched = watchedSet.has(item.id);
            const posterUrl = getImageUrl(item.poster_path, 'w300');
            const stepNum = orderMode === 'chronological' ? item.chronologicalOrder : item.releaseOrder;

            // Render phase divider header when phase changes
            const prevItem = index > 0 ? sortedItems[index - 1] : null;
            const showPhaseHeader = !prevItem || prevItem.phase !== item.phase;

            return (
              <div key={`${item.id}-${index}`} className="relative group">
                {/* Phase Header Divider */}
                {showPhaseHeader && (
                  <div className="-ml-10 md:-ml-14 mb-6 pt-4 flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 shadow-lg"
                      style={{ background: franchise.accentColor }}
                    >
                      {item.phase}
                    </span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                )}

                {/* Timeline node dot on line */}
                <div
                  className={`absolute -left-[31px] md:-left-[47px] top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition-all ${
                    isWatched
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.6)]'
                      : 'bg-background border-border text-muted-foreground group-hover:border-primary'
                  }`}
                >
                  {isWatched ? <CheckCircle className="w-4 h-4 fill-current" /> : stepNum}
                </div>

                {/* Item Card */}
                <div
                  onClick={() => handleItemClick(item)}
                  className={`relative overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-md p-4 md:p-5 transition-all duration-300 cursor-pointer flex gap-4 md:gap-6 items-center ${
                    isWatched
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-white/10 hover:border-primary/50 hover:shadow-xl'
                  }`}
                >
                  {/* Poster */}
                  <div className="w-16 sm:w-20 md:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-muted flex-shrink-0 relative shadow-md">
                    {posterUrl ? (
                      <img src={posterUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.media_type === 'movie' ? <Film className="w-6 h-6" /> : <Tv className="w-6 h-6" />}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        #{stepNum}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {item.year > 1000 ? item.year : `${item.year} BBY/ABY`}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {item.media_type}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    {item.note && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        💡 {item.note}
                      </p>
                    )}
                  </div>

                  {/* Checkbox button */}
                  <button
                    onClick={(e) => toggleItemWatched(e, item)}
                    title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                    className={`p-2.5 rounded-full border transition-all shrink-0 ${
                      isWatched
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {isWatched ? <CheckCircle className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </Layout>
  );
});

TimelinePage.displayName = 'TimelinePage';
export default TimelinePage;
