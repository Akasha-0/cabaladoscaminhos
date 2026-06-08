import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/orixa/alagbedo-data';
describe('orixa/alagbedo-data', () => { it('has data', () => { expect(getData()).toBeDefined(); }); });
