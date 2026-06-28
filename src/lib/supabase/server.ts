/**
 * Supabase Server Client (Server Components + Server Actions + Route Handlers)
 * ----------------------------------------------------------------------------
 * Use esta factory em:
 *   - Server Components (Next.js 16)
 *   - Server Actions (`src/app/actions/*`)
 *   - Route Handlers (`src/app/api/*`)
 *
 * O cliente lê e escreve cookies via `next/headers`, então **não** é
 * compartilhado entre requests — sempre crie um novo dentro da função.
 *
 * Para operações privilegiadas (admin), use `createAdminClient()` que
 * aplica `SUPABASE_SERVICE_ROLE_KEY` — nunca exponha essa chave ao browser.
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ServerSupabaseClient = SupabaseClient;

export function isSupabaseServerConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Cliente para Server Components / Server Actions / Route Handlers.
 * Implementa `getAll` + `setAll` (forma recomendada do @supabase/ssr 0.10+).
 */
export async function createClient(): Promise<ServerSupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn(
        '[supabase/server] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Auth desabilitada.'
      );
    }
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Em Server Components, setAll pode falhar se chamado fora de uma
          // ação que escreve cookies. Ignorar — o middleware cuida do refresh.
        }
      },
    },
  });
}

/**
 * Cliente admin (service_role). IGNORA RLS — usar apenas server-side
 * para bootstrap de perfil no signup, moderação, etc.
 *
 * ⚠️ Nunca expor ao browser. Nunca logar a chave.
 */
export function createAdminClient(): ServerSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('[supabase/server] Service role key ausente — admin client indisponível.');
    }
    return null;
  }

  return createSupabaseAdminClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}