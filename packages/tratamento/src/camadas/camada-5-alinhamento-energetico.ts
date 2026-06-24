/**
 * Camada 5 — Alinhamento Energético
 *
 * Chácra work + respiração + movimento. Sequência prática de 10-20min
 * baseada nas chácras dominantes identificadas na Camada 1.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-5-alinhamento-energetico.json`
 */

import type { Camada, Corpus, PilarInput, TextSource } from '../types';
import {
  buscarPorChacra,
  camadaVazia,
  identificarChacrasDominantes,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada5Alinhamento(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-5-alinhamento-energetico';
  const titulo = 'Alinhamento Energético';

  const chacras = identificarChacrasDominantes(input, corpus);
  if (chacras.length === 0) {
    return camadaVazia(id, titulo);
  }

  const fontes: TextSource[] = [];
  // 1 prática (cristal ou respiração) por chácra dominante, até 3 fontes.
  for (const c of chacras.slice(0, 3)) {
    const praticas = buscarPorChacra(corpus, c).filter(
      (r) => r.categoria === 'chakra_pratica'
    );
    if (praticas[0]) fontes.push(recordParaSource(praticas[0]));
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  const base = juntarTextos(fontes, maxFrases);
  const intro = `Sequência breve (10-20 min) para ${chacras[0]}: ${base}`;
  const conteudo = limitarFrases(intro, maxFrases);

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, 3),
    requires_professional_review: false,
  };
}
