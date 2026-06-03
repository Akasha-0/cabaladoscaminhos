'use client';

// ============================================================
// Global Error Boundary — root fallback
// Substitui o root layout quando ocorre um erro não tratado.
// Deve ser client component e incluir seu próprio <html>/<body>
// (Next.js 16 + React 19 docs: app/global-error.tsx).
// ============================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            background: '#0a0a0a',
            color: '#fbbf24',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo deu errado</h1>
          <p style={{ color: '#d4d4d8', maxWidth: '32rem', marginBottom: '1.5rem' }}>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: '#71717a',
                marginBottom: '1.5rem',
              }}
            >
              Código: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '0.5rem 1.5rem',
              border: '1px solid #fbbf24',
              borderRadius: '0.375rem',
              background: 'transparent',
              color: '#fbbf24',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
