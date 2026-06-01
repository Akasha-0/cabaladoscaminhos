// src/app/cockpit/page.tsx
// Cockpit Oracular - Professional divination workspace

'use client';

import { CockpitOracular } from '@/components/cockpit/CockpitOracular';

export default function CockpitPage() {
  // Check for debug mode - in production, set to false
  const showDebug = process.env.NODE_ENV === 'development' || 
                    typeof window !== 'undefined' && 
                    window.location.search.includes('debug=true');
  
  return (
    <main className="min-h-screen bg-slate-950">
      <CockpitOracular showDebug={showDebug} />
    </main>
  );
}