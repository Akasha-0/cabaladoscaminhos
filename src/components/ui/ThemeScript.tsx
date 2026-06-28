// ============================================================================
// ThemeScript — Inline script que aplica tema antes da hidratação (anti-FOUC)
// ============================================================================
// Roda síncrono no <head> antes do body. Lê cookie + localStorage e aplica a
// classe `dark` no <html> pra evitar "flash of wrong theme" no first paint.
// ============================================================================

/**
 * Server-safe theme bootstrap script.
 *
 * Strategy:
 *  1. Read cookie `theme` (set by theme.ts on user toggle)
 *  2. Fallback to localStorage `theme-preference` (zustand persist)
 *  3. Fallback to OS preference (prefers-color-scheme)
 *  4. Apply class `dark` on <html>
 *
 * Returns a JSON-serializable string for embedding in <Script strategy="beforeInteractive">.
 */
export const themeBootstrapScript = `
(function() {
  try {
    var theme = null;

    // 1) Cookie
    var cookie = document.cookie.match(/(?:^|; )theme=(dark|light)/);
    if (cookie && cookie[1]) theme = cookie[1];

    // 2) localStorage (zustand persist)
    if (!theme) {
      try {
        var raw = localStorage.getItem('theme-preference');
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && (parsed.state && (parsed.state.theme === 'dark' || parsed.state.theme === 'light'))) {
            theme = parsed.state.theme;
          }
        }
      } catch (e) { /* noop */ }
    }

    // 3) OS preference
    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Em qualquer falha, default = dark (místico)
    document.documentElement.classList.add('dark');
  }
})();
`.trim();

export interface ThemeScriptProps {
  /** Quando true, usa dangerouslySetInnerHTML inline (recomendado, evita RTT). */
  inline?: boolean;
}

/**
 * Embed o themeBootstrapScript na página.
 * Use dentro de <head> via dangerouslySetInnerHTML para evitar flash.
 */
export function ThemeScript({ inline = true }: ThemeScriptProps) {
  if (!inline) return null;
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
    />
  );
}

export default ThemeScript;