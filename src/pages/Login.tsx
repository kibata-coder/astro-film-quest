import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Film, ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';

type AuthMode = 'signin' | 'signup' | 'reset';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
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
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You are now signed in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: 'https://soudflex.pages.dev/',
    });
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: result.error.message,
      });
      return;
    }
    if (result.redirected) return;
    navigate('/');
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create your account';
      case 'reset': return 'Reset your password';
      default: return 'Sign in to SoudFlex';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    switch (mode) {
      case 'signup': return 'Sign Up';
      case 'reset': return 'Send Reset Link';
      default: return 'Sign In';
    }
  };

  return (
    <>
      <Seo
        title={`${getTitle()} | SoudFlex`}
        description="Sign in to your SoudFlex account to manage your watchlist, sync history, and get personalized recommendations."
      />
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="w-full max-w-[440px] z-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SoudFlex</span>
          </div>

          {/* Login Card */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
              {getTitle()}
            </h2>

            {/* OAuth Sign In Buttons */}
            {mode !== 'reset' && (
              <div className="flex flex-col gap-3 mb-6">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center w-full gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-xl transition-colors border border-gray-200 shadow-sm text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}

            {mode !== 'reset' && (
              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-border/50" />
                <span className="px-3 text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
                <div className="flex-1 border-t border-border/50" />
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 rounded-xl"
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-xs text-orange-500 hover:text-orange-400 hover:underline transition-colors"
                      >
                        Forgot your password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 border-border/50 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 mt-2" 
                disabled={loading}
              >
                {getButtonText()}
              </Button>
            </form>

            {/* Toggle Signin/Signup */}
            <div className="text-center text-sm mt-6 border-t border-border/50 pt-4">
              <span className="text-muted-foreground">
                {mode === 'signup' ? "Already have an account? " : 
                 mode === 'reset' ? "Remembered your password? " : 
                 "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'signup' ? 'signin' : mode === 'reset' ? 'signin' : 'signup')}
                className="text-orange-500 hover:text-orange-400 hover:underline font-semibold transition-colors"
              >
                {mode === 'signup' ? 'Sign In' : mode === 'reset' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
