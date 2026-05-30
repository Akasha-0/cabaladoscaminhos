/**
 * URL Shortener Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  shortenUrl,
  expandUrl,
  getUrlStats,
  deleteShortenedUrl,
  type ShortenerOptions,
} from '@/lib/sharing/url-shortener';

describe('URL Shortener', () => {
  beforeEach(() => {
    // Reset modules to clear in-memory store
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shortenUrl', () => {
    it('should create a shortened URL for a valid URL', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const result = shorten('https://example.com/very/long/path');
      
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('originalUrl');
      expect(result).toHaveProperty('shortUrl');
      expect(result).toHaveProperty('createdAt');
      expect(result.code).toHaveLength(8);
    });

    it('should generate URL-safe codes', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const result = shorten('https://example.com/test');
      
      // URL-safe base64 characters
      expect(result.code).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should include accessCount starting at 0', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const result = shorten('https://example.com/test');
      
      expect(result.accessCount).toBe(0);
    });

    it('should accept custom options', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const options: ShortenerOptions = { expiresIn: 3600000 };
      const result = shorten('https://example.com/test', options);
      
      expect(result).toHaveProperty('expiresAt');
    });

    it('should reuse existing code for same URL', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const url = 'https://example.com/same-url';
      
      const result1 = shorten(url);
      const result2 = shorten(url);
      
      expect(result1.code).toBe(result2.code);
    });

    it('should generate different codes for different URLs', async () => {
      const { shortenUrl: shorten } = await import('@/lib/sharing/url-shortener');
      const result1 = shorten('https://example.com/url1');
      const result2 = shorten('https://example.com/url2');
      
      expect(result1.code).not.toBe(result2.code);
    });
  });

  describe('expandUrl', () => {
    it('should return URL info for a valid code', async () => {
      const { shortenUrl: shorten, expandUrl: expand } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/original');
      const expanded = expand(shortened.code);
      
      expect(expanded).not.toBeNull();
      expect(expanded?.originalUrl).toBe('https://example.com/original');
    });

    it('should return null for unknown code', async () => {
      const { expandUrl: expand } = await import('@/lib/sharing/url-shortener');
      const result = expand('unknown-code');
      
      expect(result).toBeNull();
    });

    it('should increment access count', async () => {
      const { shortenUrl: shorten, expandUrl: expand } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/test');
      
      expand(shortened.code);
      const expanded = expand(shortened.code);
      
      expect(expanded?.accessCount).toBeGreaterThan(0);
    });

    it('should return null for expired URL', async () => {
      const { shortenUrl: shorten, expandUrl: expand } = await import('@/lib/sharing/url-shortener');
      const options: ShortenerOptions = { expiresIn: -1000 }; // Already expired
      const shortened = shorten('https://example.com/expired', options);
      
      const result = expand(shortened.code);
      
      expect(result).toBeNull();
    });
  });

  describe('getUrlStats', () => {
    it('should return stats for existing URL', async () => {
      const { shortenUrl: shorten, getUrlStats: stats } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/stats-test');
      
      const result = stats(shortened.code);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('accessCount');
      expect(result).toHaveProperty('createdAt');
    });

    it('should return null for unknown code', async () => {
      const { getUrlStats: stats } = await import('@/lib/sharing/url-shortener');
      const result = stats('unknown-code-123');
      
      expect(result).toBeNull();
    });

    it('should reflect access count changes', async () => {
      const { shortenUrl: shorten, expandUrl: expand, getUrlStats: stats } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/count-test');
      
      expand(shortened.code);
      expand(shortened.code);
      
      const result = stats(shortened.code);
      
      expect(result?.accessCount).toBe(2);
    });
  });

  describe('deleteShortenedUrl', () => {
    it('should return true when deleting existing URL', async () => {
      const { shortenUrl: shorten, deleteShortenedUrl: deleteUrl } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/delete-test');
      
      const result = deleteUrl(shortened.code);
      
      expect(result).toBe(true);
    });

    it('should remove URL from store', async () => {
      const { shortenUrl: shorten, expandUrl: expand, deleteShortenedUrl: deleteUrl } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/remove-test');
      
      deleteUrl(shortened.code);
      const expanded = expand(shortened.code);
      
      expect(expanded).toBeNull();
    });

    it('should return false for unknown code', async () => {
      const { deleteShortenedUrl: deleteUrl } = await import('@/lib/sharing/url-shortener');
      const result = deleteUrl('non-existent-code');
      
      expect(result).toBe(false);
    });

    it('should allow deletion of already deleted URL', async () => {
      const { shortenUrl: shorten, deleteShortenedUrl: deleteUrl } = await import('@/lib/sharing/url-shortener');
      const shortened = shorten('https://example.com/double-delete');
      
      deleteUrl(shortened.code);
      const result = deleteUrl(shortened.code);
      
      expect(result).toBe(false);
    });
  });
});