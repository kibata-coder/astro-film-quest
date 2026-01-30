import { memo } from 'react';
import { Film } from 'lucide-react';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="px-4 md:px-12 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold netflix-logo">SOUD FLIX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for movies and TV shows.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold mb-3">Browse</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Movies</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">TV Shows</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Trending</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Latest</li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Indian</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">English</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">International</li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-3">Help</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">FAQ</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Contact</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SOUD FLIX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
