// ============================================================================
// SUPABASE ADMIN CLIENT — server-side with service role key
// ============================================================================
// Wave 21 (2026-06-28) — helpers para upload de mídia (Storage) e admin ops
// que precisam bypassar RLS (sempre após verificação de auth/role).
//
// NÃO importar do client — este módulo é server-only.
// ============================================================================

import 'server-only';
import { createClient } from '@supabase/supabase-js';

let cached: ReturnType<typeof createClient> | null = null;

/**
 * Cliente Supabase com service role key. Bypassa RLS — use SOMENTE em
 * rotas server-side após verificação explícita de auth/admin.
 */
export function createAdminClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios'
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}

/**
 * Bucket default para uploads de mídia da comunidade. Configurado no
 * setup do Supabase (ver docs/SUPABASE-SETUP.md). Deve existir; caso
 * contrário, /api/upload retorna 503 com mensagem clara.
 */
export const MEDIA_BUCKET = 'post-media';