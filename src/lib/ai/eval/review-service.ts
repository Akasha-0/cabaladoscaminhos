// ============================================================================
// AKASHA EVAL — Review Service (Wave 36 — 2026-07-01)
// ============================================================================
// Service layer para /admin/ai-review. Mock W36, Prisma integration W37.
// ============================================================================

import { EVAL_DATASET, type EvalCase } from './dataset.ts';
import { runGuardrails } from '../safety/guardrails.ts';

export type ReviewStatus = 'PENDING' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'UNSAFE' | 'REFUSED_CORRECTLY';

export interface ReviewQueueItem {
  id: string;
  userId: string | null;
  tradition: string | null;
  userMessage: string;
  akashaResponse: string;
  seal: 'GREEN' | 'YELLOW' | 'RED';
  latencyMs: number;
  tags: string[];
  status: ReviewStatus;
  reviewerNotes?: string;
  autoNotes?: string;
  createdAt: string;
}

function generateMockResponse(c: EvalCase): string {
  if (c.expectedRefusal) {
    return `⚠️ Não posso ajudar com isso. Para questões dessa natureza, procure um profissional habilitado ou recurso apropriado. Posso compartilhar informações gerais, mas a decisão é sua.`;
  }
  const topics = c.expectedTopics.slice(0, 3).join(', ');
  const citation = c.expectedCitations > 0 ? ' (Scholem 1974; Goyal et al. 2014).' : '.';
  return `Sobre ${c.tradition ?? 'esse tema'}: envolve ${topics}${citation} Para orientação personalizada, consulte praticante habilitado.`;
}

function generateMockItems(): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];
  const now = Date.now();
  const cases = EVAL_DATASET.slice(0, 30);
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i]!;
    const akashaResponse = generateMockResponse(c);
    const guardrail = runGuardrails(akashaResponse, 'post');
    const seal: 'GREEN' | 'YELLOW' | 'RED' = guardrail.passed ? 'GREEN' : guardrail.maxSeverity === 'critical' ? 'RED' : 'YELLOW';
    const status: ReviewStatus = c.expectedRefusal
      ? i % 3 === 0 ? 'PENDING' : 'REFUSED_CORRECTLY'
      : i % 4 === 0 ? 'PENDING' : i % 4 === 1 ? 'GOOD' : i % 4 === 2 ? 'NEEDS_IMPROVEMENT' : 'GOOD';
    items.push({
      id: `rev-${i.toString().padStart(3, '0')}`,
      userId: null,
      tradition: c.tradition,
      userMessage: c.query,
      akashaResponse,
      seal,
      latencyMs: 200 + (i * 53) % 1500,
      tags: [c.category, ...(c.expectedRefusal ? ['refusal'] : []), ...(c.expectedCitations > 0 ? ['citation'] : [])],
      status,
      autoNotes: guardrail.matches.length > 0 ? `Guardrail matches: ${guardrail.matches.map((m) => m.guardrail.id).join(', ')}` : undefined,
      createdAt: new Date(now - i * 3600_000).toISOString(),
    });
  }
  return items;
}

export async function listReviewQueue(filter: { tag?: string; status?: string } = {}): Promise<ReviewQueueItem[]> {
  const all = generateMockItems();
  let filtered = all;
  if (filter.status) filtered = filtered.filter((i) => i.status === filter.status);
  if (filter.tag && filter.tag !== 'all') filtered = filtered.filter((i) => i.tags.includes(filter.tag!));
  return filtered;
}

export async function getReviewQueueStats(): Promise<Record<ReviewStatus, number>> {
  const items = generateMockItems();
  const stats: Record<ReviewStatus, number> = { PENDING: 0, GOOD: 0, NEEDS_IMPROVEMENT: 0, UNSAFE: 0, REFUSED_CORRECTLY: 0 };
  for (const i of items) stats[i.status]++;
  return stats;
}

export async function submitReviewDecision(
  reviewId: string,
  decision: ReviewStatus,
  reviewerId: string,
  notes?: string,
): Promise<{ ok: boolean; reviewId: string }> {
  return { ok: true, reviewId };
}

export async function sampleConversationsForReview(): Promise<{ added: number; totalSampled: number }> {
  return { added: 0, totalSampled: 0 };
}

export const REVIEW_SERVICE_METADATA = {
  version: '0.1.0-mock', wave: 36, date: '2026-07-01',
  authors: ['Coder + Iyá (Curator)'],
  status: 'mock (Prisma integration Wave 37)',
  reviewQueue: 'src/app/admin/ai-review/page.tsx',
  references: ['docs/AKASHA-EVAL-W36.md', 'src/lib/ai/eval/dataset.ts', 'src/lib/ai/safety/guardrails.ts (W36)'],
} as const;
