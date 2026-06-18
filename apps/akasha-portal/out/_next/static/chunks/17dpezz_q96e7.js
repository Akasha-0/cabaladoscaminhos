(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  24150,
  (e) => {
    'use strict';
    var r = e.i(30722),
      l = e.i(52330),
      i = e.i(89426);
    let a = {
        background: 'rgba(11,14,28,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(38,48,79,0.7)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 20,
      },
      t = {
        fontSize: '0.68rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(244,245,255,0.38)',
        marginBottom: 3,
      },
      n = { color: '#F4F5FF', fontSize: '0.95rem' },
      s = { color: 'rgba(244,245,255,0.68)', fontSize: '0.875rem', lineHeight: 1.7, marginTop: 14 },
      o = (e) => ({
        fontFamily: 'var(--font-cinzel, "Cinzel", serif)',
        color: e,
        fontSize: '0.78rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginBottom: 18,
        paddingBottom: 12,
        borderBottom: `1px solid ${e}28`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      });
    function d({ label: e, value: l }) {
      return null == l
        ? null
        : (0, r.jsxs)('div', {
            style: { marginBottom: 10 },
            children: [
              (0, r.jsx)('div', { style: t, children: e }),
              (0, r.jsx)('div', { style: n, children: l }),
            ],
          });
    }
    function c({ pairs: e }) {
      return (0, r.jsx)('div', {
        style: { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 4 },
        children: e.map((e) => (0, r.jsx)(d, { label: e.label, value: e.value }, e.label)),
      });
    }
    function p({ expanded: e, onToggle: l, color: i }) {
      return (0, r.jsx)('button', {
        onClick: l,
        style: {
          background: 'none',
          border: `1px solid ${i}44`,
          borderRadius: 6,
          color: i,
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          padding: '3px 10px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'border-color 0.2s',
        },
        children: e ? 'Ver menos' : 'Ver mais',
      });
    }
    e.s([
      'default',
      0,
      function () {
        let e = (0, i.useRouter)(),
          n = (0, i.useParams)(),
          m = n?.locale ?? 'pt-BR',
          [x, g] = (0, l.useState)(null),
          [u, h] = (0, l.useState)(!1),
          [b, f] = (0, l.useState)(!0),
          [j, y] = (0, l.useState)(!1),
          [v, F] = (0, l.useState)(!1),
          [S, B] = (0, l.useState)(!1),
          [T, z] = (0, l.useState)(!1);
        if (
          ((0, l.useEffect)(() => {
            !(async function () {
              try {
                let r = await fetch('/api/akasha/manifesto/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                });
                if (401 === r.status || 403 === r.status || 404 === r.status)
                  return void e.replace(`/${m}/onboarding`);
                let l = await r.json();
                (g(l.content), h(l.incomplete ?? !1));
              } catch {
                e.replace(`/${m}/onboarding`);
              } finally {
                f(!1);
              }
            })();
          }, [e, m]),
          b)
        )
          return (0, r.jsx)('main', {
            style: {
              background: '#06070F',
              minHeight: 'calc(100vh - 56px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: (0, r.jsx)('div', {
              style: {
                textAlign: 'center',
                color: 'rgba(244,245,255,0.38)',
                fontFamily: 'var(--font-lora, "Lora", serif)',
                fontSize: '0.9rem',
                letterSpacing: '0.06em',
              },
              children: 'Tecendo seu mapa akáshico…',
            }),
          });
        if (!x) return null;
        let {
          userName: C,
          generatedAt: k,
          synthesis: P,
          odus: w,
          kabala: A,
          tantra: I,
          astrology: R,
        } = x;
        return (0, r.jsxs)('main', {
          style: { background: '#06070F', minHeight: 'calc(100vh - 56px)', paddingBottom: 100 },
          className: 'flex flex-col items-center py-10 px-4',
          children: [
            (0, r.jsxs)('div', {
              style: { textAlign: 'center', marginBottom: 36, maxWidth: 700, width: '100%' },
              children: [
                (0, r.jsx)('h1', {
                  style: {
                    fontFamily: 'var(--font-cinzel, "Cinzel", serif)',
                    color: '#F0B429',
                    fontSize: 'clamp(1.05rem, 3vw, 1.45rem)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  },
                  children: 'Manifesto Akáshico',
                }),
                (0, r.jsx)('p', {
                  style: {
                    color: 'rgba(244,245,255,0.62)',
                    fontSize: '0.88rem',
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-lora, "Lora", serif)',
                  },
                  children: C,
                }),
                (0, r.jsxs)('p', {
                  style: {
                    color: 'rgba(244,245,255,0.28)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    marginTop: 4,
                  },
                  children: ['Gerado em ', k],
                }),
              ],
            }),
            u &&
              (0, r.jsxs)('div', {
                style: {
                  maxWidth: 700,
                  width: '100%',
                  marginBottom: 20,
                  background: 'rgba(240,180,41,0.08)',
                  border: '1px solid rgba(240,180,41,0.4)',
                  borderRadius: 10,
                  padding: '12px 18px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                },
                children: [
                  (0, r.jsx)('span', {
                    style: { color: '#F0B429', fontSize: '0.9rem' },
                    children: '⚠',
                  }),
                  (0, r.jsx)('p', {
                    style: { color: '#F0B429', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 },
                    children:
                      'Seu mapa está incompleto — alguns dados podem ser genéricos. Complete seu onboarding para uma leitura precisa.',
                  }),
                ],
              }),
            (0, r.jsxs)('div', {
              style: { maxWidth: 700, width: '100%' },
              children: [
                (0, r.jsxs)('div', {
                  style: a,
                  children: [
                    (0, r.jsx)('div', {
                      style: o('#FB5781'),
                      children: (0, r.jsx)('span', { children: 'Síntese dos 4 Pilares' }),
                    }),
                    (0, r.jsx)('p', {
                      style: {
                        ...s,
                        marginTop: 0,
                        color: 'rgba(244,245,255,0.82)',
                        fontFamily: 'var(--font-lora, "Lora", serif)',
                        fontSize: '0.9rem',
                        lineHeight: 1.75,
                      },
                      children: P,
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  style: a,
                  children: [
                    (0, r.jsxs)('div', {
                      style: o('#F0B429'),
                      children: [
                        (0, r.jsx)('span', { children: 'I. Bússola Ancestral — Odus' }),
                        (0, r.jsx)(p, { expanded: j, onToggle: () => y(!j), color: '#F0B429' }),
                      ],
                    }),
                    (0, r.jsx)(c, {
                      pairs: [
                        { label: 'Odu', value: w.oduName || '—' },
                        ...(null !== w.oduNumber
                          ? [{ label: 'Número', value: String(w.oduNumber) }]
                          : []),
                        ...(w.elementalForce
                          ? [{ label: 'Força Elemental', value: w.elementalForce }]
                          : []),
                      ],
                    }),
                    w.orixas.length > 0 &&
                      (0, r.jsx)(d, { label: 'Orixás', value: w.orixas.join(' · ') }),
                    (0, r.jsx)('p', { style: s, children: w.description }),
                    j &&
                      w.preceitos &&
                      w.preceitos.length > 0 &&
                      (0, r.jsxs)('div', {
                        style: { marginTop: 16 },
                        children: [
                          (0, r.jsx)('div', { style: t, children: 'Preceitos' }),
                          (0, r.jsx)('ul', {
                            style: { margin: '8px 0 0', paddingLeft: 18 },
                            children: w.preceitos.map((e, l) =>
                              (0, r.jsx)(
                                'li',
                                {
                                  style: {
                                    color: 'rgba(244,245,255,0.6)',
                                    fontSize: '0.83rem',
                                    lineHeight: 1.6,
                                    marginBottom: 4,
                                  },
                                  children: e,
                                },
                                l
                              )
                            ),
                          }),
                        ],
                      }),
                    w.provisional &&
                      (0, r.jsx)('div', {
                        style: {
                          display: 'inline-block',
                          marginTop: 14,
                          background: 'rgba(240,180,41,0.1)',
                          border: '1px solid rgba(240,180,41,0.3)',
                          borderRadius: 6,
                          padding: '3px 10px',
                          fontSize: '0.68rem',
                          letterSpacing: '0.1em',
                          color: '#F0B429',
                          textTransform: 'uppercase',
                        },
                        children: 'Provisório',
                      }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  style: a,
                  children: [
                    (0, r.jsxs)('div', {
                      style: o('#7C5CFF'),
                      children: [
                        (0, r.jsx)('span', { children: 'II. O Verbo — Numerologia Cabalística' }),
                        (0, r.jsx)(p, { expanded: v, onToggle: () => F(!v), color: '#7C5CFF' }),
                      ],
                    }),
                    (0, r.jsx)(c, {
                      pairs: [
                        {
                          label: 'Caminho de Vida',
                          value:
                            null !== A.lifePath
                              ? `${A.lifePath}${A.lifePathMaster ? ' ✦' : ''}`
                              : null,
                        },
                        { label: 'Expressão', value: A.expression },
                        { label: 'Motivação', value: A.motivation },
                        ...(null !== A.personalYear
                          ? [{ label: 'Ano Pessoal', value: String(A.personalYear) }]
                          : []),
                      ],
                    }),
                    (0, r.jsx)('p', { style: s, children: A.description }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  style: a,
                  children: [
                    (0, r.jsxs)('div', {
                      style: o('#2DD4BF'),
                      children: [
                        (0, r.jsx)('span', { children: 'III. A Anatomia — Tantra' }),
                        (0, r.jsx)(p, { expanded: S, onToggle: () => B(!S), color: '#2DD4BF' }),
                      ],
                    }),
                    (0, r.jsx)(c, {
                      pairs: [
                        { label: 'Alma', value: I.soul },
                        { label: 'Karma', value: I.karma },
                        { label: 'Dádiva Divina', value: I.divineGift },
                        { label: 'Caminho Tântrico', value: I.tantricPath },
                      ],
                    }),
                    (0, r.jsx)('p', { style: s, children: I.description }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  style: a,
                  children: [
                    (0, r.jsxs)('div', {
                      style: o('#7C5CFF'),
                      children: [
                        (0, r.jsx)('span', { children: 'IV. O Céu — Astrologia' }),
                        (0, r.jsx)(p, { expanded: T, onToggle: () => z(!T), color: '#7C5CFF' }),
                      ],
                    }),
                    (0, r.jsx)(c, {
                      pairs: [
                        { label: 'Ascendente', value: R.ascendant },
                        { label: 'Planeta Dominante', value: R.dominantPlanet },
                      ],
                    }),
                    R.mainPlanets.length > 0 &&
                      (0, r.jsxs)('div', {
                        style: { marginTop: 14 },
                        children: [
                          (0, r.jsx)('div', { style: t, children: 'Posições Planetárias' }),
                          (0, r.jsx)('div', {
                            style: { display: 'flex', gap: 16, flexWrap: 'wrap' },
                            children: R.mainPlanets.map((e, l) =>
                              (0, r.jsxs)(
                                'div',
                                {
                                  style: { color: 'rgba(244,245,255,0.78)', fontSize: '0.85rem' },
                                  children: [
                                    (0, r.jsx)('strong', {
                                      style: { color: '#F4F5FF' },
                                      children: e.name,
                                    }),
                                    ' em ',
                                    e.sign,
                                  ],
                                },
                                l
                              )
                            ),
                          }),
                        ],
                      }),
                    (0, r.jsx)('p', { style: s, children: R.description }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)('a', {
              href: '/api/akasha/manifesto/pdf',
              download: !0,
              style: {
                position: 'fixed',
                bottom: 28,
                right: 24,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background:
                  'linear-gradient(135deg, rgba(240,180,41,0.18) 0%, rgba(240,180,41,0.08) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(240,180,41,0.5)',
                borderRadius: 12,
                padding: '11px 22px',
                color: '#F0B429',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(240,180,41,0.15)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                zIndex: 50,
              },
              children: [
                (0, r.jsx)('span', { style: { fontSize: '1rem' }, children: '⬇' }),
                (0, r.jsx)('span', { children: 'Exportar Manifesto' }),
              ],
            }),
          ],
        });
      },
    ]);
  },
]);
