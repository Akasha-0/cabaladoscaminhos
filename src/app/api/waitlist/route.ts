// ============================================================================
// /api/waitlist — Captura de leads da landing /validacao (Wave 32, 2026-06-30)
// ============================================================================
//
// Endpoints:
//   - POST /api/waitlist         → captura novo lead (idempotent, rate-limited)
//   - GET  /api/waitlist         → stats públicos (total, remaining)
//   - PATCH /api/waitlist        → admin: confirmar, gerar invite, remover
//   - GET  /api/waitlist/export  → admin: CSV de leads
//
// Persistência: arquivo JSON local em `data/waitlist.json` (gitignored).
// - Suficiente para validar demanda nas próximas 1–2 semanas
// - Sem dependência de DB / Redis
// - Trocar por tabela Prisma é o próximo passo (deixar schema pronto)
//
// Features W32:
//   - Idempotency via email (não duplicar)
//   - Rate limit por IP (3 req/hora)
//   - Score de prioridade (tradição + confirmação + referral)
//   - Validação Zod server-side com mensagens PT-BR
//   - LGPD consent flag (obrigatório em W32+)
//   - Hook de email (chama sendEmail se RESEND_API_KEY configurada)
//   - Webhook Zapier/Make stub (configurável via env WAITLIST_WEBHOOK_URL)
//   - Analytics via events-catalog (PostHog)
//
// ============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackEvent } from '@/lib/analytics/events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// Constants
// ============================================================================

const BETA_CAPACITY = 50;
const WAVE_SIZE = [10, 20, 20] as const; // Wave 1, 2, 3
const RATE_LIMIT_PER_HOUR = 3;
const CONFIRM_TOKEN_TTL_DAYS = 7;
const INVITE_TOKEN_TTL_DAYS = 7;
const DATA_DIR = path.join(process.cwd(), 'data');
const WAITLIST_PATH = path.join(DATA_DIR, 'waitlist.json');
const RATE_LIMIT_PATH = path.join(DATA_DIR, 'waitlist-rate-limit.json');

// Tradições canônicas — alinhadas com o seletor visual do WaitlistForm
export const CANONICAL_TRADITIONS = [
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as const;
export type TraditionSlug = (typeof CANONICAL_TRADITIONS)[number];

// Score de prioridade base por tradição (maior = mais prioritário para o beta).
// Decisão editorial Wave 32: Baralho Cigano é o eixo do projeto, seguido pelas
// tradições afro-brasileiras (sub-representadas em apps).
const TRADITION_BASE_SCORE: Record<TraditionSlug, number> = {
  cigano: 10,
  candomble: 8,
  umbanda: 8,
  ifa: 8,
  cabala: 5,
  astrologia: 5,
  tantra: 5,
};

// ============================================================================
// Types
// ============================================================================

export type LeadStatus =
  | 'pending' // signup, email não confirmado
  | 'confirmed' // email confirmado
  | 'invited' // wave invite enviado
  | 'accepted' // entrou no beta (criou conta)
  | 'rejected' // recusado pelo admin
  | 'unsubscribed'; // saiu da fila

export interface WaitlistEntry {
  email: string;
  displayName?: string;
  tradition: TraditionSlug | null;
  /** Slug do perfil escolhido (ex: 'iniciante', 'praticante', 'mestre'). */
  profile?: 'iniciante' | 'praticante' | 'mestre' | 'curioso' | null;
  /** Aceita LGPD (Art. 7º, I — consentimento). */
  lgpdConsent: boolean;
  /** Aceita receber comunicações de marketing. */
  marketingConsent: boolean;
  status: LeadStatus;
  /** Score numérico para ordenação na fila. */
  score: number;
  /** Quantos amigos confirmados indicou (anti-fraud). */
  referralCount: number;
  /** Quem indicou (email do referrer, se aplicável). */
  referredBy: string | null;
  /** Token HMAC para confirmar email (null após confirmado). */
  confirmToken: string | null;
  /** Token HMAC para aceitar invite (gerado quando vira 'invited'). */
  inviteToken: string | null;
  /** ISO datetime — quando o confirmToken expira. */
  confirmExpiresAt: string | null;
  /** ISO datetime — quando o inviteToken expira. */
  inviteExpiresAt: string | null;
  /** ISO datetime da entrada na fila. */
  createdAt: string;
  /** ISO datetime da última atualização de status. */
  updatedAt: string;
  /** Origem do tráfego (utm_source, referrer, variant). */
  source?: string;
  referrer?: string;
  utm?: Record<string, string | undefined>;
  userAgent: string | null;
  ip: string | null;
}

interface WaitlistFile {
  version: 2;
  entries: WaitlistEntry[];
}

interface RateLimitBucket {
  ip: string;
  hour: string; // YYYY-MM-DDTHH (chave de bucket)
  count: number;
  firstAt: string;
}

// ============================================================================
// Validation schemas
// ============================================================================

const leadInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido').max(254),
  displayName: z.string().trim().min(1, 'Nome é obrigatório').max(80).optional(),
  tradition: z
    .enum([...CANONICAL_TRADITIONS] as [TraditionSlug, ...TraditionSlug[]])
    .nullable()
    .optional(),
  profile: z.enum(['iniciante', 'praticante', 'mestre', 'curioso']).nullable().optional(),
  lgpdConsent: z.literal(true, {
    errorMap: () => ({ message: 'É preciso aceitar a Política de Privacidade.' }),
  }),
  marketingConsent: z.boolean().optional().default(false),
  source: z.string().trim().max(64).optional(),
  referrer: z.string().trim().max(256).optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .partial()
    .optional(),
  referredBy: z.string().trim().toLowerCase().email().nullable().optional(),
});

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('confirm'),
    email: z.string().trim().toLowerCase().email(),
    confirmToken: z.string().min(16),
  }),
  z.object({
    action: z.literal('send_invite'),
    email: z.string().trim().toLowerCase().email(),
    waveNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
  z.object({
    action: z.literal('mark_accepted'),
    email: z.string().trim().toLowerCase().email(),
  }),
  z.object({
    action: z.literal('reject'),
    email: z.string().trim().toLowerCase().email(),
    reason: z.string().max(200).optional(),
  }),
  z.object({
    action: z.literal('unsubscribe'),
    email: z.string().trim().toLowerCase().email(),
  }),
]);

// ============================================================================
// File helpers
// ============================================================================

async function readWaitlist(): Promise<WaitlistFile> {
  try {
    const raw = await fs.readFile(WAITLIST_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as WaitlistFile;
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { version: 2, entries: [] };
    }
    // Migração: arquivos antigos (v1) ganham campos novos com defaults
    if (parsed.version !== 2) {
      parsed.version = 2;
      for (const e of parsed.entries) {
        e.lgpdConsent ??= false;
        e.marketingConsent ??= false;
        e.status ??= e.confirmToken ? 'confirmed' : 'pending';
        e.score ??= 0;
        e.referralCount ??= 0;
        e.referredBy ??= null;
        e.confirmToken ??= null;
        e.inviteToken ??= null;
        e.confirmExpiresAt ??= null;
        e.inviteExpiresAt ??= null;
        e.displayName ??= undefined;
        e.tradition ??= null;
        e.profile ??= null;
      }
    }
    return parsed;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return { version: 2, entries: [] };
    }
    console.error('[api/waitlist] erro lendo arquivo, recriando vazio:', err);
    return { version: 2, entries: [] };
  }
}

async function writeWaitlist(file: WaitlistFile): Promise<void> {
  await fs.mkdir(path.dirname(WAITLIST_PATH), { recursive: true });
  await fs.writeFile(WAITLIST_PATH, JSON.stringify(file, null, 2), 'utf-8');
}

async function readRateLimits(): Promise<RateLimitBucket[]> {
  try {
    const raw = await fs.readFile(RATE_LIMIT_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    return [];
  }
}

async function writeRateLimits(buckets: RateLimitBucket[]): Promise<void> {
  await fs.mkdir(path.dirname(RATE_LIMIT_PATH), { recursive: true });
  await fs.writeFile(RATE_LIMIT_PATH, JSON.stringify(buckets, null, 2), 'utf-8');
}

function extractIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return request.headers.get('x-real-ip');
}

function currentHourKey(): string {
  return new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
}

function nowIso(): string {
  return new Date().toISOString();
}

function generateToken(): string {
  // 32 bytes hex = 64 chars. Suficiente para HMAC dedup.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function calcScore(
  entry: Pick<WaitlistEntry, 'tradition' | 'status' | 'referralCount'>,
): number {
  const base = entry.tradition ? TRADITION_BASE_SCORE[entry.tradition] : 0;
  const confirmedBonus = entry.status === 'confirmed' ? 5 : 0;
  const acceptedBonus = entry.status === 'accepted' ? 20 : 0;
  const referralBonus = entry.referralCount * 3;
  // Bonus leve para tradição cigano (eixo do projeto) — desempate
  const traditionBoost = entry.tradition === 'cigano' ? 2 : 0;
  return base + confirmedBonus + acceptedBonus + referralBonus + traditionBoost;
}

// ============================================================================
// Rate limit (sliding window — 1h por IP)
// ============================================================================

async function checkAndIncrementRateLimit(ip: string | null): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: string;
}> {
  if (!ip) {
    // Sem IP (sandbox dev) — não bloqueia
    return { allowed: true, remaining: RATE_LIMIT_PER_HOUR, resetAt: '' };
  }
  const buckets = await readRateLimits();
  const hourKey = currentHourKey();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Limpa buckets com mais de 1h (sliding window mínimo)
  const active = buckets.filter((b) => b.firstAt > cutoff);
  const ipBuckets = active.filter((b) => b.ip === ip);
  const total = ipBuckets.reduce((sum, b) => sum + b.count, 0);

  const resetAt = ipBuckets[0]?.firstAt
    ? new Date(new Date(ipBuckets[0].firstAt).getTime() + 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (total >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Incrementa bucket atual
  const currentBucket = active.find((b) => b.ip === ip && b.hour === hourKey);
  if (currentBucket) {
    currentBucket.count += 1;
  } else {
    active.push({ ip, hour: hourKey, count: 1, firstAt: nowIso() });
  }
  await writeRateLimits(active);

  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_HOUR - (total + 1),
    resetAt,
  };
}

// ============================================================================
// Webhook (Zapier/Make) — fire-and-forget
// ============================================================================

async function fireWebhook(event: string, data: Record<string, unknown>): Promise<void> {
  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, timestamp: nowIso(), data }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // Webhook é best-effort. Log e segue.
    console.warn('[api/waitlist] webhook falhou (ignorado):', err);
  }
}

// ============================================================================
// Email hook (chama sendEmail se Resend estiver configurado)
// ============================================================================

async function sendWaitlistEmail(
  templateId: string,
  to: string,
  data: Record<string, unknown>,
): Promise<void> {
  // Import dinâmico para evitar bundle do client
  try {
    const { sendEmail } = await import('@/lib/email/send');
    await sendEmail({
      to,
      templateId: templateId as never,
      data,
      silent: true,
    });
  } catch (err) {
    // Falha no envio é log + webhook, mas nunca derruba o signup
    console.error('[api/waitlist] email hook falhou:', templateId, to, err);
    await fireWebhook('waitlist_email_failed', { templateId, to, error: String(err) });
  }
}

// ============================================================================
// POST — captura novo lead
// ============================================================================

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body inválido (esperava JSON).' },
      { status: 400 },
    );
  }

  const parsed = leadInputSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Dados inválidos.';
    return NextResponse.json(
      { ok: false, error: firstIssue, issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ip = extractIp(request);
  const rl = await checkAndIncrementRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Muitas tentativas. Tente novamente em alguns minutos.',
        retryAfter: rl.resetAt,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((new Date(rl.resetAt).getTime() - Date.now()) / 1000)) },
      },
    );
  }

  const file = await readWaitlist();
  const existingIdx = file.entries.findIndex((e) => e.email === parsed.data.email);

  // Idempotency: se já existe, retorna a posição atual
  if (existingIdx >= 0) {
    const existing = file.entries[existingIdx];
    // Recalcula posição baseada em score (desc)
    const ranked = [...file.entries].sort((a, b) => b.score - a.score);
    const position = ranked.findIndex((e) => e.email === existing.email) + 1;
    void trackEvent({
      name: 'waitlist_already_joined',
      properties: { email_hash: hashEmail(existing.email), source: existing.source ?? null },
    });
    return NextResponse.json({
      ok: true,
      alreadyRegistered: true,
      position,
      total: file.entries.length,
      capacity: BETA_CAPACITY,
      status: existing.status,
    });
  }

  // Beta capacity check — se lotou, ainda aceita (vai pra fila geral pós-wave)
  const fileIsFull = file.entries.length >= BETA_CAPACITY;

  const confirmToken = generateToken();
  const confirmExpiresAt = new Date(
    Date.now() + CONFIRM_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const newEntry: WaitlistEntry = {
    email: parsed.data.email,
    displayName: parsed.data.displayName,
    tradition: (parsed.data.tradition ?? null) as TraditionSlug | null,
    profile: (parsed.data.profile ?? null) as WaitlistEntry['profile'],
    lgpdConsent: parsed.data.lgpdConsent,
    marketingConsent: parsed.data.marketingConsent ?? false,
    status: 'pending',
    score: 0,
    referralCount: 0,
    referredBy: parsed.data.referredBy ?? null,
    confirmToken,
    inviteToken: null,
    confirmExpiresAt,
    inviteExpiresAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    source: parsed.data.source,
    referrer: parsed.data.referrer,
    utm: parsed.data.utm as Record<string, string | undefined> | undefined,
    userAgent: request.headers.get('user-agent'),
    ip,
  };
  newEntry.score = calcScore(newEntry);
  file.entries.push(newEntry);

  // Se referredBy existir e for um lead confirmado, incrementa referralCount
  if (newEntry.referredBy) {
    const referrerEntry = file.entries.find((e) => e.email === newEntry.referredBy);
    if (referrerEntry) {
      referrerEntry.referralCount += 1;
      referrerEntry.score = calcScore(referrerEntry);
      referrerEntry.updatedAt = nowIso();
    }
  }

  await writeWaitlist(file);

  // Ranking atual
  const ranked = [...file.entries].sort((a, b) => b.score - a.score);
  const position = ranked.findIndex((e) => e.email === newEntry.email) + 1;

  // Tracking
  console.log(
    `[waitlist] novo signup #${position} email=${hashEmail(newEntry.email)} source=${newEntry.source ?? 'n/a'} ip=${ip ?? 'n/a'}`,
  );
  void trackEvent({
    name: 'waitlist_joined',
    properties: {
      position,
      tradition: newEntry.tradition,
      profile: newEntry.profile,
      score: newEntry.score,
      full_at_signup: fileIsFull,
      source: newEntry.source ?? null,
      email_hash: hashEmail(newEntry.email),
    },
  });
  await fireWebhook('waitlist_joined', {
    email: hashEmail(newEntry.email), // nunca enviar email cru em webhook
    position,
    tradition: newEntry.tradition,
    score: newEntry.score,
    full: fileIsFull,
  });

  // Email hook (welcome com link de confirmação)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.com.br';
  const confirmUrl = `${siteUrl}/validacao/confirmar?email=${encodeURIComponent(newEntry.email)}&token=${confirmToken}`;
  void sendWaitlistEmail('waitlist-welcome', newEntry.email, {
    displayName: newEntry.displayName,
    tradition: newEntry.tradition ?? 'cigano',
    position,
    total: file.entries.length,
    confirmUrl,
    exploreUrl: siteUrl,
    nextWaveEta: '15 dias',
  });

  return NextResponse.json({
    ok: true,
    alreadyRegistered: false,
    position,
    total: file.entries.length,
    capacity: BETA_CAPACITY,
    full: fileIsFull,
    status: 'pending',
    score: newEntry.score,
  });
}

// ============================================================================
// GET — stats públicos
// ============================================================================

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const adminToken = url.searchParams.get('admin_token');
  const isAdmin = adminToken && adminToken === process.env.ADMIN_API_TOKEN;

  const file = await readWaitlist();
  const ranked = [...file.entries].sort((a, b) => b.score - a.score);

  // Stats agregadas (sempre públicas)
  const traditionCounts = new Map<string, number>();
  const statusCounts = new Map<LeadStatus, number>();
  let confirmedCount = 0;
  for (const e of ranked) {
    traditionCounts.set(e.tradition ?? 'nao-declarada', (traditionCounts.get(e.tradition ?? 'nao-declarada') ?? 0) + 1);
    statusCounts.set(e.status, (statusCounts.get(e.status) ?? 0) + 1);
    if (e.status === 'confirmed' || e.status === 'invited' || e.status === 'accepted') {
      confirmedCount++;
    }
  }

  const publicPayload = {
    total: file.entries.length,
    capacity: BETA_CAPACITY,
    remaining: Math.max(0, BETA_CAPACITY - file.entries.length),
    confirmed: confirmedCount,
    conversionRate: file.entries.length > 0 ? confirmedCount / file.entries.length : 0,
    topTraditions: Array.from(traditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tradition, count]) => ({ tradition, count })),
    waves: WAVE_SIZE.map((size, i) => ({
      wave: i + 1,
      size,
      filled: ranked.filter((e) => e.score >= (i === 0 ? 35 : i === 1 ? 20 : 0)).slice(0, size).length,
    })),
  };

  if (!isAdmin) {
    // Payload público sem PII
    return NextResponse.json({
      ...publicPayload,
      recent: ranked.slice(-5).map((e) => ({
        position: ranked.indexOf(e) + 1,
        tradition: e.tradition,
        createdAt: e.createdAt,
      })),
    });
  }

  // Admin: payload completo com leads (para o dashboard /admin/waitlist)
  return NextResponse.json({
    ...publicPayload,
    leads: ranked.map((e, idx) => ({
      position: idx + 1,
      email: e.email,
      displayName: e.displayName,
      tradition: e.tradition,
      profile: e.profile,
      status: e.status,
      score: e.score,
      referralCount: e.referralCount,
      referredBy: e.referredBy,
      lgpdConsent: e.lgpdConsent,
      marketingConsent: e.marketingConsent,
      source: e.source,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  });
}

// ============================================================================
// PATCH — admin actions (confirm, send_invite, mark_accepted, reject, unsubscribe)
// ============================================================================
// - 'confirm' é self-service (não requer admin token) — vem do link do email
// - Outras actions requerem x-admin-token = process.env.ADMIN_API_TOKEN
// ============================================================================

export async function PATCH(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido.' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Ação inválida.' },
      { status: 400 },
    );
  }

  // Self-service: 'confirm' NÃO requer admin token.
  // Demais ações (send_invite, mark_accepted, reject, unsubscribe) exigem admin.
  const isSelfConfirm = parsed.data.action === 'confirm';
  const adminToken = request.headers.get('x-admin-token');
  if (!isSelfConfirm) {
    if (!adminToken || adminToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
    }
  }

  const file = await readWaitlist();
  const idx = file.entries.findIndex((e) => e.email === parsed.data.email);
  if (idx < 0) {
    return NextResponse.json({ ok: false, error: 'Email não encontrado na fila.' }, { status: 404 });
  }
  const entry = file.entries[idx];

  switch (parsed.data.action) {
    case 'confirm': {
      if (entry.confirmToken !== parsed.data.confirmToken) {
        return NextResponse.json({ ok: false, error: 'Token de confirmação inválido.' }, { status: 400 });
      }
      if (entry.confirmExpiresAt && new Date(entry.confirmExpiresAt) < new Date()) {
        return NextResponse.json({ ok: false, error: 'Token de confirmação expirado.' }, { status: 410 });
      }
      entry.status = 'confirmed';
      entry.confirmToken = null; // invalida após uso
      entry.updatedAt = nowIso();
      entry.score = calcScore(entry);
      void trackEvent({ name: 'waitlist_confirmed', properties: { email_hash: hashEmail(entry.email) } });
      await fireWebhook('waitlist_confirmed', { email: hashEmail(entry.email) });
      await writeWaitlist(file);
      return NextResponse.json({ ok: true, status: entry.status, score: entry.score });
    }

    case 'send_invite': {
      if (entry.status !== 'confirmed') {
        return NextResponse.json(
          { ok: false, error: 'Só é possível convidar leads confirmados.' },
          { status: 400 },
        );
      }
      const inviteToken = generateToken();
      const inviteExpiresAt = new Date(
        Date.now() + INVITE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();
      entry.inviteToken = inviteToken;
      entry.inviteExpiresAt = inviteExpiresAt;
      entry.status = 'invited';
      entry.updatedAt = nowIso();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.com.br';
      const accessUrl = `${siteUrl}/api/waitlist/accept-invite?email=${encodeURIComponent(entry.email)}&token=${inviteToken}`;
      void sendWaitlistEmail('waitlist-wave-invite', entry.email, {
        displayName: entry.displayName ?? entry.email.split('@')[0],
        waveNumber: parsed.data.waveNumber,
        waveSize: WAVE_SIZE[parsed.data.waveNumber - 1],
        tradition: entry.tradition ?? 'cigano',
        accessUrl,
        communityUrl: siteUrl,
        feedbackUrl: `${siteUrl}/feedback`,
      });
      void trackEvent({
        name: 'invite_sent',
        properties: {
          wave: parsed.data.waveNumber,
          tradition: entry.tradition,
          email_hash: hashEmail(entry.email),
        },
      });
      await fireWebhook('invite_sent', {
        email: hashEmail(entry.email),
        wave: parsed.data.waveNumber,
      });
      await writeWaitlist(file);
      return NextResponse.json({ ok: true, status: entry.status, accessUrl });
    }

    case 'mark_accepted': {
      if (entry.status !== 'invited') {
        return NextResponse.json(
          { ok: false, error: 'Lead precisa estar em status invited.' },
          { status: 400 },
        );
      }
      entry.status = 'accepted';
      entry.inviteToken = null;
      entry.updatedAt = nowIso();
      entry.score = calcScore(entry);
      void trackEvent({ name: 'invite_accepted', properties: { email_hash: hashEmail(entry.email) } });
      await fireWebhook('invite_accepted', { email: hashEmail(entry.email) });
      await writeWaitlist(file);
      return NextResponse.json({ ok: true, status: entry.status });
    }

    case 'reject': {
      entry.status = 'rejected';
      entry.confirmToken = null;
      entry.inviteToken = null;
      entry.updatedAt = nowIso();
      void trackEvent({
        name: 'waitlist_rejected',
        properties: { email_hash: hashEmail(entry.email), reason: parsed.data.reason ?? null },
      });
      await writeWaitlist(file);
      return NextResponse.json({ ok: true, status: entry.status });
    }

    case 'unsubscribe': {
      entry.status = 'unsubscribed';
      entry.confirmToken = null;
      entry.inviteToken = null;
      entry.updatedAt = nowIso();
      void trackEvent({ name: 'waitlist_unsubscribed', properties: { email_hash: hashEmail(entry.email) } });
      await writeWaitlist(file);
      return NextResponse.json({ ok: true, status: entry.status });
    }

    default: {
      const _exhaustive: never = parsed.data;
      return NextResponse.json({ ok: false, error: 'Ação desconhecida.' }, { status: 400 });
    }
  }
}

// ============================================================================
// Helpers
// ============================================================================

/** Hash do email para analytics (LGPD — nunca logar email cru). */
function hashEmail(email: string): string {
  // SHA-256 simples com substring (não-criptográfico, suficiente para dedup)
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  }
  return `h_${Math.abs(h).toString(36)}`;
}