import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode | ((props: { isVisible: boolean }) => ReactNode);
  className?: string;
  rootMargin?: string;
  threshold?: number;
  fallback?: ReactNode;
}

const LazySection = ({ 
  children, 
  className, 
  rootMargin = '200px',
  threshold = 0.1,
  fallback 
}: LazySectionProps) => {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const defaultFallback = (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-36 md:w-44">
          <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          <div className="mt-2 h-4 bg-muted rounded animate-pulse" />
          <div className="mt-1 h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );

  return (
    <div ref={ref} className={cn("min-h-[200px]", className)}>
      {hasBeenVisible ? (
        <div className="transition-opacity duration-500 opacity-100">
          {typeof children === 'function' ? children({ isVisible: hasBeenVisible }) : children}
        </div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazySection;
