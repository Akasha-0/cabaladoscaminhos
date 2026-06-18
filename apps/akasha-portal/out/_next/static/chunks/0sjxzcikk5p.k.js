(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  59570,
  (e, r, t) => {
    'use strict';
    (Object.defineProperty(t, '__esModule', { value: !0 }),
      Object.defineProperty(t, 'warnOnce', {
        enumerable: !0,
        get: function () {
          return n;
        },
      }));
    let n = (e) => {};
  },
  57999,
  (e, r, t) => {
    'use strict';
    Object.defineProperty(t, '__esModule', { value: !0 });
    var n = {
      DecodeError: function () {
        return b;
      },
      MiddlewareNotFoundError: function () {
        return E;
      },
      MissingStaticPage: function () {
        return x;
      },
      NormalizeError: function () {
        return h;
      },
      PageNotFoundError: function () {
        return P;
      },
      SP: function () {
        return g;
      },
      ST: function () {
        return y;
      },
      WEB_VITALS: function () {
        return i;
      },
      execOnce: function () {
        return s;
      },
      getDisplayName: function () {
        return f;
      },
      getLocationOrigin: function () {
        return c;
      },
      getURL: function () {
        return l;
      },
      isAbsoluteUrl: function () {
        return a;
      },
      isResSent: function () {
        return d;
      },
      loadGetInitialProps: function () {
        return p;
      },
      normalizeRepeatedSlashes: function () {
        return m;
      },
      stringifyError: function () {
        return j;
      },
    };
    for (var o in n) Object.defineProperty(t, o, { enumerable: !0, get: n[o] });
    let i = ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'];
    function s(e) {
      let r,
        t = !1;
      return (...n) => (t || ((t = !0), (r = e(...n))), r);
    }
    let u = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/,
      a = (e) => u.test(e);
    function c() {
      let { protocol: e, hostname: r, port: t } = window.location;
      return `${e}//${r}${t ? ':' + t : ''}`;
    }
    function l() {
      let { href: e } = window.location,
        r = c();
      return e.substring(r.length);
    }
    function f(e) {
      return 'string' == typeof e ? e : e.displayName || e.name || 'Unknown';
    }
    function d(e) {
      return e.finished || e.headersSent;
    }
    function m(e) {
      let r = e.split('?');
      return (
        r[0].replace(/\\/g, '/').replace(/\/\/+/g, '/') + (r[1] ? `?${r.slice(1).join('?')}` : '')
      );
    }
    async function p(e, r) {
      let t = r.res || (r.ctx && r.ctx.res);
      if (!e.getInitialProps)
        return r.ctx && r.Component ? { pageProps: await p(r.Component, r.ctx) } : {};
      let n = await e.getInitialProps(r);
      if (t && d(t)) return n;
      if (!n)
        throw Object.defineProperty(
          Error(
            `"${f(e)}.getInitialProps()" should resolve to an object. But found "${n}" instead.`
          ),
          '__NEXT_ERROR_CODE',
          { value: 'E1025', enumerable: !1, configurable: !0 }
        );
      return n;
    }
    let g = 'u' > typeof performance,
      y =
        g &&
        ['mark', 'measure', 'getEntriesByName'].every((e) => 'function' == typeof performance[e]);
    class b extends Error {}
    class h extends Error {}
    class P extends Error {
      constructor(e) {
        (super(),
          (this.code = 'ENOENT'),
          (this.name = 'PageNotFoundError'),
          (this.message = `Cannot find module for page: ${e}`));
      }
    }
    class x extends Error {
      constructor(e, r) {
        (super(), (this.message = `Failed to load static file for page: ${e} ${r}`));
      }
    }
    class E extends Error {
      constructor() {
        (super(), (this.code = 'ENOENT'), (this.message = 'Cannot find the middleware module'));
      }
    }
    function j(e) {
      return JSON.stringify({ message: e.message, stack: e.stack });
    }
  },
  70685,
  (e, r, t) => {
    'use strict';
    Object.defineProperty(t, '__esModule', { value: !0 });
    var n = {
      assign: function () {
        return a;
      },
      searchParamsToUrlQuery: function () {
        return i;
      },
      urlQueryToSearchParams: function () {
        return u;
      },
    };
    for (var o in n) Object.defineProperty(t, o, { enumerable: !0, get: n[o] });
    function i(e) {
      let r = {};
      for (let [t, n] of e.entries()) {
        let e = r[t];
        void 0 === e ? (r[t] = n) : Array.isArray(e) ? e.push(n) : (r[t] = [e, n]);
      }
      return r;
    }
    function s(e) {
      return 'string' == typeof e
        ? e
        : ('number' != typeof e || isNaN(e)) && 'boolean' != typeof e
          ? ''
          : String(e);
    }
    function u(e) {
      let r = new URLSearchParams();
      for (let [t, n] of Object.entries(e))
        if (Array.isArray(n)) for (let e of n) r.append(t, s(e));
        else r.set(t, s(n));
      return r;
    }
    function a(e, ...r) {
      for (let t of r) {
        for (let r of t.keys()) e.delete(r);
        for (let [r, n] of t.entries()) e.append(r, n);
      }
      return e;
    }
  },
  82915,
  (e) => {
    'use strict';
    var r = e.i(30722);
    e.s([
      'default',
      0,
      function ({ error: e, reset: t }) {
        return (0, r.jsx)('html', {
          lang: 'pt-BR',
          children: (0, r.jsx)('body', {
            children: (0, r.jsxs)('main', {
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
                (0, r.jsx)('h1', {
                  style: { fontSize: '1.5rem', marginBottom: '1rem' },
                  children: 'Algo deu errado',
                }),
                (0, r.jsx)('p', {
                  style: { color: '#d4d4d8', maxWidth: '32rem', marginBottom: '1.5rem' },
                  children: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
                }),
                e.digest
                  ? (0, r.jsxs)('p', {
                      style: {
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: '#71717a',
                        marginBottom: '1.5rem',
                      },
                      children: ['Código: ', e.digest],
                    })
                  : null,
                (0, r.jsx)('button', {
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
