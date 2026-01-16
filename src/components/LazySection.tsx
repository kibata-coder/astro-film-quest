import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
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
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once visible, we can disconnect
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

  return (
    <div ref={ref} className={cn("min-h-[200px]", className)}>
      {hasBeenVisible ? (
        <div className={cn(
          "transition-opacity duration-500",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          {children}
        </div>
      ) : (
        fallback || (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 md:w-44">
                <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
                <div className="mt-2 h-4 bg-muted rounded animate-pulse" />
                <div className="mt-1 h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default LazySection;
