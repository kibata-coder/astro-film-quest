import { useState, useEffect, memo } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie, getBackdropUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

const HeroBanner = memo(({ movies, onPlay, onInfo }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featuredMovies = movies.slice(0, 5);
  const currentMovie = featuredMovies[currentIndex];

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    
    const timer = setInterval(() => {
      handleNext();
    }, 10000);

    return () => clearInterval(timer);
  }, [currentIndex, featuredMovies.length]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
      setIsTransitioning(false);
    }, 300);
  };

  if (!currentMovie) return null;

  const backdropUrl = getBackdropUrl(currentMovie.backdrop_path, 'w1280');

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
        style={{
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : undefined,
          backgroundColor: backdropUrl ? undefined : 'hsl(var(--muted))',
        }}
      />

      {/* Simplified Gradient for performance */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 pb-20 md:pb-32">
        <div className={cn(
          "max-w-2xl transition-all duration-500",
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 line-clamp-2">
            {currentMovie.title}
          </h1>

          {/* Meta Info */}
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

          {/* Overview */}
          <p className="text-sm md:text-base text-muted-foreground mb-8 line-clamp-3 max-w-xl">
            {currentMovie.overview}
          </p>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => onPlay(currentMovie)}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Play
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onInfo(currentMovie)}
              className="gap-2"
            >
              <Info className="w-5 h-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? "bg-foreground w-6" : "bg-foreground/40 hover:bg-foreground/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HeroBanner.displayName = 'HeroBanner';

export default HeroBanner;
