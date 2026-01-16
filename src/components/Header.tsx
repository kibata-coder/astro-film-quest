import { useState, useEffect } from 'react';
import { Search, X, Film, Tv, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const navLinks = [
  { label: 'Movies', icon: Film },
  { label: 'TV Shows', icon: Tv },
];

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
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border' 
          : 'bg-gradient-to-b from-background via-background/60 to-transparent'
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6 md:gap-10">
          <h1 className="text-xl md:text-2xl font-bold netflix-logo tracking-tight whitespace-nowrap">
            SOUD FLIX
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Search + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className={cn(
              'flex items-center transition-all duration-300 rounded-md overflow-hidden',
              isSearchOpen 
                ? 'w-48 sm:w-64 md:w-80 border border-border bg-background/95 backdrop-blur-sm' 
                : 'w-10'
            )}
          >
            {isSearchOpen && (
              <Input
                type="text"
                placeholder="Search movies & shows..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground h-9"
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
              className="p-2 hover:text-primary transition-colors flex-shrink-0"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg font-semibold netflix-logo">SOUD FLIX</h2>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
