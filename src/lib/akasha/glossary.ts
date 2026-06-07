/**
 * glossary.ts — Injeção mínima de glossário (AD-20.2)
 *
 * Fornece o trecho de "verdade-base" sobre o Odu de nascimento
 * (essência, quizila, conselho) para os builders que alimentam IA:
 *   - buildManifestoContent (PDF)
 *   - buildDailyContent (Dashboard Diário)
 *   - buildAkashaSystemPrompt (consult SSE)
 *
 * Objetivo: impedir alucinação garantindo que o conteúdo canônico
 * do Odu esteja sempre presente no contexto enviado ao LLM.
 *
 * Fonte: docs/15_glossario-oracular.md + src/lib/akasha/odu-data.ts
 * (a tabela canônica de Odus usada por cross-engine).
 */

import { getOduByName, type OduData } from './odu-data';

export interface OduGlossarySection {
  oduName: string;
  essencia: string;
  quizila: string;
  conselho: string;
}

/**
 * Resolve o Odu de nascimento a partir do `oduBirth` (JSON do DB) e devolve
 * o bloco-base para injeção. Retorna null se o Odu não puder ser resolvido.
 */
export function buildOduGlossary(oduBirth: unknown): OduGlossarySection | null {
  const odu = (oduBirth ?? {}) as { oduName?: string; name?: string };
  const oduName = (odu.oduName ?? odu.name ?? '').toString().trim();
  if (!oduName) return null;
  const data: OduData | undefined = getOduByName(oduName);
  if (!data) return null;
  return {
    oduName: data.name,
    essencia: data.essencia,
    quizila: data.quizilas[0] ?? '',
    conselho: data.preceitos[0] ?? '',
  };
}

/**
 * Serializa a seção de glossário em texto markdown para colar diretamente
 * no System Prompt. Cabeçalho padronizado (AD-20.2) — facilita auditoria
 * e detecção de regressão via testes.
 */
export function formatGlossarySection(section: OduGlossarySection | null): string {
  if (!section) return '';
  return [
    '## GLOSSÁRIO DO ODU (verdade-base — use APENAS como referência)',
    `- odu_essencia: ${section.essencia}`,
    `- odu_quizila: ${section.quizila}`,
    `- odu_conselho: ${section.conselho}`,
  ].join('\n');
}
