'use client';

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <CosmicBackground variant="dense">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="mb-6 text-center">
          <h1
            className="text-3xl font-bold text-spiritual-gold mb-1"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ✦ Cabala dos Caminhos ✦
          </h1>
          <p className="text-spiritual-text-secondary text-sm">
            Desvende os mistérios da sua alma
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-sm text-spiritual-text-secondary">
          <a
            href="/login"
            className="text-spiritual-gold hover:text-spiritual-gold-light underline"
          >
            ← Voltar para login
          </a>
        </p>
      </div>
    </CosmicBackground>
  );
}