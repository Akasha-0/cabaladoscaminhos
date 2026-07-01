// ============================================================================
// lib/support — centraliza exports do helpdesk (Wave 37)
// ============================================================================
// Layer de domínio isolada para evitar crescimento dos route handlers.
// Inclui: enums (via Prisma), canned responses, auto-routing, SLA tracking,
// CSAT surveys, email-inbound parser.
//
// LGPD Art. 7 + 18 + 37: PII handling, direito de exclusão, audit log.
// ============================================================================

// Types
export * from './types';

// Canned responses
export {
  CANNED_RESPONSES,
  searchCannedResponses,
  renderCannedResponse,
} from './canned-responses';
export type { CannedResponse } from './canned-responses';

// Auto-routing
export {
  decideRouting,
  pickAgent,
  assignTicket,
  TEAM_AGENTS,
} from './auto-routing';
export type { Agent, Assignment } from './auto-routing';

// SLA
export {
  getSlaPolicy,
  computeSlaStatus,
  detectSlaAlerts,
  buildSlaReport,
} from './sla';
export type {
  SlaContext,
  SlaAlert,
  SlaReport,
  SlaTicketSample,
} from './sla';

// CSAT
export {
  validateCsat,
  aggregateCsat,
  detectDetractors,
  buildWeeklyCsatReport,
  shouldEscalateToManager,
} from './csat';
export type {
  CsatInput,
  DetractorTicket,
  WeeklyCsatReport,
} from './csat';

// Email inbound
export {
  parseInboundEmail,
  extractReplyToken,
  normalizeEmailBody,
  verifyPostmarkSignature,
} from './email-inbound';
export type {
  PostmarkInboundPayload,
  InboundTicketInput,
} from './email-inbound';

// ============================================================================
// Helpers compartilhados
// ============================================================================

/**
 * Formata o body de uma ticket message com limit de preview (para listas).
 */
export function previewBody(body: string, max = 140): string {
  const trimmed = body.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1) + '…';
}

/**
 * Mapeia TicketStatus → label PT-BR (para UI).
 */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Novo',
    OPEN: 'Em atendimento',
    PENDING_CUSTOMER: 'Aguardando você',
    PENDING_AGENT: 'Aguardando agente',
    RESOLVED: 'Resolvido',
    CLOSED: 'Fechado',
  };
  return map[status] ?? status;
}

/**
 * Mapeia TicketPriority → cor + label (para badges).
 */
export function priorityBadge(priority: string): { color: string; label: string } {
  const map: Record<string, { color: string; label: string }> = {
    LOW: { color: 'bg-slate-100 text-slate-700', label: 'Baixa' },
    MEDIUM: { color: 'bg-blue-100 text-blue-700', label: 'Média' },
    HIGH: { color: 'bg-amber-100 text-amber-700', label: 'Alta' },
    URGENT: { color: 'bg-red-100 text-red-700', label: 'Urgente' },
  };
  return map[priority] ?? { color: 'bg-slate-100 text-slate-700', label: priority };
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    BILLING: 'Cobrança',
    TECHNICAL: 'Técnico',
    CONTENT: 'Conteúdo',
    COMMUNITY: 'Comunidade',
    ACCOUNT: 'Conta',
    OTHER: 'Outro',
  };
  return map[cat] ?? cat;
}