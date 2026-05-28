import { describe, it, expect } from 'vitest';
import {
  getTokenFromRequest,
  createAuthCookie,
  clearAuthCookie,
} from '@/lib/auth-jwt/helpers';

describe('Auth Helpers', () => {
  describe('getTokenFromRequest', () => {
    it('should return null when no cookie header', () => {
      // @ts-expect-error - simplified for testing
      const token = getTokenFromRequest({ headers: { get: () => null } });
      expect(token).toBeNull();
    });

    it('should return null when auth_token not present', () => {
      const token = getTokenFromRequest({ 
        // @ts-expect-error - simplified for testing
        headers: { get: () => 'other=value' } 
      });
      expect(token).toBeNull();
    });

    it('should extract token from cookie header', () => {
      const token = getTokenFromRequest({
        // @ts-expect-error - simplified for testing
        headers: { get: () => 'auth_token=test-token; other=value' }
      });
      expect(token).toBe('test-token');
    });
  });

  describe('createAuthCookie', () => {
    it('should create cookie string with correct attributes', () => {
      const cookie = createAuthCookie('test-token');
      expect(cookie).toContain('auth_token=test-token');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Max-Age=86400');
    });
  });

  describe('clearAuthCookie', () => {
    it('should create cookie with Max-Age=0', () => {
      const cookie = clearAuthCookie();
      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('Max-Age=0');
    });
  });
});