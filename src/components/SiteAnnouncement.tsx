import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'soudflex.announcement.dismissedUntil.v1';
const DISMISS_MS = 24 * 60 * 60 * 1000; // 24 hours

const SiteAnnouncement = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
    // Lock body scroll while maintenance overlay is active
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div
        className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl"
      >
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

        <p className="text-xs text-muted-foreground text-center">
          We'll be back soon. Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

export default SiteAnnouncement;
