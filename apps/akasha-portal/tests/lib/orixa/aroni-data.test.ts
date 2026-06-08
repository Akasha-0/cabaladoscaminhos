import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/aroni-data';
describe('orixa/aroni-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
