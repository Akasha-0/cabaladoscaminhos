import { describe, it, expect } from 'vitest';
import { getProtection } from '@/lib/aura/aura-protection';

describe('aura/aura-protection', () => {
  it('getProtection returns protection object', () => {
    const protection = getProtection();
    expect(protection).toBeDefined();
    expect(typeof protection.shield).toBe('function');
    expect(typeof protection.cleanse).toBe('function');
    expect(typeof protection.ground).toBe('function');
  });

  it('shield returns string', () => {
    const { shield } = getProtection();
    expect(typeof shield()).toBe('string');
    expect(shield()).toBe('shielded');
  });
});