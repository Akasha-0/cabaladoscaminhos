/**
 * Supabase Browser Client
 * ----------------------------------------------------------------------------
 * Use esta factory em qualquer componente "use client" para criar um cliente
 * Supabase que lê cookies automaticamente. É seguro instanciar várias vezes
 * — o @supabase/ssr já faz cache interno — mas o provider (SupabaseProvider)
 * mantém um singleton para evitar múltiplas subscrições `onAuthStateChange`.
 *
 * Variáveis de ambiente necessárias (ver docs/SUPABASE-SETUP.md):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Se as variáveis estiverem ausentes, retornamos `null` em vez de explodir,
 * para que páginas de marketing/landing continuem renderizando no sandbox.
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrowserSupabaseClient = SupabaseClient;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Cria um cliente Supabase para uso no browser. Retorna `null` quando as
 * variáveis públicas não estão configuradas — nesse caso, autenticação
 * fica indisponível mas a aplicação não quebra.
 */
export function createClient(): BrowserSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn(
        '[supabase/client] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Auth desabilitada.'
      );
    }
    return null;
  }

  return createSupabaseBrowserClient(url, anonKey);
}