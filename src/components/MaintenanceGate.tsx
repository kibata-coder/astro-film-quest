import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSiteSettings, ADMIN_EMAIL } from '@/hooks/use-site-settings';
import Maintenance from '@/pages/Maintenance';
import LoadingSpinner from '@/components/LoadingSpinner';

/** Routes that stay reachable while maintenance mode is on. */
const ALWAYS_ALLOWED = ['/admin', '/login'];

/**
 * Blocks the app with a maintenance page when the global flag is on.
 * The admin account always passes through and sees a status bar instead.
 */
const MaintenanceGate = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading } = useSiteSettings();

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isAllowedRoute = ALWAYS_ALLOWED.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (settings?.maintenance_mode && !isAdmin && !isAllowedRoute) {
    return <Maintenance message={settings.maintenance_message} />;
  }

  return (
    <>
      {settings?.maintenance_mode && isAdmin && (
        <div className="sticky top-0 z-[70] bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground">
          Maintenance mode is ON — only you can see the site.
        </div>
      )}
      {children}
    </>
  );
};

export default MaintenanceGate;
