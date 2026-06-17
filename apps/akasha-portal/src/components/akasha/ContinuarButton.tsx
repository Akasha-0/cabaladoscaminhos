/**
 * ContinuarButton — client wrapper for the "Continuar →" scroll button.
 * Kept small so the parent page.tsx stays a Server Component.
 */
'use client';

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
} as const;

export function ContinuarButton() {
  return (
    <button
      aria-label="Continuar para o Ritual — sua reflexão na pergunta acima será perdida ao rolar"
      onClick={() =>
        document.getElementById('tela-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        padding: '13px 0',
        borderRadius: 12,
        background: `linear-gradient(135deg, ${C.violeta}22 0%, ${C.aurora}14 100%)`,
        border: `1px solid ${C.violeta}55`,
        color: C.violeta,
        fontSize: '0.88rem',
        letterSpacing: '0.07em',
        fontFamily: 'var(--font-cinzel, serif)',
        cursor: 'pointer',
        marginTop: 10,
      }}
    >
      Continuar →
    </button>
  );
}
