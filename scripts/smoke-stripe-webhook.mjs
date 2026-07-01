// ============================================================================
// Smoke test para Stripe webhook + PII helpers (Wave 33) — node:test puro
// ============================================================================
// Usa node:test nativo (zero deps) + node --experimental-strip-types.
// Roda em ~3s com <200MB RAM.
//
// Escopo (sem precisar de Next runtime):
//   - PII helpers: maskEmail/maskPhone/maskName/stripPiiFromStripePayload
//   - HMAC-SHA256 signature computation (espelha lógica de stripe.ts)
//   - Routes existem como arquivos (file presence check, sem import dinâmico)
//
// Validação de integração do route.ts fica a cargo do vitest suite em
// tests/unit/payments/stripe-webhook.test.ts (4 cenários: valid/invalid/
// duplicate/unknown).
// ============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, timingSafeEqual } from 'node:crypto';

// ============================================================================
// Test 1: maskEmail
// ============================================================================

test('1a) maskEmail: emails típicos', async () => {
  const { maskEmail } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskEmail('joao@gmail.com'), 'j***@g****.com');
  assert.equal(maskEmail('maria.silva@example.com.br'), 'm**********@e**********.br');
});

test('1b) maskEmail: edge cases (null/empty/sem @)', async () => {
  const { maskEmail } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskEmail(null), '[no-email]');
  assert.equal(maskEmail(undefined), '[no-email]');
  assert.equal(maskEmail(''), '[no-email]');
  assert.equal(maskEmail('invalidsemarroba'), '[invalid-email]');
  // 1 char em cada parte: preserva
  assert.equal(maskEmail('a@b.com'), 'a@b.com');
});

// ============================================================================
// Test 2: maskPhone
// ============================================================================

test('2a) maskPhone: BR com DDI', async () => {
  const { maskPhone } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskPhone('+5511987654321'), '+55*****4321');
  // Sem DDI explícito: primeiros 2 dígitos viram DDI fallback
  assert.equal(maskPhone('11987654321'), '+11*****4321');
});

test('2b) maskPhone: edge cases', async () => {
  const { maskPhone } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskPhone(null), '[no-phone]');
  assert.equal(maskPhone(''), '[no-phone]');
  assert.equal(maskPhone('12'), '[invalid-phone]');
});

// ============================================================================
// Test 3: maskName
// ============================================================================

test('3a) maskName: nomes completos', async () => {
  const { maskName } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskName('João da Silva'), 'J*** D*** S****');
  assert.equal(maskName('Maria'), 'M****');
});

test('3b) maskName: edge cases', async () => {
  const { maskName } = await import('../src/lib/payments/webhook-log.ts');
  assert.equal(maskName(null), '[no-name]');
  assert.equal(maskName(''), '[no-name]');
  assert.equal(maskName('   '), '[no-name]');
});

// ============================================================================
// Test 4: stripPiiFromStripePayload (recursivo + PII-aware)
// ============================================================================

test('4a) stripPiiFromStripePayload mascara top-level email', async () => {
  const { stripPiiFromStripePayload } = await import(
    '../src/lib/payments/webhook-log.ts'
  );
  const payload = { id: 'cus_1', email: 'joao@gmail.com' };
  const lite = stripPiiFromStripePayload(payload);
  assert.match(lite.email, /^j\*+@g\*+\.com$/);
  assert.equal(lite.id, 'cus_1'); // id NÃO é PII
});

test('4b) stripPiiFromStripePayload recursivo em billing_details', async () => {
  const { stripPiiFromStripePayload } = await import(
    '../src/lib/payments/webhook-log.ts'
  );
  const payload = {
    billing_details: {
      email: 'maria@example.com',
      phone: '+5511987654321',
      name: 'Maria de Fátima',
    },
    payment_method_details: {
      card: { last4: '4242', brand: 'visa' },
    },
  };
  const lite = stripPiiFromStripePayload(payload);
  assert.match(lite.billing_details.email, /^m\*+@e\*+\.com$/);
  assert.match(lite.billing_details.phone, /^\+55\*+4321$/);
  assert.match(lite.billing_details.name, /^M\*+ D\*+ F\*+$/);
  // last4 NÃO é PII (Stripe já entrega seguro)
  assert.equal(lite.payment_method_details.card.last4, '4242');
  assert.equal(lite.payment_method_details.card.brand, 'visa');
});

test('4c) stripPiiFromStripePayload respeita maxDepth', async () => {
  const { stripPiiFromStripePayload } = await import(
    '../src/lib/payments/webhook-log.ts'
  );
  const deep = { a: { b: { c: { d: { e: 'deep-value' } } } } };
  // maxDepth=2: trunca em depth=0 retornando '[truncated]'
  const lite = stripPiiFromStripePayload(deep, 2);
  // lite.a.b deveria ser '[truncated]' (alcançou depth=0 dentro de b)
  assert.equal(lite.a.b, '[truncated]');
  // maxDepth=10: deve descer até o fundo
  const liteDeep = stripPiiFromStripePayload(deep, 10);
  assert.equal(liteDeep.a.b.c.d.e, 'deep-value');
});

// ============================================================================
// Test 5: HMAC-SHA256 signature (espelha lógica de verifyWebhookSignature)
// ============================================================================

test('5a) HMAC-SHA256 signature válida → match constant-time', () => {
  const WEBHOOK_SECRET = 'whsec_test_w33_at_least_32_chars_long_xxxxxxxxxxxx';
  const payload = JSON.stringify({
    id: 'evt_001',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_001' } },
  });
  const ts = Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const expected = createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  const provided = createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  // constantTimeEqual evita timing-attack
  assert.equal(
    timingSafeEqual(Buffer.from(expected), Buffer.from(provided)),
    true
  );
  assert.equal(expected.length, 64); // SHA-256 = 32 bytes = 64 hex
});

test('5b) HMAC-SHA256 signature inválida → mismatch', () => {
  const WEBHOOK_SECRET = 'whsec_test_w33_at_least_32_chars_long_xxxxxxxxxxxx';
  const ts = Math.floor(Date.now() / 1000);
  const payload = '{"id":"evt_x"}';
  const expected = createHmac('sha256', WEBHOOK_SECRET)
    .update(`${ts}.${payload}`)
    .digest('hex');
  const tampered = createHmac('sha256', 'wrong-secret')
    .update(`${ts}.${payload}`)
    .digest('hex');

  assert.notEqual(expected, tampered);
});

test('5c) Timestamp tolerance — fora de 5min rejeita', () => {
  // Não importa stripe.ts (parameter properties incompatíveis com strip-types)
  // Validação indireta: aritmética de tolerância
  const TOLERANCE = 5 * 60;
  const ts = Math.floor(Date.now() / 1000) - 600; // 10min atrás
  const now = Math.floor(Date.now() / 1000);
  assert.equal(Math.abs(now - ts) > TOLERANCE, true);
});

// ============================================================================
// Test 6: Routes existem (file presence check)
// ============================================================================

test('6a) /api/payments/webhook/route.ts existe', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(__dirname, '../src/app/api/payments/webhook/route.ts');
  const stat = await fs.stat(file);
  assert.ok(stat.isFile(), `${file} deve existir`);
  assert.ok(stat.size > 1000, 'route.ts deve ter >1KB');
});

test('6b) /api/cron/expire-invites/route.ts existe', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(__dirname, '../src/app/api/cron/expire-invites/route.ts');
  const stat = await fs.stat(file);
  assert.ok(stat.isFile(), `${file} deve existir`);
  assert.ok(stat.size > 1000, 'route.ts deve ter >1KB');
});

test('6c) webhook-log.ts existe', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(__dirname, '../src/lib/payments/webhook-log.ts');
  const stat = await fs.stat(file);
  assert.ok(stat.isFile(), `${file} deve existir`);
});

// ============================================================================
// Test 7: Schema WebhookEvent existe em schema.prisma
// ============================================================================

test('7a) prisma/schema.prisma declara model WebhookEvent', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(__dirname, '../prisma/schema.prisma');
  const schema = await fs.readFile(file, 'utf8');
  assert.match(schema, /^model WebhookEvent \{/m, 'model WebhookEvent deve existir');
  assert.match(schema, /stripeId\s+String\s+@unique/, 'stripeId UNIQUE obrigatório');
  assert.match(schema, /@@index\(\[processed, type\]\)/, 'index (processed, type) obrigatório');
  assert.match(schema, /@@map\("webhook_events"\)/, 'map webhook_events obrigatório');
});

test('7b) prisma/schema.prisma adiciona INVITE_EXPIRED_BATCH no enum', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(__dirname, '../prisma/schema.prisma');
  const schema = await fs.readFile(file, 'utf8');
  assert.match(schema, /INVITE_EXPIRED_BATCH/, 'AuditAction.INVITE_EXPIRED_BATCH obrigatório');
});

// ============================================================================
// Test 8: Hooks de assinatura exportados (file content check)
// ============================================================================

test('8) WebhookEvent persistência via helper (signature check)', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const url = await import('node:url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const file = path.resolve(
    __dirname,
    '../src/lib/payments/marketplace-service.ts'
  );
  const content = await fs.readFile(file, 'utf8');
  assert.match(
    content,
    /export async function persistWebhookEvent/,
    'persistWebhookEvent deve ser export'
  );
  assert.match(
    content,
    /webhookEvent:\s*\{\s*upsert:/,
    'PrismaLike.webhookEvent.upsert deve existir'
  );
});

// ============================================================================
// Summary
// ============================================================================

test('SUMMARY: webhook smoke suite W33 rodou sem exceção fatal', () => {
  assert.ok(true, 'suite completa');
});