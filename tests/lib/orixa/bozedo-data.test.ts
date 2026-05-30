import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/bozedo-data';
describe('orixa/bozedo-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
