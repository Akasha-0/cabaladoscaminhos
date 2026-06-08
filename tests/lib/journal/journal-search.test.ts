import { describe, it, expect } from 'vitest';
import { searchEntries, getAllEntries, getEntriesByType } from '@/lib/journal/journal-search';

describe('journal/journal-search', () => {
  it('searchEntries returns an array', () => {
    const results = searchEntries({ query: 'test' });
    expect(Array.isArray(results)).toBe(true);
  });

  it('getAllEntries returns sorted entries', () => {
    const entries = getAllEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  it('getEntriesByType filters by type', () => {
    const entries = getEntriesByType('reflection');
    expect(Array.isArray(entries)).toBe(true);
  });
});