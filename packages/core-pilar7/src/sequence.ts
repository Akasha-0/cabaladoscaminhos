/**
 * @akasha/core-pilar7 — Sequence Venusiana (22 chaves)
 *
 * A Sequence Venusiana captura um arco de 22 chaves que se desdobram
 * a partir da chave natal. O algoritmo Wave 4 e simples e
 * deterministico:
 *
 *   1. chaveInicial = chave natal (Pilar 5)
 *   2. para i = 0..21:
 *        numero = ((chaveInicial - 1 + i * GOLD_STEP) % 64) + 1
 *      GOLD_STEP = 11 (numero primo relativo a 64, gera boa cobertura)
 *   3. tema = TEMAS_VENUS[chave.numero] (mapa canonico universalista)
 *
 * NEM o algoritmo de passo nem os temas foram copiados do sistema
 * comercial original. A escolha de 22 chaves e a nomenclatura
 * "Sequence Venusiana" sao referencias publicas (astronomia,
 * alquimia) nao-protegidas. Os temas sao gerados para serem
 * universalistas e nao-violativos.
 *
 * PT-BR: comentarios e temas em portugues.
 */
import { getChave } from './chave';
import type { ChaveNatal, PilaresDados, SequenceVenusiana } from './types';

/** Numero de chaves na Sequence Venusiana (canonico, D-ZZZ §2). */
export const SEQUENCE_VENUS_LENGTH = 22;

/**
 * Passo modular usado para desdobrar a sequence a partir da chave natal.
 *
 * 11 foi escolhido por ser primo relativo a 64 (= mdc(11, 64) = 1), o que
 * garante que o passo cobre todas as 64 posicoes antes de repetir. Qualquer
 * valor em {3, 5, 11, 13, 19, 21, 27, 29, 37, 43, 53, 59, 61} funcionaria
 * com cobertura total; 11 foi escolhido por ser o passo usado em muitos
 * sistemas oraculares (cabalisticos, astronomicos), sem ser copia de
 * nenhum especifico.
 */
const GOLD_STEP = 11;

/**
 * Temas universalistas para as 22 posicoes da Sequence.
 *
 * Cada tema e uma frase curta, original, descrevendo a qualidade
 * contemplada na posicao. NAO foram copiados de fontes proprietarias.
 *
 * Inspiracao: ciclos de transformacao pessoal (relacionamentos,
 * criatividade, prosperidade) na tradicao contemplativa universal.
 *
 * Determinismo: tema[i] e estavel entre chamadas.
 */
const TEMAS_VENUS: readonly string[] = [
  // 1-22
  'O Chamado Inicial',
  'A Escuta do Corpo',
  'A Emocao que Move',
  'A Verdade que Fala',
  'A Voluntade que Age',
  'O Amor que Expande',
  'A Beleza que Refina',
  'O Poder que Integra',
  'A Visao que Aprofunada',
  'A Manifestacao que Concretiza',
  'A Liberdade que Solta',
  'A Cooperacao que Sustenta',
  'A Discernimento que Corta',
  'A Curiosidade que Explorada',
  'A Coragem que Avanca',
  'A Compaixao que Acolhe',
  'A Sabedoria que Integra',
  'A Transformacao que Purifica',
  'A Renovacao que Renasce',
  'A Plenitude que Irradia',
  'A Transcendencia que Dissolve',
  'O Retorno ao Centro',
];

/**
 * Calcula o numero (1-64) da i-esima chave (0-indexed) na Sequence.
 *
 *   numero = ((natal - 1 + i * GOLD_STEP) % 64) + 1
 *
 * Como GOLD_STEP e coprimo com 64, cada sequence gerada cobre
 * exatamente 22 chaves distintas (22 < 64), sem repeticao.
 */
function chaveNaPosicao(chaveNatalNumero: number, i: number): number {
  const offset = i * GOLD_STEP;
  const raw = (chaveNatalNumero - 1 + offset) % 64;
  return raw + 1;
}

/**
 * Detecta a Sequence Venusiana do consulente (22 chaves).
 *
 * Regras:
 * - Se Pilar 5 nao proveu chave natal (opt-in desativado) → retorna `[]`.
 * - Caso contrario, retorna 22 chaves em ordem.
 *
 * Cada entrada tem:
 * - `posicao` (1-22)
 * - `chave` (ChaveNatal com nome universalista)
 * - `tema` (placeholder universalista, nao copia)
 */
export function detectarSequenceVenusiana(
  pilares: PilaresDados
): SequenceVenusiana[] {
  const chaveNatal = pilares?.pilar5?.hexagramNumber;
  if (chaveNatal == null) return [];
  if (!Number.isInteger(chaveNatal) || chaveNatal < 1 || chaveNatal > 64) {
    return [];
  }

  const result: SequenceVenusiana[] = [];
  for (let i = 0; i < SEQUENCE_VENUS_LENGTH; i++) {
    const numero = chaveNaPosicao(chaveNatal, i);
    const chave = getChave(numero);
    const tema = TEMAS_VENUS[i] ?? `Estagio ${i + 1}`;
    result.push({
      posicao: i + 1,
      chave,
      tema,
    });
  }
  return result;
}
