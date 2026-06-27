#!/usr/bin/env tsx
/* eslint-disable no-console */
// ============================================================================
// Akasha Portal — Notifications Realtime Verification
// ============================================================================
// Verifica end-to-end que:
//   1. Supabase Realtime conecta no canal `notifications`
//   2. INSERT event na tabela `notifications` chega no canal
//   3. Payload contem o row esperado
//
// Uso:
//   1. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local
//   2. tsx scripts/verify-notifications-realtime.ts
//   3. Observe no terminal:
//      - "[connect] OK" em <2s
//      - "[insert] received" quando rodar o INSERT de teste abaixo
//
// Refs:
//   - src/hooks/useCommunityNotifications.ts (cliente)
//   - src/app/api/notifications/route.ts (producer)
//   - gap analysis 2026-06-27 P1 #7 (realtime verification)
// ============================================================================

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em .env.local');
  console.error('Defina as duas e rode de novo.');
  process.exit(1);
}

const TEST_USER_ID = `verify-${Date.now()}`;
const TIMEOUT_MS = 10_000;

async function main() {
  console.log(`[setup] SUPABASE_URL=${SUPABASE_URL}`);
  console.log(`[setup] TEST_USER_ID=${TEST_USER_ID}`);

  // Service-role client (server-side, bypasses RLS)
  const admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  // --------------------------------------------------------------------------
  // 1. Subscribe ao canal realtime
  // --------------------------------------------------------------------------
  console.log('[connect] subscribing to channel=notifications...');

  let receivedRow: unknown = null;
  const channel = admin
    .channel('notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        console.log('[insert] received:', JSON.stringify(payload.new, null, 2));
        receivedRow = payload.new;
      },
    )
    .subscribe((status) => {
      console.log(`[connect] status=${status}`);
    });

  // Aguarda conectar (SUBSCRIBED) ou timeout
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`timeout after ${TIMEOUT_MS}ms waiting for SUBSCRIBED`)),
      TIMEOUT_MS,
    );
    const check = setInterval(() => {
      // Supabase expõe estado via channel mas nao diretamente; usamos workaround
      // Se receivedRow chegou OU se passaram 1.5s sem erro, seguimos
    }, 200);
    setTimeout(() => {
      clearInterval(check);
      clearTimeout(timeout);
      resolve();
    }, 1500);
  });

  console.log('[connect] OK (assuming SUBSCRIBED — Supabase nao expoe estado synchronously)');

  // --------------------------------------------------------------------------
  // 2. INSERT de teste via service-role (bypassa RLS)
  // --------------------------------------------------------------------------
  console.log('[insert] inserting test notification via service-role...');

  const { data, error } = await admin
    .from('notifications')
    .insert({
      userId: TEST_USER_ID,
      type: 'TEST_VERIFY',
      payload: { message: 'verify-script-test', ts: Date.now() },
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[insert] FAILED:', error.message);
    await admin.removeChannel(channel);
    process.exit(2);
  }

  console.log(`[insert] inserted notification id=${data?.id}`);

  // --------------------------------------------------------------------------
  // 3. Aguarda payload chegar
  // --------------------------------------------------------------------------
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`timeout after ${TIMEOUT_MS}ms waiting for realtime payload`)),
      TIMEOUT_MS,
    );
    const check = setInterval(() => {
      if (receivedRow) {
        clearTimeout(timeout);
        clearInterval(check);
        resolve();
      }
    }, 100);
  });

  // --------------------------------------------------------------------------
  // 4. Valida payload
  // --------------------------------------------------------------------------
  const row = receivedRow as { id: string; userId: string; type: string };
  if (!row || row.userId !== TEST_USER_ID) {
    console.error('[verify] FAIL: payload mismatch or empty');
    console.error('expected userId=', TEST_USER_ID);
    console.error('received=', row);
    await admin.removeChannel(channel);
    process.exit(3);
  }

  console.log('[verify] OK — realtime delivery confirmed');
  console.log(`  - id: ${row.id}`);
  console.log(`  - userId: ${row.userId}`);
  console.log(`  - type: ${row.type}`);

  // --------------------------------------------------------------------------
  // 5. Cleanup
  // --------------------------------------------------------------------------
  await admin.from('notifications').delete().eq('userId', TEST_USER_ID);
  await admin.removeChannel(channel);
  console.log('[cleanup] test notification deleted, channel removed');
  console.log('[done] PASS');
  process.exit(0);
}

main().catch((err) => {
  console.error('[error]', err.message);
  process.exit(99);
});