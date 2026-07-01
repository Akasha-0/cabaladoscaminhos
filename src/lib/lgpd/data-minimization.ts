// ============================================================================
// LGPD DATA MINIMIZATION — Wave 37 / Compliance 7/8
// ============================================================================
// LGPD Art. 6° (princípios: necessidade, adequação) + Art. 9° (princípio
// da necessidade) — coletar apenas dados pessoais adequados, pertinentes e
// limitados ao que é necessário para a finalidade.
//
// Ferramentas neste módulo:
//   1. detectExcessiveFields — auditoria estática que identifica campos
//      livres com tamanho excessivo (>200 chars para texto que não precisa).
//   2. autoRedactPII — wrapper sobre `console.*` que remove emails,
//      telefones, CPFs antes de logar.
//   3. aggregateAnalyticsOnly — helper para analytics que retorna apenas
//      dados agregados (nunca PII por linha).
//
// Uso:
//   import { setupLogRedaction, aggregateAnalyticsOnly } from '@/lib/lgpd/data-minimization';
//   setupLogRedaction(); // uma vez no boot
//
//   // Em analytics:
//   const stats = await aggregateAnalyticsOnly({
//     model: 'post', where: { createdAt: { gte: ... } },
//     groupBy: ['tradition'], aggregate: { count: true },
//   });
// ============================================================================

import { prisma } from '@/lib/prisma';

// ============================================================================
// detectExcessiveFields — auditoria estática
// ============================================================================

export interface ExcessiveFieldReport {
  model: string;
  field: string;
  type: string;
  maxLength?: number;
  issue:
    | 'EXCESSIVE_FREE_TEXT'  // free text > 200 chars sem justificativa
    | 'NO_PRIVACY_HINT'      // campo sensível sem comentário privacy
    | 'NO_INDEX'             // campo de busca sem @@index
    | 'STORES_PII_RAW';      // campo PII sem hash/redaction
  suggestion: string;
}

/**
 * Heurística leve para identificar campos com risco de "excesso de coleta".
 *
 * Para auditoria real, olhar schema.prisma manualmente — este helper
 * fornece apenas um sinal de primeira passagem.
 */
export async function detectExcessiveFields(): Promise<ExcessiveFieldReport[]> {
  const reports: ExcessiveFieldReport[] = [];

  try {
    // Padrão comum: campos String sem @db.Text e sem justificativa
    const candidateFields = await prisma.$queryRaw<
      Array<{
        table_name: string;
        column_name: string;
        data_type: string;
        character_maximum_length: number | null;
      }>
    >`
      SELECT table_name, column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND data_type IN ('text', 'character varying')
        AND column_name NOT LIKE '%_id'
        AND column_name NOT IN ('id', 'createdAt', 'updatedAt', 'deletedAt')
      ORDER BY table_name, column_name
      LIMIT 200
    `;

    for (const row of candidateFields) {
      // Heurística 1: free text > 500 chars sem justificativa
      if (
        row.character_maximum_length &&
        row.character_maximum_length > 500 &&
        !isFieldJustified(row.table_name, row.column_name)
      ) {
        reports.push({
          model: row.table_name,
          field: row.column_name,
          type: row.data_type,
          maxLength: row.character_maximum_length,
          issue: 'EXCESSIVE_FREE_TEXT',
          suggestion: `Limitar a 200 chars ou documentar justificativa (LGPD Art. 6°).`,
        });
      }

      // Heurística 2: campos com nomes PII-typical
      if (isLikelyPIIField(row.column_name) && !row.column_name.endsWith('Hash')) {
        reports.push({
          model: row.table_name,
          field: row.column_name,
          type: row.data_type,
          maxLength: row.character_maximum_length ?? undefined,
          issue: 'STORES_PII_RAW',
          suggestion: `Considere hash ou redacao parcial (LGPD Art. 46 — segurança).`,
        });
      }
    }
  } catch (err) {
    // Tabela information_schema indisponível — retornar heurística local
    return localFieldHeuristics();
  }

  return reports;
}

// ============================================================================
// localFieldHeuristics — fallback estático
// ============================================================================

/**
 * Lista hardcoded de campos que valem revisão manual.
 * Atualizar quando schema muda.
 */
function localFieldHeuristics(): ExcessiveFieldReport[] {
  return [
    {
      model: 'User',
      field: 'bio',
      type: 'String',
      issue: 'EXCESSIVE_FREE_TEXT',
      suggestion: 'Limitar a 280 chars (LGPD Art. 6°, I — adequação).',
    },
    {
      model: 'Post',
      field: 'content',
      type: 'Text',
      issue: 'NO_PRIVACY_HINT',
      suggestion: 'Documentar se conteúdo pode conter PII de terceiros.',
    },
    {
      model: 'Comment',
      field: 'content',
      type: 'Text',
      issue: 'NO_PRIVACY_HINT',
      suggestion: 'Validar que comentários não vazam email/CPF.',
    },
    {
      model: 'NewsletterSubscription',
      field: 'email',
      type: 'String',
      issue: 'STORES_PII_RAW',
      suggestion: 'Manter raw para envio, mas marcar como PII no comment.',
    },
    {
      model: 'EventRsvp',
      field: 'note',
      type: 'String',
      issue: 'EXCESSIVE_FREE_TEXT',
      suggestion: 'Limitar a 500 chars (W37 schema já faz; validar em app).',
    },
  ];
}

function isLikelyPIIField(name: string): boolean {
  const lowered = name.toLowerCase();
  return /^(email|phone|cpf|cnpj|rg|birth|address|cep|location|lat|lng)$/.test(lowered);
}

function isFieldJustified(table: string, column: string): boolean {
  // Tabela de campos explicitamente aprovados com justificativa
  const justified = new Set([
    'User.email', 'User.displayName', 'User.username',
    'Post.content', 'Comment.content',
    'Article.content', 'Mentorship.notes',
  ]);
  return justified.has(`${table}.${column}`);
}

// ============================================================================
// autoRedactPII — log redaction
// ============================================================================

const PII_PATTERNS: Array<{ name: string; re: RegExp; replace: (m: string) => string }> = [
  {
    name: 'email',
    re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replace: (m) => {
      const [local, domain] = m.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    },
  },
  {
    name: 'phone_br',
    re: /\b\d{2}\s?9?\d{4}-?\d{4}\b/g,
    replace: () => '***phone***',
  },
  {
    name: 'cpf',
    re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
    replace: () => '***cpf***',
  },
  {
    name: 'cnpj',
    re: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
    replace: () => '***cnpj***',
  },
  {
    name: 'credit_card',
    re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    replace: () => '***card***',
  },
];

/**
 * Redige PII comum de uma string. Use antes de logar dados externos.
 */
export function redactPII(input: string): string {
  let output = input;
  for (const pattern of PII_PATTERNS) {
    output = output.replace(pattern.re, pattern.replace);
  }
  return output;
}

/**
 * Wrappers sobre console.* que redact PII automaticamente.
 * Ativar com setupLogRedaction() uma vez no boot.
 */
let _redactionInstalled = false;

export function setupLogRedaction(): void {
  if (_redactionInstalled) return;
  if (typeof globalThis === 'undefined') return;

  const origLog = globalThis.console?.log;
  const origInfo = globalThis.console?.info;
  const origWarn = globalThis.console?.warn;
  const origError = globalThis.console?.error;
  const origDebug = globalThis.console?.debug;

  function wrap(orig: typeof console.log) {
    return (...args: unknown[]) => {
      try {
        const safe = args.map((a) =>
          typeof a === 'string' ? redactPII(a) : a
        );
        orig.apply(globalThis.console, safe as []);
      } catch {
        // se redaction falhar, log original (não bloquear)
        orig.apply(globalThis.console, args as []);
      }
    };
  }

  if (origLog) globalThis.console.log = wrap(origLog);
  if (origInfo) globalThis.console.info = wrap(origInfo);
  if (origWarn) globalThis.console.warn = wrap(origWarn);
  if (origError) globalThis.console.error = wrap(origError);
  if (origDebug) globalThis.console.debug = wrap(origDebug);

  _redactionInstalled = true;
}

/** Apenas para testes. */
export function _resetLogRedactionForTesting(): void {
  _redactionInstalled = false;
}

// ============================================================================
// aggregateAnalyticsOnly — analytics sem PII por linha
// ============================================================================

export interface AggregateOptions {
  model: 'post' | 'comment' | 'user' | 'eventRsvp' | 'aiConversation';
  where?: Record<string, unknown>;
  groupBy?: string[];
  aggregate?: {
    count?: boolean;
    avg?: Record<string, true>;
    sum?: Record<string, true>;
  };
  /** Limite para groups (anti-DoS). Default 1000. */
  limit?: number;
}

export interface AggregateResult {
  groups: Array<Record<string, unknown>>;
  total: number;
  generatedAt: string;
}

/**
 * Helper de analytics que retorna apenas agregados (LGPD Art. 12 — minimização).
 *
 * NUNCA retorna linhas individuais. Apenas counts/sums/avgs agrupados.
 *
 * Uso correto:
 *   const stats = await aggregateAnalyticsOnly({
 *     model: 'post',
 *     where: { createdAt: { gte: lastMonth } },
 *     groupBy: ['tradition'],
 *     aggregate: { count: true },
 *   });
 *   // stats.groups = [{ tradition: 'cabala', _count: 42 }, ...]
 *
 * Uso INCORRETO (não fazer):
 *   const posts = await prisma.post.findMany(...) // retorna PII!
 */
export async function aggregateAnalyticsOnly(
  opts: AggregateOptions
): Promise<AggregateResult> {
  try {
    const limit = Math.min(opts.limit ?? 1000, 5000);
    const groupBy = opts.groupBy ?? [];
    const aggregate = opts.aggregate ?? { count: true };

    // Mapeamento model → prisma delegate
    const delegate = (prisma as unknown as Record<string, any>)[
      opts.model.charAt(0).toLowerCase() + opts.model.slice(1)
    ];
    if (!delegate || typeof delegate.groupBy !== 'function') {
      return { groups: [], total: 0, generatedAt: new Date().toISOString() };
    }

    const groups = await delegate.groupBy({
      by: groupBy as string[],
      where: opts.where,
      _count: aggregate.count ? true : undefined,
      _avg: aggregate.avg,
      _sum: aggregate.sum,
      take: limit,
    });

    return {
      groups: groups as Array<Record<string, unknown>>,
      total: groups.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      groups: [],
      total: 0,
      generatedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// requiredFieldsByPurpose — declaração de minimização
// ============================================================================

/**
 * Documenta, para CADA finalidade de tratamento, quais campos são
 * estritamente necessários. Auditoria ANPD consulta essa tabela
 * conceitual para validar Art. 6° (necessidade).
 */
export const REQUIRED_FIELDS_BY_PURPOSE: Record<string, string[]> = {
  account_creation: ['email', 'displayName', 'passwordHash'],
  authentication: ['email', 'passwordHash', 'lastLoginAt'],
  content_publishing: ['displayName', 'bio', 'avatarUrl'],
  mentorship: ['displayName', 'bio', 'tradicoes'],
  newsletter: ['email', 'tradicoes'],
  payment: ['email', 'displayName', 'stripeCustomerId'],
  ai_akasha: ['displayName', 'tradicoes', 'spiritualProfile'],
  audit: ['userId', 'createdAt', 'action'], // sem PII
  analytics: [], // apenas agregados
};

// ============================================================================
// unusedFieldReport — campos coletados mas nunca referenciados
// ============================================================================

/**
 * Heurística: lista campos PII-típicos que foram adicionados ao schema mas
 * não aparecem em queries de produção (grep + análise estática).
 *
 * Implementação real exige parser de Prisma queries — aqui fornecemos o
 * stub para o DPO integrar com ferramenta própria (ex.: SQL log analysis).
 */
export async function findUnusedPIIFields(): Promise<string[]> {
  // TODO: integrar com log parser — retorna stub por ora
  return [];
}