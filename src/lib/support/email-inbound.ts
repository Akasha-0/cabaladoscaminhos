// ============================================================================
// lib/support/email-inbound — inbound email → ticket (Wave 37)
// ============================================================================
// Postmark inbound webhook parses `From`, `Subject`, `TextBody`, `HtmlBody`
// and creates (or appends to) a ticket.
//
//   - From: support@cabaladoscaminhos.com.br → ticketReplyToken match
//
// LGPD Art. 7: From email is captured as user contact if no userId match.
// LGPD Art. 37: every inbound email writes to AuditLog.
//
// Wave 37 entrega:
//   - parseInboundEmail(rawPayload): normaliza Postmark payload → ticket input
//   - extractReplyToken(headers): identifica thread de reply
//   - normalizeEmailBody(body): quote stripping + signature cleanup
// ============================================================================

// ============================================================================
// Postmark inbound shape (subset)
// ============================================================================
export interface PostmarkInboundPayload {
  From: string;
  FromName?: string;
  To: string;
  Subject: string;
  TextBody?: string;
  HtmlBody?: string;
  MessageID?: string;
  Date?: string;
  Headers?: Array<{ Name: string; Value: string }>;
  Attachments?: Array<{
    Name: string;
    Content: string; // base64
    ContentType: string;
    ContentLength: number;
  }>;
}

// ============================================================================
// Normalized ticket input
// ============================================================================
export interface InboundTicketInput {
  email: string;
  emailName: string | null;
  subject: string;
  body: string;
  messageId: string | null;
  inReplyTo: string | null;
  receivedAt: Date;
  attachments: Array<{ name: string; contentType: string; sizeBytes: number }>;
}

// ============================================================================
// Parse Postmark payload → InboundTicketInput
// ============================================================================
export function parseInboundEmail(payload: PostmarkInboundPayload): InboundTicketInput {
  // From format: "Name <email@example.com>" or "email@example.com"
  const fromMatch = payload.From.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/) ?? null;
  const emailName = fromMatch?.[1]?.trim() ?? payload.FromName?.trim() ?? null;
  const email = (fromMatch?.[2] ?? payload.From).trim().toLowerCase();

  const body = normalizeEmailBody(payload.TextBody ?? stripHtml(payload.HtmlBody ?? ''));

  const inReplyTo = extractHeader(payload.Headers, 'In-Reply-To') ?? null;
  const messageId = payload.MessageID ?? null;

  return {
    email,
    emailName: emailName || null,
    subject: payload.Subject?.trim() ?? '(sem assunto)',
    body,
    messageId,
    inReplyTo,
    receivedAt: payload.Date ? new Date(payload.Date) : new Date(),
    attachments: (payload.Attachments ?? []).map((a) => ({
      name: a.Name,
      contentType: a.ContentType,
      sizeBytes: a.ContentLength,
    })),
  };
}

// ============================================================================
// Reply-token extraction (we inject `support-ref: <ticketId>` in outgoing
// emails; inbound client replies preserve it via In-Reply-To header or
// embedded in subject `[#abc123]`).
// ============================================================================
export function extractReplyToken(headers: PostmarkInboundPayload['Headers'], subject: string): string | null {
  // Pattern 1: In-Reply-To header value contains "<ticketId@cabala>"
  const inReplyTo = extractHeader(headers, 'In-Reply-To');
  if (inReplyTo) {
    const m = inReplyTo.match(/<([a-z0-9]{20,})@/i);
    if (m) return m[1];
  }
  // Pattern 2: Subject contains [#<id>]
  const subjMatch = subject.match(/\[#([a-z0-9]{20,})\]/i);
  if (subjMatch) return subjMatch[1];
  return null;
}

// ============================================================================
// Email body cleanup — strip quotes + signatures
// ============================================================================
export function normalizeEmailBody(raw: string): string {
  let text = raw;
  // Strip "On <date>, <name> wrote:" blocks (English clients)
  text = text.replace(/^>+\s.*$/gm, '');
  text = text.replace(/On\s.+wrote:\s*$/gm, '');
  text = text.replace(/Em\s.+\nescreveu:\s*$/gm, ''); // pt-BR
  // Strip common signature markers
  text = text.replace(/^--\s*$/m, '\n[signature]\n');
  text = text.replace(/^_{2,}$/m, '\n[signature]\n');
  // Trim multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

// ============================================================================
// Helpers
// ============================================================================
function extractHeader(headers: PostmarkInboundPayload['Headers'], name: string): string | null {
  if (!headers) return null;
  const h = headers.find((x) => x.Name.toLowerCase() === name.toLowerCase());
  return h?.Value?.trim() ?? null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// ============================================================================
// Verify Postmark webhook signature (HMAC sha256)
// ============================================================================
// Header: `X-Postmark-Signature: <base64>`
// Secret: process.env.POSTMARK_INBOUND_SECRET
//
// We DO NOT crash if env var is missing — return false and log instead.
// ============================================================================
export function verifyPostmarkSignature(
  rawBody: string,
  signature: string | null,
  secret?: string,
): boolean {
  if (!signature || !secret) {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.warn('[email-inbound] signature verification skipped (missing secret or header)');
    }
    return false;
  }
  // Lazy import crypto (Node runtime)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHmac } = require('crypto') as typeof import('crypto');
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  return timingSafeEqual(signature, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}