import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'soudflex.announcement.domain-change.v1';

const SiteAnnouncement = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      // ignore storage errors, still show
    }
    setOpen(true);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-lg border border-border bg-card/95 backdrop-blur p-4 pr-9 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">We're back!</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              One of our streaming providers moved from{' '}
              <span className="font-mono text-foreground/80">vsembed.ru</span> to{' '}
              <span className="font-mono text-foreground/80">vsembed.su</span>. Everything is
              working normally again — enjoy SoudFlex.
            </p>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={dismiss} className="h-7 px-3 text-xs">
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteAnnouncement;
