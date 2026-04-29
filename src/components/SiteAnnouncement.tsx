import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const ETA_KEY = 'soudflex.maintenance.eta.v1';
const ETA_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours from first visit

function getEta(): number {
  try {
    const stored = Number(localStorage.getItem(ETA_KEY) || 0);
    if (stored && stored > Date.now()) return stored;
    const eta = Date.now() + ETA_DURATION_MS;
    localStorage.setItem(ETA_KEY, String(eta));
    return eta;
  } catch {
    return Date.now() + ETA_DURATION_MS;
  }
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00h 00m 00s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const SiteAnnouncement = () => {
  const [open, setOpen] = useState(false);
  const [eta, setEta] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    setOpen(true);
    setEta(getEta());
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      document.body.style.overflow = prev;
      window.clearInterval(interval);
    };
  }, []);

  if (!open) return null;

  const remaining = eta - now;
  const etaDate = new Date(eta);
  const etaLabel = etaDate.toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
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

        <div className="rounded-md border border-border bg-background/60 p-4 mb-4">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Clock className="h-3.5 w-3.5" />
            Estimated time to recovery
          </div>
          <div className="text-center font-mono text-2xl font-semibold text-primary tabular-nums">
            {formatRemaining(remaining)}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Expected back by ~{etaLabel}
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};

export default SiteAnnouncement;
