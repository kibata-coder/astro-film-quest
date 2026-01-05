import { Tv } from 'lucide-react';
import TVShowCard from './TVShowCard';
import type { TVShow } from '@/lib/tmdb';

interface TVShowSectionProps {
  title: string;
  shows: TVShow[];
  isLoading: boolean;
  onShowClick: (show: TVShow) => void;
}

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-40">
    <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
    <div className="mt-2 h-4 bg-muted rounded animate-pulse" />
    <div className="mt-1 h-3 w-16 bg-muted rounded animate-pulse" />
  </div>
);

const TVShowSection = ({ title, shows, isLoading, onShowClick }: TVShowSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Tv className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : shows.length > 0 ? (
          shows.map((show) => (
            <TVShowCard key={show.id} show={show} onClick={onShowClick} />
          ))
        ) : (
          <p className="text-muted-foreground">No shows available.</p>
        )}
      </div>
    </section>
  );
};

export default TVShowSection;
