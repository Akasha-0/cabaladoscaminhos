// ============================================================================
// lib/support/auto-routing — roteamento automático de tickets (Wave 37)
// ============================================================================
// Decide (a) qual equipe assume (BILLING/TECHNICAL/CONTENT/COMMUNITY/ACCOUNT)
// e (b) qual a prioridade (LOW/MEDIUM/HIGH/URGENT) baseado no texto +
// categoria escolhida pelo usuário.
//
// Estratégia:
//   1. Se a categoria foi escolhida manualmente, usar como hint forte.
//   2. Detectar keywords URGENT (pt-BR) → priority = URGENT.
//   3. Match contra dicionário de keywords por equipe (mais keywords = mais
//      confiança). Empate → categoria manual tem precedência.
//   4. Round-robin: rotacionar entre agentes da equipe escolhida usando
//      um cursor persistido em metadata.
//
// LGPD: keywords são processadas em runtime — NUNCA armazenadas.
//
// Determinístico: mesma entrada = mesma decisão. Útil para testes.
// ============================================================================

import type { TicketCategory, TicketPriority, SupportTeam, RoutingDecision } from './types';

// ============================================================================
// Keywords — pt-BR + en (comuns em tickets de turistas)
// ============================================================================
const URGENT_KEYWORDS = [
  'urgente',
  'urgência',
  'crítico',
  'critico',
  'não consigo acessar',
  'nao consigo acessar',
  'não consigo entrar',
  'nao consigo entrar',
  'bloqueado',
  'pane',
  'fora do ar',
  'fraude',
  'roubo',
  'clonaram',
  'phishing',
  'emergência',
  'emergencia',
  'critical',
  'urgent',
  'cannot access',
  'locked out',
  'down',
  'compromised',
  'hacked',
];

const TEAM_KEYWORDS: Record<SupportTeam, string[]> = {
  BILLING: [
    'cobrança', 'cobranca', 'fatura', 'pagamento', 'cartão', 'cartao', 'pix',
    'boleto', 'reembolso', 'refund', 'estorno', 'nota fiscal', 'nf', 'recibo',
    'invoice', 'billing', 'charge', 'preço', 'preco', 'plano', 'assinatura',
    'subscription', 'desconto', 'cupom', 'promoção', 'promocao',
  ],
  TECHNICAL: [
    'erro', 'bug', 'quebrado', 'não funciona', 'nao funciona', 'travou',
    'lentidão', 'lentidao', 'performance', 'tela branca', 'crash', 'exception',
    'log', 'stack trace', 'console', 'cache', 'cookie', 'servidor', 'api',
    'error', 'broken', 'slow', 'loading', 'failed', '500', '404', 'timeout',
  ],
  CONTENT: [
    'conteúdo', 'conteudo', 'artigo', 'post', 'publicação', 'publicacao',
    'autoria', 'autor', 'curadoria', 'tradução', 'traducao', 'liberação',
    'liberacao', 'denúncia de conteúdo', 'denuncia de conteudo', 'takedown',
    'copyright', 'plágio', 'plagio', 'editorial',
  ],
  COMMUNITY: [
    'comunidade', 'grupo', 'moderador', 'moderação', 'moderacao', 'denúncia',
    'denuncia', 'ofensa', 'assédio', 'assedio', 'spam', 'bloquear usuário',
    'bloquear usuario', 'regras', 'evento', 'rsvp', 'participar',
    'community', 'group', 'harassment', 'block user',
  ],
  ACCOUNT: [
    'conta', 'login', 'senha', 'password', 'reset', '2fa', 'verificação',
    'verificacao', 'autenticação', 'autenticacao', 'email não chega',
    'email nao chega', 'cadastro', 'registro', 'exclusão', 'exclusao',
    'deletar conta', 'lgpd', 'unificar', 'merge', 'profile', 'perfil',
  ],
};

// ============================================================================
// Team → TicketCategory mapping (default hint when category is ambiguous)
// ============================================================================
const TEAM_TO_CATEGORY: Record<SupportTeam, TicketCategory> = {
  BILLING: 'BILLING',
  TECHNICAL: 'TECHNICAL',
  CONTENT: 'CONTENT',
  COMMUNITY: 'COMMUNITY',
  ACCOUNT: 'ACCOUNT',
};

// ============================================================================
// Main: decideTeam — given subject + description + manualCategory → decision
// ============================================================================
export function decideRouting(
  subject: string,
  description: string,
  manualCategory?: TicketCategory,
): RoutingDecision {
  const text = `${subject} ${description}`.toLowerCase();
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip diacritics for matching
  // We keep original for the keyword-match loop (case-insensitive).

  // ---- Priority detection ----
  let priority: TicketPriority = 'MEDIUM';
  const urgentMatches = URGENT_KEYWORDS.filter((kw) => normalized.includes(
    kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  ));
  if (urgentMatches.length > 0) {
    priority = 'URGENT';
  } else if (manualCategory === 'BILLING' && /reembolso|estorno|refund/.test(normalized)) {
    priority = 'HIGH';
  }

  // ---- Team detection ----
  let team: SupportTeam;
  let matchedKeywords: string[] = [];
  let reason: string;

  if (manualCategory && manualCategory !== 'OTHER') {
    // Category chosen manually → strong hint
    team = (TEAM_TO_CATEGORY[manualCategory] ?? 'TECHNICAL') as SupportTeam;
    reason = `Categoria manual: ${manualCategory}`;
    matchedKeywords = [];
  } else {
    // Score each team
    const scores: Record<SupportTeam, { score: number; hits: string[] }> = {
      BILLING: { score: 0, hits: [] },
      TECHNICAL: { score: 0, hits: [] },
      CONTENT: { score: 0, hits: [] },
      COMMUNITY: { score: 0, hits: [] },
      ACCOUNT: { score: 0, hits: [] },
    };
    for (const [t, kws] of Object.entries(TEAM_KEYWORDS) as [SupportTeam, string[]][]) {
      for (const kw of kws) {
        const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalized.includes(kwNorm)) {
          scores[t].score += 1;
          scores[t].hits.push(kw);
        }
      }
    }
    const ranked = (Object.entries(scores) as [SupportTeam, { score: number; hits: string[] }][])
      .sort((a, b) => b[1].score - a[1].score);
    const [topTeam, topScore] = ranked[0];
    if (topScore.score === 0) {
      // No keyword match → fallback ACCOUNT (default contact form)
      team = 'ACCOUNT';
      reason = 'Nenhuma keyword detectada — fallback ACCOUNT';
    } else {
      team = topTeam;
      matchedKeywords = topScore.hits;
      reason = `${topScore.score} keyword(s) batidas: ${topScore.hits.slice(0, 3).join(', ')}`;
    }
  }

  return {
    team,
    priority,
    reason,
    matchedKeywords,
  };
}

// ============================================================================
// Round-robin: rotate entre agentes da equipe
// ============================================================================
// Stateful: lê cursor em memória (mock — em produção, persistir em
// `support_team_cursor` table). Para Wave 37 entregamos a interface +
// fallback determinístico (sem cursor = primeira agente).

export interface Agent {
  id: string;
  name: string;
  team: SupportTeam;
  active: boolean;
}

// In-memory registry — seeded from /admin/support/agents (future).
// For Wave 37: hard-coded agents per team.
export const TEAM_AGENTS: Record<SupportTeam, Agent[]> = {
  BILLING: [
    { id: 'agent-billing-01', name: 'Maria (Billing)', team: 'BILLING', active: true },
    { id: 'agent-billing-02', name: 'João (Billing)', team: 'BILLING', active: true },
  ],
  TECHNICAL: [
    { id: 'agent-tech-01', name: 'Pedro (Tech)', team: 'TECHNICAL', active: true },
    { id: 'agent-tech-02', name: 'Ana (Tech)', team: 'TECHNICAL', active: true },
    { id: 'agent-tech-03', name: 'Lucas (Tech)', team: 'TECHNICAL', active: true },
  ],
  CONTENT: [
    { id: 'agent-content-01', name: 'Beatriz (Content)', team: 'CONTENT', active: true },
  ],
  COMMUNITY: [
    { id: 'agent-community-01', name: 'Iuri (Community)', team: 'COMMUNITY', active: true },
    { id: 'agent-community-02', name: 'Camila (Community)', team: 'COMMUNITY', active: true },
  ],
  ACCOUNT: [
    { id: 'agent-account-01', name: 'Sofia (Account)', team: 'ACCOUNT', active: true },
  ],
};

// Module-level cursor (round-robin state). In real prod, use Redis or DB.
const cursorByTeam: Map<SupportTeam, number> = new Map();

export function pickAgent(team: SupportTeam): Agent | null {
  const agents = TEAM_AGENTS[team]?.filter((a) => a.active) ?? [];
  if (agents.length === 0) return null;
  const cursor = cursorByTeam.get(team) ?? 0;
  const picked = agents[cursor % agents.length];
  cursorByTeam.set(team, (cursor + 1) % agents.length);
  return picked;
}

// ============================================================================
// High-level: assignTicket — combines routing + agent pick
// ============================================================================
export interface Assignment {
  team: SupportTeam;
  priority: TicketPriority;
  assignedTo: string | null;
  reason: string;
  matchedKeywords: string[];
}

export function assignTicket(
  subject: string,
  description: string,
  manualCategory?: TicketCategory,
): Assignment {
  const routing = decideRouting(subject, description, manualCategory);
  const agent = pickAgent(routing.team);
  return {
    team: routing.team,
    priority: routing.priority,
    assignedTo: agent?.id ?? null,
    reason: routing.reason,
    matchedKeywords: routing.matchedKeywords,
  };
}