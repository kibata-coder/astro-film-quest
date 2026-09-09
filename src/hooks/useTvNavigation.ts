import { useEffect, useRef } from 'react';
import {
  getActiveScope,
  getFocusableElements,
  focusElement,
  moveFocus,
  normalizeKey,
} from '@/lib/tv-navigation';

const TV_MODE_CLASS = 'tv-mode';

export function isTvDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || '').toLowerCase();
  const search = window.location.search || '';
  return (
    search.includes('tv=1') ||
    ua.includes('browsehere') ||
    ua.includes('tcl') ||
    ua.includes('smart-tv') ||
    ua.includes('smarttv') ||
    ua.includes('googletv') ||
    ua.includes('android tv') ||
    ua.includes('appletv') ||
    ua.includes('hbbtv') ||
    ua.includes('tizen') ||
    ua.includes('webos') ||
    ua.includes('hisense') ||
    ua.includes('crkey') ||
    ua.includes('aft')
  );
}

/**
 * Global TV remote / arrow-key navigation.
 *
 * - Arrow keys move focus geometrically.
 * - Enter activates the focused element (native click for buttons/links).
 * - Back / Return / Escape bubbles through so existing close handlers run.
 * - Mouse movement disables TV mode on PCs, but is ignored on TV browsers (e.g. TCL BrowseHere).
 */
export function useTvNavigation() {
  const lastFocusBeforeDialog = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const body = document.body;
    const isTv = isTvDevice();

    const enableTvMode = () => {
      if (!body.classList.contains(TV_MODE_CLASS)) body.classList.add(TV_MODE_CLASS);
    };
    const disableTvMode = () => {
      // On Smart TVs / BrowseHere, never disable TV mode
      if (isTv) return;
      if (body.classList.contains(TV_MODE_CLASS)) body.classList.remove(TV_MODE_CLASS);
    };

    if (isTv) {
      enableTvMode();
      // Auto-focus hero play button or first card on TV load
      window.setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          const initial = findNextElement(null, 'down', getActiveScope());
          if (initial) focusElement(initial);
        }
      }, 600);
    }

    const isTextInput = (el: Element | null) =>
      !!el &&
      (el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        (el as HTMLElement).isContentEditable);

    const onKeyDown = (e: KeyboardEvent) => {
      const key = normalizeKey(e);
      if (!key) return;

      // Never hijack typing in the search box.
      if (isTextInput(document.activeElement) && key !== 'back') return;

      if (key === 'back') {
        // Let existing Escape handlers (modals, player) do the work.
        enableTvMode();
        if (e.key !== 'Escape') {
          const escape = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(escape);
          (document.activeElement || document.body).dispatchEvent(escape);
          e.preventDefault();
        }
        return;
      }

      enableTvMode();

      if (key === 'enter') {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body && active.dataset.tvCard === 'true') {
          // Cards are plain divs — synthesise the click.
          active.click();
          e.preventDefault();
        }
        return;
      }

      // Directional movement.
      if (moveFocus(key)) {
        e.preventDefault();
      } else if (!document.activeElement || document.activeElement === document.body) {
        const next = findNextElement(null, key, getActiveScope());
        if (next) {
          focusElement(next);
          e.preventDefault();
        }
      }
    };

    const onMouseMove = () => disableTvMode();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // When a dialog opens, remember where we were and jump to its primary action.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][data-state="open"]');
      if (dialog) {
        if (!lastFocusBeforeDialog.current) {
          const active = document.activeElement as HTMLElement | null;
          if (active && active !== document.body) lastFocusBeforeDialog.current = active;
        }
        if (!dialog.contains(document.activeElement)) {
          const primary =
            dialog.querySelector<HTMLElement>('[data-tv-primary="true"]') ||
            getFocusableElements(dialog)[0];
          if (primary) window.setTimeout(() => focusElement(primary), 60);
        }
      } else if (lastFocusBeforeDialog.current) {
        const target = lastFocusBeforeDialog.current;
        lastFocusBeforeDialog.current = null;
        if (document.body.contains(target)) window.setTimeout(() => focusElement(target), 60);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    });

    return () => observer.disconnect();
  }, []);
}

export default useTvNavigation;
