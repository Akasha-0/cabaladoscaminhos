(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  11371,
  (e) => {
    'use strict';
    var s = e.i(30722),
      a = e.i(52330),
      r = e.i(91137);
    async function t() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window))
        return (console.warn('[push] Push not supported in this browser'), null);
      let e = r.default.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!e) return (console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set'), null);
      if ('granted' !== (await Notification.requestPermission()))
        return (console.warn('[push] Notification permission denied'), null);
      let s = await navigator.serviceWorker.ready;
      return await s.pushManager.subscribe({
        userVisibleOnly: !0,
        applicationServerKey: (function (e) {
          let s = '='.repeat((4 - (e.length % 4)) % 4),
            a = atob((e + s).replace(/-/g, '+').replace(/_/g, '/')),
            r = new Uint8Array(a.length);
          for (let e = 0; e < a.length; ++e) r[e] = a.charCodeAt(e);
          return r;
        })(e),
      });
    }
    async function o() {
      if (!('serviceWorker' in navigator)) return !1;
      let e = await navigator.serviceWorker.ready,
        s = await e.pushManager.getSubscription();
      return !!s && s.unsubscribe();
    }
    let i = {
        background: 'rgba(124, 58, 237, 0.05)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
      },
      l = [
        {
          type: 'credits_10',
          label: '10 Créditos',
          price: 'R$9,90',
          description: '10 consultas simples',
        },
        {
          type: 'credits_30',
          label: '30 Créditos',
          price: 'R$24,90',
          description: '30 consultas simples',
          highlight: !0,
        },
        {
          type: 'credits_60',
          label: '60 Créditos',
          price: 'R$44,90',
          description: '60 consultas simples',
        },
      ];
    e.s(
      [
        'default',
        0,
        function ({
          user: e,
          balance: r,
          subscription: c,
          subscriptionError: n,
          checkoutStatus: d,
          pushEnabled: p = !1,
        }) {
          let [x, u] = (0, a.useState)(null),
            [b, m] = (0, a.useState)(''),
            [h, g] = (0, a.useState)(p),
            [f, y] = (0, a.useState)(!1),
            [j, N] = (0, a.useState)(''),
            v = 'AKASHA_PRO' === c.plan && 'ACTIVE' === c.status;
          async function w(e) {
            (m(''), u(e));
            try {
              let s = await fetch('/api/akasha/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: e }),
                }),
                a = await s.json();
              if (!s.ok) throw Error(a.error ?? 'Erro ao iniciar checkout');
              a.url && (window.location.href = a.url);
            } catch (e) {
              m(e instanceof Error ? e.message : 'Erro inesperado');
            } finally {
              u(null);
            }
          }
          async function k() {
            (N(''), y(!0));
            try {
              if (h) {
                let e = await o();
                if (
                  !(
                    await fetch('/api/akasha/push/subscribe', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({}),
                    })
                  ).ok
                )
                  throw Error('Falha ao desativar notificações');
                (g(!1),
                  N(
                    e
                      ? 'Notificações desativadas.'
                      : 'Notificações desativadas (já não havia subscrição ativa).'
                  ));
              } else {
                let e = await t();
                if (!e) return void N('Seu navegador bloqueou as notificações ou não há suporte.');
                if (
                  !(
                    await fetch('/api/akasha/push/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subscription: e.toJSON() }),
                    })
                  ).ok
                )
                  throw Error('Falha ao ativar notificações');
                (g(!0),
                  N(
                    'Notificações ativadas. Você receberá um aviso por dia quando o ritual estiver pronto.'
                  ));
              }
            } catch (e) {
              N(e instanceof Error ? e.message : 'Erro ao alterar notificações');
            } finally {
              y(!1);
            }
          }
          return (0, s.jsx)('div', {
            className: 'min-h-[calc(100vh-56px)] px-4 py-12',
            style: { background: '#030711' },
            children: (0, s.jsxs)('div', {
              className: 'max-w-2xl mx-auto flex flex-col gap-6',
              children: [
                'success' === d &&
                  (0, s.jsx)('div', {
                    className: 'px-4 py-3 rounded-xl text-sm',
                    style: {
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#34D399',
                    },
                    children: 'Pagamento confirmado! Seus créditos foram adicionados.',
                  }),
                'cancel' === d &&
                  (0, s.jsx)('div', {
                    className: 'px-4 py-3 rounded-xl text-sm',
                    style: {
                      background: 'rgba(244,63,94,0.1)',
                      border: '1px solid rgba(244,63,94,0.3)',
                      color: '#f87171',
                    },
                    children: 'Checkout cancelado. Nenhuma cobrança foi realizada.',
                  }),
                b &&
                  (0, s.jsx)('div', {
                    className: 'px-4 py-3 rounded-xl text-sm',
                    style: {
                      background: 'rgba(244,63,94,0.1)',
                      border: '1px solid rgba(244,63,94,0.3)',
                      color: '#f87171',
                    },
                    children: b,
                  }),
                n &&
                  (0, s.jsx)('div', {
                    className: 'px-4 py-3 rounded-xl text-sm',
                    style: {
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#F59E0B',
                    },
                    children:
                      'Não foi possível carregar os dados da sua assinatura. O restante da conta continua disponível.',
                  }),
                (0, s.jsxs)('div', {
                  style: i,
                  className: 'p-6',
                  children: [
                    (0, s.jsx)('h1', {
                      className: 'text-xl font-semibold mb-1',
                      style: { fontFamily: 'var(--font-cinzel), serif', color: '#E2E8F0' },
                      children: e.name,
                    }),
                    (0, s.jsx)('p', {
                      className: 'text-sm',
                      style: { color: 'rgba(226,232,240,0.5)' },
                      children: e.email,
                    }),
                  ],
                }),
                (0, s.jsx)('div', {
                  style: i,
                  className: 'p-6',
                  children: (0, s.jsxs)('div', {
                    className: 'flex items-start justify-between gap-4',
                    children: [
                      (0, s.jsxs)('div', {
                        className: 'flex-1',
                        children: [
                          (0, s.jsx)('h2', {
                            className: 'text-base font-semibold mb-1',
                            style: { color: '#E2E8F0' },
                            children: 'Notificações',
                          }),
                          (0, s.jsx)('p', {
                            className: 'text-sm',
                            style: { color: 'rgba(226,232,240,0.65)' },
                            children:
                              'Receba uma notificação por dia quando seu ritual estiver pronto. Você pode desativar a qualquer momento.',
                          }),
                          (0, s.jsx)('p', {
                            className: 'text-xs mt-1',
                            style: { color: 'rgba(226,232,240,0.4)' },
                            children:
                              'A notificação é genérica — o conteúdo do ritual só é aberto no app.',
                          }),
                          j &&
                            (0, s.jsx)('p', {
                              className: 'text-xs mt-2',
                              style: { color: h ? '#34D399' : 'rgba(226,232,240,0.55)' },
                              children: j,
                            }),
                        ],
                      }),
                      (0, s.jsx)('button', {
                        onClick: k,
                        disabled: f,
                        'aria-pressed': h,
                        className:
                          'px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50',
                        style: {
                          background: h ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
                          border: h
                            ? '1px solid rgba(16,185,129,0.4)'
                            : '1px solid rgba(124,58,237,0.4)',
                          color: h ? '#34D399' : '#A78BFA',
                        },
                        children: f ? 'Aguarde...' : h ? 'Desativar' : 'Ativar',
                      }),
                    ],
                  }),
                }),
                (0, s.jsxs)('div', {
                  className: 'grid grid-cols-2 gap-4',
                  children: [
                    (0, s.jsxs)('div', {
                      style: i,
                      className: 'p-5 flex flex-col gap-2',
                      children: [
                        (0, s.jsx)('p', {
                          className: 'text-xs uppercase tracking-widest',
                          style: { color: 'rgba(226,232,240,0.4)' },
                          children: 'Plano',
                        }),
                        (0, s.jsxs)('div', {
                          className: 'flex items-center gap-2',
                          children: [
                            (0, s.jsx)('span', {
                              className: 'text-lg font-semibold',
                              style: { color: v ? '#A78BFA' : '#E2E8F0' },
                              children: v ? 'Akasha Pro' : 'Freemium',
                            }),
                            v &&
                              (0, s.jsx)('span', {
                                className: 'text-xs px-2 py-0.5 rounded-full',
                                style: { background: 'rgba(124,58,237,0.25)', color: '#A78BFA' },
                                children: 'Ativo',
                              }),
                          ],
                        }),
                        v &&
                          c.currentPeriodEnd &&
                          (0, s.jsxs)('p', {
                            className: 'text-xs',
                            style: { color: 'rgba(226,232,240,0.4)' },
                            children: [
                              'Renova em ',
                              new Date(c.currentPeriodEnd).toLocaleDateString('pt-BR'),
                            ],
                          }),
                      ],
                    }),
                    (0, s.jsxs)('div', {
                      style: i,
                      className: 'p-5 flex flex-col gap-2',
                      children: [
                        (0, s.jsx)('p', {
                          className: 'text-xs uppercase tracking-widest',
                          style: { color: 'rgba(226,232,240,0.4)' },
                          children: 'Créditos',
                        }),
                        (0, s.jsx)('span', {
                          className: 'text-3xl font-bold',
                          style: { color: '#F59E0B', fontFamily: 'var(--font-cinzel), serif' },
                          children: r,
                        }),
                        (0, s.jsx)('p', {
                          className: 'text-xs',
                          style: { color: 'rgba(226,232,240,0.4)' },
                          children: '1 crédito = 1 consulta simples · 3 = complexa',
                        }),
                      ],
                    }),
                  ],
                }),
                !v &&
                  (0, s.jsx)('div', {
                    style: {
                      ...i,
                      border: '1px solid rgba(124,58,237,0.4)',
                      background: 'rgba(124,58,237,0.08)',
                    },
                    className: 'p-6',
                    children: (0, s.jsxs)('div', {
                      className: 'flex items-start justify-between gap-4',
                      children: [
                        (0, s.jsxs)('div', {
                          children: [
                            (0, s.jsx)('h2', {
                              className: 'text-base font-semibold mb-1',
                              style: { color: '#A78BFA' },
                              children: 'Akasha Pro',
                            }),
                            (0, s.jsx)('p', {
                              className: 'text-sm mb-1',
                              style: { color: 'rgba(226,232,240,0.65)' },
                              children: 'R$39,90/mês',
                            }),
                            (0, s.jsxs)('ul', {
                              className: 'text-sm flex flex-col gap-1 mt-2',
                              style: { color: 'rgba(226,232,240,0.55)' },
                              children: [
                                (0, s.jsx)('li', { children: '✦ Dashboard Diário ilimitado' }),
                                (0, s.jsx)('li', { children: '✦ 30 créditos/mês para o Oráculo' }),
                                (0, s.jsx)('li', { children: '✦ Cancele quando quiser' }),
                              ],
                            }),
                          ],
                        }),
                        (0, s.jsx)('button', {
                          onClick: () => w('pro'),
                          disabled: 'pro' === x,
                          className:
                            'px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50',
                          style: { background: '#7C3AED', color: '#fff' },
                          children: 'pro' === x ? 'Aguarde...' : 'Assinar',
                        }),
                      ],
                    }),
                  }),
                (0, s.jsx)('div', {
                  style: i,
                  className: 'p-6',
                  children: (0, s.jsxs)('div', {
                    className: 'flex items-start justify-between gap-4',
                    children: [
                      (0, s.jsxs)('div', {
                        children: [
                          (0, s.jsx)('h2', {
                            className: 'text-base font-semibold mb-1',
                            style: { color: '#F59E0B' },
                            children: 'Manifesto Akáshico',
                          }),
                          (0, s.jsx)('p', {
                            className: 'text-sm',
                            style: { color: 'rgba(226,232,240,0.65)' },
                            children: 'R$29,90 · pagamento único',
                          }),
                          (0, s.jsx)('p', {
                            className: 'text-xs mt-1',
                            style: { color: 'rgba(226,232,240,0.4)' },
                            children: 'PDF dos seus 4 pilares + 30 dias de Dashboard Diário',
                          }),
                        ],
                      }),
                      (0, s.jsx)('button', {
                        onClick: () => w('manifesto'),
                        disabled: 'manifesto' === x,
                        className:
                          'px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50',
                        style: {
                          background: 'rgba(245,158,11,0.15)',
                          border: '1px solid rgba(245,158,11,0.4)',
                          color: '#F59E0B',
                        },
                        children: 'manifesto' === x ? 'Aguarde...' : 'Comprar',
                      }),
                    ],
                  }),
                }),
                (0, s.jsxs)('div', {
                  children: [
                    (0, s.jsx)('h2', {
                      className: 'text-sm font-medium mb-3 uppercase tracking-widest',
                      style: { color: 'rgba(226,232,240,0.4)' },
                      children: 'Pacotes de Créditos',
                    }),
                    (0, s.jsx)('div', {
                      className: 'grid grid-cols-3 gap-3',
                      children: l.map((e) =>
                        (0, s.jsxs)(
                          'button',
                          {
                            onClick: () => w(e.type),
                            disabled: !!x,
                            className:
                              'rounded-xl p-4 text-left transition-colors disabled:opacity-50',
                            style: {
                              background: e.highlight
                                ? 'rgba(124,58,237,0.12)'
                                : 'rgba(124,58,237,0.05)',
                              border: e.highlight
                                ? '1px solid rgba(124,58,237,0.4)'
                                : '1px solid rgba(124,58,237,0.15)',
                            },
                            children: [
                              (0, s.jsx)('p', {
                                className: 'text-base font-bold mb-0.5',
                                style: { color: '#E2E8F0' },
                                children: e.label,
                              }),
                              (0, s.jsx)('p', {
                                className: 'text-sm font-semibold mb-1',
                                style: { color: '#A78BFA' },
                                children: e.price,
                              }),
                              (0, s.jsx)('p', {
                                className: 'text-xs',
                                style: { color: 'rgba(226,232,240,0.45)' },
                                children: e.description,
                              }),
                              x === e.type &&
                                (0, s.jsx)('p', {
                                  className: 'text-xs mt-1',
                                  style: { color: '#A78BFA' },
                                  children: 'Aguarde...',
                                }),
                            ],
                          },
                          e.type
                        )
                      ),
                    }),
                  ],
                }),
              ],
            }),
          });
        },
      ],
      11371
    );
  },
]);
