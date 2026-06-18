(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  82915,
  (e) => {
    'use strict';
    var o = e.i(30722);
    e.s([
      'default',
      0,
      function ({ error: e, reset: t }) {
        return (0, o.jsx)('html', {
          lang: 'pt-BR',
          children: (0, o.jsx)('body', {
            children: (0, o.jsxs)('main', {
              style: {
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
              },
              children: [
                (0, o.jsx)('h1', {
                  style: { fontSize: '1.5rem', marginBottom: '1rem' },
                  children: 'Algo deu errado',
                }),
                (0, o.jsx)('p', {
                  style: { color: '#d4d4d8', maxWidth: '32rem', marginBottom: '1.5rem' },
                  children: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
                }),
                e.digest
                  ? (0, o.jsxs)('p', {
                      style: {
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#71717a',
                        marginBottom: '1.5rem',
                      },
                      children: ['Código: ', e.digest],
                    })
                  : null,
                (0, o.jsx)('button', {
                  type: 'button',
                  onClick: t,
                  style: {
                    padding: '0.5rem 1.5rem',
                    border: '1px solid #fbbf24',
                    borderRadius: '0.375rem',
                    background: 'transparent',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  },
                  children: 'Tentar novamente',
                }),
              ],
            }),
          }),
        });
      },
    ]);
  },
]);
