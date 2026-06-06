'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDismissed(true);
      setPrompt(null);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '420px',
        background: 'rgba(11, 14, 28, 0.92)',
        border: '1px solid rgba(124, 92, 255, 0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '16px 20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 0 40px rgba(124,92,255,0.2)',
      }}
    >
      <div style={{ fontSize: '1.75rem' }}>✦</div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-cinzel), serif',
            fontSize: '0.875rem',
            color: '#F4F5FF',
            fontWeight: 600,
            marginBottom: '2px',
          }}
        >
          Instalar o Akasha
        </p>
        <p style={{ fontSize: '0.75rem', color: '#A7AECF' }}>
          Adicione à tela inicial para acesso rápido ao seu oráculo diário.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#7C5CFF',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            color: '#5C6691',
            border: 'none',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
