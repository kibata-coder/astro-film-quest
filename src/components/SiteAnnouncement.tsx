import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'soudflex.announcement.dismissed.v1';

const SiteAnnouncement = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 id="announcement-title" className="text-lg font-semibold">
              Service Notice
            </h2>
            <p className="text-xs text-muted-foreground">SoudFlex Team</p>
          </div>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed mb-5">
          Hello SoudFlexers, our website is currently experiencing downtime. We are working at
          our best to bring it back online as soon as possible. If there is any change in our
          domain name, we will inform you here.
        </p>

        <button
          onClick={dismiss}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default SiteAnnouncement;
