// ============================================================================
// PII-safe logging helpers para webhooks Stripe (Wave 33, 2026-07-01)
// ============================================================================
// LGPD Art. 7, 18, 37 — webhooks carregam PII do customer/recipient em
// payload.metadata, payment_method_details, billing_details etc. Logs em
// console e persistidos no banco DEVEM ser sanitizados.
//
// Padrão:
//   - email  → a***@d***.com (mantém domínio pra debug)
//   - phone  → +55*****1234 (mantém DDI + últimos 4)
//   - name   → "J*** D***" (mantém iniciais)
//   - PAN    → nunca logar (Stripe envia last4 + brand apenas)
//
// Usado por: webhook route, PaymentAuditLog.metadata.lite, WebhookEvent.metadata
// ============================================================================

/**
 * Mascara email mantendo primeira letra + domínio mascarado.
 * Ex: "joao.silva@gmail.com" → "j*****@g****.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '[no-email]';
  const atIdx = email.indexOf('@');
  if (atIdx <= 0) return '[invalid-email]';
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  // Não mascara se já tem 1 char (já é o mínimo representável)
  const maskedLocal =
    local.length <= 1
      ? local
      : `${local[0]}${'*'.repeat(local.length - 1)}`;
  const dotIdx = domain.lastIndexOf('.');
  const maskedDomain =
    dotIdx > 0
      ? `${domain[0]}${'*'.repeat(dotIdx - 1)}${domain.slice(dotIdx)}`
      : domain.length <= 1
        ? domain
        : `${domain[0]}${'*'.repeat(domain.length - 1)}`;
  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Mascara phone mantendo DDI + últimos 4 dígitos.
 * Ex: "+5511987654321" → "+55*****4321"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '[no-phone]';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '[invalid-phone]';
  const tail = digits.slice(-4);
  const ddi = digits.slice(0, 2); // BR default
  return `+${ddi}*****${tail}`;
}

/**
 * Mascara nome mantendo apenas iniciais.
 * Ex: "João da Silva" → "J*** D*** S*****"
 */
export function maskName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '[no-name]';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '[no-name]';
  return parts
    .map((p, i) => {
      const first = p[0]?.toUpperCase() ?? '*';
      // Última palavra: mostra tamanho pra distinguir
      const tail =
        i === parts.length - 1 ? '*'.repeat(Math.max(p.length - 1, 1)) : '***';
      return `${first}${tail}`;
    })
    .join(' ');
}

/**
 * Strip recursivo de campos PII conhecidos em payload Stripe.
 * Não é exaustivo — Stripe adiciona campos novos sem aviso. Defesa em
 * profundidade: também NÃO logar payload cru em console.
 */
export function stripPiiFromStripePayload(
  payload: unknown,
  maxDepth = 4
): unknown {
  if (maxDepth <= 0) return '[truncated]';
  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'object') return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => stripPiiFromStripePayload(item, maxDepth - 1));
  }

  const obj = payload as Record<string, unknown>;
  const SCALAR_PII_KEYS = new Set([
    'email',
    'phone',
    'phone_number',
    'name',
    'address_line1',
    'address_line2',
    'ip',
    'ip_address',
    'ssn_last_4',
    'tax_id',
    'personal_id_number',
  ]);
  const OBJECT_PII_KEYS = new Set([
    // Objetos que DEVEM ser recursados (têm PII dentro)
    'billing_details',
    'shipping',
    'shipping_details',
    'payment_method_details',
    'customer',
    'recipient',
  ]);
  const lite: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SCALAR_PII_KEYS.has(key) && typeof value === 'string') {
      if (key === 'email') lite[key] = maskEmail(value);
      else if (key === 'phone' || key === 'phone_number')
        lite[key] = maskPhone(value);
      else if (key === 'name') lite[key] = maskName(value);
      else lite[key] = '[redacted]';
    } else if (OBJECT_PII_KEYS.has(key) && typeof value === 'object') {
      // Recursa no objeto, mas seus campos PII serão stripped pelo próximo nível
      lite[key] = stripPiiFromStripePayload(value, maxDepth - 1);
    } else {
      lite[key] = stripPiiFromStripePayload(value, maxDepth - 1);
    }
  }
  return lite;
}