/**
 * Supabase — entrypoint público
 * ----------------------------------------------------------------------------
 * Re-exporta os clientes para uso simplificado:
 *   - import { getBrowserClient } from '@/lib/supabase'
 *   - import { getServerClient } from '@/lib/supabase'
 * ----------------------------------------------------------------------------
 */

export { createClient as getBrowserClient, isSupabaseConfigured } from './client';
export { createClient as getServerClient, createAdminClient } from './server';
export { updateSession } from './middleware';