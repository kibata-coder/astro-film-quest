import { Helmet } from 'react-helmet-async';
import { Wrench, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaintenanceProps {
  message?: string | null;
}

const Maintenance = ({ message }: MaintenanceProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <Helmet>
      <title>Under Maintenance | SoudFlex</title>
      <meta name="description" content="SoudFlex is temporarily under maintenance. We will be back shortly." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>

    <main className="w-full max-w-md text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Wrench className="h-8 w-8" aria-hidden="true" />
      </div>

      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">SoudFlex</p>

      <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
        The website is under maintenance
      </h1>

      <p className="mb-8 text-muted-foreground">
        {message?.trim() || "We're making some improvements right now. We'll be back shortly, thanks for your patience."}
      </p>

      <Button onClick={() => window.location.reload()} className="gap-2">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </main>
  </div>
);

export default Maintenance;
