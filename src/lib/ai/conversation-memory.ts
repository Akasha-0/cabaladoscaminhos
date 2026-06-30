// ============================================================================
// AKASHA — Conversation Memory (Wave 32 — 2026-06-30)
// ============================================================================
// 3 camadas de memória:
//   1. SHORT_TERM — últimas 10 mensagens (in-session, no contexto)
//   2. LONG_TERM — preferências explícitas (tradição favorita, tom)
//   3. CROSS_SESSION — retomada de conversa (opt-in, LGPD)
//
// LGPD-first: tudo opt-in explícito. Sem cookies, sem fingerprint.
// Cross-session só persiste se user consentiu e tem conta.
//
// Inspiração:
//   - Park et al. 2023 — "Generative Agents" (Stanford)
//   - Lewis et al. 2020 — "Retrieval-Augmented Generation" (curto prazo)
// ============================================================================

// ============================================================================
// Types
// ============================================================================

/**
 * Memória de curto prazo — buffer de mensagens recentes.
 * Tamanho máximo = 10 (Wave 18 spec, mantém coerência sem estourar tokens).
 */
export interface ShortTermMemory {
  /** Mensagens em ordem cronológica */
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  /** Contexto detectado (sentiment, knowledge, intent) */
  context?: {
    sentiment?: string;
    knowledge?: string;
    intent?: string;
  };
  /** Tradição ativa nesta sessão */
  tradition?: string | null;
}

/**
 * Preferências de longo prazo (LGPD opt-in).
 * Persiste no DB somente se user consentiu.
 */
export interface LongTermPreferences {
  /** Tradição favorita do usuário (auto-aplicada se consistente) */
  favoriteTradition?: string;
  /** Tom preferido: 'acolhedor' | 'direto' | 'técnico' | 'reflexivo' */
  preferredTone?: 'acolhedor' | 'direto' | 'técnico' | 'reflexivo';
  /** Profundidade preferida */
  preferredDepth?: 'resumido' | 'balanceado' | 'profundo';
  /** Idioma (default pt-BR) */
  language?: string;
  /** Tradições que o usuário pratica/estuda */
  studiedTraditions?: string[];
  /** Última vez que atualizou */
  updatedAt: number;
}

/**
 * Sessão cross-session (LGPD opt-in).
 * Permite retomar conversa depois de fechar/abrir.
 */
export interface CrossSession {
  /** ID único da sessão (client-generated UUID) */
  sessionId: string;
  /** User ID (se autenticado) ou null (visitante anônimo) */
  userId: string | null;
  /** Primeira mensagem (preview para listagem) */
  preview: string;
  /** Resumo curto (auto-gerado) */
  summary: string;
  /** Tradição principal */
  tradition?: string | null;
  /** Última atividade */
  lastActivity: number;
  /** Criada em */
  createdAt: number;
}

// ============================================================================
// Short-term — buffer
// ============================================================================

const SHORT_TERM_MAX = 10;

/**
 * Adiciona uma mensagem ao buffer, mantendo o tamanho máximo.
 * Mensagens antigas são descartadas (FIFO).
 */
export function appendShortTerm(
  memory: ShortTermMemory,
  message: { role: 'user' | 'assistant'; content: string },
): ShortTermMemory {
  const messages = [
    ...memory.messages,
    { ...message, timestamp: Date.now() },
  ];
  // Trunca se passar do máximo
  const truncated = messages.length > SHORT_TERM_MAX
    ? messages.slice(-SHORT_TERM_MAX)
    : messages;
  return { ...memory, messages: truncated };
}

/**
 * Constrói ShortTermMemory vazia.
 */
export function emptyShortTerm(tradition: string | null = null): ShortTermMemory {
  return {
    messages: [],
    tradition,
  };
}

/**
 * Formata ShortTermMemory para injeção no system prompt (recap).
 */
export function formatShortTermRecap(memory: ShortTermMemory): string {
  if (memory.messages.length === 0) return '';

  const lines = memory.messages.map((m) => {
    const role = m.role === 'user' ? 'Usuário' : 'Akasha';
    const preview = m.content.length > 200 ? m.content.slice(0, 200) + '…' : m.content;
    return `- **${role}:** ${preview}`;
  });

  return [
    '',
    '## Histórico recente (curto prazo)',
    'Use para manter coerência com a conversa atual:',
    '',
    ...lines,
  ].join('\n');
}

// ============================================================================
// Long-term — preferências
// ============================================================================

const DEFAULT_PREFERENCES: LongTermPreferences = {
  preferredTone: 'acolhedor',
  preferredDepth: 'balanceado',
  language: 'pt-BR',
  updatedAt: 0,
};

/**
 * Cria preferências padrão NÃO-OPTADAS (updatedAt = 0 = sem opt-in).
 * Use quando user ainda não consentiu em salvar preferências.
 */
export function defaultPreferences(): LongTermPreferences {
  return { ...DEFAULT_PREFERENCES, updatedAt: 0 };
}

/**
 * Cria preferências com opt-in explícito (updatedAt = now).
 * Use quando user consentiu em salvar preferências.
 */
export function optInPreferences(): LongTermPreferences {
  return { ...DEFAULT_PREFERENCES, updatedAt: Date.now() };
}

/**
 * Injeta preferências no system prompt como bloco.
 */
export function formatPreferencesBlock(prefs: LongTermPreferences): string {
  if (prefs.updatedAt === 0) return ''; // sem opt-in = não incluir

  const lines: string[] = ['', '## Preferências do usuário (longo prazo — opt-in LGPD)'];
  if (prefs.favoriteTradition) {
    lines.push(`- **Tradição favorita:** ${prefs.favoriteTradition}`);
  }
  if (prefs.preferredTone) {
    lines.push(`- **Tom preferido:** ${prefs.preferredTone}`);
  }
  if (prefs.preferredDepth) {
    lines.push(`- **Profundidade preferida:** ${prefs.preferredDepth}`);
  }
  if (prefs.studiedTraditions && prefs.studiedTraditions.length > 0) {
    lines.push(`- **Tradições estudadas/praticadas:** ${prefs.studiedTraditions.join(', ')}`);
  }
  if (prefs.language) {
    lines.push(`- **Idioma:** ${prefs.language}`);
  }
  lines.push('');
  lines.push('> Respeite estas preferências, mas permita que o usuário as mude nesta conversa sem sobrescrever o default.');

  return lines.join('\n');
}

/**
 * Atualiza preferências com novo valor. Imutável.
 */
export function updatePreferences(
  prefs: LongTermPreferences,
  update: Partial<Omit<LongTermPreferences, 'updatedAt'>>,
): LongTermPreferences {
  return {
    ...prefs,
    ...update,
    updatedAt: Date.now(),
  };
}

// ============================================================================
// Cross-session — retomada (LGPD opt-in)
// ============================================================================

/**
 * Gera preview curto para listagem (primeiros 80 chars).
 */
export function generatePreview(firstMessage: string): string {
  const clean = firstMessage.trim().slice(0, 80);
  return clean.length < firstMessage.trim().length ? `${clean}…` : clean;
}

/**
 * Resumo auto-gerado (heurística simples).
 * Em produção, Wave 33+ pode usar LLM para resumir.
 */
export function generateSummary(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  tradition: string | null,
): string {
  const userMsgs = messages.filter((m) => m.role === 'user');
  if (userMsgs.length === 0) return 'Conversa vazia';
  const first = userMsgs[0].content.slice(0, 100);
  const last = userMsgs[userMsgs.length - 1].content.slice(0, 100);
  const tradPart = tradition ? ` [${tradition}]` : '';
  return `${first}${userMsgs.length > 1 ? ` → ${last}` : ''}${tradPart}`;
}

/**
 * Valida se cross-session pode ser persistido (LGPD opt-in).
 * @returns lista de issues (vazia = pode persistir)
 */
export function validateCrossSession(session: CrossSession, optedIn: boolean): string[] {
  const issues: string[] = [];

  if (!optedIn) {
    issues.push('LGPD: opt-in necessário para persistir cross-session');
  }

  if (session.userId && !/^[a-z0-9-]{8,64}$/i.test(session.userId)) {
    issues.push('userId em formato inesperado');
  }

  if (!session.sessionId || session.sessionId.length < 8) {
    issues.push('sessionId ausente ou muito curto');
  }

  if (session.preview.length > 100) {
    issues.push('preview truncado indevidamente');
  }

  return issues;
}

// ============================================================================
// Self-check
// ============================================================================

export async function selfCheckMemory(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 1. appendShortTerm trunca em 10
  let mem = emptyShortTerm();
  for (let i = 0; i < 15; i++) {
    mem = appendShortTerm(mem, { role: 'user', content: `msg ${i}` });
  }
  if (mem.messages.length !== SHORT_TERM_MAX) {
    errors.push(`appendShortTerm não truncou: ${mem.messages.length} msgs`);
  }
  if (mem.messages[0].content !== 'msg 5') {
    errors.push(`appendShortTerm FIFO errado: ${mem.messages[0].content}`);
  }

  // 2. emptyShortTerm funciona
  const empty = emptyShortTerm('cabala');
  if (empty.tradition !== 'cabala' || empty.messages.length !== 0) {
    errors.push('emptyShortTerm falhou');
  }

  // 3. formatShortTermRecap
  const recap = formatShortTermRecap(mem);
  if (!recap.includes('msg 14') || !recap.includes('Histórico recente')) {
    errors.push('formatShortTermRecap falhou');
  }

  // 4. defaultPreferences — sem opt-in (updatedAt = 0)
  const prefs1 = defaultPreferences();
  if (prefs1.preferredTone !== 'acolhedor' || prefs1.language !== 'pt-BR' || prefs1.updatedAt !== 0) {
    errors.push('defaultPreferences deveria ser não-optada (updatedAt=0)');
  }

  // 5. optInPreferences — com opt-in
  const prefsOpted = optInPreferences();
  if (prefsOpted.updatedAt === 0) {
    errors.push('optInPreferences deveria ter updatedAt > 0');
  }

  // 6. updatePreferences
  // Pequeno delay para garantir que timestamp mude (test rápido)
  await new Promise((resolve) => setTimeout(resolve, 5));
  const prefs2 = updatePreferences(prefsOpted, { favoriteTradition: 'cabala' });
  if (prefs2.favoriteTradition !== 'cabala' || prefs2.updatedAt === prefsOpted.updatedAt) {
    errors.push('updatePreferences falhou');
  }

  // 7. formatPreferencesBlock — sem opt-in = vazio
  const block1 = formatPreferencesBlock(prefs1);
  if (block1.length > 0) {
    errors.push('formatPreferencesBlock deveria ser vazio sem opt-in');
  }

  // 8. formatPreferencesBlock — com opt-in
  const block2 = formatPreferencesBlock(prefs2);
  if (!block2.includes('cabala') || !block2.includes('Tom preferido')) {
    errors.push('formatPreferencesBlock falhou com prefs');
  }

  // 9. generatePreview
  const preview1 = generatePreview('Olá, gostaria de saber sobre meditação e como ela pode me ajudar');
  if (preview1.length > 100) {
    errors.push('generatePreview não truncou');
  }

  // 10. generateSummary
  const summary1 = generateSummary(
    [
      { role: 'user', content: 'O que é Cabala?' },
      { role: 'assistant', content: 'Cabala é...' },
      { role: 'user', content: 'Como pratico?' },
    ],
    'cabala',
  );
  if (!summary1.includes('Cabala') || !summary1.includes('[cabala]')) {
    errors.push(`generateSummary falhou: ${summary1}`);
  }

  // 11. validateCrossSession
  const session1: CrossSession = {
    sessionId: 'abc-123-456-789',
    userId: null,
    preview: 'preview',
    summary: 's',
    lastActivity: Date.now(),
    createdAt: Date.now(),
  };
  const issues1 = validateCrossSession(session1, false);
  if (!issues1.some((i) => i.includes('opt-in'))) {
    errors.push('validateCrossSession deveria exigir opt-in');
  }
  const issues2 = validateCrossSession(session1, true);
  if (issues2.length > 0) {
    errors.push(`validateCrossSession falhou com opt-in: ${issues2.join(', ')}`);
  }

  return { ok: errors.length === 0, errors };
}
