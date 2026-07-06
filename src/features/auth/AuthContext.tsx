import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthModalOpen(false);
        setIsSignUpPromptOpen(false);
        if (event === 'SIGNED_IN') {
          await syncLocalHistoryToCloud(session.user.id);
          window.dispatchEvent(new Event('watch-history-updated'));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  
  const openSignUpPrompt = useCallback(() => setIsSignUpPromptOpen(true), []);
  const closeSignUpPrompt = useCallback(() => setIsSignUpPromptOpen(false), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthModalOpen,
      isSignUpPromptOpen,
      openAuthModal,
      closeAuthModal,
      openSignUpPrompt,
      closeSignUpPrompt,
      signOut,
    }}>
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
