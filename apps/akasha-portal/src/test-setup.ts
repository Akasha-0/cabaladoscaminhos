/**
 * apps/akasha-portal/src/test-setup.ts
 *
 * Setup local do Vitest para o portal. Importado pelo projeto `core-ui`
 * (e qualquer outro project jsdom) via `setupFiles` em vitest.config.ts.
 *
 * Conteúdo:
 *   - `@testing-library/jest-dom` matchers (toBeInTheDocument, toHaveTextContent, etc.)
 *   - Placeholder para polyfills específicos do Next.js/portal (matchMedia,
 *     IntersectionObserver, ResizeObserver) podem ser adicionados aqui.
 *
 * Wave 7.4 — A.4 (jest-dom setup para TratamentoDashboard.test.tsx).
 */
import '@testing-library/jest-dom/vitest';
