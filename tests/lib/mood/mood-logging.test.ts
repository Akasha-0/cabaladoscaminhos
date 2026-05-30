import { describe, it, expect } from 'vitest';
import { logMood } from '@/lib/mood/mood-logging';

describe('mood/mood-logging', () => {
  it('logs mood entry with level', async () => {
    const result = await logMood({ level: 3 });
    expect(result.level).toBe(3);
  });

  it('includes timestamp', async () => {
    const result = await logMood({ level: 3 });
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('accepts note optional field', async () => {
    const result = await logMood({ level: 5, note: 'Feeling great' });
    expect(result.note).toBe('Feeling great');
  });
});
