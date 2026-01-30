import { useState, useEffect } from 'react';
import { Search, Menu, User, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavLink } from './NavLink';
import AuthModal from './AuthModal';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const Header = ({ onSearch, searchQuery = '' }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : 'bg-gradient-to-b from-background/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold text-primary tracking-tighter hover:scale-105 transition-transform">
            SoudFlex
          </a>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/movies">Movies</NavLink>
            <NavLink to="/tv">TV Shows</NavLink>
            <NavLink to="/new">New & Popular</NavLink>
            {/* ADDED MY LIST BUTTON HERE */}
            {user && <NavLink to="/mylist">My List</NavLink>}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {onSearch && showSearch ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search movies, TV shows..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-48 md:w-64 h-9"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowSearch(false);
                  setLocalSearch('');
                  onSearch('');
                }}
                className="text-foreground hover:text-primary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onSearch ? setShowSearch(true) : undefined}
              className="text-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {user ? (
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={handleSignOut}
               className="text-foreground hover:text-primary transition-colors"
               title="Sign Out"
             >
               <LogOut className="w-5 h-5" />
             </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAuthOpen(true)}
              className="text-foreground hover:text-primary transition-colors"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-xl border-white/10">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/movies">Movies</NavLink>
                <NavLink to="/tv">TV Shows</NavLink>
                <NavLink to="/new">New & Popular</NavLink>
                {/* ADDED MY LIST BUTTON TO MOBILE MENU */}
                {user && <NavLink to="/mylist">My List</NavLink>}
                
                {user ? (
                   <button onClick={handleSignOut} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                     Sign Out
                   </button>
                ) : (
                   <button onClick={() => setIsAuthOpen(true)} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                     Sign In
                   </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};

export default Header;
