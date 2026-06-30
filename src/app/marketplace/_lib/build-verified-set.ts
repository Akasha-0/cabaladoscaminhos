/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-B — MARKETPLACE · Verified Practitioner Set (server helper)
 * ════════════════════════════════════════════════════════════════════════════
 */

import type { Practitioner } from '@/lib/engines/marketplace/marketplace-engine';

export function buildVerifiedPractitionerSet(
  practitioners: ReadonlyArray<Practitioner>,
): ReadonlySet<string> {
  const set = new Set<string>();
  for (const p of practitioners) {
    if (p.verified) set.add(p.id);
  }
  return set;
}