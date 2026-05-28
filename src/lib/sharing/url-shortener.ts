/**
 * URL shortener for readings
 * Generates short codes and maps them to full URLs
 */

export interface ShortenedUrl {
  code: string;
  url: string;
  originalUrl: string;
  createdAt: number;
  expiresAt: number | null;
  accessCount: number;
}

export interface ShortenerOptions {
  expiresIn?: number; // milliseconds, null for never
  prefix?: string;
}

// Character set for short codes (URL-safe base64)
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
const CODE_LENGTH = 8;

// In-memory store for short codes
const urlStore = new Map<string, ShortenedUrl>();

// Reverse lookup: original URL -> short code
const reverseIndex = new Map<string, string>();

// Cleanup expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of urlStore.entries()) {
    if (entry.expiresAt !== null && now > entry.expiresAt) {
      urlStore.delete(code);
      if (reverseIndex.get(entry.originalUrl) === code) {
        reverseIndex.delete(entry.originalUrl);
      }
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate a cryptographically random short code
 */
function generateCode(): string {
  const array = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => CHARSET[byte % CHARSET.length]).join('');
}

/**
 * Shorten a URL for a reading
 * Reuses existing code if URL was already shortened
 */
export function shortenUrl(originalUrl: string, options: ShortenerOptions = {}): ShortenedUrl {
  const { expiresIn = null, prefix = '' } = options;

  // Check if already shortened
  const existingCode = reverseIndex.get(originalUrl);
  if (existingCode) {
    const existing = urlStore.get(existingCode);
    if (existing && (existing.expiresAt === null || existing.expiresAt > Date.now())) {
      return existing;
    }
  }

  // Generate new short code
  let code: string;
  do {
    code = prefix + generateCode();
  } while (urlStore.has(code));

  const now = Date.now();
  const shortened: ShortenedUrl = {
    code,
    url: `/${code}`,
    originalUrl,
    createdAt: now,
    expiresAt: expiresIn ? now + expiresIn : null,
    accessCount: 0,
  };

  urlStore.set(code, shortened);
  reverseIndex.set(originalUrl, code);

  return shortened;
}

/**
 * Expand a short code back to the full URL info
 * Returns null if not found or expired
 */
export function expandUrl(code: string): ShortenedUrl | null {
  const entry = urlStore.get(code);
  if (!entry) return null;

  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    urlStore.delete(code);
    if (reverseIndex.get(entry.originalUrl) === code) {
      reverseIndex.delete(entry.originalUrl);
    }
    return null;
  }

  // Increment access count
  entry.accessCount++;

  return entry;
}

/**
 * Get statistics for a shortened URL
 */
export function getUrlStats(code: string): { accessCount: number; createdAt: number } | null {
  const entry = urlStore.get(code);
  if (!entry) return null;
  return { accessCount: entry.accessCount, createdAt: entry.createdAt };
}

/**
 * Delete a shortened URL
 */
export function deleteShortenedUrl(code: string): boolean {
  const entry = urlStore.get(code);
  if (!entry) return false;

  urlStore.delete(code);
  reverseIndex.delete(entry.originalUrl);
  return true;
}