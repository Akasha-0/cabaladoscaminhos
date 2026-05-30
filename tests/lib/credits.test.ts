/**
 * Credits Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getCredits,
  getCreditInfo,
  deductCredits,
  addCredits,
  trackCreditUsage,
  InsufficientCreditsError,
  type CreditInfo,
} from '@/lib/credits';

describe('Credits Module', () => {
  describe('Functions', () => {
    it('exports getCredits as async function', () => {
      expect(typeof getCredits).toBe('function');
    });

    it('exports getCreditInfo as async function', () => {
      expect(typeof getCreditInfo).toBe('function');
    });

    it('exports deductCredits as async function', () => {
      expect(typeof deductCredits).toBe('function');
    });

    it('exports addCredits as async function', () => {
      expect(typeof addCredits).toBe('function');
    });

    it('exports trackCreditUsage as async function', () => {
      expect(typeof trackCreditUsage).toBe('function');
    });
  });

  describe('InsufficientCreditsError', () => {
    it('exports InsufficientCreditsError class', () => {
      expect(typeof InsufficientCreditsError).toBe('function');
      const error = new InsufficientCreditsError(10, 50);
      expect(error).toBeInstanceOf(Error);
      expect(error.currentBalance).toBe(10);
      expect(error.requiredAmount).toBe(50);
    });
  });

  describe('Types', () => {
    it('exports CreditInfo type', () => {
      const info: CreditInfo = { userId: 'test', balance: 100, lastUpdated: new Date() };
      expect(info).toBeDefined();
    });
  });
});