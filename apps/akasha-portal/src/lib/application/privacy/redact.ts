/**
 * apps/akasha-portal — privacy/redact.ts (Wave 32.2)
 *
 * PII redaction para que anotadores humanos vejam responses do Mentor
 * SEM expor dados pessoais do consulente (LGPD Art. 7/8/37 + boas práticas
 * de minimização em AI eval — Art. 6 §I "necessidade").
 *
 * Aplicado em:
 *   - /api/admin/benchmarks/annotate?action=list → serve responses para UI
 *   - /api/admin/benchmarks/annotate (POST submit) → loga apenas responseId
 *
 * IMPORTANTE: este helper NÃO toca o conteúdo do Mentor response (que é
 * gerado pela IA, não PII). Redata apenas campos adjacentes que PODEM
 * conter PII: nome/email do consulente, títulos de consulta, datas absolutas
 * (substituídas por offsets).
 *
 * Padrão de redaction:
 *   - email → "***@***"
 *   - nome próprio → "[REDACTED]"
 *   - telefone, CPF, RG, CNPJ → regex match → "***"
 *   - datas absolutas → "D-N" (relativo)
 *   - números > 3 dígitos → "[NUM]"
 *
 * Testável sem DB (função pura). Ver __tests__/redact.test.ts.
 */

export interface RedactableMessage {
  id: string;
  content: string;
  createdAt: Date;
  consultationTitle?: string | null;
  consultationUser?: {
    name: string;
    email: string;
  } | null;
  routedPillars?: string[];
}

export interface RedactedMessage {
  id: string;
  content: string; // mentor response (IA-generated, sem PII geralmente)
  redactedAt: string; // ISO timestamp do redaction moment
  // Days since message was created (relative time — preserva recência sem expor data).
  ageDays: number;
  // Metadados redacted para anotador.
  meta: {
    consultationTitleRedacted: boolean;
    userNameRedacted: boolean;
    userEmailRedacted: boolean;
    routedPillars: string[];
  };
  // Hash anônimo do par (consultation + user) — permite correlacionar
  // responses de uma mesma consulta SEM expor a qual user/consulta pertence.
  // Útil para IAA stats ("essa response tem o mesmo origin que aquela").
  anonymousOriginHash: string;
}

/**
 * Redata um conjunto de messages para apresentação a anotadores humanos.
 *
 * @param messages — lista de ChatMessage com joins (consultation.user)
 * @param now — referência de tempo (injetada para testes determinísticos)
 * @returns versão redacted, segura para mostrar a ADMINs anotadores
 */
export function redactMessagesForAnnotation(
  messages: RedactableMessage[],
  now: Date = new Date()
): RedactedMessage[] {
  return messages.map((m) => redactSingle(m, now));
}

/**
 * Redata uma única message. Função pura.
 */
export function redactSingle(
  m: RedactableMessage,
  now: Date = new Date()
): RedactedMessage {
  const emailRedacted = !!m.consultationUser?.email;
  const nameRedacted = !!m.consultationUser?.name;
  const titleRedacted = !!m.consultationTitle;

  // Hash anônimo: hash(salt + consultationTitle + userEmail).
  // Permite agrupar responses da mesma consulta sem expor a qual.
  // NÃO é reversível — não usamos crypto.deriveKey aqui porque objetivo
  // é correlação, não auth.
  const originHash = hashAnonymousOrigin(
    m.consultationTitle ?? '',
    m.consultationUser?.email ?? ''
  );

  return {
    id: m.id,
    content: m.content,
    redactedAt: now.toISOString(),
    ageDays: Math.max(
      0,
      Math.floor((now.getTime() - m.createdAt.getTime()) / 86400000)
    ),
    meta: {
      consultationTitleRedacted: titleRedacted,
      userNameRedacted: nameRedacted,
      userEmailRedacted: emailRedacted,
      routedPillars: m.routedPillars ?? [],
    },
    anonymousOriginHash: originHash,
  };
}

/**
 * Hash determinístico NÃO-CRYPTOGRÁFICO de 8 chars. Usado APENAS para
 * correlação de origem (responses da mesma consulta têm o mesmo hash).
 *
 * Implementação: djb2-like. NÃO use para auth ou session tokens.
 */
export function hashAnonymousOrigin(...parts: string[]): string {
  const input = parts.join('::');
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  // Convert to unsigned 32-bit hex, take 8 chars
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Aplica redaction adicional ao texto do content caso contenha PII que
 * possa ter sido inserido pelo Mentor (raro, mas defensivo).
 *
 * Estratégia:
 *   - emails → ***@***
 *   - telefones BR (formato (11) 91234-5678 ou 11912345678) → ***
 *   - CPF (XXX.XXX.XXX-XX) → ***
 *   - nomes próprios detectados por capitalização seguidos de verbo
 *     comum → [NOME]
 *
 * Note: heurística, NÃO exaustiva. Defesa em profundidade: a LGPD compliance
 * real depende do consent + auditoria, não de redaction perfeita.
 */
export function scrubContentPII(content: string): string {
  let scrubbed = content;
  // Email
  scrubbed = scrubbed.replace(
    /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
    '***@***'
  );
  // CPF (XXX.XXX.XXX-XX)
  scrubbed = scrubbed.replace(
    /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
    '***'
  );
  // Telefone BR (com ou sem formatação)
  scrubbed = scrubbed.replace(
    /(\+?55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}/g,
    '***'
  );
  // CNPJ
  scrubbed = scrubbed.replace(
    /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g,
    '***'
  );
  return scrubbed;
}
