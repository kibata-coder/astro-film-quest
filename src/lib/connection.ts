/**
 * Network & device-aware quality hints.
 * Used to downgrade image sizes / disable autoplay carousels on
 * low-end devices and slow / metered connections.
 */

type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: EffectiveType;
  downlink?: number;
}

const getConnection = (): NavigatorConnection | undefined => {
  if (typeof navigator === 'undefined') return undefined;
  // @ts-expect-error - non-standard but widely supported
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
};

/** True for slow networks or when the user has Data Saver enabled. */
export const isSlowConnection = (): boolean => {
  const c = getConnection();
  if (!c) return false;
  if (c.saveData) return true;
  if (c.effectiveType === 'slow-2g' || c.effectiveType === '2g' || c.effectiveType === '3g') return true;
  if (typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 1.5) return true;
  return false;
};

/** True for low-end CPU devices (heuristic). */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // @ts-expect-error - deviceMemory is non-standard
  const mem = navigator.deviceMemory as number | undefined;
  const cores = navigator.hardwareConcurrency || 0;
  if (mem && mem <= 2) return true;
  if (cores && cores <= 2) return true;
  return false;
};

/** Pick the best poster size for the current network. */
export const pickPosterSize = (): 'w300' | 'w500' => {
  return isSlowConnection() ? 'w300' : 'w300'; // posters already small
};

/** Pick the best backdrop size for the current network/viewport. */
export const pickBackdropSize = (): 'w780' | 'w1280' => {
  if (typeof window === 'undefined') return 'w1280';
  if (isSlowConnection()) return 'w780';
  if (window.innerWidth < 768) return 'w780';
  return 'w1280';
};

/** Should we disable expensive UI (autoplay carousels, hover anims)? */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (isSlowConnection() || isLowEndDevice()) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
