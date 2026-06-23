/**
 * @akasha/core-pilar7 — Espectro de Transformacao (3 estagios)
 *
 * Cada chave (1-64) tem 3 estagios:
 * - `sombra` — o padrao que aprisiona
 * - `dom`    — a qualidade cultivada
 * - `siddhi` — a transcendencia
 *
 * HEURISTICA WAVE 4 (D-ZZZ §4):
 * - NAO usamos a complexidade "Program/Mind/Body" do sistema comercial
 *   de origem (Wave 5+ se justificado pelo uso real).
 * - Usamos uma combinacao simples: idade do consulente + fase de vida
 *   (que pode vir do Pilar 4 / Odu, se disponivel).
 *
 * HEURISTICA:
 *   - infancia (0-12)  → sombra (formacao, predomina o desconhecido)
 *   - juventude (13-29) → sombra → dom (transicao; usamos dom se > 21)
 *   - maturidade (30-59) → dom (cultivo ativo)
 *   - sabedoria (60+)  → siddhi (integracao)
 *
 * Se Pilar 4 fornece `faseVida` explicita, ela sobrescreve a heuristica.
 *
 * PT-BR: comentarios e nomes em portugues.
 */
import type { ChaveNatal, EstagioTransformacao, FaseVida } from './types';

/**
 * Mapeamento canonico de fase de vida → estagio.
 *
 * NAO confundir com a dinamica interna do Pilar 4 (Odu) — Pilar 7
 * usa apenas a fase (infancia, juventude, maturidade, sabedoria)
 * como sinal contextual, NAO como correspondencia esoterica.
 */
const FASE_PARA_ESTAGIO: Record<FaseVida, EstagioTransformacao> = {
  infancia: 'sombra',
  juventude: 'dom', // default juventude: dom (cultivo); ver override por idade abaixo
  maturidade: 'dom',
  sabedoria: 'siddhi',
};

/**
 * Refinamento por idade dentro de "juventude":
 * - < 21 anos → sombra (ainda em formacao)
 * - >= 21 anos → dom (entrada no cultivo ativo)
 *
 * Este refinamento existe porque a fronteira 13-29 da juventude e
 * larga. Aos 14 anos, e sombra (formacao); aos 25, e dom (cultivo).
 */
function refinarJuventude(idade: number): EstagioTransformacao {
  if (idade < 21) return 'sombra';
  return 'dom';
}

/**
 * Heuristica completa: faseVida + idade.
 *
 * Ordem de prioridade:
 * 1. Se Pilar 4 passou `faseVida` explicita → usar mapeamento canonico.
 * 2. Senao → derivar faseVida da idade, depois mapear.
 * 3. Para juventude sem Pilar 4 → refinar por idade (21 anos).
 *
 * Determinismo: mesma (chave, idade, faseVida) → mesmo estagio.
 */
export function detectarEstagio(
  _chave: ChaveNatal | null,
  idade: number,
  faseVida?: FaseVida | string | null
): EstagioTransformacao {
  // 1. Fase de vida explicita (Pilar 4 / Odu)
  if (faseVida && isFaseVida(faseVida)) {
    if (faseVida === 'juventude' && Number.isFinite(idade)) {
      return refinarJuventude(idade);
    }
    return FASE_PARA_ESTAGIO[faseVida];
  }

  // 2. Heuristica por idade (fallback)
  if (!Number.isFinite(idade) || idade < 0) {
    // Idade ausente → conservador: sombra (formacao inicial)
    return 'sombra';
  }
  if (idade < 13) return 'sombra';
  if (idade < 30) return refinarJuventude(idade);
  if (idade < 60) return 'dom';
  return 'siddhi';
}

/**
 * Type guard: verifica se string e uma FaseVida canonica.
 *
 * Aceita tambem entradas do Pilar 4 / Odu que usem variantes.
 * NAO inventa FaseVida nova (canonical whitelist — ver AGENTS.md).
 */
export function isFaseVida(s: unknown): s is FaseVida {
  return (
    typeof s === 'string' &&
    (s === 'infancia' ||
      s === 'juventude' ||
      s === 'maturidade' ||
      s === 'sabedoria')
  );
}

/**
 * Helper publico: deriva fase de vida a partir da idade.
 *
 * Util para testes e para a camada de aplicacao quando Pilar 4 nao
 * proveu faseVida. NAO substitui o Pilar 4 quando ele existe —
 * Pilar 4 pode ter nuances que esta heuristica ignora.
 */
export function inferirFaseVida(idade: number): FaseVida {
  if (!Number.isFinite(idade) || idade < 0) return 'infancia';
  if (idade < 13) return 'infancia';
  if (idade < 30) return 'juventude';
  if (idade < 60) return 'maturidade';
  return 'sabedoria';
}
