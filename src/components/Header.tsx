import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const Header = ({ onSearch, searchQuery }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-4',
        isScrolled ? 'bg-background' : 'bg-gradient-to-b from-background/80 to-transparent'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl md:text-3xl font-bold netflix-logo tracking-tight">
            SOUD FLIX
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center transition-all duration-300 overflow-hidden',
              isSearchOpen ? 'w-64 md:w-80 border border-border bg-background/90' : 'w-10'
            )}
          >
            {isSearchOpen && (
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            )}
            <button
              onClick={() => {
                if (isSearchOpen && searchQuery) {
                  onSearch('');
                }
                setIsSearchOpen(!isSearchOpen);
              }}
              className="p-2 hover:text-primary transition-colors"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
