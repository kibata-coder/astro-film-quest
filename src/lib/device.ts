// Detect if the device is likely a low-end device (TV, Projector, budget phone)
export const isLowEndDevice = (): boolean => {
  // 1. Check if user manually toggled "Lite Mode" (we can build a toggle later if needed)
  const manualPreference = localStorage.getItem('lite-mode');
  if (manualPreference === 'true') return true;
  if (manualPreference === 'false') return false;

  // 2. Check Hardware Concurrency (Cores)
  // Most modern phones/laptops have > 4 cores. Cheap projectors often have 4 or less.
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency <= 4) return true;
  }

  // 3. Check Device Memory (RAM)
  // If the browser supports this API, < 4GB usually means low end.
  // @ts-ignore - deviceMemory is not standard in all browsers yet
  if (typeof navigator !== 'undefined' && navigator.deviceMemory) {
    // @ts-ignore
    if (navigator.deviceMemory < 4) return true;
  }

  // 4. Check User Agent for generic "Android" TV/Projector keywords without "Mobile"
  // (Optional refinement, but hardware check is usually enough)
  
  return false;
};
