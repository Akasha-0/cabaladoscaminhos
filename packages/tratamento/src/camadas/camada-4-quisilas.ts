/**
 * Camada 4 — Quisilas
 *
 * Lista 3-5 coisas a evitar, com base no Odu principal + padrão orí.
 * 'Menos é mais' — Gabriel: 3 itens, não 10.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-4-quisilas.json`
 */

import type { Camada, Corpus, PilarInput, TextSource } from '../types';
import {
  buscarPorOdu,
  camadaVazia,
  detectarPadraoOri,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada4Quisilas(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-4-quisilas';
  const titulo = 'Quisilas (o que evitar)';

  const oduPrincipal = input.odu?.odu_principal;
  if (!oduPrincipal) {
    return camadaVazia(id, titulo);
  }

  const ori = detectarPadraoOri(input, corpus);
  const fontes: TextSource[] = [];

  // 1) Quisilas do Odu principal (até 3).
  const quisilas = buscarPorOdu(corpus, oduPrincipal)
    .filter((r) => r.categoria === 'quisila')
    .slice(0, 3);
  for (const q of quisilas) {
    fontes.push(recordParaSource(q));
  }

  // 2) Se houver padrão orí, anexa 1 sinal orí para contextualizar.
  if (ori) {
    const sinalOri = buscarPorOdu(corpus, oduPrincipal).find(
      (r) =>
        (r.categoria === 'oriquente' || r.categoria === 'orifrio') &&
        r.padrao_orí === ori
    );
    if (sinalOri) fontes.push(recordParaSource(sinalOri));
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  // Monta texto com 3 itens, PT-BR direto.
  const base = juntarTextos(fontes, 3);
  const intro = ori === 'quente'
    ? 'Com orí quente, evite:'
    : ori === 'frio'
      ? 'Com orí frio, evite:'
      : 'Evite:';
  const conteudo = limitarFrases(`${intro} ${base}`, maxFrases);

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, 3),
    requires_professional_review: false,
  };
}
