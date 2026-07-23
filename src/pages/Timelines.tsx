import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { FRANCHISE_TIMELINES, TimelineFranchise } from '@/lib/timelines';
import { getWatchHistory, WatchHistoryItem } from '@/lib/watchHistory';
import { Sparkles, Compass, Film, Tv, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Timelines = memo(() => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    getWatchHistory().then(setHistory).catch(console.error);

    const onUpdate = () => {
      getWatchHistory().then(setHistory).catch(console.error);
    };
    window.addEventListener('watch-history-updated', onUpdate);
    return () => window.removeEventListener('watch-history-updated', onUpdate);
  }, []);

  // Calculate watched count for a franchise
  const getWatchedCount = (franchise: TimelineFranchise) => {
    const watchedIds = new Set(
      history
        .filter((h) => h.completed || h.progress > 0.5)
        .map((h) => h.id)
    );
    return franchise.items.filter((item) => watchedIds.has(item.id)).length;
  };

  return (
    <Layout>
      <Seo
        title="Franchise Timelines & Story Orders — SoudFlex"
        description="Watch Marvel, Star Wars, DC, and Anime sagas in official chronological story order or release date order with progress tracking."
        canonicalPath="/timelines"
      />

      <main className="pt-28 pb-20 px-5 md:px-16">
        {/* Header banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-8 md:p-12 mb-12 border border-primary/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5" /> Interactive Story Orders
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              Franchise Timeline Guides
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Never wonder what order to watch in again. Explore the official story timelines for Marvel, Star Wars, DC, and major anime sagas — and track your progress as you watch.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Timeline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FRANCHISE_TIMELINES.map((franchise) => {
            const watchedCount = getWatchedCount(franchise);
            const totalCount = franchise.items.length;
            const percentage = Math.round((watchedCount / totalCount) * 100);

            return (
              <Link
                key={franchise.id}
                to={`/timeline/${franchise.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col"
              >
                {/* Banner / Poster Header */}
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={franchise.bannerUrl}
                    alt={franchise.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  
                  {/* Badge */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/20"
                    style={{ background: franchise.accentColor + 'cc' }}
                  >
                    {franchise.shortName} Universe
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {franchise.name}
                    </h2>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {franchise.tagline}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        {watchedCount} of {totalCount} Watched
                      </span>
                      <span className="text-muted-foreground font-mono">{percentage}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
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

                {/* Footer bar */}
                <div className="px-5 py-3 bg-white/5 flex items-center justify-between text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <span>Explore Timeline ({totalCount} Titles)</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </Layout>
  );
});

Timelines.displayName = 'Timelines';
export default Timelines;
