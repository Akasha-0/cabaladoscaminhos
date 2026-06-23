/**
 * loading.tsx — Suspense boundary for the diario page.
 * Shows DiarioPageSkeleton while the page is loading.
 */
import { Suspense } from 'react';
import { DiarioPageSkeleton } from '@/components/akasha/diario/DiarioPageSkeleton';

export default function Loading() {
  return (
    <Suspense fallback={<DiarioPageSkeleton />}>
      <DiarioPageSkeleton />
    </Suspense>
  );
}
