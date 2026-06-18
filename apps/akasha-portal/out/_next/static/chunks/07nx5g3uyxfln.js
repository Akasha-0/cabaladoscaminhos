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
    let l = e.r(44066)._(e.r(70685)),
      a = /https?|ftp|gopher|file/;
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
        i && 'object' == typeof i && (i = String(l.urlQueryToSearchParams(i))));
      let s = e.search || (i && `?${i}`) || '';
      return (
        n && !n.endsWith(':') && (n += ':'),
        e.slashes || ((!n || a.test(n)) && !1 !== c)
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
          } else (e && (r.current = l(e, n)), t && (o.current = l(t, n)));
        },
        [e, t]
      );
    }
    function l(e, t) {
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
          return l;
        },
      }));
    let n = e.r(57999),
      o = e.r(21578);
    function l(e) {
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
        return m;
      },
      useLinkStatus: function () {
        return v;
      },
    };
    for (var o in n) Object.defineProperty(r, o, { enumerable: !0, get: n[o] });
    let l = e.r(44066),
      a = e.r(30722),
      u = l._(e.r(52330)),
      i = e.r(53091),
      c = e.r(23437),
      s = e.r(36019),
      f = e.r(57999),
      p = e.r(2812);
    e.r(59570);
    let d = e.r(61820),
      h = e.r(2297),
      y = e.r(98957),
      g = e.r(13083);
    function m(t) {
      var r, n;
      let o,
        l,
        m,
        [v, _] = (0, u.useOptimistic)(h.IDLE_LINK_STATUS),
        k = (0, u.useRef)(null),
        {
          href: C,
          as: j,
          children: O,
          prefetch: P = null,
          passHref: w,
          replace: S,
          shallow: R,
          scroll: T,
          onClick: L,
          onMouseEnter: E,
          onTouchStart: M,
          legacyBehavior: x = !1,
          onNavigate: A,
          transitionTypes: U,
          ref: N,
          unstable_dynamicOnHover: $,
          ...I
        } = t;
      ((o = O),
        x &&
          ('string' == typeof o || 'number' == typeof o) &&
          (o = (0, a.jsx)('a', { children: o })));
      let B = u.default.useContext(c.AppRouterContext),
        K = !1 !== P,
        D =
          !1 !== P
            ? null === (n = P) || 'auto' === n
              ? g.FetchStrategy.PPR
              : g.FetchStrategy.Full
            : g.FetchStrategy.PPR,
        W = 'string' == typeof (r = j || C) ? r : (0, i.formatUrl)(r);
      if (x) {
        if (o?.$$typeof === Symbol.for('react.lazy'))
          throw Object.defineProperty(
            Error(
              "`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."
            ),
            '__NEXT_ERROR_CODE',
            { value: 'E863', enumerable: !1, configurable: !0 }
          );
        l = u.default.Children.only(o);
      }
      let z = x ? l && 'object' == typeof l && l.ref : N,
        F = u.default.useCallback(
          (e) => (
            null !== B && (k.current = (0, h.mountLinkInstance)(e, W, B, D, K, _)),
            () => {
              (k.current && ((0, h.unmountLinkForCurrentNavigation)(k.current), (k.current = null)),
                (0, h.unmountPrefetchableInstance)(e));
            }
          ),
          [K, W, B, D, _]
        ),
        q = {
          ref: (0, s.useMergedRef)(F, z),
          onClick(t) {
            (x || 'function' != typeof L || L(t),
              x && l.props && 'function' == typeof l.props.onClick && l.props.onClick(t),
              !B ||
                t.defaultPrevented ||
                (function (t, r, n, o, l, a, i) {
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
                    if ((t.preventDefault(), a)) {
                      let e = !1;
                      if (
                        (a({
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
                        !1 === l ? d.ScrollBehavior.NoScroll : d.ScrollBehavior.Default,
                        n.current,
                        i
                      );
                    });
                  }
                })(t, W, k, S, T, A, U));
          },
          onMouseEnter(e) {
            (x || 'function' != typeof E || E(e),
              x && l.props && 'function' == typeof l.props.onMouseEnter && l.props.onMouseEnter(e),
              B && K && (0, h.onNavigationIntent)(e.currentTarget, !0 === $));
          },
          onTouchStart: function (e) {
            (x || 'function' != typeof M || M(e),
              x && l.props && 'function' == typeof l.props.onTouchStart && l.props.onTouchStart(e),
              B && K && (0, h.onNavigationIntent)(e.currentTarget, !0 === $));
          },
        };
      return (
        (0, f.isAbsoluteUrl)(W)
          ? (q.href = W)
          : (x && !w && ('a' !== l.type || 'href' in l.props)) || (q.href = (0, p.addBasePath)(W)),
        (m = x ? u.default.cloneElement(l, q) : (0, a.jsx)('a', { ...I, ...q, children: o })),
        (0, a.jsx)(b.Provider, { value: v, children: m })
      );
    }
    e.r(66391);
    let b = (0, u.createContext)(h.IDLE_LINK_STATUS),
      v = () => (0, u.useContext)(b);
    ('function' == typeof r.default || ('object' == typeof r.default && null !== r.default)) &&
      void 0 === r.default.__esModule &&
      (Object.defineProperty(r.default, '__esModule', { value: !0 }),
      Object.assign(r.default, r),
      (t.exports = r.default));
  },
  6927,
  (e) => {
    'use strict';
    var t = e.i(52330);
    let r = (...e) =>
        e
          .filter((e, t, r) => !!e && '' !== e.trim() && r.indexOf(e) === t)
          .join(' ')
          .trim(),
      n = (e) => {
        let t = e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, r) =>
          r ? r.toUpperCase() : t.toLowerCase()
        );
        return t.charAt(0).toUpperCase() + t.slice(1);
      };
    var o = {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };
    let l = (0, t.createContext)({}),
      a = (0, t.forwardRef)(
        (
          {
            color: e,
            size: n,
            strokeWidth: a,
            absoluteStrokeWidth: u,
            className: i = '',
            children: c,
            iconNode: s,
            ...f
          },
          p
        ) => {
          let {
              size: d = 24,
              strokeWidth: h = 2,
              absoluteStrokeWidth: y = !1,
              color: g = 'currentColor',
              className: m = '',
            } = (0, t.useContext)(l) ?? {},
            b = (u ?? y) ? (24 * Number(a ?? h)) / Number(n ?? d) : (a ?? h);
          return (0, t.createElement)(
            'svg',
            {
              ref: p,
              ...o,
              width: n ?? d ?? o.width,
              height: n ?? d ?? o.height,
              stroke: e ?? g,
              strokeWidth: b,
              className: r('lucide', m, i),
              ...(!c &&
                !((e) => {
                  for (let t in e)
                    if (t.startsWith('aria-') || 'role' === t || 'title' === t) return !0;
                  return !1;
                })(f) && { 'aria-hidden': 'true' }),
              ...f,
            },
            [...s.map(([e, r]) => (0, t.createElement)(e, r)), ...(Array.isArray(c) ? c : [c])]
          );
        }
      );
    e.s(
      [
        'default',
        0,
        (e, o) => {
          let l = (0, t.forwardRef)(({ className: l, ...u }, i) =>
            (0, t.createElement)(a, {
              ref: i,
              iconNode: o,
              className: r(
                `lucide-${n(e)
                  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                  .toLowerCase()}`,
                `lucide-${e}`,
                l
              ),
              ...u,
            })
          );
          return ((l.displayName = n(e)), l);
        },
      ],
      6927
    );
  },
  9180,
  (e) => {
    'use strict';
    let t = (0, e.i(6927).default)('sparkles', [
      [
        'path',
        {
          d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
          key: '1s2grr',
        },
      ],
      ['path', { d: 'M20 2v4', key: '1rf3ol' }],
      ['path', { d: 'M22 4h-4', key: 'gwowj6' }],
      ['circle', { cx: '4', cy: '20', r: '2', key: '6kqj1y' }],
    ]);
    e.s(['Sparkles', 0, t], 9180);
  },
  57409,
  (e) => {
    'use strict';
    let t = (0, e.i(6927).default)('compass', [
      ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
      [
        'path',
        {
          d: 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z',
          key: '9ktpf1',
        },
      ],
    ]);
    e.s(['Compass', 0, t], 57409);
  },
]);
