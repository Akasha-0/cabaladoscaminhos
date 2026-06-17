'use client';

import { useState } from 'react';

export function LilithCasa8Details({ cor }: { cor: string }) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div
      style={{
        fontSize: '0.75rem',
        color: '#A7AECF',
        fontStyle: 'italic',
        margin: '4px 0 0',
        border: `1px solid ${cor}22`,
        borderRadius: '6px',
        padding: '0.5rem 0.6rem',
      }}
    >
      <button
        onClick={() => setMostrar(!mostrar)}
        style={{
          color: '#FB5781',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
        }}
        aria-expanded={mostrar}
      >
        Lilith e Casa 8 no mesmo signo — {mostrar ? 'ocultar' : 'mostrar mais'}
      </button>
      {mostrar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
          <span>• Sua assinatura sexual é reconhecível: um padrão fixo, não situacional.</span>
          <span>• O que é reprimido aqui tende a se expressar por outros canais (projeção, obsessão, transformação).</span>
          <span>• Não é necessário "aceitar" — é necessário notar o padrão e escolher conscientemente.</span>
        </div>
      )}
    </div>
  );
}
