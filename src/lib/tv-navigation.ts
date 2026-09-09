/**
 * 2D geometric spatial navigation for TV remotes / arrow keys.
 *
 * Pure DOM utilities — no React. The engine picks the visually closest
 * focusable element in the pressed direction, then keeps it on screen
 * (centering horizontally inside carousels, vertically on the page).
 */

export type Direction = 'up' | 'down' | 'left' | 'right';
export type TvKey = Direction | 'enter' | 'back' | null;

const FOCUSABLE = [
  '[data-tv-card="true"]',
  '[data-tv-focusable="true"]',
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Normalise browser + TV manufacturer key codes into a single vocabulary. */
export function normalizeKey(e: KeyboardEvent): TvKey {
  switch (e.key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return 'enter';
    case 'Escape':
    case 'Backspace':
    case 'BrowserBack':
    case 'GoBack':
      return 'back';
  }
  // Hardware keycodes: Samsung Tizen RETURN 10009, LG webOS BACK 461,
  // Android TV / Fire TV BACK 4.
  if (e.keyCode === 10009 || e.keyCode === 461 || e.keyCode === 4) return 'back';
  return null;
}

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (Number(style.opacity) === 0) return false;
  return true;
}

/** Topmost open Radix dialog / sheet, if any — navigation is trapped inside it. */
export function getActiveScope(): HTMLElement | Document {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"]'),
  ).filter(isVisible);
  return dialogs.length ? dialogs[dialogs.length - 1] : document;
}

export function getFocusableElements(scope: HTMLElement | Document = document): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('data-tv-skip') && isVisible(el),
  );
}

interface Point {
  x: number;
  y: number;
}

function center(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Score candidates: they must lie in the pressed direction. We weight the
 * off-axis distance heavily so the engine prefers elements in the same
 * row/column rather than diagonal neighbours.
 */
export function findNextElement(
  current: HTMLElement | null,
  direction: Direction,
  scope: HTMLElement | Document = document,
): HTMLElement | null {
  const candidates = getFocusableElements(scope);
  if (!candidates.length) return null;
  if (!current || !scope.contains(current)) return candidates[0];

  const from = center(current);
  const fromRect = current.getBoundingClientRect();

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current || current.contains(el) || el.contains(current)) continue;
    const to = center(el);
    const rect = el.getBoundingClientRect();

    let primary: number;
    let offAxis: number;

    if (direction === 'left' || direction === 'right') {
      primary = direction === 'right' ? rect.left - fromRect.right : fromRect.left - rect.right;
      // Allow slight overlap so tightly packed rails still advance.
      if (primary < -Math.min(rect.width, fromRect.width) / 2) continue;
      offAxis = Math.abs(to.y - from.y);
      if (offAxis > Math.max(rect.height, fromRect.height) * 1.5) continue;
    } else {
      primary = direction === 'down' ? rect.top - fromRect.bottom : fromRect.top - rect.bottom;
      if (primary < -Math.min(rect.height, fromRect.height) / 2) continue;
      offAxis = Math.abs(to.x - from.x);
    }

    const score = Math.max(primary, 0) + offAxis * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function scrollableXParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const overflowX = window.getComputedStyle(node).overflowX;
    if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/** Keep the focused element comfortably visible for a 10-foot experience. */
export function ensureVisible(el: HTMLElement) {
  const rail = scrollableXParent(el);
  if (rail) {
    const railRect = rail.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = elRect.left + elRect.width / 2 - (railRect.left + railRect.width / 2);
    rail.scrollBy({ left: delta, behavior: 'smooth' });
  }

  const elRect = el.getBoundingClientRect();
  const margin = window.innerHeight * 0.25;
  if (elRect.top < margin || elRect.bottom > window.innerHeight - margin) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'nearest' });
  }
}

export function focusElement(el: HTMLElement) {
  el.focus({ preventScroll: true });
  ensureVisible(el);
}

/** Move focus one step in the given direction. Returns true when it moved. */
export function moveFocus(direction: Direction): boolean {
  const scope = getActiveScope();
  const active = document.activeElement as HTMLElement | null;
  const next = findNextElement(active && active !== document.body ? active : null, direction, scope);
  if (!next) return false;
  focusElement(next);
  return true;
}
