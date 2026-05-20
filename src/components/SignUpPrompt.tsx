import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bookmark, FolderHeart, History, Sparkles, Play } from 'lucide-react';

const benefits = [
  { icon: Bookmark, text: 'Save your favorite movies & shows' },
  { icon: FolderHeart, text: 'Create custom collections' },
  { icon: History, text: 'Sync watch history across devices' },
  { icon: Play, text: 'Continue watching where you left off' },
  { icon: Sparkles, text: 'Get personalized recommendations' },
];

export default function SignUpPrompt() {
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => setIsOpen(true), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  if (user) return null;

  const handleSignUp = () => {
    setIsOpen(false);
    openAuthModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Get More From SoudFlex</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create a free account to unlock these features
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-2">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-foreground">
              <Icon className="h-5 w-5 text-primary shrink-0" />
              {text}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSignUp} className="w-full">Create Free Account</Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="w-full text-muted-foreground">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
