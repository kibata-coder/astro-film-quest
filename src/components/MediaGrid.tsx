import { memo } from 'react';
import type { Movie, TVShow } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';

type Item = Movie | TVShow;

interface MediaGridProps<T extends Item> {
  items: T[];
  onItemClick: (item: T) => void;
}

/**
 * Shared responsive media grid used across listing pages.
 * Single source of truth for the grid breakpoint pattern.
 */
function MediaGridInner<T extends Item>({ items, onItemClick }: MediaGridProps<T>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
    </div>
  );
}

const MediaGrid = memo(MediaGridInner) as typeof MediaGridInner;
export default MediaGrid;
