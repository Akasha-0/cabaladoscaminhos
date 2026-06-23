/**
 * @akasha/core-pilar7 — Orquestrador (calcular)
 *
 * `calcular(pilares, idade)` e a funcao de entrada do Pilar 7. Recebe
 * os pilares ja calculados (Pilar 5 obrigatorio; Pilar 4 e Pilar 6
 * opcionais) e retorna um `Pilar7Result` com:
 * - chaveNatal
 * - estagioAtual (sombra/dom/siddhi)
 * - textos placeholder dos 3 estagios (lidos de src/textos/*.md em Wave 5+)
 * - sequenceVenusiana (22 chaves)
 * - caminhoDourado (11 chaves)
 * - metadados de auditoria (versaoCalculo, calculadoEm)
 *
 * DETERMINISMO:
 * - ZERO Math.random(), ZERO LLM, ZERO network.
 * - `calculadoEm` e o unico campo nao-deterministico (new Date()).
 *   Tests podem injetar um Date fixo via stub ou ignorar este campo.
 *
 * GRACEFUL DEGRADATION:
 * - Se Pilar 5 ausente → chaveNatal=null, estagioAtual=sombra,
 *   listas vazias. (Pilar 5 e opt-in; Pilar 7 NAO quebra.)
 */
import { detectarChave } from './chave';
import { detectarEstagio } from './espectro';
import { detectarSequenceVenusiana } from './sequence';
import { detectarCaminhoDourado } from './pathway';
import type { Pilar7Result, PilaresDados } from './types';

/** Versao do algoritmo de calculo (auditoria). */
export const VERSAO_CALCULO: Pilar7Result['versaoCalculo'] = 'v1';

/**
 * Placeholders de texto para os 3 estagios. Wave 4 entrega strings
 * curtas e origi nais; Wave 5+ substitui por textos finais lidos de
 * `src/textos/chave-XX-estagio.md`.
 *
 * Guardrail 2 (ADR 0002): estes textos NAO sao copias de livros
 * comerciais. Sao descricoes funcionais do que cada estagio significa
 * na chave especifica.
 */
function placeholderTexto(
  chaveNumero: number | null,
  estagio: 'sombra' | 'dom' | 'siddhi'
): string {
  if (chaveNumero == null) {
    return '';
  }
  // Placeholder universalista — sera substituido em Wave 5+
  // por leitura de arquivos em src/textos/chave-XX-{estagio}.md
  const numero = String(chaveNumero).padStart(2, '0');
  return (
    `[Placeholder Wave 4 — texto original] ` +
    `Chave ${numero}, estagio ${estagio}. ` +
    `Texto definitivo sera carregado de src/textos/chave-${numero}-${estagio}.md em Wave 5+.`
  );
}

/**
 * Funcao principal: calcula o Pilar 7 para o consulente.
 *
 * @param pilares Dados dos pilares (Pilar 5 obrigatorio; 4 e 6 opcionais).
 * @param idade Idade do consulente em anos (>= 0). Usado pela heuristica
 *              de estagio quando Pilar 4 nao proveu faseVida.
 * @param agora Data/hora do calculo (default: new Date()). Injetavel
 *              em testes para garantir determinismo.
 */
export function calcular(
  pilares: PilaresDados,
  idade: number,
  agora: Date = new Date()
): Pilar7Result {
  const chaveNatal = detectarChave(pilares?.pilar5 ?? null);
  const chaveNumero = chaveNatal?.numero ?? null;

  // Estagio: usa Pilar 4 faseVida se presente; senao, heuristica por idade.
  const faseVidaPilar4 = pilares?.pilar4?.faseVida ?? null;
  const estagioAtual = detectarEstagio(chaveNatal, idade, faseVidaPilar4);

  const sombra = placeholderTexto(chaveNumero, 'sombra');
  const dom = placeholderTexto(chaveNumero, 'dom');
  const siddhi = placeholderTexto(chaveNumero, 'siddhi');

  const sequenceVenusiana = detectarSequenceVenusiana(pilares);
  const caminhoDourado = detectarCaminhoDourado(pilares);

  return {
    chaveNatal,
    estagioAtual,
    sombra,
    dom,
    siddhi,
    sequenceVenusiana,
    caminhoDourado,
    versaoCalculo: VERSAO_CALCULO,
    calculadoEm: agora,
  };
}
