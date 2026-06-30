'use client';

// ============================================================================
// lazy-mounts — Client-side wrappers for lazy-loaded modals/bars
// ============================================================================
// Wave 32 (perf 4/8) — Tiny client wrappers that mount the lazy-loaded
// conversion components. Server pages can import these freely; the wrappers
// mount the lazy components on the client side, deferring their JS until
// needed.
//
// Why this pattern?
//   - `next/dynamic` with `ssr: false` is forbidden in server components.
//   - Server pages render the wrapper (small client bundle) inline.
//   - The actual modal/bar JS loads only when the wrapper mounts.
//
// Each wrapper is < 1KB. The lazy component code only loads if user
// triggers the conditions (exit intent, mobile viewport, etc).
// ============================================================================

import {
  LazyExitIntentModal,
  LazyMobileCaptureBar,
} from './lazy-components';

interface VariantProps {
  variant: 'A' | 'B' | 'C' | 'D';
}

export function LazyMountExitIntentModal({ variant }: VariantProps) {
  return <LazyExitIntentModal variant={variant} />;
}

export function LazyMountMobileCaptureBar({ variant }: VariantProps) {
  return <LazyMobileCaptureBar variant={variant} />;
}

export function LazyMountConversionBundle({ variant }: VariantProps) {
  return (
    <>
      <LazyExitIntentModal variant={variant} />
      <LazyMobileCaptureBar variant={variant} />
    </>
  );
}