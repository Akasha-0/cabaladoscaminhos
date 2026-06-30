'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/**
 * WelcomeClient — Lazy-loads FirstValueExperience.
 *
 * Why? FirstValueExperience is the largest client component on /welcome
 * (241 LOC + 3 recommended-post fetches + 3 tradition cards + tracking).
 * Deferring it to dynamic lets the page shell + skeleton appear in < 1s
 * while the heavy component hydrates behind the scenes.
 */
const FirstValueExperience = dynamic(
  () => import('@/components/conversion/FirstValueExperience').then(m => ({
    default: m.FirstValueExperience,
  })),
  {
    loading: () => (
      <div className="min-h-screen min-h-app flex items-center justify-center bg-slate-950 safe-area">
        <LoadingSpinner variant="gold" size="lg" />
      </div>
    ),
    ssr: false,
  }
);

export default function WelcomeClient() {
  return <FirstValueExperience />;
}