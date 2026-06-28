// ============================================================================
// POST /api/admin/newsletter/send — admin: enviar digest
// ============================================================================
// Auth: header x-admin-secret (env ADMIN_NEWSLETTER_SECRET) — mesma estratégia
// dos outros endpoints /api/admin/* quando não há user admin formal.
// Body: { subject: string, contentMarkdown: string, traditions?: string[] }
//
// Comportamento:
//   1. Cria registro Newsletter (rascunho se contentMarkdown vazio)
//   2. Se contentMarkdown não veio, chama composeDigest('weekly')
//   3. Chama sendNewsletter(id) — dispara ou stub
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { composeDigest, sendNewsletter } from '@/lib/email/newsletter';

export const dynamic = 'force-dynamic';

// ============================================================================
// Auth — header x-admin-secret
// ============================================================================

function isAdmin(request: NextRequest): boolean {
  const provided = request.headers.get('x-admin-secret');
  const expected = process.env.ADMIN_NEWSLETTER_SECRET;
  if (!expected) {
    // Em dev sem secret configurado, aceita em modo permissive (log warning)
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('[api/admin/newsletter/send] ADMIN_NEWSLETTER_SECRET não definido; modo dev permissive');
      return true;
    }
    return false;
  }
  return provided === expected;
}

// ============================================================================
// Validation
// ============================================================================

const SendSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  contentMarkdown: z.string().max(50_000).optional(),
  traditions: z.array(z.string().min(1).max(64)).max(20).optional(),
  composeWeekly: z.boolean().optional(), // se true e contentMarkdown ausente, compõe digest semanal
});

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = SendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { traditions = [] } = parsed.data;
    let subject = parsed.data.subject;
    let contentMarkdown = parsed.data.contentMarkdown;

    // Se não veio conteúdo e composeWeekly=true, gera via composeDigest
    if ((!contentMarkdown || !subject) && parsed.data.composeWeekly) {
      const digest = await composeDigest('weekly');
      subject = subject ?? digest.subject;
      contentMarkdown = contentMarkdown ?? digest.contentMarkdown;
    }

    if (!subject || !contentMarkdown) {
      return NextResponse.json(
        {
          error:
            'Forneça subject+contentMarkdown OU composeWeekly=true para gerar digest automaticamente',
        },
        { status: 400 }
      );
    }

    // Cria a edição (rascunho)
    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        contentMarkdown,
        traditionsFilter: traditions,
        composedBy: 'admin',
      },
    });

    // Envia (atômico: se falhar, sentAt permanece null e pode retentar)
    const result = await sendNewsletter(newsletter.id);

    return NextResponse.json({
      ok: result.ok,
      newsletterId: newsletter.id,
      subject,
      mode: result.mode,
      recipientCount: result.recipientCount,
      delivered: result.delivered,
      failed: result.failed,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch (err) {
    console.error('[api/admin/newsletter/send][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao enviar newsletter' },
      { status: 500 }
    );
  }
}
