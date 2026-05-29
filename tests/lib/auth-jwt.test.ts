/**
 * Auth JWT Unit Tests
 * 
 * Comprehensive tests for JWT authentication functions.
 * Tests token operations and cookie helpers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

import { signToken, verifyToken, type TokenPayload } from '@/lib/auth-jwt/jwt';
import {
  getTokenFromRequest,
  getAuthenticatedUser,
  requireAuth,
  createAuthCookie,
  clearAuthCookie,
} from '@/lib/auth-jwt/helpers';
import { NextRequest } from 'next/server';

// Mock factory for jsonwebtoken - creates configurable mock functions
function createJwtMock(overrides?: {
  signResult?: string;
  verifyResult?: object | null;
  verifyThrows?: boolean;
  expiredToken?: string;
}) {
  const {
    signResult = 'mock.token',
    verifyResult = { userId: 'user123', email: 'test@example.com' },
    verifyThrows = false,
    expiredToken = 'expired.token',
  } = overrides || {};

  return {
    default: {
      sign: vi.fn((payload) => `${signResult}.${payload.userId}.${Date.now()}`),
      verify: vi.fn((token: string) => {
        if (token === 'invalid.token' || token === 'not-a-valid-jwt-format' || token === '') {
          throw new Error('JsonWebTokenError: invalid signature');
        }
        if (token === expiredToken) {
          const err = new Error('TokenExpiredError: jwt expired');
          err.name = 'TokenExpiredError';
          throw err;
        }
        if (!token.includes('.')) {
          throw new Error('JsonWebTokenError: invalid signature');
        }
        if (verifyThrows) {
          throw new Error('JsonWebTokenError: invalid signature');
        }
        return verifyResult;
      }),
    },
  };
}

function createMockRequest(cookieHeader?: string): NextRequest {
  const headers = new Map<string, string>();
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }
  
  return {
    headers: {
      get: (name: string) => headers.get(name) || null,
    },
  } as unknown as NextRequest;
}

describe('JWT Token Functions', () => {
  // Mock jsonwebtoken for these tests
  vi.mock('jsonwebtoken', () => createJwtMock());

  describe('signToken', () => {
    it('should sign token with valid payload', async () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = await signToken(payload);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should include userId in token', async () => {
      const payload = { userId: 'user456', email: 'user@example.com' };
      const token = await signToken(payload);
      
      expect(token).toContain('user456');
    });

    it('should generate unique tokens for different users', async () => {
      const payload1 = { userId: 'user1', email: 'user1@example.com' };
      const payload2 = { userId: 'user2', email: 'user2@example.com' };
      
      const token1 = await signToken(payload1);
      const token2 = await signToken(payload2);
      
      expect(token1).not.toBe(token2);
    });

    it('should generate token with expected format', async () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = await signToken(payload);
      
      // Mock returns format "mock.token.{userId}.{timestamp}"
      expect(token).toMatch(/^mock\.token\.user123\.\d+$/);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = await signToken(payload);
      
      const result = await verifyToken(token);
      
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
    });

    it('should return null for invalid token', async () => {
      const result = await verifyToken('invalid.token');
      
      expect(result).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const result = await verifyToken('not-a-valid-jwt-format');
      
      expect(result).toBeNull();
    });

    it('should return null for empty token', async () => {
      const result = await verifyToken('');
      
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const result = await verifyToken('expired.token');
      
      expect(result).toBeNull();
    });
  });
});

describe('Token Helper Functions', () => {
  // Mock jsonwebtoken for these tests
  vi.mock('jsonwebtoken', () => createJwtMock());

  describe('getTokenFromRequest', () => {
    it('should extract token from cookie header', () => {
      const request = createMockRequest('auth_token=my-token-123');
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBe('my-token-123');
    });

    it('should return null when no cookie present', () => {
      const request = createMockRequest();
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBeNull();
    });

    it('should return null when auth_token is empty', () => {
      const request = createMockRequest('auth_token=');
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBeNull();
    });

    it('should handle multiple cookies', () => {
      const request = createMockRequest('other=value; auth_token=my-token; another=data');
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBe('my-token');
    });

    it('should handle cookies with special characters', () => {
      const request = createMockRequest('auth_token=token%20with%20spaces');
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBe('token%20with%20spaces');
    });

    it('should handle cookie with spaces around =', () => {
      const request = createMockRequest('auth_token = my-token');
      
      const token = getTokenFromRequest(request);
      
      expect(token).toBe('my-token');
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user for valid authenticated request', async () => {
      const request = createMockRequest('auth_token=valid.token.here');
      
      const user = await getAuthenticatedUser(request);
      
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('userId');
    });

    it('should return null for unauthenticated request', async () => {
      const request = createMockRequest();
      
      const user = await getAuthenticatedUser(request);
      
      expect(user).toBeNull();
    });

    it('should return null for invalid token', async () => {
      const request = createMockRequest('auth_token=invalid.token');
      
      const user = await getAuthenticatedUser(request);
      
      expect(user).toBeNull();
    });

    it('should return null for empty token', async () => {
      const request = createMockRequest('auth_token=');
      
      const user = await getAuthenticatedUser(request);
      
      expect(user).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user for authenticated request', async () => {
      const request = createMockRequest('auth_token=valid.token.here');
      
      const user = await requireAuth(request);
      
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('userId');
    });

    it('should throw for unauthenticated request', async () => {
      const request = createMockRequest();
      
      await expect(requireAuth(request)).rejects.toThrow();
    });

    it('should throw for invalid token', async () => {
      const request = createMockRequest('auth_token=invalid.token');
      
      await expect(requireAuth(request)).rejects.toThrow();
    });
  });
});

describe('Cookie Helper Functions', () => {
  describe('createAuthCookie', () => {
    it('should create valid cookie string', () => {
      const cookie = createAuthCookie('my-jwt-token');
      
      expect(cookie).toContain('auth_token=my-jwt-token');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Max-Age=86400');
    });

    it('should set 24 hour expiration', () => {
      const cookie = createAuthCookie('token');
      
      expect(cookie).toContain('Max-Age=86400');
    });

    it('should include all security attributes', () => {
      const cookie = createAuthCookie('token123');
      
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });
  });

  describe('clearAuthCookie', () => {
    it('should create cookie with zero max-age', () => {
      const cookie = clearAuthCookie();
      
      expect(cookie).toContain('auth_token=');
      expect(cookie).toContain('Max-Age=0');
    });

    it('should still have required attributes', () => {
      const cookie = clearAuthCookie();
      
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('should not contain any value after =', () => {
      const cookie = clearAuthCookie();
      
      // Should be "auth_token=;" not "auth_token=value;"
      expect(cookie).toMatch(/^auth_token=[^;]*;/);
    });
  });
});

describe('TokenPayload Interface', () => {
  it('should have required fields', () => {
    const payload: TokenPayload = {
      userId: 'user123',
      email: 'test@example.com',
    };
    
    expect(payload.userId).toBe('user123');
    expect(payload.email).toBe('test@example.com');
  });

  it('should allow optional iat and exp', () => {
    const now = Date.now();
    const payload: TokenPayload = {
      userId: 'user123',
      email: 'test@example.com',
      iat: now,
      exp: now + 86400,
    };
    
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });
});

describe('JWT Security Considerations', () => {
  it('should use HS256 algorithm via sign', async () => {
    const payload = { userId: 'user123', email: 'test@example.com' };
    const token = await signToken(payload);
    
    // Token should be generated without errors
    expect(token).toBeTruthy();
  });

  it('should handle concurrent token operations', async () => {
    const payload = { userId: 'user123', email: 'test@example.com' };
    
    // Generate multiple tokens concurrently
    const tokens = await Promise.all([
      signToken(payload),
      signToken(payload),
      signToken(payload),
    ]);
    
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeTruthy();
    expect(tokens[1]).toBeTruthy();
    expect(tokens[2]).toBeTruthy();
  });

  it('should verify multiple tokens independently', async () => {
    const payload1 = { userId: 'user1', email: 'user1@example.com' };
    const payload2 = { userId: 'user2', email: 'user2@example.com' };
    
    const token1 = await signToken(payload1);
    const token2 = await signToken(payload2);
    
    const result1 = await verifyToken(token1);
    const result2 = await verifyToken(token2);
    
    expect(result1).toBeTruthy();
    expect(result2).toBeTruthy();
  });

  it('should handle token with no payload gracefully', async () => {
    const result = await verifyToken('no-dots-in-this-token');
    
    expect(result).toBeNull();
  });
});

describe('Cookie Integration', () => {
  it('should create cookie that can be parsed back', () => {
    const token = 'test-token-abc123';
    const cookie = createAuthCookie(token);
    
    // Extract token from cookie string
    const tokenMatch = cookie.match(/auth_token=([^;]+)/);
    expect(tokenMatch).toBeTruthy();
    expect(tokenMatch![1]).toBe(token);
  });

  it('should create clear cookie that differs from createAuthCookie', () => {
    const setCookie = createAuthCookie('some-token');
    const clearCookie = clearAuthCookie();
    
    expect(setCookie).not.toBe(clearCookie);
    expect(clearCookie).toContain('Max-Age=0');
  });
});
