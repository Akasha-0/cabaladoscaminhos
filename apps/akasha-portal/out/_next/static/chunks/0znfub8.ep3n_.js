(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  38782,
  (e) => {
    'use strict';
    var a = e.i(30722),
      s = e.i(52330),
      i = e.i(50245),
      t = e.i(11818),
      r = e.i(9180),
      o = e.i(6927);
    let n = (0, o.default)('moon', [
        [
          'path',
          {
            d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
            key: 'kfwtm',
          },
        ],
      ]),
      l = (0, o.default)('sun', [
        ['circle', { cx: '12', cy: '12', r: '4', key: '4exip2' }],
        ['path', { d: 'M12 2v2', key: 'tus03m' }],
        ['path', { d: 'M12 20v2', key: '1lh1kg' }],
        ['path', { d: 'm4.93 4.93 1.41 1.41', key: '149t6j' }],
        ['path', { d: 'm17.66 17.66 1.41 1.41', key: 'ptbguv' }],
        ['path', { d: 'M2 12h2', key: '1t8f8n' }],
        ['path', { d: 'M20 12h2', key: '1q8mjw' }],
        ['path', { d: 'm6.34 17.66-1.41 1.41', key: '1m8zz5' }],
        ['path', { d: 'm19.07 4.93-1.41 1.41', key: '1shlcs' }],
      ]),
      d = (0, o.default)('cloud', [
        ['path', { d: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z', key: 'p7xjir' }],
      ]),
      c = (0, o.default)('check', [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]]),
      m = (0, o.default)('loader', [
        ['path', { d: 'M12 2v4', key: '3427ic' }],
        ['path', { d: 'm16.2 7.8 2.9-2.9', key: 'r700ao' }],
        ['path', { d: 'M18 12h4', key: 'wj9ykh' }],
        ['path', { d: 'm16.2 16.2 2.9 2.9', key: '1bxg5t' }],
        ['path', { d: 'M12 18v4', key: 'jadmvz' }],
        ['path', { d: 'm4.9 19.1 2.9-2.9', key: 'bwix9q' }],
        ['path', { d: 'M2 12h4', key: 'j09sii' }],
        ['path', { d: 'm4.9 4.9 2.9 2.9', key: 'giyufr' }],
      ]),
      x = (0, o.default)('refresh-cw', [
        ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', key: 'v9h5vc' }],
        ['path', { d: 'M21 3v5h-5', key: '1q7to0' }],
        ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', key: '3uifl3' }],
        ['path', { d: 'M8 16H3v5', key: '1cv678' }],
      ]);
    var u = e.i(97275);
    let p = (0, o.default)('award', [
        [
          'path',
          {
            d: 'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526',
            key: '1yiouv',
          },
        ],
        ['circle', { cx: '12', cy: '8', r: '6', key: '1vp47v' }],
      ]),
      h = (0, o.default)('user-check', [
        ['path', { d: 'm16 11 2 2 4-4', key: '9rsbq5' }],
        ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
        ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
      ]);
    var g = e.i(75442),
      f = e.i(85526),
      b = e.i(85258);
    let v = (0, o.default)('monitor', [
      ['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2', key: '48i651' }],
      ['line', { x1: '8', x2: '16', y1: '21', y2: '21', key: '1svkeh' }],
      ['line', { x1: '12', x2: '12', y1: '17', y2: '21', key: 'vw1qmm' }],
    ]);
    function j() {
      let { theme: e, setTheme: s } = (0, b.useTheme)(),
        i = [
          { value: 'light', icon: l, label: 'Claro' },
          { value: 'dark', icon: n, label: 'Escuro' },
          { value: 'system', icon: v, label: 'Sistema' },
        ];
      return (0, a.jsx)('div', {
        className: 'flex gap-1 rounded-lg bg-muted p-1',
        children: i.map(({ value: i, icon: t, label: r }) =>
          (0, a.jsx)(
            'button',
            {
              onClick: () => s(i),
              className: `p-2 rounded-md transition-colors ${e === i ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`,
              title: r,
              children: (0, a.jsx)(t, { className: 'h-4 w-4' }),
            },
            i
          )
        ),
      });
    }
    let N = {
        userId: 'user_akasha_dev_001',
        totalRituals: 42,
        currentStreak: 7,
        longestStreak: 14,
        completionRate: 87,
        lastRitualDate: '2026-06-08',
        weeklyProgress: [1, 1, 1, 1, 1, 1, 1],
        monthlyProgress: [
          1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0,
        ],
      },
      y = (function () {
        let e = [],
          a = new Date('2026-06-09'),
          s = [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 1, 0, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0],
            [1, 0, 1, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0],
          ],
          i = ['oracao-manha', 'meditacao', 'leitura-grimorio', 'ritual-completo'];
        for (let t = 59; t >= 0; t--) {
          let r = new Date(a);
          r.setDate(r.getDate() - t);
          let o = Math.floor((59 - t) / 7),
            n = (59 - t) % 7,
            l = o < 8 && s[o]?.[n] === 1;
          e.push({
            date: r.toISOString().split('T')[0],
            completed: l,
            ritualType: l ? i[Math.floor(Math.random() * i.length)] : void 0,
          });
        }
        return e;
      })(),
      w = [
        {
          id: 'ritual_001',
          date: '2026-06-08',
          ritualName: 'Ritual Matinal de Ori',
          ritualLevel: 'siddhi',
          completedAt: '2026-06-08T06:30:00Z',
          duration: 2700,
          grimoireId: 'grimorio_ifa_01',
        },
        {
          id: 'ritual_002',
          date: '2026-06-07',
          ritualName: 'Meditação I Ching',
          ritualLevel: 'gift',
          completedAt: '2026-06-07T21:00:00Z',
          duration: 1800,
        },
        {
          id: 'ritual_003',
          date: '2026-06-06',
          ritualName: 'Oração aos Orixás',
          ritualLevel: 'shadow',
          completedAt: '2026-06-06T06:15:00Z',
          duration: 1200,
        },
        {
          id: 'ritual_004',
          date: '2026-06-05',
          ritualName: 'Leitura do Grimório',
          ritualLevel: 'gift',
          completedAt: '2026-06-05T20:30:00Z',
          duration: 3600,
          grimoireId: 'grimorio_cabala_02',
        },
        {
          id: 'ritual_005',
          date: '2026-06-04',
          ritualName: 'Ritual de Transformação',
          ritualLevel: 'siddhi',
          completedAt: '2026-06-04T07:00:00Z',
          duration: 5400,
        },
        {
          id: 'ritual_006',
          date: '2026-06-03',
          ritualName: 'Prática de Separação',
          ritualLevel: 'shadow',
          completedAt: '2026-06-03T18:00:00Z',
          duration: 900,
        },
        {
          id: 'ritual_007',
          date: '2026-06-02',
          ritualName: 'Meditação Akáshica',
          ritualLevel: 'gift',
          completedAt: '2026-06-02T20:00:00Z',
          duration: 2400,
        },
        {
          id: 'ritual_008',
          date: '2026-06-01',
          ritualName: 'Ritual do Hexagrama',
          ritualLevel: 'siddhi',
          completedAt: '2026-06-01T06:45:00Z',
          duration: 3e3,
        },
        {
          id: 'ritual_009',
          date: '2026-05-31',
          ritualName: 'Oração Noturna',
          ritualLevel: 'shadow',
          completedAt: '2026-05-31T22:00:00Z',
          duration: 600,
        },
        {
          id: 'ritual_010',
          date: '2026-05-30',
          ritualName: 'Estudo da Tradição',
          ritualLevel: 'gift',
          completedAt: '2026-05-30T19:00:00Z',
          duration: 4500,
          grimoireId: 'grimorio_ifa_01',
        },
      ];
    function k({ userId: e, enabled: a = !0 }) {
      let [i, t] = (0, s.useState)(null),
        [r, o] = (0, s.useState)(!0),
        [n, l] = (0, s.useState)(null),
        [d, c] = (0, s.useState)(0),
        m = (0, s.useCallback)(() => {
          c((e) => e + 1);
        }, []);
      return (
        (0, s.useEffect)(() => {
          if (!a || !e) return void o(!1);
          let s = !1;
          return (
            (async function () {
              (o(!0), l(null));
              try {
                let a = await fetch(`/api/akasha/dashboard/stats?userId=${encodeURIComponent(e)}`);
                if (!a.ok) throw Error(`HTTP ${a.status}: ${a.statusText}`);
                let i = await a.json();
                s ||
                  (t({ stats: i.stats ?? N, streak: i.streak ?? y, history: i.history ?? w }),
                  o(!1));
              } catch (e) {
                s ||
                  (console.warn('[useDashboardData] API error, using mock data:', e),
                  t({ stats: N, streak: y, history: w }),
                  l(e instanceof Error ? e : Error('Unknown error')),
                  o(!1));
              }
            })(),
            () => {
              s = !0;
            }
          );
        }, [e, a, d]),
        { data: i, loading: r, error: n, refetch: m }
      );
    }
    let F = { opacity: 0, y: 20 },
      C = { opacity: 1, y: 0 },
      A = { opacity: 0, y: -20 },
      $ = ({ children: e, className: s }) =>
        (0, a.jsx)(i.motion.div, {
          initial: F,
          animate: C,
          exit: A,
          transition: { duration: 0.3 },
          className: s,
          children: e,
        }),
      z = { scale: [1, 1.05, 1], transition: { duration: 1, repeat: 1 / 0 } },
      D = ({ children: e, className: s }) =>
        (0, a.jsx)(i.motion.div, { animate: z, className: s, children: e });
    function S({ title: e, value: i, subtitle: t, icon: r, suffix: o }) {
      let n = (function (e, a = 2e3) {
        let [i, t] = (0, s.useState)(0);
        return (
          (0, s.useEffect)(() => {
            let s,
              i,
              r = (o) => {
                s || (s = o);
                let n = Math.min((o - s) / a, 1);
                (t(Math.floor(n * e)), n < 1 && (i = requestAnimationFrame(r)));
              };
            return ((i = requestAnimationFrame(r)), () => cancelAnimationFrame(i));
          }, [e, a]),
          i
        );
      })(i, 2e3);
      return (0, a.jsxs)('div', {
        className:
          'relative overflow-hidden rounded-xl bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:bg-slate-800/70',
        children: [
          (0, a.jsxs)('div', {
            className: 'mb-4 flex items-center justify-between',
            children: [
              (0, a.jsx)('span', {
                className: 'text-sm font-medium uppercase tracking-wider text-slate-400',
                children: e,
              }),
              r && (0, a.jsx)('span', { className: 'text-2xl', children: r }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'flex items-baseline gap-1',
            children: [
              (0, a.jsx)('span', { className: 'text-4xl font-bold text-white', children: n }),
              o && (0, a.jsx)('span', { className: 'text-xl text-slate-400', children: o }),
            ],
          }),
          t && (0, a.jsx)('p', { className: 'mt-2 text-sm text-slate-500', children: t }),
          (0, a.jsx)('div', {
            className: 'absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl',
          }),
        ],
      });
    }
    function E({ userId: e }) {
      let { data: s, loading: t } = k({ userId: e });
      if (t)
        return (0, a.jsx)('div', {
          className: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4',
          children: [void 0, void 0, void 0, void 0].map((e, s) =>
            (0, a.jsx)('div', { className: 'h-32 animate-pulse rounded-xl bg-slate-800/50' }, s)
          ),
        });
      if (!s?.stats)
        return (0, a.jsx)('div', {
          className: 'flex min-h-[200px] items-center justify-center rounded-xl bg-slate-800/30',
          children: (0, a.jsxs)('div', {
            className: 'text-center',
            children: [
              (0, a.jsx)('p', {
                className: 'text-lg font-medium text-slate-400',
                children: 'Nenhum dado disponível',
              }),
              (0, a.jsx)('p', {
                className: 'mt-1 text-sm text-slate-500',
                children: 'Complete rituais para ver suas estatísticas',
              }),
            ],
          }),
        });
      let { stats: r } = s;
      return (0, a.jsxs)(i.motion.div, {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
        className: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4',
        children: [
          (0, a.jsx)(S, {
            title: 'Total',
            value: r.totalRituals,
            subtitle: 'rituais completados',
            icon: '✨',
          }),
          (0, a.jsx)(S, {
            title: 'Sequência',
            value: r.currentStreak,
            subtitle: 'dias consecutivos',
            icon: '🔥',
          }),
          (0, a.jsx)(S, {
            title: 'Recorde',
            value: r.longestStreak,
            subtitle: 'maior sequência',
            icon: '🏆',
          }),
          (0, a.jsx)(S, {
            title: 'Taxa',
            value: r.completionRate,
            suffix: '%',
            subtitle: 'rituais cumpridos',
            icon: '📊',
          }),
        ],
      });
    }
    let q = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    function O({ date: e, completed: s, isToday: i, ritualType: t }) {
      let r = e.getDate(),
        o = q[e.getDay()],
        n = (e) => e.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        l = (0, a.jsxs)('div', {
          className: 'flex flex-col items-center gap-1',
          children: [
            (0, a.jsx)('span', { className: 'text-xs text-zinc-400', children: o }),
            (0, a.jsx)('div', {
              className: `
          relative flex items-center justify-center w-10 h-10 rounded-full
          font-medium text-sm transition-all duration-200
          ${s ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700'}
          ${i ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-900' : ''}
        `,
              title: t ? `${n(e)} - ${t}` : n(e),
              children: r,
            }),
          ],
        });
      return i
        ? (0, a.jsxs)(D, {
            className: 'relative group cursor-default',
            children: [
              l,
              (0, a.jsxs)('div', {
                className:
                  ' absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-xs text-zinc-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-zinc-700 ',
                children: [
                  n(e),
                  (0, a.jsx)('div', {
                    className:
                      'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800',
                  }),
                ],
              }),
            ],
          })
        : (0, a.jsxs)('div', {
            className: 'relative group cursor-default',
            children: [
              l,
              (0, a.jsxs)('div', {
                className:
                  ' absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-xs text-zinc-300 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-zinc-700 ',
                children: [
                  n(e),
                  (0, a.jsx)('div', {
                    className:
                      'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800',
                  }),
                ],
              }),
            ],
          });
    }
    function _() {
      return (0, a.jsx)('div', {
        className: 'flex justify-between gap-2',
        children: Array.from({ length: 7 }).map((e, s) =>
          (0, a.jsxs)(
            'div',
            {
              className: 'flex flex-col items-center gap-1',
              children: [
                (0, a.jsx)('div', { className: 'w-6 h-3 bg-zinc-800 rounded animate-pulse' }),
                (0, a.jsx)(i.motion.div, {
                  animate: z,
                  className: 'w-10 h-10 bg-zinc-800 rounded-full',
                }),
              ],
            },
            s
          )
        ),
      });
    }
    function P({ streak: e, loading: s }) {
      let i = (function () {
          let e = new Date(),
            a = e.getDay(),
            s = new Date(e);
          (s.setDate(e.getDate() + (0 === a ? -6 : 1 - a)), s.setHours(0, 0, 0, 0));
          let i = [];
          for (let e = 0; e < 7; e++) {
            let a = new Date(s);
            (a.setDate(s.getDate() + e), i.push(a));
          }
          return i;
        })(),
        t = new Date();
      t.setHours(0, 0, 0, 0);
      let r = i.findIndex((e) => e.getTime() === t.getTime()),
        o = new Map(e.map((e) => [e.date, e]));
      return (0, a.jsxs)($, {
        className: 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800',
        children: [
          (0, a.jsxs)('div', {
            className: 'flex items-center justify-between mb-4',
            children: [
              (0, a.jsx)('h3', {
                className: 'text-sm font-medium text-zinc-300',
                children: 'Esta Semana',
              }),
              -1 !== r &&
                (0, a.jsx)('span', {
                  className: 'text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full',
                  children: 'Hoje',
                }),
            ],
          }),
          s
            ? (0, a.jsx)(_, {})
            : (0, a.jsx)('div', {
                className: 'flex justify-between gap-2',
                children: i.map((e) => {
                  let s = e.toISOString().split('T')[0],
                    i = o.get(s),
                    r = e.getTime() === t.getTime();
                  return (0, a.jsx)(
                    O,
                    {
                      date: e,
                      completed: i?.completed ?? !1,
                      isToday: r,
                      ritualType: i?.ritualType,
                    },
                    s
                  );
                }),
              }),
        ],
      });
    }
    function T({ value: e, max: s, label: i, showPercent: t = !0 }) {
      let r = s > 0 ? Math.round((e / s) * 100) : 0;
      return (0, a.jsxs)('div', {
        className: 'space-y-2',
        children: [
          (i || t) &&
            (0, a.jsxs)('div', {
              className: 'flex justify-between text-sm text-akasha-text-secondary',
              children: [
                i && (0, a.jsx)('span', { children: i }),
                t && (0, a.jsxs)('span', { children: [e, ' de ', s, ' dias'] }),
              ],
            }),
          (0, a.jsx)('div', {
            className: 'w-full h-2 bg-akasha-bg-tertiary rounded-full overflow-hidden',
            children: (0, a.jsx)('div', {
              className:
                'h-full bg-gradient-to-r from-akasha-primary to-akasha-primary/70 rounded-full transition-all duration-500 ease-out',
              style: { width: `${r}%` },
            }),
          }),
        ],
      });
    }
    function M() {
      return (0, a.jsxs)('div', {
        className: 'space-y-6 animate-pulse',
        children: [
          (0, a.jsxs)('div', {
            className: 'space-y-2',
            children: [
              (0, a.jsx)('div', { className: 'h-5 w-40 bg-akasha-bg-tertiary rounded' }),
              (0, a.jsx)('div', { className: 'h-8 w-full bg-akasha-bg-tertiary rounded-full' }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'space-y-2',
            children: [
              (0, a.jsx)('div', { className: 'h-5 w-40 bg-akasha-bg-tertiary rounded' }),
              (0, a.jsx)('div', { className: 'h-8 w-full bg-akasha-bg-tertiary rounded-full' }),
            ],
          }),
        ],
      });
    }
    function I({ userId: e }) {
      let { data: s, loading: i } = k({ userId: e });
      if (i) return (0, a.jsx)(M, {});
      if (!s) return null;
      let t = s.stats.weeklyProgress.reduce((e, a) => e + a, 0),
        r = s.stats.monthlyProgress.reduce((e, a) => e + a, 0);
      return (0, a.jsxs)('div', {
        className: 'space-y-6 animate-fadeInUp',
        children: [
          (0, a.jsxs)('div', {
            className: 'space-y-3',
            children: [
              (0, a.jsx)('h3', {
                className: 'text-lg font-medium text-akasha-text-primary',
                children: 'Progresso Semanal',
              }),
              (0, a.jsx)(T, { value: t, max: 7 }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'space-y-3',
            children: [
              (0, a.jsx)('h3', {
                className: 'text-lg font-medium text-akasha-text-primary',
                children: 'Progresso Mensal',
              }),
              (0, a.jsx)(T, { value: r, max: 30 }),
            ],
          }),
        ],
      });
    }
    let B = {
      shadow: {
        icon: '🌑',
        bg: 'bg-purple-100 dark:bg-purple-900/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-700/50',
        label: 'Sombra',
      },
      gift: {
        icon: '✨',
        bg: 'bg-amber-100 dark:bg-amber-900/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-700/50',
        label: 'Dom',
      },
      siddhi: {
        icon: '⚡',
        bg: 'bg-emerald-100 dark:bg-emerald-900/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-700/50',
        label: 'Siddhi',
      },
    };
    function R({ item: e }) {
      let s,
        t,
        r,
        o,
        n = B[e.ritualLevel];
      return (0, a.jsx)(i.motion.div, {
        whileHover: { scale: 1.02, x: 4 },
        transition: { duration: 0.2 },
        className: 'group',
        children: (0, a.jsx)('a', {
          href: '#',
          onClick: (e) => e.preventDefault(),
          className: `
          block p-4 rounded-lg border transition-all duration-200
          bg-white/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-800/50
          ${n.border} hover:${n.border.replace('/50', '')}
        `,
          children: (0, a.jsxs)('div', {
            className: 'flex items-start justify-between gap-3',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-start gap-3 flex-1 min-w-0',
                children: [
                  (0, a.jsx)('span', {
                    className: 'text-2xl flex-shrink-0 mt-0.5',
                    role: 'img',
                    'aria-label': n.label,
                    children: n.icon,
                  }),
                  (0, a.jsxs)('div', {
                    className: 'min-w-0 flex-1',
                    children: [
                      (0, a.jsx)('h3', {
                        className: 'font-medium text-slate-900 dark:text-zinc-100 truncate',
                        children: e.ritualName,
                      }),
                      (0, a.jsx)('span', {
                        className: `
                inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium
                ${n.bg} ${n.text}
              `,
                        children: n.label,
                      }),
                    ],
                  }),
                ],
              }),
              (0, a.jsx)('span', {
                className: 'text-sm text-slate-500 dark:text-zinc-500 flex-shrink-0',
                children:
                  ((s = new Date(e.date)),
                  (t = new Date()).setHours(0, 0, 0, 0),
                  (r = new Date(s)).setHours(0, 0, 0, 0),
                  0 === (o = Math.floor((t.getTime() - r.getTime()) / 864e5))
                    ? 'Hoje'
                    : 1 === o
                      ? 'Ontem'
                      : o < 7
                        ? `${o} dias atr\xe1s`
                        : o < 14
                          ? '1 semana atrás'
                          : o < 30
                            ? `${Math.floor(o / 7)} semanas atr\xe1s`
                            : s.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })),
              }),
            ],
          }),
        }),
      });
    }
    let H = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      },
      L = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      };
    function V() {
      return (0, a.jsx)('div', {
        className:
          'p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 animate-pulse',
        children: (0, a.jsxs)('div', {
          className: 'flex items-start gap-3',
          children: [
            (0, a.jsx)('div', { className: 'w-8 h-8 rounded bg-slate-200 dark:bg-zinc-800' }),
            (0, a.jsxs)('div', {
              className: 'flex-1',
              children: [
                (0, a.jsx)('div', {
                  className: 'h-5 w-3/4 rounded bg-slate-200 dark:bg-zinc-800 mb-2',
                }),
                (0, a.jsx)('div', { className: 'h-4 w-16 rounded bg-slate-200 dark:bg-zinc-800' }),
              ],
            }),
            (0, a.jsx)('div', { className: 'h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800' }),
          ],
        }),
      });
    }
    function Q({ userId: e, maxVisible: s = 10 }) {
      let { data: t, loading: r } = k({ userId: e });
      if (r)
        return (0, a.jsxs)('section', {
          className:
            'bg-white/80 dark:bg-zinc-950/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-800',
          children: [
            (0, a.jsx)('h2', {
              className: 'text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4',
              children: 'Histórico de Rituais',
            }),
            (0, a.jsx)('div', {
              className: 'space-y-3',
              children: Array.from({ length: 3 }).map((e, s) => (0, a.jsx)(V, {}, s)),
            }),
          ],
        });
      let o = t?.history ?? [],
        n = o.slice(0, s),
        l = o.length > s;
      return (0, a.jsxs)('section', {
        className:
          'bg-white/80 dark:bg-zinc-950/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-800',
        children: [
          (0, a.jsx)('h2', {
            className: 'text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4',
            children: 'Histórico de Rituais',
          }),
          0 === n.length
            ? (0, a.jsxs)('div', {
                className: 'text-center py-12',
                children: [
                  (0, a.jsx)('p', {
                    className: 'text-slate-600 dark:text-zinc-400 mb-2',
                    children: 'Nenhum ritual ainda.',
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-slate-500 dark:text-zinc-500 text-sm',
                    children: 'Comece seu primeiro ritual!',
                  }),
                ],
              })
            : (0, a.jsxs)(a.Fragment, {
                children: [
                  (0, a.jsx)(i.motion.div, {
                    variants: H,
                    initial: 'hidden',
                    animate: 'visible',
                    className: 'space-y-3',
                    children: n.map((e) =>
                      (0, a.jsx)(
                        i.motion.div,
                        { variants: L, children: (0, a.jsx)(R, { item: e }) },
                        e.id
                      )
                    ),
                  }),
                  l &&
                    (0, a.jsx)('div', {
                      className:
                        'mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center',
                      children: (0, a.jsxs)('a', {
                        href: '#',
                        onClick: (e) => e.preventDefault(),
                        className:
                          'text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1',
                        children: [
                          'Ver mais',
                          (0, a.jsx)('span', { 'aria-hidden': !0, children: '→' }),
                        ],
                      }),
                    }),
                ],
              }),
        ],
      });
    }
    var K = e.i(53723),
      U = e.i(21694),
      Z = e.i(61560),
      J = e.i(63825),
      G = e.i(55107);
    let W = (0, o.default)('chevron-up', [['path', { d: 'm18 15-6-6-6 6', key: '153udz' }]]);
    var X = e.i(38430),
      Y = e.i(53443),
      ee = e.i(86726),
      ea = e.i(28113);
    let es = (0, o.default)('lightbulb', [
        [
          'path',
          {
            d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
            key: '1gvzjb',
          },
        ],
        ['path', { d: 'M9 18h6', key: 'x1upvd' }],
        ['path', { d: 'M10 22h4', key: 'ceow96' }],
      ]),
      ei = (0, o.default)('git-branch', [
        ['path', { d: 'M15 6a9 9 0 0 0-9 9V3', key: '1cii5b' }],
        ['circle', { cx: '18', cy: '6', r: '3', key: '1h7g24' }],
        ['circle', { cx: '6', cy: '18', r: '3', key: 'fqmcym' }],
      ]);
    var et = e.i(98306);
    let er = {
        vitalidadeEnergia: {
          icon: K.Zap,
          color: '#FF9500',
          bgColor: 'rgba(255,149,0,0.12)',
          label: 'Corpo',
          description: 'Saúde, sexualidade e energia vital',
        },
        conexoesAmor: {
          icon: U.Heart,
          color: '#FF3B30',
          bgColor: 'rgba(255,59,48,0.12)',
          label: 'Relações',
          description: 'Amor, família e vínculos afetivos',
        },
        carreiraProsperidade: {
          icon: u.TrendingUp,
          color: '#34C759',
          bgColor: 'rgba(52,199,89,0.12)',
          label: 'Recursos',
          description: 'Finanças, carreira e abundância',
        },
        oriCabecaQuizilas: {
          icon: Z.Brain,
          color: '#5856D6',
          bgColor: 'rgba(88,86,214,0.12)',
          label: 'Mente',
          description: 'Intuição, direção e propósito',
        },
        missaoDestino: {
          icon: r.Sparkles,
          color: '#AF52DE',
          bgColor: 'rgba(175,82,222,0.12)',
          label: 'Espiritual',
          description: 'Missão, destino e transcendência',
        },
        desafiosSombras: {
          icon: J.AlertTriangle,
          color: '#FF2D55',
          bgColor: 'rgba(255,45,85,0.12)',
          label: 'Transformação',
          description: 'Karma, padrões inconscientes e superação',
        },
      },
      eo = {
        shadow: {
          label: 'Sombra',
          color: '#FF2D55',
          description: 'Padrão inconsciente de sofrimento',
          icon: Y.XCircle,
        },
        gift: {
          label: 'Dom',
          color: '#34C759',
          description: 'Genialidade e amor inato',
          icon: X.CheckCircle2,
        },
        siddhi: {
          label: 'Realização',
          color: '#AF52DE',
          description: 'Transcendência do padrão',
          icon: ee.Star,
        },
      };
    function en({ frequency: e }) {
      let s = eo[e],
        i = s.icon;
      return (0, a.jsxs)('span', {
        className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        style: { backgroundColor: `${s.color}22`, color: s.color },
        children: [(0, a.jsx)(i, { size: 10 }), s.label],
      });
    }
    function el({ intensity: e }) {
      return (0, a.jsx)('div', {
        className: 'flex gap-0.5',
        children: [1, 2, 3].map((s) =>
          (0, a.jsx)(
            'div',
            {
              className: 'w-1.5 h-1.5 rounded-full',
              style: { backgroundColor: s <= e ? '#FF9500' : '#3A3A3C' },
            },
            s
          )
        ),
      });
    }
    function ed({ strategy: e }) {
      let s = {
          act: { color: '#34C759', bg: 'rgba(52,199,89,0.15)', label: 'Agir' },
          wait: { color: '#FF9500', bg: 'rgba(255,149,0,0.15)', label: 'Aguarde' },
          observe: { color: '#5856D6', bg: 'rgba(88,86,214,0.15)', label: 'Observe' },
        },
        i = s[e] ?? s.observe;
      return (0, a.jsx)('span', {
        className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        style: { backgroundColor: i.bg, color: i.color },
        children: i.label,
      });
    }
    function ec({ decision: e }) {
      return (0, a.jsxs)('div', {
        className:
          'rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] p-5 space-y-4',
        children: [
          (0, a.jsxs)('div', {
            className: 'flex items-center justify-between',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-center gap-2',
                children: [
                  (0, a.jsx)(es, { size: 16, className: 'text-[#FF9500]' }),
                  (0, a.jsx)('span', {
                    className: 'text-sm font-semibold text-white',
                    children: 'Decisão do Dia',
                  }),
                ],
              }),
              (0, a.jsx)(ed, { strategy: e.strategy }),
            ],
          }),
          (0, a.jsx)('p', {
            className: 'text-sm text-white/70 leading-relaxed',
            children: e.strategyExplanation,
          }),
          (0, a.jsxs)('div', {
            className: 'bg-white/5 rounded-xl p-3 space-y-2',
            children: [
              (0, a.jsx)('p', {
                className: 'text-xs text-white/50 font-medium uppercase tracking-wider',
                children: 'Autoridade',
              }),
              (0, a.jsxs)('p', {
                className: 'text-sm text-white/80 italic',
                children: ['“', e.authorityQuestion, '”'],
              }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'grid grid-cols-1 gap-2',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-start gap-2',
                children: [
                  (0, a.jsx)(ea.ArrowRight, {
                    size: 14,
                    className: 'text-[#34C759] mt-0.5 shrink-0',
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-sm text-white/80',
                    children: e.recommendation,
                  }),
                ],
              }),
              (0, a.jsxs)('div', {
                className: 'flex items-start gap-2',
                children: [
                  (0, a.jsx)(Y.XCircle, { size: 14, className: 'text-[#FF2D55] mt-0.5 shrink-0' }),
                  (0, a.jsx)('p', { className: 'text-sm text-white/80', children: e.avoid }),
                ],
              }),
            ],
          }),
        ],
      });
    }
    let em = {
      emotional: 'Autoridade Emocional',
      sacral: 'Autoridade Sacral',
      splenic: 'Autoridade Esplênica',
      mental: 'Autoridade Mental',
    };
    function ex({ profile: e }) {
      let s =
        {
          catalisador: '#FF6B35',
          receptor: '#0A84FF',
          construtor: '#30D158',
          transformador: '#BF5AF2',
          guardiao: '#64D2FF',
          curador: '#FF375F',
          canal: '#FFD60A',
          alquimista: '#AC8E68',
          arquiteto: '#8E8E93',
        }[e.type] ?? '#FF9500';
      return (0, a.jsxs)('div', {
        className:
          'rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] overflow-hidden',
        children: [
          (0, a.jsxs)('div', {
            className: 'px-5 pt-5 pb-4',
            style: { background: `linear-gradient(135deg, ${s}22 0%, transparent 60%)` },
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-start justify-between',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'flex items-center gap-3',
                    children: [
                      (0, a.jsx)('span', { className: 'text-4xl', children: e.typeIcon }),
                      (0, a.jsxs)('div', {
                        children: [
                          (0, a.jsx)('p', {
                            className:
                              'text-xs text-white/40 uppercase tracking-widest font-medium',
                            children: 'Seu Tipo Akasha',
                          }),
                          (0, a.jsx)('h2', {
                            className: 'text-xl font-bold text-white leading-tight',
                            children: e.typeName,
                          }),
                          (0, a.jsxs)('p', {
                            className: 'text-sm text-white/60 mt-0.5 italic',
                            children: ['“', e.corePattern, '”'],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsx)('span', {
                    className:
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                    style: { backgroundColor: `${s}22`, color: s },
                    children: e.dominantPillar.split('—')[0].trim(),
                  }),
                ],
              }),
              (0, a.jsx)('div', {
                className: 'mt-4 bg-black/20 rounded-xl p-4',
                children: (0, a.jsx)('p', {
                  className: 'text-base text-white font-semibold leading-snug',
                  children: e.oneLiner,
                }),
              }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'px-5 py-4 border-t border-white/8 grid grid-cols-2 gap-3',
            children: [
              (0, a.jsxs)('div', {
                children: [
                  (0, a.jsx)('p', {
                    className: 'text-xs text-white/40 uppercase tracking-wider mb-1.5',
                    children: 'Estratégia',
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-sm font-semibold text-white',
                    children: e.strategy,
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-xs text-white/50 mt-1 leading-relaxed',
                    children: e.strategyDetail,
                  }),
                ],
              }),
              (0, a.jsxs)('div', {
                children: [
                  (0, a.jsx)('p', {
                    className: 'text-xs text-white/40 uppercase tracking-wider mb-1.5',
                    children: em[e.authority] ?? 'Autoridade',
                  }),
                  (0, a.jsxs)('p', {
                    className: 'text-sm text-white/80 leading-relaxed italic',
                    children: ['“', e.authorityPractice, '”'],
                  }),
                ],
              }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'mx-5 mb-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-4 py-3',
            children: [
              (0, a.jsx)('p', {
                className: 'text-xs text-[#FF9500]/80 uppercase tracking-wider font-semibold mb-1',
                children: 'Diretiva de Hoje',
              }),
              (0, a.jsx)('p', {
                className: 'text-sm text-white font-medium leading-snug',
                children: e.dailyDirective,
              }),
            ],
          }),
          (0, a.jsxs)('div', {
            className: 'px-5 pb-5 grid grid-cols-1 gap-2',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-start gap-2',
                children: [
                  (0, a.jsx)(ea.ArrowRight, {
                    size: 14,
                    className: 'text-[#30D158] mt-0.5 shrink-0',
                  }),
                  (0, a.jsxs)('p', {
                    className: 'text-xs text-white/60',
                    children: [
                      (0, a.jsx)('span', {
                        className: 'text-[#30D158] font-medium',
                        children: 'Crescimento: ',
                      }),
                      e.growthEdge,
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)('div', {
                className: 'flex items-start gap-2',
                children: [
                  (0, a.jsx)(J.AlertTriangle, {
                    size: 14,
                    className: 'text-[#FF375F] mt-0.5 shrink-0',
                  }),
                  (0, a.jsxs)('p', {
                    className: 'text-xs text-white/60',
                    children: [
                      (0, a.jsx)('span', {
                        className: 'text-[#FF375F] font-medium',
                        children: 'Armadilha: ',
                      }),
                      e.shadowTrap,
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }
    function eu({ ritual: e }) {
      return (0, a.jsxs)('div', {
        className: 'rounded-xl p-3 flex items-start gap-3',
        style: { backgroundColor: `${e.color}18` },
        children: [
          (0, a.jsx)('div', {
            className: 'w-2 h-2 rounded-full mt-1.5 shrink-0',
            style: { backgroundColor: e.color },
          }),
          (0, a.jsxs)('div', {
            className: 'min-w-0',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-center gap-2',
                children: [
                  (0, a.jsx)('span', {
                    className: 'text-xs font-semibold',
                    style: { color: e.color },
                    children: e.title,
                  }),
                  (0, a.jsx)('span', { className: 'text-xs text-white/40', children: e.duration }),
                ],
              }),
              (0, a.jsx)('p', {
                className: 'text-xs text-white/60 mt-0.5 leading-relaxed',
                children: e.instruction,
              }),
            ],
          }),
        ],
      });
    }
    function ep({ sexualidade: e }) {
      let [i, t] = (0, s.useState)(!1);
      return (0, a.jsxs)('div', {
        className: 'border-t border-[#FF2D55]/20 pt-2 mt-2',
        children: [
          (0, a.jsxs)('button', {
            onClick: () => t((e) => !e),
            className: 'flex items-center gap-2 w-full',
            children: [
              (0, a.jsx)('span', {
                className: 'text-xs font-semibold text-[#FF2D55]/90 uppercase tracking-wider',
                children: 'Sexualidade',
              }),
              (0, a.jsx)('span', { className: 'text-xs text-white/40', children: e.name }),
              (0, a.jsx)('span', {
                className: 'text-xs text-white/30 ml-auto',
                children: i ? '▲' : '▼',
              }),
            ],
          }),
          i &&
            (0, a.jsxs)('div', {
              className: 'mt-2 space-y-2',
              children: [
                e.description &&
                  (0, a.jsx)('p', {
                    className: 'text-xs text-white/60 leading-relaxed',
                    children: e.description,
                  }),
                e.desirePattern &&
                  (0, a.jsxs)('div', {
                    className: 'bg-[#FF2D55]/08 rounded-lg p-2',
                    children: [
                      (0, a.jsx)('p', {
                        className: 'text-xs text-[#FF2D55]/80 font-medium',
                        children: 'Padrão de Desejo',
                      }),
                      (0, a.jsx)('p', {
                        className: 'text-xs text-white/50 mt-0.5',
                        children: e.desirePattern,
                      }),
                    ],
                  }),
                e.turnOn.length > 0 &&
                  (0, a.jsxs)('div', {
                    children: [
                      (0, a.jsx)('p', {
                        className: 'text-xs text-[#34C759]/80 font-medium mb-1',
                        children: 'LIGA',
                      }),
                      (0, a.jsx)('div', {
                        className: 'flex flex-wrap gap-1',
                        children: e.turnOn.map((e, s) =>
                          (0, a.jsx)(
                            'span',
                            {
                              className:
                                'text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80',
                              children: e,
                            },
                            s
                          )
                        ),
                      }),
                    ],
                  }),
                e.turnOff.length > 0 &&
                  (0, a.jsxs)('div', {
                    children: [
                      (0, a.jsx)('p', {
                        className: 'text-xs text-[#FF2D55]/80 font-medium mb-1',
                        children: 'DESLIGA',
                      }),
                      (0, a.jsx)('div', {
                        className: 'flex flex-wrap gap-1',
                        children: e.turnOff.map((e, s) =>
                          (0, a.jsx)(
                            'span',
                            {
                              className:
                                'text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80',
                              children: e,
                            },
                            s
                          )
                        ),
                      }),
                    ],
                  }),
                e.hiddenDesires.length > 0 &&
                  (0, a.jsxs)('div', {
                    children: [
                      (0, a.jsx)('p', {
                        className: 'text-xs text-[#FFD60A]/80 font-medium mb-1',
                        children: 'Desejos Ocultos',
                      }),
                      e.hiddenDesires.map((e, s) =>
                        (0, a.jsxs)(
                          'div',
                          {
                            className: 'text-xs text-white/50 mb-1',
                            children: [
                              (0, a.jsx)('span', {
                                className: 'text-white/70',
                                children: e.desire,
                              }),
                              (0, a.jsxs)('span', {
                                className: 'text-white/30',
                                children: [' → medo: ', e.fear],
                              }),
                            ],
                          },
                          s
                        )
                      ),
                    ],
                  }),
                e.transformationKey &&
                  (0, a.jsxs)('div', {
                    className: 'bg-[#AF52DE]/08 rounded-lg p-2',
                    children: [
                      (0, a.jsx)('p', {
                        className: 'text-xs text-[#AF52DE]/80 font-medium',
                        children: 'Chave de Transformação',
                      }),
                      (0, a.jsx)('p', {
                        className: 'text-xs text-white/50 mt-0.5',
                        children: e.transformationKey,
                      }),
                    ],
                  }),
              ],
            }),
        ],
      });
    }
    let eh = { siddhi: 3, gift: 2, shadow: 1 };
    function eg({ areas: e }) {
      let s = Object.entries(e)
        .filter(([, e]) => null != e)
        .sort(([, e], [, a]) => {
          let s = eh[e.frequency] ?? 1,
            i = eh[a.frequency] ?? 1;
          return s !== i ? i - s : (a.intensity ?? 0) - (e.intensity ?? 0);
        })
        .slice(0, 3);
      return 0 === s.length
        ? null
        : (0, a.jsxs)('div', {
            className: 'bg-[#1C1C1E]/80 rounded-2xl border border-white/8 p-3 space-y-2',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-center gap-1.5',
                children: [
                  (0, a.jsx)(r.Sparkles, { size: 11, className: 'text-[#FFD60A]' }),
                  (0, a.jsx)('span', {
                    className:
                      'text-[10px] font-semibold text-[#FFD60A]/80 uppercase tracking-wider',
                    children: 'Prioridades de Hoje',
                  }),
                ],
              }),
              (0, a.jsx)('div', {
                className: 'flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5',
                children: s.map(([e, s]) => {
                  let i = er[e] ?? er.desafiosSombras,
                    t = eo[s.frequency];
                  return (0, a.jsxs)(
                    'div',
                    {
                      className:
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0',
                      style: { backgroundColor: `${i.color}12`, borderColor: `${i.color}30` },
                      children: [
                        (0, a.jsx)('span', { style: { color: i.color }, children: i.label }),
                        (0, a.jsx)('div', {
                          className: 'w-1.5 h-1.5 rounded-full shrink-0',
                          style: { backgroundColor: t.color },
                          title: s.frequency,
                        }),
                        (0, a.jsx)(el, { intensity: s.intensity }),
                      ],
                    },
                    e
                  );
                }),
              }),
            ],
          });
    }
    function ef({ areaKey: e, narrative: o }) {
      let [n, l] = (0, s.useState)(o.intensity >= 2),
        d = er[e] ?? er.desafiosSombras,
        c = d.icon;
      return (0, a.jsxs)(i.motion.div, {
        layout: !0,
        className: 'rounded-2xl border border-white/8 overflow-hidden',
        style: { backgroundColor: d.bgColor },
        children: [
          (0, a.jsxs)('button', {
            onClick: () => l((e) => !e),
            className: 'w-full flex items-center gap-3 p-4 text-left',
            children: [
              (0, a.jsx)('div', {
                className: 'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                style: { backgroundColor: `${d.color}30` },
                children: (0, a.jsx)(c, { size: 18, style: { color: d.color } }),
              }),
              (0, a.jsxs)('div', {
                className: 'flex-1 min-w-0',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      (0, a.jsx)('span', {
                        className: 'text-sm font-semibold text-white',
                        children: d.label,
                      }),
                      (0, a.jsx)(en, { frequency: o.frequency }),
                      (0, a.jsx)(el, { intensity: o.intensity }),
                    ],
                  }),
                  (0, a.jsx)('p', {
                    className: 'text-xs text-white/50 mt-0.5 truncate',
                    children: d.description,
                  }),
                ],
              }),
              (0, a.jsx)('div', {
                className: 'shrink-0 text-white/30',
                children: n ? (0, a.jsx)(W, { size: 16 }) : (0, a.jsx)(G.ChevronDown, { size: 16 }),
              }),
            ],
          }),
          (0, a.jsx)(t.AnimatePresence, {
            children:
              n &&
              (0, a.jsx)(i.motion.div, {
                initial: { height: 0, opacity: 0 },
                animate: { height: 'auto', opacity: 1 },
                exit: { height: 0, opacity: 0 },
                transition: { duration: 0.25, ease: 'easeInOut' },
                className: 'overflow-hidden',
                children: (0, a.jsxs)('div', {
                  className: 'px-4 pb-4 space-y-4',
                  children: [
                    (0, a.jsxs)('div', {
                      className: 'space-y-1.5',
                      children: [
                        (0, a.jsxs)('div', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            (0, a.jsx)(Y.XCircle, { size: 12, className: 'text-[#FF2D55]' }),
                            (0, a.jsx)('span', {
                              className:
                                'text-xs font-semibold text-[#FF2D55]/80 uppercase tracking-wider',
                              children: 'Padrão de Sombra',
                            }),
                          ],
                        }),
                        (0, a.jsx)('p', {
                          className: 'text-sm text-white/75 leading-relaxed',
                          children: o.shadowPattern,
                        }),
                        o.shadowSymptoms.length > 0 &&
                          (0, a.jsx)('div', {
                            className: 'flex flex-wrap gap-1 mt-1',
                            children: o.shadowSymptoms.map((e, s) =>
                              (0, a.jsx)(
                                'span',
                                {
                                  className:
                                    'text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80',
                                  children: e,
                                },
                                s
                              )
                            ),
                          }),
                      ],
                    }),
                    (0, a.jsxs)('div', {
                      className: 'space-y-1.5',
                      children: [
                        (0, a.jsxs)('div', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            (0, a.jsx)(X.CheckCircle2, { size: 12, className: 'text-[#34C759]' }),
                            (0, a.jsx)('span', {
                              className:
                                'text-xs font-semibold text-[#34C759]/80 uppercase tracking-wider',
                              children: 'Seu Dom',
                            }),
                          ],
                        }),
                        (0, a.jsx)('p', {
                          className: 'text-sm text-white/75 leading-relaxed',
                          children: o.giftPattern,
                        }),
                        o.giftStrengths.length > 0 &&
                          (0, a.jsx)('div', {
                            className: 'flex flex-wrap gap-1 mt-1',
                            children: o.giftStrengths.map((e, s) =>
                              (0, a.jsx)(
                                'span',
                                {
                                  className:
                                    'text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80',
                                  children: e,
                                },
                                s
                              )
                            ),
                          }),
                      ],
                    }),
                    o.chainOfReasoning &&
                      o.chainOfReasoning.length > 0 &&
                      (0, a.jsxs)('div', {
                        className: 'space-y-1.5',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'flex items-center gap-1.5',
                            children: [
                              (0, a.jsx)(ei, { size: 12, className: 'text-[#64D2FF]' }),
                              (0, a.jsx)('span', {
                                className:
                                  'text-xs font-semibold text-[#64D2FF]/90 uppercase tracking-wider',
                                children: 'Como chegamos aqui',
                              }),
                            ],
                          }),
                          (0, a.jsx)('div', {
                            className: 'space-y-1',
                            children: o.chainOfReasoning.map((e, s) => {
                              let [i, t] = e.split('→');
                              return (0, a.jsxs)(
                                'div',
                                {
                                  className: 'flex items-start gap-2',
                                  children: [
                                    (0, a.jsxs)('span', {
                                      className: 'text-xs text-[#64D2FF]/60 shrink-0 mt-px',
                                      children: [s + 1, '.'],
                                    }),
                                    (0, a.jsxs)('div', {
                                      className: 'flex-1 min-w-0',
                                      children: [
                                        i &&
                                          (0, a.jsx)('span', {
                                            className: 'text-xs text-white/60',
                                            children: i.trim(),
                                          }),
                                        t &&
                                          (0, a.jsxs)('div', {
                                            className: 'flex items-start gap-1 mt-0.5',
                                            children: [
                                              (0, a.jsx)(ea.ArrowRight, {
                                                size: 10,
                                                className: 'text-[#64D2FF] mt-0.5 shrink-0',
                                              }),
                                              (0, a.jsx)('span', {
                                                className:
                                                  'text-xs text-[#64D2FF]/90 font-medium leading-relaxed',
                                                children: t.trim(),
                                              }),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                },
                                s
                              );
                            }),
                          }),
                        ],
                      }),
                    o.expandedNarrative &&
                      (0, a.jsxs)('div', {
                        className:
                          'bg-gradient-to-br from-[#AF52DE]/10 to-[#64D2FF]/10 border border-[#AF52DE]/20 rounded-xl p-3 space-y-2',
                        children: [
                          (0, a.jsxs)('div', {
                            className: 'flex items-center gap-1.5',
                            children: [
                              (0, a.jsx)(ee.Star, { size: 12, className: 'text-[#AF52DE]' }),
                              (0, a.jsx)('span', {
                                className:
                                  'text-xs font-semibold text-[#AF52DE]/90 uppercase tracking-wider',
                                children: 'Núcleo Akasha',
                              }),
                              (0, a.jsx)('span', {
                                className: 'text-xs text-white/30 ml-auto',
                                children: o.expandedNarrative.sourceLabel,
                              }),
                            ],
                          }),
                          (0, a.jsx)('p', {
                            className: 'text-xs text-white/80 leading-relaxed italic',
                            children: o.expandedNarrative.integratedNarrative,
                          }),
                          o.expandedNarrative.practicalExample &&
                            (0, a.jsxs)('div', {
                              className: 'flex items-start gap-1.5 mt-1',
                              children: [
                                (0, a.jsx)(es, {
                                  size: 10,
                                  className: 'text-[#FFD60A] mt-0.5 shrink-0',
                                }),
                                (0, a.jsx)('p', {
                                  className: 'text-xs text-[#FFD60A]/80 leading-relaxed',
                                  children: o.expandedNarrative.practicalExample,
                                }),
                              ],
                            }),
                          'vitalidadeEnergia' === e &&
                            o.sexualidade &&
                            (0, a.jsx)(ep, { sexualidade: o.sexualidade }),
                        ],
                      }),
                    o.dailyTransit &&
                      (0, a.jsxs)('div', {
                        className: 'rounded-xl p-3 flex items-start gap-2.5',
                        style: {
                          background: 'linear-gradient(135deg, #64D2FF08 0%, #AF52DE08 100%)',
                          border: '1px solid #64D2FF25',
                        },
                        children: [
                          (0, a.jsx)(r.Sparkles, {
                            size: 12,
                            className: 'text-[#64D2FF] mt-0.5 shrink-0',
                          }),
                          (0, a.jsxs)('div', {
                            className: 'min-w-0',
                            children: [
                              (0, a.jsx)('p', {
                                className:
                                  'text-[10px] font-semibold text-[#64D2FF]/70 uppercase tracking-wider mb-0.5',
                                children: 'Trânsito de Hoje',
                              }),
                              (0, a.jsx)('p', {
                                className: 'text-xs text-white/75 leading-relaxed',
                                children: o.dailyTransit.todayPhrase,
                              }),
                            ],
                          }),
                        ],
                      }),
                    (0, a.jsxs)('div', {
                      className:
                        'bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl p-3 space-y-1.5',
                      children: [
                        (0, a.jsxs)('div', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            (0, a.jsx)(ea.ArrowRight, { size: 12, className: 'text-[#FF9500]' }),
                            (0, a.jsx)('span', {
                              className:
                                'text-xs font-semibold text-[#FF9500] uppercase tracking-wider',
                              children: 'Prática de Hoje',
                            }),
                          ],
                        }),
                        (0, a.jsx)('p', {
                          className: 'text-sm text-white/80 leading-relaxed',
                          children: o.practicalAdvice,
                        }),
                      ],
                    }),
                    (0, a.jsx)(eu, { ritual: o.dailyRitual }),
                    (0, a.jsxs)('div', {
                      className: 'bg-[#5856D6]/10 border border-[#5856D6]/20 rounded-xl p-3',
                      children: [
                        (0, a.jsxs)('div', {
                          className: 'flex items-center gap-1.5 mb-1.5',
                          children: [
                            (0, a.jsx)(r.Sparkles, { size: 12, className: 'text-[#5856D6]' }),
                            (0, a.jsx)('span', {
                              className:
                                'text-xs font-semibold text-[#5856D6]/80 uppercase tracking-wider',
                              children: 'Pergunta de Transformação',
                            }),
                          ],
                        }),
                        (0, a.jsxs)('p', {
                          className: 'text-sm text-white/70 italic leading-relaxed',
                          children: ['“', o.transformationPrompt, '”'],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
          }),
        ],
      });
    }
    function eb({ synthesis: e, loading: s = !1, onRefetch: i }) {
      let t = [
        'vitalidadeEnergia',
        'conexoesAmor',
        'carreiraProsperidade',
        'oriCabecaQuizilas',
        'missaoDestino',
        'desafiosSombras',
      ];
      if (s)
        return (0, a.jsx)('div', {
          className: 'space-y-4',
          children: t.map((e) =>
            (0, a.jsx)(
              'div',
              {
                className: 'rounded-2xl border border-white/8 bg-[#1C1C1E] p-4 animate-pulse',
                children: (0, a.jsxs)('div', {
                  className: 'flex items-center gap-3',
                  children: [
                    (0, a.jsx)('div', { className: 'w-9 h-9 rounded-xl bg-white/10' }),
                    (0, a.jsxs)('div', {
                      className: 'space-y-2 flex-1',
                      children: [
                        (0, a.jsx)('div', { className: 'h-4 w-24 bg-white/10 rounded' }),
                        (0, a.jsx)('div', { className: 'h-3 w-40 bg-white/5 rounded' }),
                      ],
                    }),
                  ],
                }),
              },
              e
            )
          ),
        });
      if (!e)
        return (0, a.jsxs)('div', {
          className: 'rounded-2xl border border-white/10 bg-[#1C1C1E] p-8 text-center',
          children: [
            (0, a.jsx)(J.AlertTriangle, { size: 32, className: 'text-white/30 mx-auto mb-3' }),
            (0, a.jsx)('p', {
              className: 'text-sm text-white/50',
              children: 'Perfil de síntese não disponível.',
            }),
            (0, a.jsx)('p', {
              className: 'text-xs text-white/30 mt-1',
              children: 'Complete seu mapa astral para desbloquear.',
            }),
          ],
        });
      let { oneProfile: o } = e,
        { akashaProfile: n, areas: l, dailyDecision: d, synthesisParagraph: c } = e;
      return (0, a.jsxs)('div', {
        className: 'space-y-5',
        children: [
          o && (0, a.jsx)(ex, { profile: o }),
          (0, a.jsxs)('div', {
            className:
              'rounded-2xl border border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/8 to-transparent p-5',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-center justify-between mb-3',
                children: [
                  (0, a.jsxs)('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      (0, a.jsx)(r.Sparkles, { size: 16, className: 'text-[#FF9500]' }),
                      (0, a.jsx)('span', {
                        className: 'text-sm font-semibold text-white',
                        children: 'Perfil Akasha',
                      }),
                    ],
                  }),
                  (0, a.jsxs)('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      (0, a.jsxs)('span', {
                        className: 'text-xs text-white/40',
                        children: ['Score: ', n.overallFrequencyScore, '/100'],
                      }),
                      (0, a.jsx)(en, { frequency: n.dominantFrequency }),
                      i &&
                        (0, a.jsx)('button', {
                          onClick: i,
                          className: 'text-white/30 hover:text-white/60 transition-colors',
                          children: (0, a.jsx)(x, { size: 14 }),
                        }),
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)('p', {
                className: 'text-sm text-white/80 leading-relaxed italic',
                children: ['“', c, '”'],
              }),
              (0, a.jsxs)('div', {
                className: 'flex items-center gap-3 mt-3',
                children: [
                  (0, a.jsxs)('span', {
                    className: 'text-xs text-white/40',
                    children: [
                      'Estágio: ',
                      (0, a.jsx)('span', {
                        className: 'text-white/60 capitalize',
                        children: n.transformationStage,
                      }),
                    ],
                  }),
                  (0, a.jsxs)('span', {
                    className: 'text-xs text-white/40',
                    children: [
                      'Sequência ativa: ',
                      (0, a.jsx)('span', {
                        className: 'text-white/60 capitalize',
                        children: n.activeSequence,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.lifePath > 0 &&
            (0, a.jsx)(et.AkashaSignificadoCard, {
              lifePath: e.lifePath,
              defaultNivel: n.dominantFrequency,
            }),
          d && (0, a.jsx)(ec, { decision: d }),
          (0, a.jsxs)('div', {
            className: 'space-y-3',
            children: [
              (0, a.jsxs)('div', {
                className: 'flex items-center gap-2',
                children: [
                  (0, a.jsx)('div', { className: 'h-px flex-1 bg-white/10' }),
                  (0, a.jsx)('span', {
                    className: 'text-xs text-white/30 uppercase tracking-widest',
                    children: '6 Áreas de Vida',
                  }),
                  (0, a.jsx)('div', { className: 'h-px flex-1 bg-white/10' }),
                ],
              }),
              (0, a.jsx)(eg, { areas: l }),
              (0, a.jsx)('div', {
                className: 'space-y-2',
                children: t.map((e) => {
                  let s = l[e];
                  return s ? (0, a.jsx)(ef, { areaKey: e, narrative: s }, e) : null;
                }),
              }),
            ],
          }),
        ],
      });
    }
    let ev = {
        paz: 'Paz',
        saude: 'Saúde',
        relacoes: 'Relações',
        dinheiro: 'Dinheiro',
        trabalho: 'Trabalho',
        proposito: 'Propósito',
        criatividade: 'Criatividade',
        espiritualidade: 'Espiritualidade',
        sexualidade: 'Sexualidade',
      },
      ej = {
        paz: '☮',
        saude: '♥',
        relacoes: '◉',
        dinheiro: '◆',
        trabalho: '⚒',
        proposito: '✶',
        criatividade: '✎',
        espiritualidade: '✦',
        sexualidade: '⟁',
      },
      eN = [
        {
          pilar: 'cabala',
          area: 'paz',
          frase:
            'Sua paz interior vem de alinhar vida externa com número interno. Quando você age CONTRA o seu número, a inquietação aparece. Quando você age A PARTIR dele, há silêncio — mesmo no caos.',
          fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 4',
        },
        {
          pilar: 'cabala',
          area: 'saude',
          frase:
            'O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.',
          fonte: 'Mispar Hechrachi',
        },
        {
          pilar: 'cabala',
          area: 'relacoes',
          frase:
            'Atraia quem vibra no seu número, não quem completa o que falta. Você não precisa ser "metade" — você é inteiro, com geometria própria. Quem reconhece isso fica; quem não, vai sem culpa.',
          fonte: 'Cabala Luriânica 1570 (Tikkun: atrai sua tikun, não seu complemento)',
        },
        {
          pilar: 'cabala',
          area: 'dinheiro',
          frase:
            'Dinheiro segue missão, não o contrário. Recuse hoje 1 proposta que paga bem mas te afasta do seu número. A abundância vem quando VOCÊ está alinhado — e o dinheiro reconhece.',
          fonte: 'Proverbios 3:9-10; Mispar Hechrachi (Mestre 8)',
        },
        {
          pilar: 'cabala',
          area: 'trabalho',
          frase:
            'Seu trabalho ideal NÃO é compatível com qualquer um. É compatível com o seu número. Se você está em trabalho que cabe em QUALQUER pessoa, fuja. Busque o que só VOCÊ pode fazer.',
          fonte: 'Mispar Hechrachi',
        },
        {
          pilar: 'cabala',
          area: 'proposito',
          frase:
            'O número do seu nascimento é o resumo do seu contrato de vida. Re-leia-o hoje: ele diz em 1 linha o que você veio fazer. Você não precisa descobrir — só lembrar.',
          fonte: 'Sefer Yetzirah 4:1-3',
        },
        {
          pilar: 'cabala',
          area: 'criatividade',
          frase:
            'Crie HOJE a partir do seu número, não da moda. Sua voz criativa tem geometria própria — quem copiar o estilo do vizinho vai soar falso. Ouse ser estranho no seu.',
          fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 1',
        },
        {
          pilar: 'cabala',
          area: 'espiritualidade',
          frase:
            'Prática espiritual = 1 ato por dia coerente com seu número. Não é técnica universal — é a SUA oração. Meditação, oração, ritual, silêncio: o que ressoa com seu número?',
          fonte: 'Sefer Yetzirah; Cabala prática contemporânea',
        },
        {
          pilar: 'cabala',
          area: 'sexualidade',
          frase:
            'Números Mestres (11, 22, 33) carregam energia sexual/espiritual amplificada. O 11 é o Canal — sexualidade vista como portal, fusão de corpos e visões. Você não quer só prazer: quer SIGNIFICADO. Recuse sexo que esvazia; busque o que ilumina.',
          fonte: 'Mispar Hechrachi; numerologia mestre (Pinnock 2010); Zohar Bereshit 49b',
        },
        {
          pilar: 'astrologia',
          area: 'paz',
          frase:
            'Paz interior vem de alinhar com o trânsito do dia, não de fugir dele. Quando o céu pede recolhimento e você sai festejando, a inquietação sobe. Olhe o céu HOJE e aja a partir dele.',
          fonte: 'Brennan, Hellenistic Astrology (2017); CHANI App RQ-007',
        },
        {
          pilar: 'astrologia',
          area: 'saude',
          frase:
            'Seu signo mostra onde sua energia VAI. Áries vai pra ação; Touro vai pro corpo; Gêmeos pra comunicação. Honre seu signo — corpo sadio = corpo na sua natureza, não na do coach.',
          fonte: 'Brennan 2017; trad. PT-BR Raffaelli',
        },
        {
          pilar: 'astrologia',
          area: 'relacoes',
          frase:
            'Atraia pelo Sol: você ama a partir dele, não do ascendente social. O outro precisa ver seu SOL — não sua máscara. Quem só responde à sua persona vai embora quando a persona cansa.',
          fonte: 'Brennan 2017, cap. 8 (Sol como identidade essencial)',
        },
        {
          pilar: 'astrologia',
          area: 'dinheiro',
          frase:
            'Transits de Júpiter e Saturno são os grandes moduladores financeiros. Quando Júpiter transita seu Sol, expanda. Quando Saturno retorna, contraia e estruture. O céu te avisa 6 meses antes.',
          fonte: 'Brennan 2017; Saturn Return como rito de passagem',
        },
        {
          pilar: 'astrologia',
          area: 'trabalho',
          frase:
            'O Meio do Céu (MC) é sua carreira pública; o Ascendente é como você se mostra; o Sol é quem você é. Trabalho bom alinha os 3 — não sacrifica nenhum.',
          fonte: 'Brennan 2017, cap. 6 (Ângulos: ASC/MC/IC/DSC)',
        },
        {
          pilar: 'astrologia',
          area: 'proposito',
          frase:
            'O Nodo Norte (Júpiter evoluído) é a direção da alma. A direção do Nodo Sul (que você já conhece) é onde você fica preso. A vida pede: vá do Sul pro Norte, mesmo com medo.',
          fonte: 'Brennan 2017; Jyotish R-018',
        },
        {
          pilar: 'astrologia',
          area: 'espiritualidade',
          frase:
            'A prática espiritual muda com o trânsito lunar. Lua Nova = plantar; Crescente = agir; Cheia = colher e soltar; Minguante = descansar. Não force a fase errada. O céu te guia.',
          fonte: 'Brennan 2017, cap. 14 (Fases Lunares)',
        },
        {
          pilar: 'astrologia',
          area: 'sexualidade',
          frase:
            'Sua sexualidade é descrita por 3 marcadores: Sol (quem você é na cama), Lilith (o que te excita em segredo), Casa 8 (o que transforma sua intimidade). Sol + Lilith no mesmo signo = intensidade dobrada — você não é meio termo. Casa 8 no signo X = a forma como você DESEJA, e o que te faz perder o controle.',
          fonte: 'Brennan 2017, cap. 7-8 (Casas + planetas); Cafe Astrology (Lilith)',
        },
        {
          pilar: 'tantrica',
          area: 'paz',
          frase:
            'Você tem 11 corpos, mas costuma viver em 1 ou 2. Paz vem de EXPANDIR para os outros: ouça o corpo 9 (intuição), sinta o 7 (aura), respire o 8 (prana). Quanto mais corpos ativos, mais presença.',
          fonte: 'Yogi Bhajan, Aquarian Teacher (KRI 2007); 10 corpos + Mente Divina',
        },
        {
          pilar: 'tantrica',
          area: 'saude',
          frase:
            'O corpo 5 (físico) é o templo, mas o 8 (prana) é a energia que o anima. Saúde = respirar fundo 3x hoje. O corpo sutil, quando bem alimentado, sustenta o físico.',
          fonte: 'KRI 2007; Taittiriya Upanishad (pancha kosha)',
        },
        {
          pilar: 'tantrica',
          area: 'relacoes',
          frase:
            'Você se relaciona a partir de UM corpo predominante. Astral (emoção) tende à fusão; Mental (cabeça) à distância; Físico (corpo) à presença. Reconheça o seu e avise o outro — quem ama de verdade, ajusta.',
          fonte: 'KRI 2007; trigêmeo físico/astral/mental',
        },
        {
          pilar: 'tantrica',
          area: 'dinheiro',
          frase:
            'O corpo 8 (prana) sustenta sua vitalidade E sua capacidade de gerar. Dinheiro é troca de energia vital. Cuide do seu prana: sono, respiração, alimentação. A conta vem junto.',
          fonte: 'KRI 2007; Ayurveda como base',
        },
        {
          pilar: 'tantrica',
          area: 'trabalho',
          frase:
            'Seu corpo 10 (radiante) é o que o mundo vê. Mas o 11 (mente divina) é o que ENTREGA visão. No trabalho, alinhe os 2: o brilho visível precisa estar a serviço do invisível. Senão vira performance.',
          fonte: 'KRI 2007, Aquarian Teacher',
        },
        {
          pilar: 'tantrica',
          area: 'proposito',
          frase:
            'O corpo 1 (alma) é seu núcleo. Quando você decide a partir dele, tudo se alinha. Quando decide a partir do ego (3 mentes inferiores), diverge. Volte ao 1 hoje, em silêncio, antes de agir.',
          fonte: 'KRI 2007; Taittiriya Upanishad',
        },
        {
          pilar: 'tantrica',
          area: 'criatividade',
          frase:
            'O corpo 3 (mente positiva) e o 6 (linha do arco) juntos = a vontade criativa. O 3 expande, o 6 sustenta. Crie HOJE a partir dos dois: imagine (3) e mantenha (6) até terminar.',
          fonte: 'KRI 2007',
        },
        {
          pilar: 'tantrica',
          area: 'espiritualidade',
          frase:
            'A Mente Divina (corpo 11) é o canal. Pratique hoje 5 min de silêncio TOTAL — sem música, sem mantra, sem intenção. Apenas esteja. É a partir desse silêncio que a voz fala.',
          fonte: 'KRI 2007; Sahaja Yoga como referência',
        },
        {
          pilar: 'tantrica',
          area: 'sexualidade',
          frase:
            'Sexualidade tântrica = subir a kundalini pelo corpo 6 (linha do arco) até o 10 (radiante) e o 11 (mente divina). Não se trata de técnica — trata-se de PRESENÇA. O corpo 2 (mente negativa) aprende a dizer sim E não com verdade. A não-monogamia consensual é honrosa quando acordada entre corpos que se respeitam.',
          fonte:
            'KRI 2007; tantra Kashmir Shaivism; consciente não-monogamia como ética (Relações)',
        },
        {
          pilar: 'odu',
          area: 'paz',
          frase:
            'O Odu que rege seu nascimento traz uma QUALIDADE DE PAZ específica. Para conhecer a sua, procure babalaô/yaô de sua confiança.',
          fonte: 'Verger 1973',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'saude',
          frase:
            'Seu Odu aponta caminhos ancestrais de cura (ervas, banhos, ebós). A tradição iorubá tem práticas de saúde para cada Odu. Consulte terreiro de referência antes de aplicar.',
          fonte: 'Verger 1973; Mbiti 1969',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'relacoes',
          frase:
            'O Odu ensina como você se conecta com o outro a partir da ancestralidade. Não substitui a escolha consciente — ilumina o chão onde você pisa. Para detalhes: babalaô/yaô.',
          fonte: 'Verger 1973',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'dinheiro',
          frase:
            'O Odu carrega uma relação específica com prosperidade (alguns Odus pedem expansão, outros contração). A leitura detalhada pede terreiro. Aqui só dizemos: não trate dinheiro como separado do Ori.',
          fonte: 'Verger 1973',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'trabalho',
          frase:
            'O Odu aponta ofícios que o Ori reconhece como seus. Em Ifá, ofício é caminho, não carreira. A definição do seu ofício pede babalaô/yaô + terreiro + consentimento da tradição.',
          fonte: 'Verger 1973',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'proposito',
          frase:
            'O Odu é o resumo ancestral do seu Ori — a cabeça divina. A leitura do Propósito pelo Odu é responsabilidade da tradição, não do app. Procure babalaô/yaô de referência.',
          fonte: 'Verger 1973; Mbiti 1969',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'criatividade',
          frase:
            'Seu Odu carrega arquétipos criativos ancestrais (histórias, danças, cantos, cores). Para acessar, vá ao terreiro, peça o Odu seu e ouça. O app só abre a porta — não entra na casa.',
          fonte: 'Verger 1973',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'espiritualidade',
          frase:
            'A prática espiritual do seu Odu inclui oferendas (ebós), preces e ritmos específicos. A tradição iorubá é viva e não se aprende em app. Comece: visite um terreiro, peça a bênção, escute.',
          fonte: 'Verger 1973; Mbiti 1969',
          requer_terreiro: !0,
        },
        {
          pilar: 'odu',
          area: 'sexualidade',
          frase:
            'Cada Odu traz uma energia sexual-espiritual específica. Alguns pedem contenção, outros celebração; alguns abençoam a não-monogamia, outros a monogamia sagrada. A leitura detalhada do seu Odu nesta área requer babalaô/yaô — não invente sozinho.',
          fonte: 'Verger 1973; Mbiti 1969',
          requer_terreiro: !0,
        },
        {
          pilar: 'iching',
          area: 'paz',
          frase:
            'O hexagrama de hoje diz em qual ESTADO você está. Paz não é ausência de conflito — é saber em qual fase você está. Olhe o hexagrama, leia a mensagem, ajuste a postura.',
          fonte: 'Wilhelm/Baynes 1950, I Ching: O Livro das Mutações',
        },
        {
          pilar: 'iching',
          area: 'saude',
          frase:
            'O corpo muda a cada dia; o I Ching é o espelho. Hexagrama do dia te diz se HOJE é dia de movimento (Trovão 51) ou repouso (Montanha 52). Não force a fase errada.',
          fonte: 'Wilhelm/Baynes 1950',
        },
        {
          pilar: 'iching',
          area: 'relacoes',
          frase:
            'Cada hexagrama mostra o tom da relação HOJE. Hexagrama 31 (Influência) aproxima; 44 (Encontrar) alerta; 8 (Solidão) pede individuação. Não force intimidade quando o I Ching pede espaço.',
          fonte: 'Wilhelm/Baynes 1950',
        },
        {
          pilar: 'iching',
          area: 'dinheiro',
          frase:
            'Hexagrama 11 (Paz) = abundância; 12 (Estagnamento) = espera; 42 (Aumento) = expansão. Use o hexagrama do dia para calibrar: HOJE, dinheiro pede expandir ou contrair?',
          fonte: 'Wilhelm/Baynes 1950; King Wen sequence',
        },
        {
          pilar: 'iching',
          area: 'trabalho',
          frase:
            'O hexagrama do dia é seu briefing. 51 (Trovão) pede início; 15 (Modéstia) pede contenção; 49 (Revolução) pede mudança radical. Antes de agir, leia o hexagrama — ele antecipa a fase.',
          fonte: 'Wilhelm/Baynes 1950',
        },
        {
          pilar: 'iching',
          area: 'proposito',
          frase:
            'Seu hexagrama NATAL é o tema da vida inteira. O do DIA é o microcosmos. O do MOMENTO (mutação por linha) é a hora. Jogue o I Ching hoje, antes de decidir o grande. O livro fala com quem escuta.',
          fonte: 'Wilhelm/Baynes 1950',
        },
        {
          pilar: 'iching',
          area: 'criatividade',
          frase:
            'O I Ching é criativo POR NATUREZA — cada hexagrama é uma possibilidade. Crie a partir do hexagrama de hoje: ele indica o tom. 35 (Progresso) = expor; 50 (Cachimbo) = nutrir; 58 (Alegre) = compartilhar.',
          fonte: 'Wilhelm/Baynes 1950',
        },
        {
          pilar: 'iching',
          area: 'espiritualidade',
          frase:
            'A meditação sobre 1 hexagrama HOJE = prática espiritual completa. Escolha o do dia, leia o nome + essência, sente 10 min com a imagem. O I Ching é livro vivo: muda com você.',
          fonte: 'Wilhelm/Baynes 1950; tradição confuciana + taoísta',
        },
        {
          pilar: 'iching',
          area: 'sexualidade',
          frase:
            'Hexagrama 31 (Influência/Atração) fala de magnetismo; 44 (Encontrar/Sedução) de jogo de sedução; 53 (Desenvolvimento) de amadurecimento erótico. Seu hexagrama NATAL indica o TOM da sua sexualidade — como você busca, como encontra, como se entrega. Leia-o com paciência.',
          fonte: 'Wilhelm/Baynes 1950; King Wen sequence',
        },
      ];
    function ey(e, a) {
      return eN.find((s) => s.pilar === e && s.area === a);
    }
    let ew = {};
    var ek = e.i(36446),
      eF = e.i(92188);
    function eC(e) {
      return (0, eF.significadoPorPilar)('cabala', e);
    }
    function eA(e) {
      return (0, eF.significadoPorPilar)('astrologia', e);
    }
    function e$(e) {
      return (0, eF.significadoPorPilar)('tantrica', e);
    }
    function ez(e) {
      return (0, eF.significadoPorPilar)('odu', e);
    }
    function eD(e) {
      return (0, eF.significadoPorPilar)('iching', e);
    }
    let eS = {
      saude: ['saude', 'paz'],
      trabalho: ['trabalho', 'dinheiro'],
      sexualidade: ['sexualidade'],
      amor: ['relacoes'],
      criacao: ['criatividade'],
      proposito: ['proposito'],
      familia: ['paz', 'espiritualidade'],
      espiritualidade: ['espiritualidade', 'paz'],
      superacao: ['relacoes', 'espiritualidade'],
    };
    function eE(e) {
      let a = e.astrologia,
        s = e.tantrica,
        i = e.cabala,
        t = e.odu,
        r = e.iching,
        o = s?.corpo_predominante,
        n = o ? e$(o) : void 0,
        l = a?.sol_signo;
      (l && eA(l), i?.life_path && eC(i.life_path));
      let d = t?.odu_principal ? ez(t.odu_principal) : void 0,
        c = r?.hexagrama_dia ? eD(r.hexagrama_dia) : void 0,
        m = a?.lilith_signo ? eA(a.lilith_signo) : void 0,
        x = a?.casa_8_signo ? eA(a.casa_8_signo) : void 0,
        u = [];
      if (
        (u.push('**Sexualidade — Mapa Completo**\n'),
        n &&
          (u.push(`**Teu corpo energ\xe9tico \xe9 o #${o} — ${n.titulo}**`),
          u.push(n.essencia),
          u.push(n.missao),
          n.sombra && u.push(`Sombra: ${n.sombra}`),
          n.pratica && u.push(`Pr\xe1tica corporal: ${n.pratica}`),
          u.push('')),
        a?.lilith_signo &&
          (u.push(`**Lilith em ${a.lilith_signo} — o que te excita em segredo**`),
          m
            ? (u.push(m.essencia),
              u.push(m.missao),
              m.sombra && u.push(`Sombra do desejo: ${m.sombra}`))
            : u.push(
                'Seu desejo profundo opera neste signo. O que é proibido, negado ou reprimido aqui é exatamente o que te move.'
              ),
          u.push('')),
        a?.casa_8_signo &&
          (u.push(
            `**Casa 8 em ${a.casa_8_signo} — como voc\xea deseja e o que te faz perder o controle**`
          ),
          x
            ? (u.push(x.essencia), u.push(x.missao))
            : u.push(
                'A intimidade é zona de transformação para você. O que te faz soltar o controle é também o que te abre para o mais profundo.'
              ),
          u.push('')),
        i?.life_path)
      ) {
        let e = ey('cabala', 'sexualidade');
        (u.push(`**Life Path ${i.life_path} e Sexualidade**`),
          e && u.push(e.frase),
          [11, 22, 33].includes(i.life_path) &&
            u.push(
              `N\xfamero Mestre ${i.life_path}: voc\xea opera em frequ\xeancia elevada na sexualidade — isso traz profundidade mas tamb\xe9m pode criar bloqueio por medo de n\xe3o estar \xe0 altura.`
            ),
          u.push(''));
      }
      return (
        t?.odu_principal &&
          d &&
          (u.push(`**Odu ${t.odu_principal} e Sexualidade**`),
          u.push(d.essencia),
          d.pratica && u.push(`Ritual: ${d.pratica}`),
          u.push('')),
        r?.hexagrama_dia &&
          c &&
          (u.push(`**I Ching ${r.hexagrama_dia} — energia da transforma\xe7\xe3o sexual**`),
          u.push(c.essencia),
          c.pratica && u.push(`Pr\xe1tica: ${c.pratica}`),
          u.push('')),
        u.push('**Akasha: o que isso significa na prática**'),
        n && u.push(`Corpo energ\xe9tico ${n.titulo}: ${n.essencia}`),
        a?.lilith_signo &&
          u.push(
            `Desejo secreto: Lilith em ${a.lilith_signo} — ${m?.missao ?? 'intensidade e taboo'}`
          ),
        a?.casa_8_signo &&
          u.push(
            `Intimidade: Casa 8 em ${a.casa_8_signo} — ${x?.essencia ?? 'transformação pelo controle solto'}`
          ),
        u.push(''),
        u.push(
          '**Akasha Authority:** Se há tensão no corpo emocional, ESPERE o momento certo. Se há paz no corpo e desejo genuíno, AJA com presença. Sexualidade sagrada é presença — não performance.'
        ),
        u.join('\n')
      );
    }
    let eq = {
        saude: 'Evite forçar o corpo quando sentir exaustão — seu corpo capta antes da mente.',
        trabalho: 'Evite decisões financeiras em dias de alta tensão emocional.',
        sexualidade: 'Evite agir por impulso quando o Corpo 4 (Mente Negativa) está em tensão.',
        amor: 'Evite decisões relacionais quando a Lua está em tensão com Marte.',
        criacao: 'Evite forçar criação — sua criatividade flui melhor no estado de paz.',
        proposito: 'Evite questionar seu propósito em momentos de baixa energia.',
        familia: 'Evite confrontar questões ancestrais quando você não está firme.',
        espiritualidade:
          'Evite forçar experiências espirituais — elas vêm quando você está pronto.',
        superacao: 'Evite evitar o desconforto — a transformação acontece no confronto.',
      },
      eO = {
        saude: '3 respirações profundas ao acordar, antes de qualquer decisão.',
        trabalho: 'Revise suas intenções antes de abrir o email corporativo.',
        sexualidade: 'Observe o desejo sem agir — notice where it lives in your body.',
        amor: 'Escute mais do que fale em conversas importantes hoje.',
        criacao: 'Dedique 20 minutos a algo artístico sem objetivo — só pelo prazer.',
        proposito: 'Pergunte a si mesmo: "Estou vivendo minha missão ou minha zona de conforto?"',
        familia: 'Ligue para alguém da família hoje, mesmo que brevemente.',
        espiritualidade: '5 minutos de silêncio antes de dormir — sem celular.',
        superacao: 'Nomeie o desconforto que você está evitando. Escreva num papel.',
      };
    function e_(e) {
      let a,
        s,
        i,
        t,
        r,
        o,
        n,
        l,
        d,
        c,
        m,
        x,
        u,
        p,
        h,
        g,
        f,
        b,
        v,
        j,
        N,
        y,
        w,
        k = [];
      for (let a of ek.DIMENSOES) {
        let s = Object.entries(ek.DIMENSAO_DE_AREA)
            .filter(([, e]) => e === a.id)
            .map(([e]) => e),
          i = [];
        for (let e of ['cabala', 'astrologia', 'tantrica', 'odu', 'iching']) {
          let t = a.pilaresPrimarios.includes(e),
            r = a.pilaresSecundarios.includes(e);
          if (t || r)
            for (let a of s) {
              let s = ey(e, a);
              s &&
                i.push({
                  pilar: e,
                  frase: s.frase,
                  fonte: s.fonte,
                  nivel: t ? 'primario' : 'secundario',
                });
            }
        }
        let t = new Map();
        for (let e of i) (t.get(e.pilar) && 'primario' !== e.nivel) || t.set(e.pilar, e);
        let r = Array.from(t.values()),
          o =
            'sexualidade' === a.id
              ? eE(e)
              : (function (e, a) {
                  let s = (0, eF.significadosEspecificos)(a),
                    i = eS[e] ?? [],
                    t = i.flatMap((e) => eN.filter((a) => a.area === e)),
                    r = i.flatMap((e) =>
                      ['cabala', 'astrologia', 'tantrica', 'odu', 'iching']
                        .map((a) =>
                          (function (e, a) {
                            let s = ew[e];
                            if (s && s[a]) {
                              let i = s[a];
                              return {
                                pilar: e,
                                frase: i.frase,
                                explicacao: i.explicacao,
                                convergencia: i.convergencia,
                                tensao: i.tensao,
                                evitar: i.evitar,
                                pratica: i.pratica,
                              };
                            }
                            let i = ey(e, a);
                            return i
                              ? {
                                  pilar: e,
                                  frase: i.frase,
                                  explicacao: i.frase,
                                  convergencia: '',
                                  tensao: '',
                                  evitar: '',
                                  pratica: '',
                                }
                              : null;
                          })(a, e)
                        )
                        .filter((e) => null !== e)
                    ),
                    o = (function (e, a, s) {
                      let { cabala: i, astrologia: t, tantrica: r, odu: o, iching: n } = s,
                        l = a.cabala?.life_path,
                        d = a.astrologia?.sol_signo,
                        c = a.tantrica?.corpo_predominante;
                      switch (e) {
                        case 'saude':
                          if (r && i)
                            return `Voc\xea \xe9 ${i.titulo} — ${i.essencia} No corpo, isso manifesta-se como ${r.essencia} Seu instrumento f\xedsico pede aten\xe7\xe3o: cuide do corpo como sagrado.`;
                          if (r)
                            return `${r.essencia} Seu corpo energ\xe9tico #${c} \xe9 o ponto de partida para qualquer cura.`;
                          return null;
                        case 'trabalho':
                          if (i && t)
                            return `Voc\xea \xe9 ${i.titulo} (Caminho ${l}) — ${i.essencia ?? i.missao} O ${d} adiciona: ${t.essencia} Seu trabalho ideal precisa satisfazer os dois.`;
                          if (i)
                            return `Seu caminho de vida ${l} \xe9 ${i.titulo.toLowerCase()} — ${i.missao}`;
                          return null;
                        case 'sexualidade': {
                          let e = a.astrologia?.lilith_signo,
                            s = a.astrologia?.casa_8_signo;
                          if (r && e && s)
                            return `Sexualidade: seu corpo energ\xe9tico #${c} \xe9 ${r.titulo} — ${r.essencia} Seu desejo oculto: Lilith em ${e}. Zona de transforma\xe7\xe3o: Casa 8 em ${s}. I Ching ${a.iching?.hexagrama_dia}: ${n.essencia}`;
                          if (r)
                            return `${r.titulo} \xe9 seu corpo energ\xe9tico predominante — ${r.essencia} ${r.missao}`;
                          return null;
                        }
                        case 'amor':
                          if (t && i)
                            return `Voc\xea ama a partir do ${d} — ${t.essencia} No relacionamento, isso manifesta-se como ${t.missao} Seu caminho de vida ${l} adiciona: ${i.essencia}`;
                          if (i)
                            return `${i.titulo} descreve como voc\xea se conecta — ${i.essencia} ${i.missao}`;
                          return null;
                        case 'criacao':
                          if (i && t)
                            return `Sua express\xe3o criativa nasce de ${i.titulo} com ${d} — ${i.essencia} ${t.essencia} Sua cria\xe7\xe3o \xe9 ${t.missao}`;
                          if (i)
                            return `Voc\xea \xe9 ${i.titulo} — ${i.essencia} Sua cria\xe7\xe3o reflete isso.`;
                          return null;
                        case 'proposito':
                          if (i)
                            return `Seu contrato de vida \xe9 ${l}: ${i.titulo} — ${i.essencia} ${i.missao} I Ching ${a.iching?.hexagrama_dia} aponta: ${n.missao}`;
                          return null;
                        case 'familia': {
                          let e = a.odu?.odu_principal;
                          if (e)
                            return `Ancestralidade: Odu ${e} — ${o.essencia} ${o.missao} Voc\xea carrega ${o.sombra} como gift herdado. Hexagrama natal ${a.iching?.hexagrama_natal}: ${n.essencia}`;
                          if (n)
                            return `Fam\xedlia \xe9 o fluxo descrito pelo hexagrama natal ${a.iching?.hexagrama_natal} — ${n.essencia}`;
                          return null;
                        }
                        case 'espiritualidade':
                          if (i && r)
                            return `Espiritualidade na interse\xe7\xe3o de ${i.titulo} e ${r.titulo} — ${i.essencia ?? i.missao} ${r.essencia} Odu ${a.odu?.odu_principal}: ${o.missao} I Ching ${a.iching?.hexagrama_dia}: ${n.pratica ?? n.essencia}`;
                          if (r)
                            return `${r.essencia} Sua espiritualidade passa pelo corpo. Pr\xe1tica: ${r.pratica}`;
                          return null;
                        case 'superacao':
                          if (i && t)
                            return `${i.sombra} \xe9 seu desafio central. ${t.sombra ?? ''} ${i.missao} A transforma\xe7\xe3o vem quando voc\xea para de evitar e come\xe7a a atravessar. I Ching ${a.iching?.hexagrama_dia} diz: ${n.pratica ?? n.essencia}`;
                          if (i)
                            return `${i.sombra} \xe9 sua sombra. Atravess\xe1-la \xe9 a miss\xe3o. Odu ${a.odu?.odu_secundario ?? a.odu?.odu_principal}: ${o.pratica ?? o.missao}`;
                          return null;
                        default:
                          return null;
                      }
                    })(e, a, s);
                  return o
                    ? [
                        o,
                        (function (e, a, s, i) {
                          if (0 === e.length) return '';
                          let { cabala: t, astrologia: r, tantrica: o, odu: n, iching: l } = s,
                            d = a.find((e) => 'cabala' === e.pilar),
                            c = a.find((e) => 'astrologia' === e.pilar),
                            m = a.find((e) => 'tantrica' === e.pilar),
                            x = a.find((e) => 'odu' === e.pilar),
                            u = a.find((e) => 'iching' === e.pilar),
                            p = [];
                          if (
                            (p.push('**O que cada pilar diz sobre esta dimensão:**'),
                            t &&
                              (p.push(
                                `\xb7 Cabala (Caminho ${i.cabala?.life_path}): ${d?.explicacao ?? t.essencia}`
                              ),
                              d?.convergencia && p.push(`  Converg\xeancia: ${d.convergencia}`),
                              d?.tensao && p.push(`  Tens\xe3o: ${d.tensao}`),
                              d?.evitar && p.push(`  Evitar: ${d.evitar}`),
                              d?.pratica && p.push(`  Pr\xe1tica: ${d.pratica}`)),
                            r &&
                              (p.push(
                                `\xb7 Astrologia (Sol em ${i.astrologia?.sol_signo}): ${c?.explicacao ?? r.essencia}`
                              ),
                              c?.convergencia && p.push(`  Converg\xeancia: ${c.convergencia}`),
                              c?.tensao && p.push(`  Tens\xe3o: ${c.tensao}`),
                              c?.evitar && p.push(`  Evitar: ${c.evitar}`),
                              c?.pratica && p.push(`  Pr\xe1tica: ${c.pratica}`)),
                            o &&
                              (p.push(
                                `\xb7 T\xe2ntrica (Corpo ${i.tantrica?.corpo_predominante}): ${m?.explicacao ?? o.essencia}`
                              ),
                              m?.convergencia && p.push(`  Converg\xeancia: ${m.convergencia}`),
                              m?.tensao && p.push(`  Tens\xe3o: ${m.tensao}`),
                              m?.evitar && p.push(`  Evitar: ${m.evitar}`),
                              m?.pratica && p.push(`  Pr\xe1tica: ${m.pratica}`)),
                            n &&
                              (p.push(
                                `\xb7 Odu (${i.odu?.odu_principal}): ${x?.explicacao ?? n.essencia}`
                              ),
                              x?.convergencia && p.push(`  Converg\xeancia: ${x.convergencia}`),
                              x?.tensao && p.push(`  Tens\xe3o: ${x.tensao}`),
                              x?.evitar && p.push(`  Evitar: ${x.evitar}`),
                              x?.pratica && p.push(`  Pr\xe1tica ancestral: ${x.pratica}`)),
                            l)
                          ) {
                            let e = i.iching?.hexagrama_dia;
                            (p.push(`\xb7 I Ching (${e}): ${u?.explicacao ?? l.essencia}`),
                              u?.convergencia && p.push(`  Converg\xeancia: ${u.convergencia}`),
                              u?.tensao && p.push(`  Tens\xe3o: ${u.tensao}`),
                              u?.evitar && p.push(`  Evitar: ${u.evitar}`),
                              u?.pratica && p.push(`  Pr\xe1tica: ${u.pratica}`));
                          }
                          return p.join('\n');
                        })(t, r, s, a),
                        (function (e, a, s, i) {
                          if (0 === e.length) return '';
                          let { cabala: t, astrologia: r, tantrica: o, odu: n, iching: l } = s,
                            d = [t, r, o, n, l].filter(Boolean).length,
                            c = [t?.sombra, r?.sombra, o?.sombra, n?.sombra].filter(Boolean),
                            m = a.map((e) => e.convergencia).filter(Boolean),
                            x = a.map((e) => e.tensao).filter(Boolean),
                            u = [];
                          (u.push('**Akasha Synthesis — visão unificada:**'),
                            u.push(
                              `Os seus ${d} mapas convergem: ${t?.titulo ?? 'uma assinatura única'}. ${t?.missao ?? t?.essencia ?? ''}`
                            ),
                            m.length > 0 && u.push(`Converg\xeancia: ${m.join(' ')}`),
                            c.length > 1 &&
                              u.push(
                                `Tens\xe3o detectada: ${c[0]}. Isso n\xe3o \xe9 conflito — \xe9 o campo de transforma\xe7\xe3o. Atravesse, n\xe3o evite.`
                              ),
                            x.length > 0 && u.push(`Tens\xe3o estrutural: ${x.join(' ')}`));
                          let p = i.iching?.hexagrama_dia;
                          return (
                            l?.pratica && p && u.push(`I Ching ${p} diz que hoje: ${l.pratica}`),
                            u.join(' ')
                          );
                        })(t, r, s, a),
                        (function (e) {
                          let { cabala: a, astrologia: s, tantrica: i, odu: t, iching: r } = e,
                            o = [];
                          return (
                            o.push('**O que fazer agora — ação por dimensão:**'),
                            a?.missao && o.push(`\xb7 Cabala: ${a.missao}`),
                            s?.missao && o.push(`\xb7 Astrologia: ${s.missao}`),
                            i?.pratica && o.push(`\xb7 Tantra: ${i.pratica}`),
                            t?.pratica && o.push(`\xb7 Odu: ${t.pratica}`),
                            r?.pratica && o.push(`\xb7 I Ching: ${r.pratica}`),
                            o.join('\n')
                          );
                        })(s),
                      ]
                        .filter(Boolean)
                        .join('\n\n')
                    : 'Sem dados suficientes para gerar narrativa.';
                })(a.id, e),
          n =
            'trabalho' === a.id ||
            'amor' === a.id ||
            'sexualidade' === a.id ||
            'proposito' === a.id;
        k.push({
          dimensoesId: a.id,
          titulo: a.titulo,
          icone: a.icone,
          chakraCor: a.chakraCor,
          bgCor: a.id,
          borderCor: a.id,
          descricao: a.descricao,
          synthes: o,
          contribuicoes: r,
          praktika: eO[a.id] ?? 'Observe seus sinais internos.',
          alerta: eq[a.id] ?? 'Preste atenção aos sinais do seu corpo e mente.',
          autoridadeAkasha: {
            tipo: n ? 'paz' : 'ansiedade',
            aplicavel: n,
            timing: n ? 'Aguarde até momento de paz interior.' : void 0,
          },
        });
      }
      let F = e.cabala?.life_path;
      return {
        dimensoes: k,
        caminhoDeVida: F
          ? `Caminho de Vida ${F}${[11, 22, 33].includes(F) ? ' (Mestre)' : ''}`
          : 'Dados não disponíveis',
        perfilGeral:
          ((a = e.cabala?.life_path),
          (s = e.astrologia?.sol_signo),
          (i = e.astrologia?.lua_signo),
          (t = e.tantrica?.corpo_predominante),
          (r = e.odu?.odu_principal),
          (o = e.iching?.hexagrama_natal),
          (n = a ? eC(a) : void 0),
          (l = s ? eA(s) : void 0),
          (d = t ? e$(t) : void 0),
          (c = r ? ez(r) : void 0),
          (m = o ? eD(o) : void 0),
          (x = []),
          (n &&
            (x.push(`Voc\xea \xe9 ${n.titulo} (Caminho ${a}) — ${n.essencia}`),
            n.missao && x.push(`Miss\xe3o de vida: ${n.missao}`),
            n.sombra && x.push(`Sombra: ${n.sombra}`)),
          l && x.push(`${s} \xe9 quem voc\xea \xe9 no mundo — ${l.essencia} ${l.missao}`),
          i &&
            x.push(
              `Lua em ${i}: sua necessidade emocional pede ${l?.sombra ? 'rotina e presença' : 'segurança e consistência'}.`
            ),
          d &&
            (x.push(`Corpo energ\xe9tico #${t} — ${d.titulo}: ${d.essencia}`),
            d.pratica && x.push(`Pr\xe1tica: ${d.pratica}`)),
          c && x.push(`Odu ${r} — frequ\xeancia ancestral: ${c.essencia} ${c.missao}`),
          m &&
            (x.push(`Hexagrama natal ${o} — ${m.titulo}: ${m.essencia}`),
            m.pratica && x.push(`Pr\xe1tica I Ching: ${m.pratica}`)),
          0 === x.length)
            ? 'Akasha ainda não tem dados suficientes para traçar seu perfil. Insira sua data de nascimento para começar.'
            : x.join(' ')),
        sexualidadeNarrativa: eE(e),
        autoridade:
          ((u = e.cabala?.life_path),
          (p = e.astrologia?.lua_signo),
          (h = e.astrologia?.casa_8_signo),
          (g = e.tantrica?.corpo_predominante),
          e.odu?.odu_principal,
          (f = 'wait'),
          (b = ''),
          void 0 !== u &&
            ([1, 3, 5].includes(u)
              ? ((f = 'act'),
                (b = `Life Path ${u} — voc\xea \xe9 um iniciador nato. A estrat\xe9gia n\xe3o \xe9 esperar que as coisas aconte\xe7am: \xe9 criar o momento. Masactue com informa\xe7\xe3o, n\xe3o com impulsividade.`))
              : [2, 4, 6, 7].includes(u)
                ? ((f = 'wait'),
                  (b = `Life Path ${u} — voc\xea atrai mais do que for\xe7a. A vida traz as pessoas e oportunidades certas quando voc\xea est\xe1 no seu centro. Espere o reconhecimento; n\xe3o corra atr\xe1s.`))
                : [8, 9, 11].includes(u)
                  ? ((f = 'observe'),
                    (b = `Life Path ${u} — sua vis\xe3o \xe9 mais avan\xe7ada do que o momento. Antes de agir, observe: o que o sistema precisa? Age quando tiver clareza, n\xe3o quando tiver urg\xeancia.`))
                  : 22 === u || 33 === u
                    ? ((f = 'surrender'),
                      (b = `N\xfamero Mestre ${u} — seu caminho n\xe3o \xe9 linear. N\xe3o force a rota; confie na abertura. O universo reorganiza melhor quando voc\xea solta.`))
                    : ((f = 'wait'),
                      (b = `Life Path ${u} — voc\xea tem um ritmo pr\xf3prio. N\xe3o se compare ao ritmo dos outros. Quando a oportunidade certa chegar, voc\xea vai saber.`))),
          (v = p && ['Cancér', 'Escorpião', 'Peixes'].includes(p)),
          (j = 'mental'),
          (N = ''),
          8 === g
            ? ((j = 'sagrada'),
              (N =
                'O Corpo 8 (Prana) é sua autoridade — quando sente expansão no corpo, é sim. Quando sente contracção ou tensão, é não. Confie na sabedoria corporal.'))
            : 4 === g
              ? ((j = 'emocional'),
                (N =
                  'O Corpo 4 (Mente Negativa) traz pensamento repetitivo. Antes de decidir, espere até sentir paz emocional — não clareza mental. A mente pode argumentar para os dois lados.'))
              : h
                ? ((j = 'esplénica'),
                  (N = `A Casa 8 em ${h} d\xe1-lheintui\xe7\xe3o directa. Quando sentir um "sim" no corpo — uma expans\xe3o, um calor — \xe9 a resposta. N\xe3o pense; sinta.`))
                : ((j = 'mental'),
                  (N =
                    'Sua decisão pede reflexão antes de actão. Mas não fique em loop: defina um prazo máximo de 48h para decidir. Depois, actue mesmo sem certeza total.')),
          (y = 'trabalho'),
          (w = ''),
          void 0 !== u &&
            ([1, 3, 5].includes(u)
              ? ((y = 'trabalho'),
                (w =
                  'Hoje é dia de avançar no que você começou. Não espere inspiração — actue e a inspiração vem no caminho.'))
              : [2, 6, 7].includes(u)
                ? ((y = 'relacoes'),
                  (w =
                    'O trabalho pode esperar; a conexão não. Se há alguém que precisa de sua presença hoje, vá.'))
                : [4, 8, 9, 11].includes(u)
                  ? ((y = 'proposito'),
                    (w =
                      'Você não precisa de mais informação — precisa de decisão. O que você sabe que deve fazer há mais de 6 meses? Hoje é o dia.'))
                  : 22 === u || 33 === u
                    ? ((y = 'espiritualidade'),
                      (w =
                        'Não force aacção. Hoje é dia de silêncio, reflexão e trustedo que está a emergir. O próximo passo vai estar mais claro amanhã.'))
                    : ((y = 'trabalho'),
                      (w =
                        'Mantenha o ritmo. As pequenas acções consistentes superam as grandes decisões dramáticas.'))),
          {
            estrategia: f,
            autoridade: j,
            explicacao: `${b} ${N}`,
            regra: {
              condicao:
                'sagrada' === j
                  ? 'se sentir expansão no corpo ao pensar na decisão'
                  : 'emocional' === j
                    ? 'se sentir paz emocional — não só vontade de fazer'
                    : 'esplénica' === j
                      ? 'se sentir um "sim" intuitivo, não um "talvez" mental'
                      : 'se tiver reflexão clara e ausência de ansiedade',
              accao:
                'act' === f
                  ? 'actue nos próximos 30 minutos antes que a mente intervenha'
                  : 'wait' === f
                    ? 'aguarde até sentir reconhecimento externo ou paz interior'
                    : 'observe' === f
                      ? 'observe mais 24-48h antes de decidir — a clarity virá'
                      : 'confie no processo; não force o resultado hoje',
            },
            timing: {
              melhor: v
                ? 'quando sentir paz emocional — não urgência emocional'
                : 'quando sentir clartéade e ausência de ansiedade',
              pior: v
                ? 'quando sentir medo ou ansiedade no estômago'
                : 'quando estiver cansado, com fome, ou emocionalmente reactivo',
            },
            areaFoco: y,
            decisaoHoje: w,
          }),
      };
    }
    let eP = {
        act: 'rgba(45,212,191,0.06)',
        wait: 'rgba(240,180,41,0.06)',
        observe: 'rgba(124,92,255,0.06)',
        surrender: 'rgba(196,62,142,0.06)',
      },
      eT = {
        act: 'rgba(45,212,191,0.2)',
        wait: 'rgba(240,180,41,0.2)',
        observe: 'rgba(124,92,255,0.2)',
        surrender: 'rgba(196,62,142,0.2)',
      },
      eM = { act: '#2DD4BF', wait: '#F0B429', observe: '#7C5CFF', surrender: '#C43E8E' },
      eI = { act: 'Aja', wait: 'Espere', observe: 'Observe', surrender: 'Entregue' },
      eB = {
        saude: '◈',
        trabalho: '◉',
        sexualidade: '◉',
        amor: '♥',
        criacao: '✦',
        proposito: '★',
        familia: '⬡',
        espiritualidade: '✧',
        superacao: '⛾',
      };
    function eR(e, s = '0.9rem') {
      return e
        ? e
            .split('\n\n')
            .filter(Boolean)
            .map((e, i) => {
              let t = e.split(/\*\*(.+?)\*\*/g);
              return (0, a.jsx)(
                'p',
                {
                  className: 'leading-relaxed text-[#A7AECF] mb-3 last:mb-0',
                  style: { fontSize: s },
                  children: t.map((e, s) =>
                    s % 2 == 1
                      ? (0, a.jsx)(
                          'strong',
                          { className: 'text-[#9D86FF] font-semibold', children: e },
                          s
                        )
                      : (0, a.jsx)('span', { children: e }, s)
                  ),
                },
                i
              );
            })
        : [];
    }
    e.s(
      [
        'Dashboard',
        0,
        function ({ userId: e, userName: o = 'Viajante', initialPilares: b }) {
          let v,
            [N, y] = (0, s.useState)('daily'),
            [w, F] = (0, s.useState)(!1),
            [C, A] = (0, s.useState)(!1),
            [$, z] = (0, s.useState)(() => {
              if (b)
                try {
                  return e_(b);
                } catch (e) {
                  console.error('Error synthesizing initial pilares:', e);
                }
              return null;
            }),
            [D, S] = (0, s.useState)(!b),
            [q, O] = (0, s.useState)(null),
            { data: _, loading: T, refetch: M } = k({ userId: e }),
            {
              data: B,
              synthesis: R,
              loading: H,
              refetch: L,
            } = (function ({ userId: e, enabled: a = !0 }) {
              let [i, t] = (0, s.useState)(null),
                [r, o] = (0, s.useState)(!0),
                [n, l] = (0, s.useState)(null),
                [d, c] = (0, s.useState)(0),
                m = (0, s.useCallback)(() => {
                  c((e) => e + 1);
                }, []);
              return (
                (0, s.useEffect)(() => {
                  if (!a || !e) return void o(!1);
                  let s = !1;
                  (o(!0), l(null));
                  let i = new AbortController();
                  return (
                    fetch('/api/akasha/daily', {
                      signal: i.signal,
                      headers: { 'Content-Type': 'application/json' },
                    })
                      .then((e) => {
                        if (!e.ok) throw Error(`HTTP ${e.status}`);
                        return e.json();
                      })
                      .then((e) => {
                        s || (t(e), o(!1));
                      })
                      .catch((e) => {
                        s || ('AbortError' !== e.name && (l(e), o(!1)));
                      }),
                    () => {
                      ((s = !0), i.abort());
                    }
                  );
                }, [e, a, d]),
                { data: i, synthesis: i?.synthesis ?? null, loading: r, error: n, refetch: m }
              );
            })({ userId: e }),
            V = async () => {
              S(!0);
              try {
                let e = await fetch('/api/akasha/mandato-do-dia');
                if (e.ok) {
                  let a = await e.json();
                  if (a.pilares) {
                    let e = e_(a.pilares);
                    z(e);
                  }
                }
              } catch (e) {
                console.error('Error fetching deterministic mandato:', e);
              } finally {
                S(!1);
              }
            };
          ((0, s.useEffect)(() => {
            b || V();
          }, [b]),
            (0, s.useEffect)(() => {
              if (_?.history && B?.ritual) {
                let e = new Date().toISOString().split('T')[0];
                A(
                  _.history.some(
                    (a) =>
                      new Date(a.date).toISOString().split('T')[0] === e &&
                      a.ritualName === B.ritual.titulo
                  )
                );
              }
            }, [_, B]));
          let K = async () => {
              if (B?.ritual) {
                F(!0);
                try {
                  (
                    await fetch('/api/akasha/dashboard/complete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ritualName: B.ritual.titulo,
                        ritualLevel: R?.akashaProfile?.dominantFrequency ?? 'gift',
                      }),
                    })
                  ).ok && (A(!0), M());
                } catch (e) {
                  console.error('Error completing ritual:', e);
                } finally {
                  F(!1);
                }
              }
            },
            U = T || H || D;
          if (U && (!_ || !R || !$))
            return (0, a.jsxs)('div', {
              className: 'min-h-screen bg-[#06070F] flex flex-col justify-center items-center',
              children: [
                (0, a.jsx)(m, { className: 'animate-spin text-[#7C5CFF]', size: 40 }),
                (0, a.jsx)('p', {
                  className: 'text-sm text-[#A7AECF] mt-4 font-cinzel tracking-widest',
                  children: 'SINTONIZANDO SEU DIA...',
                }),
              ],
            });
          let Z = null;
          if ($) {
            let e =
              {
                saude: 'saude',
                relacoes: 'amor',
                trabalho: 'trabalho',
                dinheiro: 'trabalho',
                proposito: 'proposito',
                criatividade: 'criacao',
                espiritualidade: 'espiritualidade',
              }[$.autoridade.areaFoco] || 'trabalho';
            Z = $.dimensoes.find((a) => a.dimensoesId === e) || $.dimensoes[0];
          }
          return (0, a.jsxs)('div', {
            className: 'min-h-screen bg-[#06070F] text-[#F4F5FF]',
            children: [
              (0, a.jsx)('div', {
                'aria-hidden': !0,
                className: 'fixed inset-0 z-0 pointer-events-none',
                style: {
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(124, 92, 255, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(45, 212, 191, 0.04) 0%, transparent 50%)',
                },
              }),
              (0, a.jsx)('header', {
                className:
                  'sticky top-0 z-40 bg-[#06070F]/80 backdrop-blur-md border-b border-[#7C5CFF]/15 px-4 py-3 md:px-6',
                children: (0, a.jsxs)('div', {
                  className: 'flex items-center justify-between max-w-4xl mx-auto',
                  children: [
                    (0, a.jsxs)('div', {
                      className: 'flex flex-col',
                      children: [
                        (0, a.jsx)('span', {
                          className:
                            'text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono',
                          children: 'Painel de Alinhamento',
                        }),
                        (0, a.jsx)('h1', {
                          className: 'text-lg font-bold font-cinzel text-white tracking-wider',
                          children: 'AKASHA OS',
                        }),
                      ],
                    }),
                    (0, a.jsxs)('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        (0, a.jsx)('button', {
                          onClick: () => {
                            (M(), L(), V());
                          },
                          className:
                            'p-2 text-[#A7AECF] hover:text-[#7C5CFF] rounded-lg transition-colors bg-white/5 border border-white/5',
                          title: 'Sincronizar',
                          children: (0, a.jsx)(x, {
                            size: 16,
                            className: `${U ? 'animate-spin' : ''}`,
                          }),
                        }),
                        (0, a.jsx)(j, {}),
                      ],
                    }),
                  ],
                }),
              }),
              (0, a.jsx)('div', {
                className: 'px-4 pt-6 max-w-2xl mx-auto relative z-10',
                children: (0, a.jsx)('div', {
                  className:
                    'bg-[#0B0E1C]/80 border border-white/10 rounded-full p-1 flex items-center justify-between backdrop-blur-md',
                  children: [
                    { id: 'daily', label: 'Meu Dia', icon: r.Sparkles },
                    { id: 'profile', label: 'Áreas da Vida', icon: p },
                    { id: 'progress', label: 'Evolução', icon: u.TrendingUp },
                  ].map((e) => {
                    let s = e.icon,
                      t = N === e.id;
                    return (0, a.jsxs)(
                      'button',
                      {
                        onClick: () => y(e.id),
                        className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 relative ${t ? 'text-white' : 'text-[#A7AECF]/60 hover:text-[#A7AECF]'}`,
                        children: [
                          t &&
                            (0, a.jsx)(i.motion.div, {
                              layoutId: 'activeTabIndicator',
                              className:
                                'absolute inset-0 bg-[#7C5CFF]/20 border border-[#7C5CFF]/45 rounded-full z-0',
                              transition: { type: 'spring', stiffness: 380, damping: 30 },
                            }),
                          (0, a.jsx)(s, { size: 14, className: 'relative z-10' }),
                          (0, a.jsx)('span', { className: 'relative z-10', children: e.label }),
                        ],
                      },
                      e.id
                    );
                  }),
                }),
              }),
              (0, a.jsx)('main', {
                className: 'max-w-3xl mx-auto px-4 py-8 relative z-10 min-h-[60vh]',
                children: (0, a.jsxs)(t.AnimatePresence, {
                  mode: 'wait',
                  children: [
                    'daily' === N &&
                      (0, a.jsxs)(
                        i.motion.div,
                        {
                          initial: { opacity: 0, y: 15 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -15 },
                          transition: { duration: 0.25 },
                          className: 'space-y-6',
                          children: [
                            (0, a.jsxs)('div', {
                              className: 'space-y-1',
                              children: [
                                (0, a.jsx)('p', {
                                  className:
                                    'text-xs text-[#A7AECF] uppercase tracking-wider font-medium',
                                  children: new Date().toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                  }),
                                }),
                                (0, a.jsxs)('h2', {
                                  className: 'text-2xl font-bold font-cinzel text-white',
                                  children: [
                                    (v = new Date().getHours()) < 5
                                      ? 'Boa madrugada'
                                      : v < 12
                                        ? 'Bom despertar'
                                        : v < 18
                                          ? 'Boa tarde'
                                          : 'Boa noite',
                                    ', ',
                                    (0, a.jsx)('span', {
                                      className: 'text-[#9D86FF]',
                                      children: o,
                                    }),
                                  ],
                                }),
                                $?.caminhoDeVida &&
                                  (0, a.jsxs)('p', {
                                    className:
                                      'text-xs text-[#A7AECF]/60 font-medium tracking-wide',
                                    children: ['✦ ', $.caminhoDeVida],
                                  }),
                              ],
                            }),
                            (0, a.jsxs)('div', {
                              className: 'grid grid-cols-3 gap-3',
                              children: [
                                (0, a.jsxs)('div', {
                                  className:
                                    'bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center',
                                  children: [
                                    (0, a.jsx)('div', {
                                      className: 'flex justify-center mb-1 text-[#2DD4BF]',
                                      children: (0, a.jsx)(d, { size: 16 }),
                                    }),
                                    (0, a.jsx)('p', {
                                      className:
                                        'text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono',
                                      children: 'Clima do Dia',
                                    }),
                                    (0, a.jsx)('p', {
                                      className: 'text-xs font-semibold mt-0.5 text-white truncate',
                                      children: B?.climate ?? 'Estável',
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)('div', {
                                  className:
                                    'bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center',
                                  children: [
                                    (0, a.jsx)('div', {
                                      className: 'flex justify-center mb-1 text-[#F0B429]',
                                      children: (0, a.jsx)(n, { size: 16 }),
                                    }),
                                    (0, a.jsx)('p', {
                                      className:
                                        'text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono',
                                      children: 'Fase Lunar',
                                    }),
                                    (0, a.jsx)('p', {
                                      className: 'text-xs font-semibold mt-0.5 text-white truncate',
                                      children: B?.moonPhase ?? 'Calculando',
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)('div', {
                                  className:
                                    'bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center',
                                  children: [
                                    (0, a.jsx)('div', {
                                      className: 'flex justify-center mb-1 text-[#7C5CFF]',
                                      children: (0, a.jsx)(l, { size: 16 }),
                                    }),
                                    (0, a.jsx)('p', {
                                      className:
                                        'text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono',
                                      children: 'Tema Geral',
                                    }),
                                    (0, a.jsx)('p', {
                                      className: 'text-xs font-semibold mt-0.5 text-white truncate',
                                      children: B?.overallTheme ?? 'Foco',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            $?.perfilGeral &&
                              (0, a.jsxs)('div', {
                                className:
                                  'rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-3',
                                children: [
                                  (0, a.jsxs)('div', {
                                    className:
                                      'flex items-center gap-1.5 border-b border-white/5 pb-2',
                                    children: [
                                      (0, a.jsx)(r.Sparkles, {
                                        size: 14,
                                        className: 'text-[#9D86FF]',
                                      }),
                                      (0, a.jsx)('span', {
                                        className:
                                          'text-xs font-bold text-white uppercase tracking-wider font-mono',
                                        children: 'Perfil de Hoje',
                                      }),
                                    ],
                                  }),
                                  (0, a.jsx)('div', {
                                    className: 'space-y-1',
                                    children: eR($.perfilGeral),
                                  }),
                                ],
                              }),
                            $?.autoridade &&
                              (0, a.jsxs)('div', {
                                className: 'rounded-2xl border p-5 space-y-4',
                                style: {
                                  backgroundColor:
                                    eP[$.autoridade.estrategia] || 'rgba(255,255,255,0.02)',
                                  borderColor:
                                    eT[$.autoridade.estrategia] || 'rgba(255,255,255,0.1)',
                                },
                                children: [
                                  (0, a.jsxs)('div', {
                                    className: 'flex items-center justify-between',
                                    children: [
                                      (0, a.jsxs)('div', {
                                        className: 'flex items-center gap-2',
                                        children: [
                                          (0, a.jsx)(f.Info, {
                                            size: 16,
                                            className: 'text-white/80',
                                          }),
                                          (0, a.jsx)('span', {
                                            className:
                                              'text-xs font-bold text-white uppercase tracking-wider font-mono',
                                            children: 'Diretriz de Decisão (Autoridade)',
                                          }),
                                        ],
                                      }),
                                      (0, a.jsx)('span', {
                                        className:
                                          'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                                        style: {
                                          backgroundColor: `${eM[$.autoridade.estrategia]}22`,
                                          color: eM[$.autoridade.estrategia],
                                        },
                                        children:
                                          eI[$.autoridade.estrategia] || $.autoridade.estrategia,
                                      }),
                                    ],
                                  }),
                                  (0, a.jsx)('h3', {
                                    className:
                                      'text-lg font-bold font-cinzel text-white leading-tight',
                                    children: $.autoridade.decisaoHoje,
                                  }),
                                  (0, a.jsx)('p', {
                                    className: 'text-xs text-[#A7AECF] leading-relaxed',
                                    children: $.autoridade.explicacao,
                                  }),
                                  (0, a.jsxs)('div', {
                                    className: 'bg-black/25 rounded-xl p-3.5 space-y-1',
                                    children: [
                                      (0, a.jsx)('p', {
                                        className:
                                          'text-[9px] uppercase tracking-wider font-mono font-semibold',
                                        style: { color: eM[$.autoridade.estrategia] },
                                        children: 'Regra Prática de Alinhamento',
                                      }),
                                      (0, a.jsxs)('p', {
                                        className: 'text-xs text-white leading-relaxed font-medium',
                                        children: [
                                          $.autoridade.regra.condicao,
                                          ' → ',
                                          (0, a.jsx)('span', {
                                            className: 'text-[#9D86FF]',
                                            children: $.autoridade.regra.accao,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)('div', {
                                    className:
                                      'grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5',
                                    children: [
                                      (0, a.jsxs)('div', {
                                        children: [
                                          (0, a.jsx)('p', {
                                            className:
                                              'text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold',
                                            children: 'Melhor Timing',
                                          }),
                                          (0, a.jsx)('p', {
                                            className: 'text-white/85 mt-0.5 leading-relaxed',
                                            children: $.autoridade.timing.melhor,
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)('div', {
                                        children: [
                                          (0, a.jsx)('p', {
                                            className:
                                              'text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold',
                                            children: 'Evitar Decidir',
                                          }),
                                          (0, a.jsx)('p', {
                                            className: 'text-white/85 mt-0.5 leading-relaxed',
                                            children: $.autoridade.timing.pior,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)('div', {
                                    className:
                                      'pt-2 border-t border-white/5 text-[11px] text-[#A7AECF]/60 flex items-center justify-between',
                                    children: [
                                      (0, a.jsxs)('span', {
                                        children: [
                                          'Autoridade: ',
                                          (0, a.jsx)('strong', {
                                            className: 'text-white capitalize',
                                            children: $.autoridade.autoridade,
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)('span', {
                                        children: [
                                          'Área Foco: ',
                                          (0, a.jsxs)('strong', {
                                            className: 'text-white capitalize',
                                            children: [
                                              ej[$.autoridade.areaFoco] || '◈',
                                              ' ',
                                              ev[$.autoridade.areaFoco] || $.autoridade.areaFoco,
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            Z &&
                              (0, a.jsxs)('div', {
                                className:
                                  'rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-4',
                                children: [
                                  (0, a.jsxs)('div', {
                                    className: 'flex items-center gap-3',
                                    children: [
                                      (0, a.jsx)('div', {
                                        className:
                                          'w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#9D86FF] text-xl font-bold',
                                        children: eB[Z.dimensoesId] || '◈',
                                      }),
                                      (0, a.jsxs)('div', {
                                        children: [
                                          (0, a.jsx)('p', {
                                            className:
                                              'text-[10px] text-[#F0B429] font-bold uppercase tracking-wider font-mono',
                                            children: 'Foco Prioritário de Hoje',
                                          }),
                                          (0, a.jsx)('h3', {
                                            className:
                                              'text-md font-bold font-cinzel text-white leading-none mt-1',
                                            children: Z.titulo,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, a.jsx)('div', {
                                    className: 'space-y-1',
                                    children: eR(Z.synthes),
                                  }),
                                  Z.praktika &&
                                    (0, a.jsxs)('div', {
                                      className:
                                        'bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1',
                                      children: [
                                        (0, a.jsx)('p', {
                                          className:
                                            'text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold',
                                          children: 'Prática do Dia',
                                        }),
                                        (0, a.jsx)('p', {
                                          className: 'text-xs text-white/90 leading-relaxed',
                                          children: Z.praktika,
                                        }),
                                      ],
                                    }),
                                  Z.alerta &&
                                    (0, a.jsxs)('div', {
                                      className:
                                        'bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1',
                                      children: [
                                        (0, a.jsx)('p', {
                                          className:
                                            'text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold',
                                          children: 'O que Evitar',
                                        }),
                                        (0, a.jsx)('p', {
                                          className: 'text-xs text-white/90 leading-relaxed',
                                          children: Z.alerta,
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                            B?.ritual &&
                              (0, a.jsxs)('div', {
                                className:
                                  'bg-[#0B0E1C]/60 border border-white/10 rounded-2xl p-5 space-y-4',
                                children: [
                                  (0, a.jsxs)('div', {
                                    className: 'flex items-start justify-between',
                                    children: [
                                      (0, a.jsxs)('div', {
                                        children: [
                                          (0, a.jsx)('p', {
                                            className:
                                              'text-[10px] text-[#2DD4BF] font-semibold uppercase tracking-wider font-mono',
                                            children: 'Prática Recomendada',
                                          }),
                                          (0, a.jsx)('h3', {
                                            className:
                                              'text-lg font-bold font-cinzel text-white mt-1',
                                            children: B.ritual.titulo,
                                          }),
                                          (0, a.jsxs)('p', {
                                            className: 'text-xs text-[#A7AECF]/60 mt-0.5',
                                            children: [
                                              'Duração: ',
                                              B.ritual.cor || '15 min',
                                              ' · Elemento: ',
                                              B.ritual.elemento || 'Éter',
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, a.jsx)('span', { className: 'text-2xl', children: '🧘' }),
                                    ],
                                  }),
                                  (0, a.jsx)('p', {
                                    className: 'text-sm text-[#A7AECF] leading-relaxed',
                                    children: B.ritual.instrucao,
                                  }),
                                  (0, a.jsx)('div', {
                                    className: 'pt-2',
                                    children: C
                                      ? (0, a.jsxs)('div', {
                                          className:
                                            'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] font-semibold text-sm',
                                          children: [
                                            (0, a.jsx)(c, { size: 16 }),
                                            'Ritual Concluído! (+1 no seu Streak)',
                                          ],
                                        })
                                      : (0, a.jsx)('button', {
                                          onClick: K,
                                          disabled: w,
                                          className:
                                            'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#7C5CFF] hover:bg-[#9D86FF] active:scale-[0.98] transition-all text-white font-semibold text-sm disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(124,92,255,0.25)]',
                                          children: w
                                            ? (0, a.jsxs)(a.Fragment, {
                                                children: [
                                                  (0, a.jsx)(m, {
                                                    size: 16,
                                                    className: 'animate-spin',
                                                  }),
                                                  'Salvando alinhamento...',
                                                ],
                                              })
                                            : (0, a.jsxs)(a.Fragment, {
                                                children: [
                                                  (0, a.jsx)(h, { size: 16 }),
                                                  'Marcar como Praticado',
                                                ],
                                              }),
                                        }),
                                  }),
                                ],
                              }),
                            $?.dimensoes &&
                              (0, a.jsxs)('div', {
                                className: 'space-y-4',
                                children: [
                                  (0, a.jsxs)('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      (0, a.jsx)('div', { className: 'h-px flex-1 bg-white/10' }),
                                      (0, a.jsx)('span', {
                                        className:
                                          'text-xs text-white/30 uppercase tracking-widest font-mono',
                                        children: 'Sua Bússola Existencial (9 Dimensões)',
                                      }),
                                      (0, a.jsx)('div', { className: 'h-px flex-1 bg-white/10' }),
                                    ],
                                  }),
                                  (0, a.jsx)('div', {
                                    className: 'grid grid-cols-2 sm:grid-cols-3 gap-2.5',
                                    children: $.dimensoes.map((e) =>
                                      (0, a.jsxs)(
                                        'button',
                                        {
                                          onClick: () => O(e),
                                          className:
                                            'flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-white/5 bg-[#0B0E1C]/45 hover:bg-white/5 hover:border-[#7C5CFF]/30 active:scale-95 transition-all text-center min-h-[92px] group',
                                          children: [
                                            (0, a.jsx)('span', {
                                              className:
                                                'text-lg text-[#9D86FF] group-hover:scale-110 transition-transform duration-300',
                                              children: eB[e.dimensoesId] || '◈',
                                            }),
                                            (0, a.jsx)('span', {
                                              className:
                                                'text-[11px] font-bold text-white leading-tight',
                                              children: e.titulo.split(' & ')[0],
                                            }),
                                            (0, a.jsx)('span', {
                                              className:
                                                'text-[9px] text-[#A7AECF]/50 group-hover:text-white transition-colors',
                                              children: 'Explorar →',
                                            }),
                                          ],
                                        },
                                        e.dimensoesId
                                      )
                                    ),
                                  }),
                                ],
                              }),
                          ],
                        },
                        'daily'
                      ),
                    'profile' === N &&
                      (0, a.jsx)(
                        i.motion.div,
                        {
                          initial: { opacity: 0, y: 15 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -15 },
                          transition: { duration: 0.25 },
                          children: (0, a.jsx)(eb, { synthesis: R, loading: H, onRefetch: L }),
                        },
                        'profile'
                      ),
                    'progress' === N &&
                      (0, a.jsxs)(
                        i.motion.div,
                        {
                          initial: { opacity: 0, y: 15 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -15 },
                          transition: { duration: 0.25 },
                          className: 'space-y-6',
                          children: [
                            (0, a.jsxs)('div', {
                              className: 'space-y-1',
                              children: [
                                (0, a.jsx)('p', {
                                  className:
                                    'text-xs text-[#A7AECF] uppercase tracking-wider font-medium',
                                  children: 'Histórico e Evolução',
                                }),
                                (0, a.jsx)('h2', {
                                  className: 'text-2xl font-bold font-cinzel text-white',
                                  children: 'Sua Jornada',
                                }),
                              ],
                            }),
                            (0, a.jsx)(E, { userId: e }),
                            _?.streak && (0, a.jsx)(P, { streak: _.streak, loading: T }),
                            (0, a.jsxs)('div', {
                              className: 'bg-[#0B0E1C]/40 rounded-2xl p-5 border border-white/5',
                              children: [
                                (0, a.jsx)('h3', {
                                  className:
                                    'text-sm font-semibold font-cinzel mb-4 text-[#A7AECF]',
                                  children: 'Intensidade das Práticas',
                                }),
                                (0, a.jsx)(I, { userId: e }),
                              ],
                            }),
                            (0, a.jsx)(Q, { userId: e }),
                          ],
                        },
                        'progress'
                      ),
                  ],
                }),
              }),
              (0, a.jsx)(t.AnimatePresence, {
                children:
                  q &&
                  (0, a.jsxs)(a.Fragment, {
                    children: [
                      (0, a.jsx)(i.motion.div, {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        onClick: () => O(null),
                        className: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
                      }),
                      (0, a.jsx)(i.motion.div, {
                        initial: { opacity: 0, scale: 0.95, y: 15 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.95, y: 15 },
                        transition: { type: 'spring', duration: 0.3 },
                        className:
                          'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none',
                        children: (0, a.jsxs)('div', {
                          className:
                            'bg-[#0B0E1C] border border-[#7C5CFF]/30 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[85vh] p-6 relative pointer-events-auto shadow-[0_0_50px_rgba(124,92,255,0.15)] space-y-4',
                          children: [
                            (0, a.jsx)('button', {
                              onClick: () => O(null),
                              className:
                                'absolute top-4 right-4 p-2 text-[#A7AECF]/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors',
                              'aria-label': 'Fechar',
                              children: (0, a.jsx)(g.X, { size: 18 }),
                            }),
                            (0, a.jsxs)('div', {
                              className: 'flex items-center gap-3 border-b border-white/5 pb-3',
                              children: [
                                (0, a.jsx)('div', {
                                  className:
                                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold',
                                  style: {
                                    backgroundColor: `${q.chakraCor}15`,
                                    color: q.chakraCor,
                                    border: `1px solid ${q.chakraCor}30`,
                                  },
                                  children: eB[q.dimensoesId] || '◈',
                                }),
                                (0, a.jsxs)('div', {
                                  children: [
                                    (0, a.jsx)('h3', {
                                      className:
                                        'text-lg font-bold font-cinzel text-white leading-none',
                                      children: q.titulo,
                                    }),
                                    (0, a.jsx)('p', {
                                      className: 'text-xs text-[#A7AECF]/60 mt-1',
                                      children: q.descricao,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, a.jsx)('div', {
                              className: 'space-y-3 py-1',
                              children: eR(q.synthes, '0.875rem'),
                            }),
                            (0, a.jsxs)('div', {
                              className: 'grid grid-cols-1 gap-2.5 pt-2',
                              children: [
                                q.praktika &&
                                  (0, a.jsxs)('div', {
                                    className:
                                      'bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1',
                                    children: [
                                      (0, a.jsx)('p', {
                                        className:
                                          'text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold',
                                        children: 'Prática Sugerida',
                                      }),
                                      (0, a.jsx)('p', {
                                        className: 'text-xs text-white/95 leading-relaxed',
                                        children: q.praktika,
                                      }),
                                    ],
                                  }),
                                q.alerta &&
                                  (0, a.jsxs)('div', {
                                    className:
                                      'bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1',
                                    children: [
                                      (0, a.jsx)('p', {
                                        className:
                                          'text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold',
                                        children: 'Evitar Padrão',
                                      }),
                                      (0, a.jsx)('p', {
                                        className: 'text-xs text-white/95 leading-relaxed',
                                        children: q.alerta,
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                            q.contribuicoes &&
                              q.contribuicoes.length > 0 &&
                              (0, a.jsxs)('div', {
                                className:
                                  'bg-black/25 rounded-2xl p-4 border border-white/5 space-y-2',
                                children: [
                                  (0, a.jsx)('p', {
                                    className:
                                      'text-[9px] text-[#7C5CFF] uppercase tracking-wider font-mono font-semibold',
                                    children: 'Cruzamento de Influências',
                                  }),
                                  (0, a.jsx)('div', {
                                    className: 'space-y-2 max-h-[160px] overflow-y-auto pr-1',
                                    children: q.contribuicoes.map((e, s) =>
                                      (0, a.jsxs)(
                                        'div',
                                        {
                                          className:
                                            'text-xs text-[#A7AECF]/80 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0',
                                          children: [
                                            (0, a.jsx)('span', {
                                              className:
                                                'text-white font-medium capitalize font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded mr-1',
                                              children: e.pilar,
                                            }),
                                            e.frase,
                                            e.fonte &&
                                              (0, a.jsxs)('span', {
                                                className:
                                                  'text-[9px] text-[#A7AECF]/40 italic block mt-0.5',
                                                children: ['Fonte: ', e.fonte],
                                              }),
                                          ],
                                        },
                                        s
                                      )
                                    ),
                                  }),
                                ],
                              }),
                          ],
                        }),
                      }),
                    ],
                  }),
              }),
            ],
          });
        },
      ],
      38782
    );
  },
]);
