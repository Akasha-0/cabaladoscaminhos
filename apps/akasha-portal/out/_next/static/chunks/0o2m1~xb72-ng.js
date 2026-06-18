(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  53091,
  (e, t, r) => {
    'use strict';
    Object.defineProperty(r, '__esModule', { value: !0 });
    var n = {
      formatUrl: function () {
        return u;
      },
      formatWithValidation: function () {
        return c;
      },
      urlObjectKeys: function () {
        return i;
      },
    };
    for (var o in n) Object.defineProperty(r, o, { enumerable: !0, get: n[o] });
    let a = e.r(44066)._(e.r(70685)),
      l = /https?|ftp|gopher|file/;
    function u(e) {
      let { auth: t, hostname: r } = e,
        n = e.protocol || '',
        o = e.pathname || '',
        u = e.hash || '',
        i = e.query || '',
        c = !1;
      ((t = t ? encodeURIComponent(t).replace(/%3A/i, ':') + '@' : ''),
        e.host
          ? (c = t + e.host)
          : r && ((c = t + (~r.indexOf(':') ? `[${r}]` : r)), e.port && (c += ':' + e.port)),
        i && 'object' == typeof i && (i = String(a.urlQueryToSearchParams(i))));
      let s = e.search || (i && `?${i}`) || '';
      return (
        n && !n.endsWith(':') && (n += ':'),
        e.slashes || ((!n || l.test(n)) && !1 !== c)
          ? ((c = '//' + (c || '')), o && '/' !== o[0] && (o = '/' + o))
          : c || (c = ''),
        u && '#' !== u[0] && (u = '#' + u),
        s && '?' !== s[0] && (s = '?' + s),
        (o = o.replace(/[?#]/g, encodeURIComponent)),
        (s = s.replace('#', '%23')),
        `${n}${c}${o}${s}${u}`
      );
    }
    let i = [
      'auth',
      'hash',
      'host',
      'hostname',
      'href',
      'path',
      'pathname',
      'port',
      'protocol',
      'query',
      'search',
      'slashes',
    ];
    function c(e) {
      return u(e);
    }
  },
  36019,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'useMergedRef', {
        enumerable: !0,
        get: function () {
          return o;
        },
      }));
    let n = e.r(52330);
    function o(e, t) {
      let r = (0, n.useRef)(null),
        o = (0, n.useRef)(null);
      return (0, n.useCallback)(
        (n) => {
          if (null === n) {
            let e = r.current;
            e && ((r.current = null), e());
            let t = o.current;
            t && ((o.current = null), t());
          } else (e && (r.current = a(e, n)), t && (o.current = a(t, n)));
        },
        [e, t]
      );
    }
    function a(e, t) {
      if ('function' != typeof e)
        return (
          (e.current = t),
          () => {
            e.current = null;
          }
        );
      {
        let r = e(t);
        return 'function' == typeof r ? r : () => e(null);
      }
    }
    ('function' == typeof r.default || ('object' == typeof r.default && null !== r.default)) &&
      void 0 === r.default.__esModule &&
      (Object.defineProperty(r.default, '__esModule', { value: !0 }),
      Object.assign(r.default, r),
      (t.exports = r.default));
  },
  98957,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'isLocalURL', {
        enumerable: !0,
        get: function () {
          return a;
        },
      }));
    let n = e.r(57999),
      o = e.r(21578);
    function a(e) {
      if (!(0, n.isAbsoluteUrl)(e)) return !0;
      try {
        let t = (0, n.getLocationOrigin)(),
          r = new URL(e, t);
        return r.origin === t && (0, o.hasBasePath)(r.pathname);
      } catch (e) {
        return !1;
      }
    }
  },
  66391,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'errorOnce', {
        enumerable: !0,
        get: function () {
          return n;
        },
      }));
    let n = (e) => {};
  },
  84996,
  (e, t, r) => {
    'use strict';
    Object.defineProperty(r, '__esModule', { value: !0 });
    var n = {
      default: function () {
        return g;
      },
      useLinkStatus: function () {
        return x;
      },
    };
    for (var o in n) Object.defineProperty(r, o, { enumerable: !0, get: n[o] });
    let a = e.r(44066),
      l = e.r(30722),
      u = a._(e.r(52330)),
      i = e.r(53091),
      c = e.r(23437),
      s = e.r(36019),
      f = e.r(57999),
      p = e.r(2812);
    e.r(59570);
    let d = e.r(61820),
      h = e.r(2297),
      y = e.r(98957),
      b = e.r(13083);
    function g(t) {
      var r, n;
      let o,
        a,
        g,
        [x, v] = (0, u.useOptimistic)(h.IDLE_LINK_STATUS),
        j = (0, u.useRef)(null),
        {
          href: S,
          as: C,
          children: _,
          prefetch: O = null,
          passHref: P,
          replace: T,
          shallow: R,
          scroll: A,
          onClick: E,
          onMouseEnter: F,
          onTouchStart: k,
          legacyBehavior: w = !1,
          onNavigate: L,
          transitionTypes: M,
          ref: U,
          unstable_dynamicOnHover: D,
          ...$
        } = t;
      ((o = _),
        w &&
          ('string' == typeof o || 'number' == typeof o) &&
          (o = (0, l.jsx)('a', { children: o })));
      let I = u.default.useContext(c.AppRouterContext),
        K = !1 !== O,
        z =
          !1 !== O
            ? null === (n = O) || 'auto' === n
              ? b.FetchStrategy.PPR
              : b.FetchStrategy.Full
            : b.FetchStrategy.PPR,
        B = 'string' == typeof (r = C || S) ? r : (0, i.formatUrl)(r);
      if (w) {
        if (o?.$$typeof === Symbol.for('react.lazy'))
          throw Object.defineProperty(
            Error(
              "`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."
            ),
            '__NEXT_ERROR_CODE',
            { value: 'E863', enumerable: !1, configurable: !0 }
          );
        a = u.default.Children.only(o);
      }
      let N = w ? a && 'object' == typeof a && a.ref : U,
        W = u.default.useCallback(
          (e) => (
            null !== I && (j.current = (0, h.mountLinkInstance)(e, B, I, z, K, v)),
            () => {
              (j.current && ((0, h.unmountLinkForCurrentNavigation)(j.current), (j.current = null)),
                (0, h.unmountPrefetchableInstance)(e));
            }
          ),
          [K, B, I, z, v]
        ),
        q = {
          ref: (0, s.useMergedRef)(W, N),
          onClick(t) {
            (w || 'function' != typeof E || E(t),
              w && a.props && 'function' == typeof a.props.onClick && a.props.onClick(t),
              !I ||
                t.defaultPrevented ||
                (function (t, r, n, o, a, l, i) {
                  if ('u' > typeof window) {
                    let c,
                      { nodeName: s } = t.currentTarget;
                    if (
                      ('A' === s.toUpperCase() &&
                        (((c = t.currentTarget.getAttribute('target')) && '_self' !== c) ||
                          t.metaKey ||
                          t.ctrlKey ||
                          t.shiftKey ||
                          t.altKey ||
                          (t.nativeEvent && 2 === t.nativeEvent.which))) ||
                      t.currentTarget.hasAttribute('download')
                    )
                      return;
                    if (!(0, y.isLocalURL)(r)) {
                      o && (t.preventDefault(), location.replace(r));
                      return;
                    }
                    if ((t.preventDefault(), l)) {
                      let e = !1;
                      if (
                        (l({
                          preventDefault: () => {
                            e = !0;
                          },
                        }),
                        e)
                      )
                        return;
                    }
                    let { dispatchNavigateAction: f } = e.r(92110);
                    u.default.startTransition(() => {
                      f(
                        r,
                        o ? 'replace' : 'push',
                        !1 === a ? d.ScrollBehavior.NoScroll : d.ScrollBehavior.Default,
                        n.current,
                        i
                      );
                    });
                  }
                })(t, B, j, T, A, L, M));
          },
          onMouseEnter(e) {
            (w || 'function' != typeof F || F(e),
              w && a.props && 'function' == typeof a.props.onMouseEnter && a.props.onMouseEnter(e),
              I && K && (0, h.onNavigationIntent)(e.currentTarget, !0 === D));
          },
          onTouchStart: function (e) {
            (w || 'function' != typeof k || k(e),
              w && a.props && 'function' == typeof a.props.onTouchStart && a.props.onTouchStart(e),
              I && K && (0, h.onNavigationIntent)(e.currentTarget, !0 === D));
          },
        };
      return (
        (0, f.isAbsoluteUrl)(B)
          ? (q.href = B)
          : (w && !P && ('a' !== a.type || 'href' in a.props)) || (q.href = (0, p.addBasePath)(B)),
        (g = w ? u.default.cloneElement(a, q) : (0, l.jsx)('a', { ...$, ...q, children: o })),
        (0, l.jsx)(m.Provider, { value: x, children: g })
      );
    }
    e.r(66391);
    let m = (0, u.createContext)(h.IDLE_LINK_STATUS),
      x = () => (0, u.useContext)(m);
    ('function' == typeof r.default || ('object' == typeof r.default && null !== r.default)) &&
      void 0 === r.default.__esModule &&
      (Object.defineProperty(r.default, '__esModule', { value: !0 }),
      Object.assign(r.default, r),
      (t.exports = r.default));
  },
  28656,
  (e) => {
    'use strict';
    var t = e.i(30722),
      r = e.i(52330),
      n = e.i(89426),
      o = e.i(84996);
    e.s([
      'default',
      0,
      function ({ locale: e }) {
        let a = (0, n.useRouter)(),
          [l, u] = (0, r.useState)(''),
          [i, c] = (0, r.useState)(''),
          [s, f] = (0, r.useState)(null),
          [p, d] = (0, r.useState)(!1);
        async function h(t) {
          (t.preventDefault(), f(null), d(!0));
          try {
            let t = await fetch('/api/akasha/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: l.trim().toLowerCase(), password: i }),
            });
            if (!t.ok) {
              let e = await t.json().catch(() => ({}));
              (f(e.error ?? 'Falha ao entrar. Tente novamente.'), d(!1));
              return;
            }
            (a.push(`/${e}/conta`), a.refresh());
          } catch {
            (f('Erro de rede. Verifique sua conexão.'), d(!1));
          }
        }
        let y = {
          width: '100%',
          background: 'rgba(11, 14, 28, 0.7)',
          border: '1px solid rgba(38, 48, 79, 0.8)',
          borderRadius: '10px',
          padding: '12px 14px',
          color: '#F4F5FF',
          fontSize: '0.9375rem',
          fontFamily: 'inherit',
          outline: 'none',
        };
        return (0, t.jsxs)('form', {
          onSubmit: h,
          style: {
            background: 'rgba(11, 14, 28, 0.7)',
            border: '1px solid rgba(38, 48, 79, 0.8)',
            borderRadius: '16px',
            padding: '1.75rem',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          },
          children: [
            (0, t.jsxs)('label', {
              style: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
              children: [
                (0, t.jsx)('span', {
                  style: { fontSize: '0.8125rem', color: '#A7AECF', fontWeight: 500 },
                  children: 'Email',
                }),
                (0, t.jsx)('input', {
                  type: 'email',
                  required: !0,
                  autoComplete: 'email',
                  autoFocus: !0,
                  value: l,
                  onChange: (e) => u(e.target.value),
                  placeholder: 'seu@email.com',
                  style: y,
                }),
              ],
            }),
            (0, t.jsxs)('label', {
              style: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
              children: [
                (0, t.jsx)('span', {
                  style: { fontSize: '0.8125rem', color: '#A7AECF', fontWeight: 500 },
                  children: 'Senha',
                }),
                (0, t.jsx)('input', {
                  type: 'password',
                  required: !0,
                  autoComplete: 'current-password',
                  value: i,
                  onChange: (e) => c(e.target.value),
                  placeholder: '••••••••',
                  style: y,
                }),
              ],
            }),
            s &&
              (0, t.jsx)('div', {
                role: 'alert',
                style: {
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#FCA5A5',
                  fontSize: '0.8125rem',
                },
                children: s,
              }),
            (0, t.jsx)('button', {
              type: 'submit',
              disabled: p,
              style: {
                background: p ? '#5A4FCC' : '#7C5CFF',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: p ? 'wait' : 'pointer',
                boxShadow: p ? 'none' : '0 0 24px rgba(124,92,255,0.3)',
                marginTop: '0.25rem',
              },
              children: p ? 'Entrando…' : 'Entrar',
            }),
            (0, t.jsxs)('div', {
              style: {
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#A7AECF',
                marginTop: '0.5rem',
              },
              children: [
                'Ainda não tem conta?',
                ' ',
                (0, t.jsx)(o.default, {
                  href: `/${e}/onboarding`,
                  style: { color: '#9D86FF', textDecoration: 'none', fontWeight: 500 },
                  children: 'Criar agora',
                }),
              ],
            }),
          ],
        });
      },
    ]);
  },
]);
