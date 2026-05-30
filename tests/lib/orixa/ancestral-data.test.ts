import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ancestral-data';
describe('orixa/ancestral-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
