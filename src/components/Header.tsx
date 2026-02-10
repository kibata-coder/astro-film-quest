import { useState, useEffect } from 'react';
import { 
  Search, Menu, LogOut, X, User, ChevronDown, Sparkles,
  Sword, Compass, Laugh, Theater, Ghost, Rocket, Heart, 
  Eye, Siren, Briefcase, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink } from './NavLink';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const Header = ({ onSearch, searchQuery = '' }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  const { user, openAuthModal, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Genres with Icons and Colors (Matching your FeedCustomizer)
  const genres = [
    { name: "Action", id: "action", icon: Sword, color: "text-red-500" },
    { name: "Adventure", id: "adventure", icon: Compass, color: "text-amber-500" },
    { name: "Comedy", id: "comedy", icon: Laugh, color: "text-yellow-500" },
    { name: "Drama", id: "drama", icon: Theater, color: "text-emerald-500" },
    { name: "Horror", id: "horror", icon: Ghost, color: "text-purple-500" },
    { name: "Sci-Fi", id: "scifi", icon: Rocket, color: "text-blue-500" },
    { name: "Fantasy", id: "fantasy", icon: Sparkles, color: "text-indigo-400" },
    { name: "Romance", id: "romance", icon: Heart, color: "text-pink-500" },
    { name: "Thriller", id: "thriller", icon: Eye, color: "text-zinc-400" },
    { name: "Western", id: "western", icon: ShieldAlert, color: "text-orange-700" },
    { name: "Crime", id: "crime", icon: Briefcase, color: "text-slate-500" },
    { name: "War", id: "war", icon: Siren, color: "text-stone-500" },
  ];

  const handleGenreClick = (genreId: string) => {
    navigate(`/genre/${genreId}`);
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : 'bg-gradient-to-b from-background/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="text-2xl font-bold text-primary tracking-tighter hover:scale-105 transition-transform">
            SoudFlex
          </a>
          
          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/movies">Movies</NavLink>
            <NavLink to="/tv">TV Shows</NavLink>
            <NavLink to="/new">New & Popular</NavLink>
            {user && <NavLink to="/mylist">My List</NavLink>}

            {/* GENRES DROPDOWN (With Icons) */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none data-[state=open]:text-foreground">
                Genres
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-xl border-border max-h-[80vh] overflow-y-auto">
                {user && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/foryou')} className="cursor-pointer text-yellow-400 focus:text-yellow-400 focus:bg-yellow-400/10 font-medium">
                      <Sparkles className="w-4 h-4 mr-2 fill-current" />
                      For You
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                  </>
                )}
                {genres.map((g) => (
                  <DropdownMenuItem 
                    key={g.id} 
                    onClick={() => handleGenreClick(g.id)}
                    className="cursor-pointer group"
                  >
                    <g.icon className={`w-4 h-4 mr-2 ${g.color} group-hover:text-current transition-colors`} />
                    {g.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          
          {/* MOBILE ONLY ICON: Shortcut to Personalized Feed */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/foryou')}
              className="md:hidden text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors"
              title="For You"
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </Button>
          )}

          {/* Search */}
          {onSearch && showSearch ? (
            <div className="fixed top-0 left-0 w-full h-[72px] bg-background flex items-center px-4 z-[60] md:static md:w-auto md:h-auto md:bg-transparent md:p-0 md:z-auto">
              <Input
                type="text"
                placeholder="Search..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearch(e.target.value);
                }}
                className="flex-1 h-10 md:w-64"
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
                className="ml-2 text-foreground hover:text-primary"
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
          
          {/* Auth Buttons */}
          {user ? (
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={signOut}
               className="text-foreground hover:text-primary transition-colors hidden md:flex"
               title="Sign Out"
             >
               <LogOut className="w-5 h-5" />
             </Button>
          ) : (
             <Button 
               variant="ghost" 
               onClick={openAuthModal}
               className="text-foreground hover:text-primary transition-colors text-sm font-medium"
             >
               Sign In
             </Button>
           )}

          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-xl border-border overflow-y-auto">
              <nav className="flex flex-col gap-5 mt-10">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/movies">Movies</NavLink>
                <NavLink to="/tv">TV Shows</NavLink>
                <NavLink to="/new">New & Popular</NavLink>
                {user && <NavLink to="/mylist">My List</NavLink>}
                
                {/* Mobile Genres List */}
                <div className="py-2 border-t border-border/50 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 mt-4">Genres</p>
                  {user && (
                    <button 
                      onClick={() => navigate('/foryou')}
                      className="flex items-center gap-3 text-sm font-medium text-yellow-400 hover:text-yellow-300 w-full text-left py-2.5 px-2 hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      For You
                    </button>
                  )}
                  {genres.map((g) => (
                    <button 
                      key={g.id}
                      onClick={() => handleGenreClick(g.id)}
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground w-full text-left py-2.5 px-2 hover:bg-white/5 rounded-md transition-colors"
                    >
                      <g.icon className={`w-4 h-4 ${g.color}`} />
                      {g.name}
                    </button>
                  ))}
                </div>

                {user ? (
                   <button onClick={signOut} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-4 border-t border-border/50 pt-4">
                     Sign Out
                   </button>
                ) : (
                   <button onClick={openAuthModal} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-4 border-t border-border/50 pt-4">
                     Sign In
                   </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
