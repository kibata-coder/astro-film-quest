import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { syncLocalHistoryToCloud } from '@/lib/watchHistory';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isSignUpPromptOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSignUpPrompt: () => void;
  closeSignUpPrompt: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUpPromptOpen, setIsSignUpPromptOpen] = useState(false);

  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const applyUser = (nextUser: User | null) => {
      if (!mounted) return;
      const nextId = nextUser?.id ?? null;
      // Only push a new object identity when the actual user changed.
      // Token refreshes emit a fresh object for the same user otherwise.
      if (userIdRef.current === nextId) return;
      userIdRef.current = nextId;
      setUser(nextUser);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applyUser(session?.user ?? null);
      if (mounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      applyUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthModalOpen(false);
        setIsSignUpPromptOpen(false);
        if (event === 'SIGNED_IN') {
          await syncLocalHistoryToCloud(session.user.id);
          window.dispatchEvent(new Event('watch-history-updated'));
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto popup login modal after 5 seconds if still not logged in
  useEffect(() => {
    if (localStorage.getItem('hasSeenLoginPrompt')) return;
    const timer = setTimeout(() => {
      if (!userIdRef.current) {
        setIsAuthModalOpen(true);
        localStorage.setItem('hasSeenLoginPrompt', 'true');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  
  const openSignUpPrompt = useCallback(() => setIsSignUpPromptOpen(true), []);
  const closeSignUpPrompt = useCallback(() => setIsSignUpPromptOpen(false), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthModalOpen,
    isSignUpPromptOpen,
    openAuthModal,
    closeAuthModal,
    openSignUpPrompt,
    closeSignUpPrompt,
    signOut,
  }), [user, isLoading, isAuthModalOpen, isSignUpPromptOpen, openAuthModal, closeAuthModal, openSignUpPrompt, closeSignUpPrompt, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
