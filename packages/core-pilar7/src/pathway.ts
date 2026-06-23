/**
 * @akasha/core-pilar7 — Caminho Dourado (11 chaves)
 *
 * O Caminho Dourado e um arco de 11 chaves que integram Sombra/Dom/Siddhi
 * ao longo da vida. O algoritmo Wave 4 e simples e deterministico:
 *
 *   1. chaveInicial = chave natal (Pilar 5)
 *   2. para i = 0..10:
 *        numero = ((chaveInicial - 1 + i * GOLD_STEP) % 64) + 1
 *      GOLD_STEP = 7 (primo relativo a 64, gera cobertura)
 *   3. tema = TEMAS_DOURADO[i] (mapa canonico universalista)
 *
 * Inspirado no simbolismo alquimico (caminho de integracao = "dourado").
 * NAO copia layout, temas ou ordem do sistema comercial original.
 * A nomenclatura "Caminho Dourado" e referencia alquimica generica.
 *
 * PT-BR: comentarios e temas em portugues.
 */
import { getChave } from './chave';
import type { CaminhoDourado, PilaresDados } from './types';

/** Numero de chaves no Caminho Dourado (canonico, D-ZZZ §2). */
export const CAMINHO_DOURADO_LENGTH = 11;

/**
 * Passo modular usado para desdobrar o caminho a partir da chave natal.
 *
 * 7 foi escolhido por ser primo relativo a 64 (= mdc(7, 64) = 1) e por
 * simbolizar ciclos completos (7 dias, 7 chakras, 7 notas — referencias
 * tradicional-genericas, nao-protegidas). O passo cobre 11 chaves
 * distintas antes de qualquer repeticao.
 */
const GOLD_STEP = 7;

/**
 * Temas universalistas para as 11 posicoes do Caminho Dourado.
 *
 * Cada tema descreve uma etapa do arco de transformacao pessoal
 * (sombra → dom → siddhi). NAO foram copiados de fontes proprietarias.
 *
 * Inspiracao: caminhos alquimicos e contemplativos genericos
 * (nigredo, albedo, rubedo como padroes universais, NAO textos
 * literais de qualquer tradicao especifica).
 */
const TEMAS_DOURADO: readonly string[] = [
  // 1-11 — Arco Sombra → Dom → Siddhi
  'O Reconhecimento da Sombra',
  'O Encontro com a Resistencia',
  'A Travessia do Limiar',
  'A Descoberta do Dom',
  'O Cultivo da Virtude',
  'A Integracao Sombra-Dom',
  'A Purificacao',
  'O Despertar da Siddhi',
  'A Sincronia com o Cosmos',
  'A Servidao Consciente',
  'A Uniao com o Centro',
];

/**
 * Calcula o numero (1-64) da i-esima chave (0-indexed) no Caminho.
 *
 *   numero = ((natal - 1 + i * GOLD_STEP) % 64) + 1
 */
function chaveNaPosicao(chaveNatalNumero: number, i: number): number {
  const offset = i * GOLD_STEP;
  const raw = (chaveNatalNumero - 1 + offset) % 64;
  return raw + 1;
}

/**
 * Detecta o Caminho Dourado do consulente (11 chaves).
 *
 * Regras:
 * - Se Pilar 5 nao proveu chave natal (opt-in desativado) → retorna `[]`.
 * - Caso contrario, retorna 11 chaves em ordem.
 */
export function detectarCaminhoDourado(
  pilares: PilaresDados
): CaminhoDourado[] {
  const chaveNatal = pilares?.pilar5?.hexagramNumber;
  if (chaveNatal == null) return [];
  if (!Number.isInteger(chaveNatal) || chaveNatal < 1 || chaveNatal > 64) {
    return [];
  }

  const result: CaminhoDourado[] = [];
  for (let i = 0; i < CAMINHO_DOURADO_LENGTH; i++) {
    const numero = chaveNaPosicao(chaveNatal, i);
    const chave = getChave(numero);
    const tema = TEMAS_DOURADO[i] ?? `Etapa ${i + 1}`;
    result.push({
      posicao: i + 1,
      chave,
      tema,
    });
  }
  return result;
}
