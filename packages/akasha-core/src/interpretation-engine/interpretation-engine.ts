/**
 * @akasha/core — Interpretation Engine v0.1.0
 *
 * Motor de interpretação profunda do Akasha.
 *
 * Modelo: 4 camadas (dado → significado → padrão → aplicação)
 * Inspirado em:
 *   - Gene Keys (Shadow → Gift → Siddhi)
 *   - Human Design (Strategy + Authority)
 *   - Pesquisa de benchmark (Astrolink Orbia, Mirofox, Co-Star)
 *
 * PILOTO: Número de Vida (Pilar 1 — Cabala Numérica)
 *
 * Esta implementação é o primeiro resultado tangível da FASE 2 do Ciclo 517:
 * a transformação de "número X = descrição rasa" em interpretação profunda
 * e prática que responde "o que isso significa PARA MIM, na minha vida?".
 *
 * Arquitetura: facade pattern com micro-módulos
 *   - .vida-data.ts    → VIDA_CONTENT (catálogo de dados)
 *   - .generate.ts     → interpretarVida / interpretarVidaArea
 *   - .format.ts       → buildInterpretation / buildFallback
 */
import type { LifeArea } from '@akasha/types';

// ─── Data ────────────────────────────────────────────────────────────────────

export { VIDA_CONTENT } from './interpretation-engine.vida-data';
export { MASTER_NUMBERS } from './interpretation-engine.vida-data';

// ─── Types (re-exported from sub-modules for public API surface) ──────────────

export type { NumeroContent } from './types';
export type { NumeroLevel, AcaoPratica, NivelContent } from './types';

// ─── Query / Generation ───────────────────────────────────────────────────────

export { interpretarVida, interpretarVidaArea } from './interpretation-engine.generate';

// ─── Formatting ───────────────────────────────────────────────────────────────

export { buildInterpretation, buildFallback, baseInterpretation } from './interpretation-engine.format';
