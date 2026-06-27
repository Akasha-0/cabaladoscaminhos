// ============================================================================
// /api/waitlist — Captura de emails da landing /validacao
// ============================================================================
//
// Persistência: arquivo JSON local em `data/waitlist.json` (gitignored).
// - Suficiente para validar demanda nas próximas 1–2 semanas
// - Sem dependência de DB / Redis
// - Trocar por tabela Prisma + e-mail transacional é o próximo passo
//   quando o sinal for positivo (ver docs/VALIDACAO-LANDING.md)
//
// Rate limiting já é aplicado pelo middleware.ts global (100 req/min por IP).
// ============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BETA_CAPACITY = 50;

const waitlistInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
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
});

interface WaitlistEntry {
  email: string;
  source?: string;
  referrer?: string;
  utm?: Record<string, string | undefined>;
  createdAt: string;
  userAgent: string | null;
  ip: string | null;
}

interface WaitlistFile {
  entries: WaitlistEntry[];
}

const WAITLIST_PATH = path.join(process.cwd(), 'data', 'waitlist.json');

async function readWaitlist(): Promise<WaitlistFile> {
  try {
    const raw = await fs.readFile(WAITLIST_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as WaitlistFile;
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { entries: [] };
    }
    return parsed;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return { entries: [] };
    }
    // Se o arquivo estiver corrompido, recomeça vazio em vez de derrubar o endpoint
    console.error('[api/waitlist] erro lendo arquivo, recriando vazio:', err);
    return { entries: [] };
  }
}

async function writeWaitlist(file: WaitlistFile): Promise<void> {
  await fs.mkdir(path.dirname(WAITLIST_PATH), { recursive: true });
  await fs.writeFile(WAITLIST_PATH, JSON.stringify(file, null, 2), 'utf-8');
}

function extractIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return request.headers.get('x-real-ip');
}

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

  const parsed = waitlistInputSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Dados inválidos.';
    return NextResponse.json(
      { ok: false, error: firstIssue },
      { status: 400 },
    );
  }

  const file = await readWaitlist();
  const alreadyRegistered = file.entries.some(
    (e) => e.email === parsed.data.email,
  );

  if (!alreadyRegistered && file.entries.length >= BETA_CAPACITY) {
    return NextResponse.json(
      {
        ok: false,
        error: `Beta lotado (${BETA_CAPACITY} vagas). Entre na lista geral para próxima turma.`,
        full: true,
      },
      { status: 409 },
    );
  }

  let position: number;
  if (alreadyRegistered) {
    position = file.entries.findIndex((e) => e.email === parsed.data.email) + 1;
  } else {
    const entry: WaitlistEntry = {
      email: parsed.data.email,
      source: parsed.data.source,
      referrer: parsed.data.referrer,
      utm: parsed.data.utm as Record<string, string | undefined> | undefined,
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: extractIp(request),
    };
    file.entries.push(entry);
    await writeWaitlist(file);
    position = file.entries.length;

    // Log estruturado simples — útil para acompanhar conversão no stdout
    console.log(
      `[waitlist] novo signup #${position} source=${parsed.data.source ?? 'n/a'} ip=${entry.ip ?? 'n/a'}`,
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyRegistered,
    position,
    total: file.entries.length,
    capacity: BETA_CAPACITY,
  });
}

export async function GET() {
  const file = await readWaitlist();
  return NextResponse.json({
    total: file.entries.length,
    capacity: BETA_CAPACITY,
    remaining: Math.max(0, BETA_CAPACITY - file.entries.length),
    recent: file.entries.slice(-10).map((e) => ({
      email: e.email.replace(/^(.{2}).+(@.+)$/, '$1***$2'),
      createdAt: e.createdAt,
      source: e.source,
    })),
  });
}