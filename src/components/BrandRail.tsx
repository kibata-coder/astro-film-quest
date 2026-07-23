import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { RAIL_BRANDS } from '@/lib/brands';

/**
 * BrandRail — horizontal row of brand logos shown on the home page,
 * replacing the old SoudSportBanner. Shows the 6 most recognisable
 * brands and a "More →" chip that leads to /brands.
 */
const BrandRail = memo(() => {
  return (
    <section className="px-5 md:px-16 -mt-10 md:-mt-16 relative z-20">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Browse by Brand
        </h2>
        <Link
          to="/brands"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          See all brands <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Scrollable rail */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {RAIL_BRANDS.map((brand) => (
          <Link
            key={brand.id}
            to={`/brand/${brand.id}`}
            className="flex-shrink-0 group relative overflow-hidden rounded-xl border border-white/8 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:border-white/25 hover:shadow-[0_0_28px_var(--brand-glow)]"
            style={{ '--brand-glow': brand.color + '55' } as React.CSSProperties}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-14 w-36 md:h-16 md:w-44 object-cover"
              loading="lazy"
            />
            {/* Bottom edge glow on hover */}
            <div
              className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: brand.color }}
            />
          </Link>
        ))}

        {/* "More" chip */}
        <Link
          to="/brands"
          className="flex-shrink-0 flex flex-col items-center justify-center gap-1 h-14 w-20 md:h-16 md:w-24 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all duration-200 group"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            More
          </span>
        </Link>
      </div>
    </section>
  );
});

BrandRail.displayName = 'BrandRail';
export default BrandRail;
