"use client";

/**
 * PostHogProvider — Provider de analytics (Wave 11)
 * ============================================================================
 * Inicializa PostHog client-side (singleton) + tracking automatico de page
 * views. Nao renderiza UI; e' um wrapper invisible.
 *
 * Como usar:
 *   <PostHogProvider>
 *     {children}
 *   </PostHogProvider>
 *
 * Emvolver em src/app/layout.tsx (dentro do <body>).
 *
 * Page view tracking:
 *   - Hook em usePathname() + useSearchParams() do next/navigation.
 *   - Dispara events.pageView(path) em mudanca de rota.
 *
 * SSR-safety:
 *   - Provider retorna children sem side-effect em server-render.
 *   - Hooks de Next.js so' rodam client-side por causa do "use client".
 * ============================================================================
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPostHog, events } from "@/lib/monitoring/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Inicializa singleton client-side
    getPostHog();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams ? Object.fromEntries(searchParams.entries()) : undefined;
    events.pageView(pathname, query);
  }, [pathname, searchParams]);

  return <>{children}</>;
}