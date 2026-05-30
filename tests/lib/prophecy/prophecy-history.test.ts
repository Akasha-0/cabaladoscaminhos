import { describe, it, expect } from 'vitest';
import { saveProphecy, getProphecyHistory, clearProphecyHistory } from '@/lib/prophecy/prophecy-history';

describe('prophecy/history', () => {
  it('saveProphecy returns entry', () => {
    const entry = saveProphecy({ data: { test: true } });
    expect(entry.id).toBeTruthy();
    expect(entry.date).toBeTruthy();
  });

  it('getProphecyHistory returns array', () => {
    expect(Array.isArray(getProphecyHistory())).toBe(true);
  });

  it('clearProphecyHistory runs without error', () => {
    clearProphecyHistory();
  });
});
