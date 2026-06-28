// ============================================================================
// GET/POST /api/cron/weekly-digest — dispara digest semanal automaticamente
// ============================================================================
// Agendado por Vercel Cron (vercel.json) ou serviço externo para rodar
// toda segunda-feira 9h (America/Sao_Paulo).
//
// Auth: header Authorization: Bearer ${CRON_SECRET} — mesmo padrão dos outros
// /api/cron/* do projeto.
//
// Fluxo:
//   1. composeDigest('weekly') → gera markdown com top posts/artigos da semana
//   2. Cria Newsletter (rascunho) → sendNewsletter(id) → dispara ou stub
//   3. Retorna JSON com stats
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { composeDigest, sendNewsletter } from '@/lib/email/newsletter';

export const dynamic = 'force-dynamic';

// ============================================================================
// Auth — Vercel Cron envia Authorization: Bearer ${CRON_SECRET}
// ============================================================================

function isAuthorized(request: NextRequest): boolean {
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('[api/cron/weekly-digest] CRON_SECRET não definido; modo dev permissive');
      return true;
    }
    return false;
  }
  return provided === expected;
}

// ============================================================================
// Handler (GET ou POST — Vercel Cron usa GET por padrão)
// ============================================================================

async function runDigest() {
  const digest = await composeDigest('weekly');

  const newsletter = await prisma.newsletter.create({
    data: {
      subject: digest.subject,
      contentMarkdown: digest.contentMarkdown,
      traditionsFilter: [],
      composedBy: 'cron:weekly-digest',
    },
  });

  const result = await sendNewsletter(newsletter.id);

  return {
    ok: result.ok,
    newsletterId: newsletter.id,
    subject: digest.subject,
    mode: result.mode,
    recipientCount: result.recipientCount,
    delivered: result.delivered,
    failed: result.failed,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runDigest();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/cron/weekly-digest][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar digest semanal' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    const result = await runDigest();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/cron/weekly-digest][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar digest semanal' },
      { status: 500 }
    );
  }
}
