// ============================================================================
// useDebounce — Hook React para debouncing de valores (Wave 18)
// ============================================================================
// Atrasa a atualização de `value` até que `delay` ms tenham se passado sem
// uma nova mudança. Usado pelo SearchBar para evitar bater no
// /api/search/suggestions a cada keystroke.
//
// Uso típico:
//   const [q, setQ] = useState('');
//   const debouncedQ = useDebounce(q, 300);
//   useEffect(() => { fetch(`/api/search/suggestions?q=${debouncedQ}`) }, [debouncedQ]);
//
// SSR-safe: o estado interno só é setado dentro de useEffect, então o
// hook retorna o valor inicial no primeiro render (servidor = cliente).
// ============================================================================

'use client';

import * as React from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
