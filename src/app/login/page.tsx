'use client';

import { Suspense } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginPageInner() {
  return (
    <CosmicBackground variant="dense">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold text-spiritual-gold mb-1"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ✦ Cabala dos Caminhos ✦
          </h1>
          <p className="text-spiritual-text-secondary text-sm">
            Comece sua jornada de autoconhecimento
          </p>
        </div>
        <LoginForm />
      </div>
    </CosmicBackground>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageInner />
    </Suspense>
  );
}