'use client';

/**
 * ============================================================================
 * Button (Design System wrapper)
 * ============================================================================
 * Canonical export surface for the Akasha Portal design system. Internally
 * delegates to `src/components/ui/button.tsx` (shadcn-style primitives) but
 * re-exports the same contract under the DS namespace so consumers can:
 *
 *   import { Button } from '@/components/design-system';
 *
 * Variant extensions for spiritual context (golden, golden-outline) live in
 * the underlying primitive and are inherited here.
 * ============================================================================
 */

export { Button, buttonVariants } from '@/components/ui/button';
export type { VariantProps } from 'class-variance-authority';
