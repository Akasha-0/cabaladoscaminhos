/**
 * Camada 1 — Diagnóstico Imediato
 *
 * Identifica:
 *   1. Padrão orí (quente/frio) — do Pilar 4 + corpus.
 *   2. Chácra dominante — do Pilar 3 + Pilar 4 (chacra_referente).
 *
 * Output: 2-3 frases em PT-BR. Tom: therapeutic-holistic universalist.
 * Aciona `requires_professional_review=true` se o pilar 6 ou sinais
 * clínicos indicam padr\u00e3o agudo (dissocia\u00e7\u00e3o, trauma).
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-1-diagnostico-imediato.json`
 */

import type { Camada, Corpus, PilarInput, TextSource, TextRecord } from '../types';
import {
  buscarPorOdu,
  camadaVazia,
  detectarPadraoOri,
  identificarChacrasDominantes,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada1Diagnostico(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-1-diagnostico';
  const titulo = 'Diagnóstico Imediato';

  // 1) Coletar corpus relevante.
  const fontes: TextSource[] = [];
  const oduPrincipal = input.odu?.odu_principal;
  const ori = detectarPadraoOri(input, corpus);
  const chacras = identificarChacrasDominantes(input, corpus);

  // 1a) Sinais de orí quente/frio do Odu principal.
  if (oduPrincipal && ori) {
    const registrosOri = buscarPorOdu(corpus, oduPrincipal).filter(
      (r) => r.categoria === 'oriquente' || r.categoria === 'orifrio'
    );
    for (const r of registrosOri.slice(0, 2)) {
      fontes.push(recordParaSource(r));
    }
  }

  // 1b) Preceitos que apontam para chácra dominante.
  if (oduPrincipal) {
    const preceitos = buscarPorOdu(corpus, oduPrincipal)
      .filter((r) => r.categoria === 'preceito')
      .slice(0, 2);
    for (const r of preceitos) {
      fontes.push(recordParaSource(r));
    }
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  // 2) Montar o conteúdo (PT-BR, direto, 2-3 frases).
  const oriLabel = ori === 'quente' ? 'orí quente' : ori === 'frio' ? 'orí frio' : 'orí em transição';
  const chacraLabel = chacras[0] ?? 'chacra central';
  const oduLabel = oduPrincipal ?? 'seu Odu';

  const frase1 = `Padr\u00e3o detectado: ${oriLabel} sob ${oduLabel}, com ${chacraLabel} em destaque.`;
  const frase2 = ori === 'quente'
    ? 'Indica momento de ativa\u00e7\u00e3o mental alta; priorize aterramento e sono regular.'
    : ori === 'frio'
      ? 'Indica momento de contra\u00e7\u00e3o e d\u00favida; priorize uma decis\u00e3o pequena por dia.'
      : 'Sinais mistos; observe rea\u00e7\u00f5es corporais antes de grandes decis\u00f5es.';

  // Se houver sinal clínico agudo (dissociação), flag profissional.
  const sinais = (input.sinais_clinicos ?? []).join(' ').toLowerCase();
  const flagAgudo = /\b(dissocia|trauma|desesper|p[aâ]nico)\b/.test(sinais);

  const conteudoBase = [frase1, frase2].join(' ');
  const conteudo = flagAgudo
    ? limitarFrases(`${conteudoBase} Sinais cl\u00ednicos sugerem revis\u00e3o profissional antes de avan\u00e7ar.`, maxFrases)
    : limitarFrases(conteudoBase, maxFrases);

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, maxFrases),
    requires_professional_review: flagAgudo,
  };
}
