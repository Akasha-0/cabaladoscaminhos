(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  59570,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'warnOnce', {
        enumerable: !0,
        get: function () {
          return n;
        },
      }));
    let n = (e) => {};
  },
  57999,
  (e, t, r) => {
    'use strict';
    Object.defineProperty(r, '__esModule', { value: !0 });
    var n = {
      DecodeError: function () {
        return E;
      },
      MiddlewareNotFoundError: function () {
        return b;
      },
      MissingStaticPage: function () {
        return w;
      },
      NormalizeError: function () {
        return v;
      },
      PageNotFoundError: function () {
        return y;
      },
      SP: function () {
        return g;
      },
      ST: function () {
        return h;
      },
      WEB_VITALS: function () {
        return i;
      },
      execOnce: function () {
        return s;
      },
      getDisplayName: function () {
        return d;
      },
      getLocationOrigin: function () {
        return c;
      },
      getURL: function () {
        return l;
      },
      isAbsoluteUrl: function () {
        return u;
      },
      isResSent: function () {
        return f;
      },
      loadGetInitialProps: function () {
        return p;
      },
      normalizeRepeatedSlashes: function () {
        return m;
      },
      stringifyError: function () {
        return P;
      },
    };
    for (var o in n) Object.defineProperty(r, o, { enumerable: !0, get: n[o] });
    let i = ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'];
    function s(e) {
      let t,
        r = !1;
      return (...n) => (r || ((r = !0), (t = e(...n))), t);
    }
    let a = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/,
      u = (e) => a.test(e);
    function c() {
      let { protocol: e, hostname: t, port: r } = window.location;
      return `${e}//${t}${r ? ':' + r : ''}`;
    }
    function l() {
      let { href: e } = window.location,
        t = c();
      return e.substring(t.length);
    }
    function d(e) {
      return 'string' == typeof e ? e : e.displayName || e.name || 'Unknown';
    }
    function f(e) {
      return e.finished || e.headersSent;
    }
    function m(e) {
      let t = e.split('?');
      return (
        t[0].replace(/\\/g, '/').replace(/\/\/+/g, '/') + (t[1] ? `?${t.slice(1).join('?')}` : '')
      );
    }
    async function p(e, t) {
      let r = t.res || (t.ctx && t.ctx.res);
      if (!e.getInitialProps)
        return t.ctx && t.Component ? { pageProps: await p(t.Component, t.ctx) } : {};
      let n = await e.getInitialProps(t);
      if (r && f(r)) return n;
      if (!n)
        throw Object.defineProperty(
          Error(
            `"${d(e)}.getInitialProps()" should resolve to an object. But found "${n}" instead.`
          ),
          '__NEXT_ERROR_CODE',
          { value: 'E1025', enumerable: !1, configurable: !0 }
        );
      return n;
    }
    let g = 'u' > typeof performance,
      h =
        g &&
        ['mark', 'measure', 'getEntriesByName'].every((e) => 'function' == typeof performance[e]);
    class E extends Error {}
    class v extends Error {}
    class y extends Error {
      constructor(e) {
        (super(),
          (this.code = 'ENOENT'),
          (this.name = 'PageNotFoundError'),
          (this.message = `Cannot find module for page: ${e}`));
      }
    }
    class w extends Error {
      constructor(e, t) {
        (super(), (this.message = `Failed to load static file for page: ${e} ${t}`));
      }
    }
    class b extends Error {
      constructor() {
        (super(), (this.code = 'ENOENT'), (this.message = 'Cannot find the middleware module'));
      }
    }
    function P(e) {
      return JSON.stringify({ message: e.message, stack: e.stack });
    }
  },
  70685,
  (e, t, r) => {
    'use strict';
    Object.defineProperty(r, '__esModule', { value: !0 });
    var n = {
      assign: function () {
        return u;
      },
      searchParamsToUrlQuery: function () {
        return i;
      },
      urlQueryToSearchParams: function () {
        return a;
      },
    };
    for (var o in n) Object.defineProperty(r, o, { enumerable: !0, get: n[o] });
    function i(e) {
      let t = {};
      for (let [r, n] of e.entries()) {
        let e = t[r];
        void 0 === e ? (t[r] = n) : Array.isArray(e) ? e.push(n) : (t[r] = [e, n]);
      }
      return t;
    }
    function s(e) {
      return 'string' == typeof e
        ? e
        : ('number' != typeof e || isNaN(e)) && 'boolean' != typeof e
          ? ''
          : String(e);
    }
    function a(e) {
      let t = new URLSearchParams();
      for (let [r, n] of Object.entries(e))
        if (Array.isArray(n)) for (let e of n) t.append(r, s(e));
        else t.set(r, s(n));
      return t;
    }
    function u(e, ...t) {
      for (let r of t) {
        for (let t of r.keys()) e.delete(t);
        for (let [t, n] of r.entries()) e.append(t, n);
      }
      return e;
    }
  },
  89426,
  (e, t, r) => {
    t.exports = e.r(33565);
  },
  85258,
  (e) => {
    'use strict';
    var t = e.i(30722),
      r = e.i(52330);
    let n = (0, r.createContext)(void 0),
      o = 'akasha-theme';
    e.s([
      'ThemeProvider',
      0,
      function ({ children: e }) {
        let [i, s] = (0, r.useState)('system'),
          [a, u] = (0, r.useState)('dark');
        return (
          (0, r.useEffect)(() => {
            let e = localStorage.getItem(o);
            e && s(e);
          }, []),
          (0, r.useEffect)(() => {
            let e = document.documentElement,
              t = () => {
                let t;
                ((t =
                  'system' === i
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? 'dark'
                      : 'light'
                    : i),
                  e.classList.remove('light', 'dark'),
                  e.classList.add(t),
                  u(t));
              };
            t();
            let r = window.matchMedia('(prefers-color-scheme: dark)');
            return (r.addEventListener('change', t), () => r.removeEventListener('change', t));
          }, [i]),
          (0, t.jsx)(n.Provider, {
            value: {
              theme: i,
              setTheme: (e) => {
                (s(e), localStorage.setItem(o, e));
              },
              resolvedTheme: a,
            },
            children: e,
          })
        );
      },
      'useTheme',
      0,
      function () {
        let e = (0, r.useContext)(n);
        if (!e) throw Error('useTheme must be used within ThemeProvider');
        return e;
      },
    ]);
  },
  93229,
  (e) => {
    'use strict';
    e.i(91137);
    var t = e.i(52330);
    e.s(
      [
        'ServiceWorkerRegistrar',
        0,
        function () {
          return (
            (0, t.useEffect)(() => {
              if (!('serviceWorker' in navigator)) return;
              let e = () => {
                navigator.serviceWorker
                  .register('/sw.js', { scope: '/' })
                  .then((e) => {
                    e.addEventListener('updatefound', () => {
                      let t = e.installing;
                      t &&
                        t.addEventListener('statechange', () => {
                          'installed' === t.state &&
                            navigator.serviceWorker.controller &&
                            window.dispatchEvent(new CustomEvent('pwa:updated'));
                        });
                    });
                  })
                  .catch(() => {});
              };
              'complete' === document.readyState
                ? e()
                : window.addEventListener('load', e, { once: !0 });
            }, []),
            null
          );
        },
      ],
      93229
    );
  },
  1404,
  (e) => {
    'use strict';
    var t = e.i(30722),
      r = e.i(52330),
      n = e.i(89426);
    let o = ['pt-BR', 'en'],
      i = 'pt-BR';
    e.s(
      [
        'LocaleSwitcher',
        0,
        function () {
          let [e, s] = (0, r.useState)(i),
            a = (0, n.useRouter)(),
            u = (0, n.usePathname)() ?? '/';
          return (
            (0, r.useEffect)(() => {
              s(
                (function () {
                  if ('u' < typeof document) return i;
                  let e = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/),
                    t = e?.[1];
                  return t && o.includes(t) ? t : i;
                })()
              );
            }, []),
            (0, t.jsx)('button', {
              type: 'button',
              onClick: () => {
                let t,
                  r = 'pt-BR' === e ? 'en' : 'pt-BR';
                ((document.cookie = `NEXT_LOCALE=${r}; path=/; max-age=31536000; samesite=lax`),
                  s(r));
                let n =
                    (t = u.split('/')).length > 1 && o.includes(t[1] ?? '')
                      ? '/' + t.slice(2).join('/')
                      : u,
                  i = '/' === n || '' === n ? `/${r}` : `/${r}${n}`;
                a.push(i);
              },
              'aria-label': `Switch language (current: ${e})`,
              'data-testid': 'locale-switcher',
              className:
                'px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors',
              children: 'pt-BR' === e ? 'EN' : 'PT',
            })
          );
        },
      ],
      1404
    );
  },
]);
