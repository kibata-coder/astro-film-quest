import { useRef, useState, useEffect, ReactNode, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ScrollableSectionProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const ScrollableSection = memo(({ 
  title, 
  icon: Icon, 
  children,
  className 
}: ScrollableSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className={cn("mb-10 md:mb-14 relative group/section", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
            "bg-background/90 shadow-lg border border-border",
            "transition-all duration-300",
            canScrollLeft 
              ? "opacity-0 group-hover/section:opacity-100 hover:bg-primary hover:text-primary-foreground" 
              : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
            "bg-background/90 shadow-lg border border-border",
            "transition-all duration-300",
            canScrollRight 
              ? "opacity-0 group-hover/section:opacity-100 hover:bg-primary hover:text-primary-foreground" 
              : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Left Gradient */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none transition-opacity",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Right Gradient */}
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none transition-opacity",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        >
          {children}
        </div>
      </div>
    </section>
  );
});

ScrollableSection.displayName = 'ScrollableSection';

export default ScrollableSection;
