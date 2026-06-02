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
    // `ramiro` aplica a paleta v2 (laranja + azul royal — Doc 13) a todo o cockpit.
    <main className="ramiro min-h-screen bg-background text-foreground">
      <CockpitOracular showDebug={showDebug} />
    </main>
  );
}