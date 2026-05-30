/**
 * QR Code Generation Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the qrcode module
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
}));

import { generateQRCode } from '@/lib/sharing/qr-code';
import { toDataURL } from 'qrcode';

describe('QR Code Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate a QR code data URL for a valid URL', async () => {
      const url = 'https://example.com/reading/123';
      const result = await generateQRCode(url);
      
      expect(result).toBe('data:image/png;base64,mock-qr-code');
      expect(toDataURL).toHaveBeenCalledWith(url, expect.objectContaining({
        width: 300,
        margin: 2,
      }));
    });

    it('should include correct color options', async () => {
      const url = 'https://example.com/reading/456';
      await generateQRCode(url);
      
      expect(toDataURL).toHaveBeenCalledWith(url, expect.objectContaining({
        color: {
          dark: '#1a1a1a',
          light: '#ffffff',
        },
      }));
    });

    it('should be called with the correct URL', async () => {
      const testUrls = [
        'https://example.com/path/to/resource',
        'https://cabala.app/reading/abc123',
        'https://dev.cabala.app/api/share?id=xyz',
      ];
      
      for (const url of testUrls) {
        vi.mocked(toDataURL).mockResolvedValueOnce('data:image/png;base64,mock');
        await generateQRCode(url);
        expect(toDataURL).toHaveBeenLastCalledWith(url, expect.any(Object));
      }
    });

    it('should use correct width setting', async () => {
      const url = 'https://example.com/test';
      await generateQRCode(url);
      
      expect(toDataURL).toHaveBeenCalledWith(url, expect.objectContaining({
        width: 300,
      }));
    });

    it('should use correct margin setting', async () => {
      const url = 'https://example.com/test';
      await generateQRCode(url);
      
      expect(toDataURL).toHaveBeenCalledWith(url, expect.objectContaining({
        margin: 2,
      }));
    });

    it('should handle long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500);
      await generateQRCode(longUrl);
      
      expect(toDataURL).toHaveBeenCalledWith(longUrl, expect.any(Object));
    });

    it('should handle URLs with special characters', async () => {
      const specialUrl = 'https://example.com/path?param=value&special=ñ&emoji=🔮';
      await generateQRCode(specialUrl);
      
      expect(toDataURL).toHaveBeenCalledWith(specialUrl, expect.any(Object));
    });
  });
});