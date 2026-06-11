import { memo } from 'react';
import { Radio, ArrowRight } from 'lucide-react';

const SoudSportBanner = memo(() => {
  return (
    <section className="px-5 md:px-16 -mt-12 md:-mt-20 relative z-20">
      <a
        href="https://soudsports.pages.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-5 py-4 md:px-6 md:py-5 hover:border-primary/60 transition-colors"
      >
        <div className="flex items-start md:items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-foreground">
              Looking for live sports? Check out SoudSport.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Live football streams, scores & highlights — our sister site.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium group-hover:opacity-90 transition-opacity">
          Go to SoudSport
          <ArrowRight className="w-4 h-4" />
        </span>
      </a>
    </section>
  );
});

SoudSportBanner.displayName = 'SoudSportBanner';

export default SoudSportBanner;
