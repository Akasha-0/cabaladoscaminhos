// Co-located unit tests for SSRF guard — Wave 12.5 §12.5.
//
// Tests cobrem: scheme validation, private IP detection (IPv4 + IPv6),
// IPv4-mapped IPv6 bypass, hostname validation, and the full DNS-resolve
// path (validateAndResolveExternalUrl).

import { describe, expect, it } from 'vitest';
import { assertSafeExternalUrl, isPrivateIp, SsrfBlockedError, validateAndResolveExternalUrl } from './ssrf';

describe('isPrivateIp', () => {
  describe('IPv4', () => {
    it.each([
      ['127.0.0.1', true, 'loopback'],
      ['127.255.255.255', true, 'loopback max'],
      ['10.0.0.1', true, 'private 10/8'],
      ['10.255.255.255', true, 'private 10/8 max'],
      ['172.16.0.1', true, 'private 172.16/12'],
      ['172.31.255.255', true, 'private 172.16/12 max'],
      ['192.168.1.1', true, 'private 192.168/16'],
      ['169.254.169.254', true, 'cloud metadata IMDS'],
      ['100.64.0.1', true, 'CGNAT'],
      ['0.0.0.0', true, 'unspecified'],
      ['224.0.0.1', true, 'multicast'],
      ['255.255.255.255', true, 'broadcast'],
    ])('blocks %s (%s)', (ip) => {
      expect(isPrivateIp(ip)).toBe(true);
    });

    it.each([
      ['8.8.8.8', false, 'Google DNS'],
      ['1.1.1.1', false, 'Cloudflare DNS'],
      ['172.32.0.1', false, 'just outside 172.16/12'],
      ['11.0.0.1', false, 'just outside 10/8'],
      ['169.255.0.1', false, 'just outside 169.254/16'],
    ])('allows %s (%s)', (ip) => {
      expect(isPrivateIp(ip)).toBe(false);
    });
  });

  describe('IPv6', () => {
    it.each([
      ['::1', true, 'IPv6 loopback'],
      ['fe80::1', true, 'IPv6 link-local'],
      ['fc00::1', true, 'IPv6 ULA'],
      ['fd00::1', true, 'IPv6 ULA fd'],
      ['::', true, 'IPv6 unspecified'],
      ['::ffff:127.0.0.1', true, 'IPv4-mapped loopback'],
      ['::ffff:192.168.1.1', true, 'IPv4-mapped private'],
    ])('blocks %s (%s)', (ip) => {
      expect(isPrivateIp(ip)).toBe(true);
    });

    it.each([
      ['2001:4860:4860::8888', false, 'Google DNS IPv6'],
      ['2606:4700:4700::1111', false, 'Cloudflare DNS IPv6'],
    ])('allows %s (%s)', (ip) => {
      expect(isPrivateIp(ip)).toBe(false);
    });
  });
});

describe('assertSafeExternalUrl', () => {
  describe('valid external URLs', () => {
    it.each([
      'https://google.com',
      'https://api.openai.com/v1/chat',
      'https://example.com/path?q=value',
      'http://example.com', // http allowed (with warning in prod)
      'https://sub.domain.example.com:8443/api',
    ])('allows %s', (url) => {
      expect(() => assertSafeExternalUrl(url)).not.toThrow();
    });
  });

  describe('blocks dangerous schemes', () => {
    it.each([
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///etc/passwd',
      'vbscript:msgbox(1)',
      'ftp://internal-server/file',
      'gopher://localhost',
      'ldap://internal-dc',
      'chrome://settings',
      'about:blank',
    ])('blocks %s', (url) => {
      expect(() => assertSafeExternalUrl(url)).toThrow(SsrfBlockedError);
    });
  });

  describe('blocks loopback and private IPs', () => {
    it.each([
      'http://127.0.0.1/admin',
      'http://127.0.0.1:3000/api',
      'http://10.0.0.1/internal',
      'http://192.168.1.1/router',
      'http://172.16.0.1/internal',
      'http://169.254.169.254/latest/meta-data/', // AWS IMDS — CRITICAL
      'http://[::1]/admin',
      'http://[::ffff:127.0.0.1]/admin', // IPv4-mapped bypass attempt
      'http://[fe80::1]/admin',
      'http://localhost/admin',
      'http://0.0.0.0/admin',
    ])('blocks %s', (url) => {
      expect(() => assertSafeExternalUrl(url)).toThrow(SsrfBlockedError);
    });
  });

  describe('blocks URLs with userinfo', () => {
    it.each([
      'https://user:pass@example.com',
      'https://attacker@legitimate.com',
    ])('blocks %s', (url) => {
      expect(() => assertSafeExternalUrl(url)).toThrow(SsrfBlockedError);
    });
  });

  describe('blocks malformed URLs', () => {
    it.each(['', 'not-a-url', 'http://', 'https://'])('blocks %s', (url) => {
      expect(() => assertSafeExternalUrl(url)).toThrow(SsrfBlockedError);
    });
  });
});

describe('SsrfBlockedError', () => {
  it('contains reason and redacted url (no query string — LGPD)', () => {
    try {
      assertSafeExternalUrl('https://127.0.0.1/admin?token=secret123&email=user@example.com');
    } catch (err) {
      expect(err).toBeInstanceOf(SsrfBlockedError);
      const ssrfErr = err as SsrfBlockedError;
      expect(ssrfErr.reason).toContain('private-ip');
      expect(ssrfErr.message).toContain('127.0.0.1');
      // Query string redacted (LGPD: tokens/PII não vão pra log)
      expect(ssrfErr.message).not.toContain('secret123');
      expect(ssrfErr.message).not.toContain('user@example.com');
    }
  });
});

describe('validateAndResolveExternalUrl', () => {
  it('blocks when DNS resolves to private IP (anti-DNS-rebinding)', async () => {
    // localhost → 127.0.0.1 (private). Deve bloquear.
    await expect(validateAndResolveExternalUrl('http://localhost/admin')).rejects.toThrow(SsrfBlockedError);
  });

  it('blocks on DNS lookup failure (fail-closed)', async () => {
    // Hostname inválido (.invalid é TLD reservado pela RFC 6761 que nunca resolve)
    await expect(
      validateAndResolveExternalUrl('https://this-host-does-not-exist-anywhere-12345.invalid/path')
    ).rejects.toThrow(SsrfBlockedError);
  });

  it('allows public hostname that resolves to public IP (Google)', async () => {
    // Google DNS — deve permitir (não é IP privado)
    await expect(validateAndResolveExternalUrl('https://dns.google/')).resolves.toBeUndefined();
  });
});