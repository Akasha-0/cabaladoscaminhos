import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '@/lib/auth-jwt/jwt';

describe('JWT Module', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
  };

  describe('signToken', () => {
    it('should create a valid JWT token', async () => {
      const token = await signToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', async () => {
      const token = await signToken(testPayload);
      const payload = await verifyToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(testPayload.userId);
      expect(payload?.email).toBe(testPayload.email);
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for tampered token', async () => {
      const token = await signToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const payload = await verifyToken(tamperedToken);
      expect(payload).toBeNull();
    });
  });
});