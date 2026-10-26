import { describe, it, expect } from 'vitest';
import { getProviders, orderProviders } from './vidsrc';

describe('orderProviders', () => {
  it('puts the recommended server first and keeps every other server', () => {
    const all = getProviders();
    const ordered = orderProviders(all, 'vidlink');
    expect(ordered[0].id).toBe('vidlink');
    expect(ordered).toHaveLength(all.length);
  });

  it('falls back to the original order for an unknown server', () => {
    expect(orderProviders(getProviders(), 'gone')[0].id).toBe('vidsrc');
  });
});
