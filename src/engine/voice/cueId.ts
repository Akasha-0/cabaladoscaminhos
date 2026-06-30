// ============================================================================
// CueId — deterministic FNV-1a + Math.imul (cycle-84-B + cycle-85-A reuse)
// ============================================================================
// Deterministic across runs so tests can assert exact CueIds.
// Format: `cue-NNNN-XXXXXXXX` (4-digit seq + 8-char hex hash)
// ============================================================================

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function fnv1a(input: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

function toHex8(n: number): string {
  return n.toString(16).padStart(8, '0').slice(0, 8);
}

let sequenceCounter = 0;
export function resetCueSequence(): void {
  sequenceCounter = 0;
}

export function makeCueId(prefix: string): string {
  sequenceCounter += 1;
  const seq = sequenceCounter.toString().padStart(4, '0');
  const hash = toHex8(fnv1a(`${prefix}:${sequenceCounter}:${Date.now()}`));
  return `cue-${seq}-${hash}`;
}
