import { useState, useEffect, useRef, memo } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie, getBackdropUrl } from '@/lib/tmdb';
import { pickBackdropSize, shouldReduceMotion } from '@/lib/connection';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

const HeroBanner = memo(({ movies, onPlay, onInfo }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reduceMotion = useRef(shouldReduceMotion());
  const backdropSize = useRef(pickBackdropSize());

  const featuredMovies = movies.slice(0, 5);
  const currentMovie = featuredMovies[currentIndex];

  // Auto-rotate, but skip on slow connections / low-end devices / reduced-motion users
  useEffect(() => {
    if (featuredMovies.length <= 1 || reduceMotion.current) return;

    let timer: number | undefined;
    const start = () => {
      timer = window.setInterval(() => {
        setIsTransitioning(true);
        window.setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
          setIsTransitioning(false);
        }, 250);
      }, 12000);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility, { passive: true });
    if (!document.hidden) start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [featuredMovies.length]);

  const goTo = (next: number) => {
    if (reduceMotion.current) {
      setCurrentIndex(next);
      return;
    }
    setIsTransitioning(true);
    window.setTimeout(() => {
      setCurrentIndex(next);
      setIsTransitioning(false);
    }, 250);
  };

  if (!currentMovie) return null;

  const backdropUrl = getBackdropUrl(currentMovie.backdrop_path, backdropSize.current);

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background image — using <img> so the browser preloads + decodes it natively.
          fetchpriority=high tells the browser this is the LCP element. */}
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt=""
          aria-hidden="true"
          decoding="async"
          // @ts-expect-error fetchpriority is a valid HTML attr not yet in React types
          fetchpriority="high"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          )}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 md:via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 md:from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 pb-24 md:pb-32">
        <div className={cn(
          'max-w-2xl transition-all duration-500',
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
        )}>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 line-clamp-2">
            {currentMovie.title}
          </h1>

          <div className="flex items-center gap-4 mb-5 text-sm md:text-base">
            {currentMovie.vote_average > 0 && (
              <span className="text-success font-semibold">
                {Math.round(currentMovie.vote_average * 10)}% Match
              </span>
            )}
            <span className="text-muted-foreground">
              {currentMovie.release_date?.slice(0, 4)}
            </span>
          </div>

          <p className="text-sm md:text-base text-muted-foreground mb-8 line-clamp-3 max-w-xl">
            {currentMovie.overview}
          </p>

          <div className="flex gap-4">
            <Button size="lg" onClick={() => onPlay(currentMovie)} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              <Play className="w-5 h-5" fill="currentColor" />
              Play
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onInfo(currentMovie)} className="gap-2">
              <Info className="w-5 h-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={() => goTo((currentIndex - 1 + featuredMovies.length) % featuredMovies.length)}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goTo((currentIndex + 1) % featuredMovies.length)}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {featuredMovies.length > 1 && (
        <div className="absolute bottom-10 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex ? 'bg-foreground w-6' : 'bg-foreground/40 hover:bg-foreground/60',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HeroBanner.displayName = 'HeroBanner';

export default HeroBanner;
