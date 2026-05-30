import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/ancestral-ritual-data';
describe('orixa/ancestral-ritual-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
