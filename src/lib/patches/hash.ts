/**
 * patches/hash — pure-JS FNV-1a 32-bit + SHA-256 helpers
 * ============================================================================
 * FNV-1a for compact audit hashes (8 hex chars); SHA-256 for file integrity.
 * No external deps. Safe for SSR + Edge runtimes (Node 18+, Web Crypto).
 * ============================================================================
 */

import { createHash } from "node:crypto";

export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}