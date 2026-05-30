import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/astrologia-data';
describe('orixa/astrologia-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
