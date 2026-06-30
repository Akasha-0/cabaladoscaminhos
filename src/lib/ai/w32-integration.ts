// ============================================================================
// AKASHA — W32 Integration (Wave 32 — 2026-06-30)
// ============================================================================
// Une os módulos Wave 32 (citation, context, multi-tradition, safety, memory,
// quality) num único ponto de entrada para o chat endpoint.
//
// Uso (em /api/akashic/chat/route.ts):
//   import { augmentAkashaWithW32, measureW32Response } from '@/lib/ai/w32-integration';
//
//   const { systemPrompt, responseAugmentations } = augmentAkashaWithW32({
//     basePrompt: buildAkashaPrompt({...}),
//     userMessage: cleanMessage,
//     tradition: rag.effectiveTradition,
//   });
//
//   // ... OpenAI ...
//
//   const quality = measureW32Response({
//     response: aiResponse.content,
//     userMessage: cleanMessage,
//     tradition: rag.effectiveTradition,
//   });
//
// Esta wave NÃO muda o contrato do buildAkashaPrompt. Apenas adiciona
// camadas de augmento + medição. Wave 33+ pode refatorar o core.
// ============================================================================

import { detectContext, formatContextBlock, type UserContext } from './context-awareness.ts';
import { chooseConceptForQuery, formatParallelsBlock, type ConceptKey } from './multi-tradition.ts';
import { SAFETY_SYSTEM_PROMPT_BLOCK } from './safety-rules.ts';
import {
  formatShortTermRecap,
  formatPreferencesBlock,
  type ShortTermMemory,
  type LongTermPreferences,
} from './conversation-memory.ts';
import { AKASHA_CONSTITUTION_BLOCK } from './akasha-principles.ts';

// ============================================================================
// Types
// ============================================================================

export interface W32AugmentInput {
  /** System prompt base (já gerado por buildAkashaPrompt) */
  basePrompt: string;
  /** Mensagem do usuário (para detecção de contexto + conceito) */
  userMessage: string;
  /** Tradição ativa (opcional) */
  tradition?: string | null;
  /** Memória de curto prazo (opcional — para recap) */
  shortTerm?: ShortTermMemory;
  /** Preferências de longo prazo (opcional — para personalização) */
  preferences?: LongTermPreferences;
  /** Injetar bloco de paralelos multi-tradição? (default true) */
  includeMultiTradition?: boolean;
  /** Injetar bloco de safety? (default true — sempre) */
  includeSafety?: boolean;
}

export interface W32AugmentOutput {
  /** System prompt final (com augmentos W32) */
  systemPrompt: string;
  /** Contexto detectado (para auditoria) */
  context: UserContext | null;
  /** Conceito multi-tradição detectado */
  concept: ConceptKey | null;
  /** Augmentos aplicados (para debug/log) */
  appliedAugmentations: string[];
}

// ============================================================================
// Main augmentor
// ============================================================================

/**
 * Aumenta o system prompt com camadas W32:
 *   1. Constituição (já em buildAkashaPrompt, mas reforçamos)
 *   2. Safety (8 regras éticas baked in)
 *   3. Contexto detectado (sentiment/knowledge/intent)
 *   4. Multi-tradição (paralelos do conceito detectado)
 *   5. Memória (curto prazo + preferências)
 */
export function augmentAkashaWithW32(input: W32AugmentInput): W32AugmentOutput {
  const {
    basePrompt,
    userMessage,
    tradition = null,
    shortTerm,
    preferences,
    includeMultiTradition = true,
    includeSafety = true,
  } = input;

  const applied: string[] = [];
  const blocks: string[] = [basePrompt];

  // 1. Constituição (garantia — já no basePrompt, mas reforçamos)
  if (!basePrompt.includes('Constituição Akasha')) {
    blocks.push('', '## Constituição (Wave 30 — 12 valores imutáveis)', AKASHA_CONSTITUTION_BLOCK);
    applied.push('constitution');
  }

  // 2. Safety (8 regras éticas)
  if (includeSafety) {
    blocks.push('', SAFETY_SYSTEM_PROMPT_BLOCK);
    applied.push('safety-8-rules');
  }

  // 3. Contexto detectado
  const context = detectContext(userMessage);
  const contextBlock = formatContextBlock(context);
  if (contextBlock) {
    blocks.push(contextBlock);
    applied.push('context-awareness');
  }

  // 4. Multi-tradição
  let concept: ConceptKey | null = null;
  if (includeMultiTradition) {
    concept = chooseConceptForQuery(userMessage);
    if (concept) {
      const trad = (tradition as any) ?? null;
      const parallelsBlock = formatParallelsBlock(concept, trad, 4);
      if (parallelsBlock) {
        blocks.push(parallelsBlock);
        applied.push('multi-tradition');
      }
    }
  }

  // 5. Memória de curto prazo
  if (shortTerm && shortTerm.messages.length > 0) {
    const recapBlock = formatShortTermRecap(shortTerm);
    if (recapBlock) {
      blocks.push(recapBlock);
      applied.push('short-term-memory');
    }
  }

  // 6. Preferências de longo prazo
  if (preferences) {
    const prefsBlock = formatPreferencesBlock(preferences);
    if (prefsBlock) {
      blocks.push(prefsBlock);
      applied.push('long-term-preferences');
    }
  }

  return {
    systemPrompt: blocks.join('\n\n'),
    context,
    concept,
    appliedAugmentations: applied,
  };
}

// ============================================================================
// Response measurement
// ============================================================================

export interface W32MeasureInput {
  response: string;
  userMessage: string;
  tradition?: string | null;
  feedback?: { up: number; down: number };
}

import { computeQualityReport, type QualityMetrics } from './quality-metrics.ts';

/**
 * Mede qualidade W32 de uma resposta gerada.
 */
export function measureW32Response(input: W32MeasureInput): QualityMetrics {
  return computeQualityReport({
    response: input.response,
    userMessage: input.userMessage,
    tradition: input.tradition ?? null,
    feedback: input.feedback,
  });
}

// ============================================================================
// Self-check
// ============================================================================

export function selfCheckW32Integration(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. augmentAkashaWithW32 adiciona safety
  const aug1 = augmentAkashaWithW32({
    basePrompt: '# Akasha test prompt',
    userMessage: 'O que é meditação?',
  });
  if (!aug1.systemPrompt.includes('8 Regras Éticas')) {
    errors.push('augmentAkashaWithW32 não adicionou safety');
  }
  if (!aug1.appliedAugmentations.includes('safety-8-rules')) {
    errors.push('appliedAugmentations não lista safety');
  }

  // 2. Contexto detectado
  const aug2 = augmentAkashaWithW32({
    basePrompt: '# Akasha',
    userMessage: 'Tô ansioso, como pratico meditação?',
  });
  if (!aug2.context) {
    errors.push('augmentAkashaWithW32 não detectou contexto');
  }
  if (aug2.context?.sentiment !== 'NEGATIVE') {
    errors.push(`augmentAkashaWithW32 não detectou NEGATIVE: ${aug2.context?.sentiment}`);
  }

  // 3. Multi-tradição quando pergunta sobre conceito universal
  const aug3 = augmentAkashaWithW32({
    basePrompt: '# Akasha',
    userMessage: 'O que é prana na ioga?',
    tradition: 'tantra',
  });
  if (!aug3.appliedAugmentations.includes('multi-tradition')) {
    errors.push('augmentAkashaWithW32 não ativou multi-tradition');
  }
  if (aug3.concept !== 'LIFE_FORCE') {
    errors.push(`augmentAkashaWithW32 não detectou LIFE_FORCE: ${aug3.concept}`);
  }

  // 4. Memória de curto prazo
  const aug4 = augmentAkashaWithW32({
    basePrompt: '# Akasha',
    userMessage: 'Continue',
    shortTerm: {
      messages: [
        { role: 'user', content: 'O que é meditação?', timestamp: Date.now() - 1000 },
        { role: 'assistant', content: 'É uma prática milenar...', timestamp: Date.now() },
      ],
    },
  });
  if (!aug4.appliedAugmentations.includes('short-term-memory')) {
    errors.push('augmentAkashaWithW32 não ativou short-term-memory');
  }

  // 5. measureW32Response
  const measure1 = measureW32Response({
    response: 'Estudos (Goyal et al. 2014, JAMA) mostram que meditação ajuda. Procure um profissional.',
    userMessage: 'Como meditar?',
    feedback: { up: 80, down: 20 },
  });
  if (measure1.seal !== 'GREEN') {
    errors.push(`measureW32Response bom deveria ser GREEN: ${measure1.seal} (overall ${measure1.overallScore})`);
  }

  return { ok: errors.length === 0, errors };
}
