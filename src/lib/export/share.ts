// fallow-ignore-file unused-file
/**
 * Shareable reading links with 7-day expiration
 */

export interface ReadingShare {
  id: string;
  reading: ReadingData;
  createdAt: number;
  expiresAt: number;
}

export interface ReadingData {
  type: string;
  data: unknown;
}

// In-memory store for shared readings
const shareStore = new Map<string, ReadingShare>();

// Cleanup expired entries every hour
setInterval(() => {
  const now = Date.now();
  Array.from(shareStore.entries()).forEach(([key, entry]) => {
    if (now > entry.expiresAt) {
      shareStore.delete(key);
    }
  });
}, 60 * 60 * 1000);

/**
 * Generate a unique ID for sharing
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Create a shareable link for a reading
 */
export function createShareableLink(reading: ReadingData): ReadingShare {
  const now = Date.now();
  const share: ReadingShare = {
    id: generateId(),
    reading,
    createdAt: now,
    expiresAt: now + SEVEN_DAYS_MS,
  };

  shareStore.set(share.id, share);
  return share;
}

/**
 * Retrieve a shared reading by ID
 * Returns null if not found or expired
 */
export function getSharedReading(id: string): ReadingShare | null {
  const share = shareStore.get(id);
  if (!share) return null;

  if (Date.now() > share.expiresAt) {
    shareStore.delete(id);
    return null;
  }

  return share;
}
