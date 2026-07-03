import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Film, Flame } from 'lucide-react';
import { useAuth } from '@/features/auth';

export const SplashSelectScreen = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [hasSelected, setHasSelected] = useState<boolean>(() => {
    // Check local storage so we don't ask every single time if they already chose
    return localStorage.getItem('soudflex_experience_selected') === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();

  // If the user navigates directly to a specific route (like /anime), we assume they selected it
  useEffect(() => {
    if (!hasSelected && location.pathname !== '/') {
      setHasSelected(true);
      localStorage.setItem('soudflex_experience_selected', 'true');
    }
  }, [location.pathname, hasSelected]);

  if (isLoading) return null; // Wait for auth to finish

  // Only show splash screen if logged in AND hasn't selected AND on the root page
  if (user && !hasSelected && location.pathname === '/') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Who's watching?</h1>
            <p className="text-lg text-muted-foreground">Select an experience to continue</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Movies & TV Shows Option */}
            <button
              onClick={() => {
                setHasSelected(true);
                localStorage.setItem('soudflex_experience_selected', 'true');
                navigate('/');
              }}
              className="group relative flex flex-col items-center p-8 space-y-4 rounded-2xl border-2 border-border bg-card/50 hover:bg-card hover:border-primary transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Film className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold">Movies & TV</h2>
              <p className="text-sm text-muted-foreground">Live-action blockbusters and trending series</p>
            </button>

            {/* Anime Option */}
            <button
              onClick={() => {
                setHasSelected(true);
                localStorage.setItem('soudflex_experience_selected', 'true');
                navigate('/anime');
              }}
              className="group relative flex flex-col items-center p-8 space-y-4 rounded-2xl border-2 border-border bg-card/50 hover:bg-card hover:border-orange-500 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-full bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <Flame className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold">Soudanime</h2>
              <p className="text-sm text-muted-foreground">The ultimate anime streaming experience</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
