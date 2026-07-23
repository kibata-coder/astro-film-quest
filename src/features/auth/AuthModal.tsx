import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://soudflex.pages.dev/'
        });
        if (error) throw error;
        toast({
          title: "Reset email sent!",
          description: "Check your inbox for the password reset link.",
        });
        setMode('signin');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: 'https://soudflex.pages.dev/' }
        });
        if (error) throw error;
        toast({ title: "Welcome!", description: "Your account has been created." });
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You are now signed in." });
        onClose();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://soudflex.pages.dev/' }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: error.message });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create your account';
      case 'reset':  return 'Reset password';
      default:       return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Start streaming movies, shows & anime today';
      case 'reset':  return 'Enter your email to receive a reset link';
      default:       return 'Sign in to continue watching';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'reset':  return 'Send Reset Link';
      default:       return 'Sign In';
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#252525',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:hidden">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-8 py-10">
            {/* Brand circle */}
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white select-none"
                style={{ background: 'hsl(217 91% 60%)' }}
              >
                S
              </div>
            </div>

            {/* Title + Subtitle */}
            <h2 className="text-2xl font-bold text-white text-center mb-1.5">{getTitle()}</h2>
            <p className="text-sm text-gray-400 text-center mb-8">{getSubtitle()}</p>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-colors"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'hsl(217 91% 60% / 0.7)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'reset' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-colors"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'hsl(217 91% 60% / 0.7)')}
                      onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Primary CTA button — SoudFlex blue */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white text-base tracking-wide transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  background: 'hsl(217 91% 60%)',
                  boxShadow: '0 4px 24px hsl(217 91% 60% / 0.4)',
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = 'hsl(217 91% 67%)'); }}
                onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = 'hsl(217 91% 60%)'); }}
              >
                {getButtonText()}
              </button>

              {/* OR divider + Google */}
              {mode !== 'reset' && (
                <>
                  <div className="flex items-center gap-3 my-0.5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">OR</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
                    style={{ background: '#252525', border: '1px solid rgba(255,255,255,0.10)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2d2d2d')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#252525')}
                  >
                    {/* Google G icon */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              {/* Forgot password */}
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors text-center"
                >
                  Forgot your password?
                </button>
              )}

              {/* Switch mode link */}
              <div className="text-center text-sm pt-0.5">
                <span className="text-gray-500">
                  {mode === 'signup' ? 'Already have an account? ' :
                   mode === 'reset'  ? 'Remember your password? ' :
                   "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'signin' : mode === 'reset' ? 'signin' : 'signup')}
                  className="font-semibold transition-colors hover:brightness-125"
                  style={{ color: 'hsl(217 91% 60%)' }}
                >
                  {mode === 'signup' ? 'Log in' : mode === 'reset' ? 'Sign In' : 'Sign Up'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
