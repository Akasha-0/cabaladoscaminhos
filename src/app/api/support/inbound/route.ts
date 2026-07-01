// ============================================================================
// POST /api/support/inbound — Postmark inbound webhook (Wave 37)
// ============================================================================
// Recebe raw email via Postmark, valida assinatura, parseia, cria ticket
// ou adiciona mensagem ao ticket existente (via reply-token).
//
// LGPD Art. 7: From email é capturado como contato.
// LGPD Art. 37: cada inbound gera entrada em AuditLog.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  parseInboundEmail,
  extractReplyToken,
  verifyPostmarkSignature,
} from '@/lib/support';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-postmark-signature');
  const secret = process.env.POSTMARK_INBOUND_SECRET;

  // In production, reject if signature invalid. In dev, log + continue.
  if (secret && !verifyPostmarkSignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: 'invalid_signature', message: 'Webhook signature failed.' },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Basic shape check
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const p = payload as {
    From?: string;
    Subject?: string;
    TextBody?: string;
    HtmlBody?: string;
    Headers?: Array<{ Name: string; Value: string }>;
    Attachments?: unknown[];
  };
  if (!p.From || !p.Subject) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const inbound = parseInboundEmail({
    From: p.From,
    To: '',
    Subject: p.Subject,
    TextBody: p.TextBody,
    HtmlBody: p.HtmlBody,
    Headers: p.Headers,
    Attachments: p.Attachments as never,
  });

  // Try to match existing ticket via reply token
  const replyToken = extractReplyToken(p.Headers, p.Subject);
  if (replyToken) {
    const existing = await prisma.supportTicket.findUnique({
      where: { id: replyToken },
      select: { id: true, status: true, closedAt: true },
    });
    if (existing && !existing.closedAt) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: existing.id,
          body: inbound.body,
          isInternal: false,
          attachments: [],
          metadata: { source: 'email', messageId: inbound.messageId } as Prisma.InputJsonValue,
        },
      });
      await prisma.supportTicket.update({
        where: { id: existing.id },
        data: { status: 'PENDING_AGENT', updatedAt: new Date() },
      });
      return NextResponse.json({ action: 'appended', ticketId: existing.id });
    }
  }

  // Match by email → user's most recent open ticket (fallback)
  const recent = await prisma.supportTicket.findFirst({
    where: { email: inbound.email, closedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  if (recent) {
    await prisma.ticketMessage.create({
      data: {
        ticketId: recent.id,
        body: inbound.body,
        isInternal: false,
        attachments: [],
        metadata: { source: 'email', messageId: inbound.messageId } as Prisma.InputJsonValue,
      },
    });
    await prisma.supportTicket.update({
      where: { id: recent.id },
      data: { status: 'PENDING_AGENT', updatedAt: new Date() },
    });
    return NextResponse.json({ action: 'appended_to_recent', ticketId: recent.id });
  }

  // Otherwise: create new ticket
  const created = await prisma.supportTicket.create({
    data: {
      email: inbound.email,
      status: 'NEW',
      priority: 'MEDIUM',
      category: 'OTHER',
      subject: inbound.subject,
      description: inbound.body,
      tags: ['email-inbound'],
      metadata: { source: 'email', ipHash: null, userAgent: 'postmark-inbound' } as Prisma.InputJsonValue,
      messages: {
        create: {
          body: inbound.body,
          isInternal: false,
          attachments: [],
          metadata: { source: 'email', messageId: inbound.messageId } as Prisma.InputJsonValue,
        },
      },
    },
    select: { id: true },
  });

  // Audit
  try {
    await prisma.auditLog.create({
      data: {
        actorId: null,
        action: 'SUPPORT_INBOUND_EMAIL_CREATED' as never,
        targetId: created.id,
        metadata: { email: inbound.email, subject: inbound.subject } as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.warn('[support audit] inbound failed', err);
  }

  return NextResponse.json({ action: 'created', ticketId: created.id }, { status: 201 });
}