/**
 * Camada 2 — Práticas Imediatas
 *
 * Sugere 1-3 práticas corporais rápidas (cristal, banho, erva) com base
 * no elemento detectado do Pilar 4 + chácra dominante. Sem práticas que
 * exijam diagnóstico médico.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-2-praticas-imediatas.json`
 */

import type { Camada, Corpus, PilarInput, TextSource } from '../types';
import {
  buscarPorChacra,
  buscarPorElemento,
  camadaVazia,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada2Praticas(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-2-praticas-imediatas';
  const titulo = 'Práticas Imediatas';

  const fontes: TextSource[] = [];
  const elemento = input.odu?.elemento;
  const oduPrincipal = input.odu?.odu_principal;

  // 1) Práticas de chácra dominante (1-2 fontes).
  //    Usa a primeira chácra que tiver preceito no corpus.
  const oduRecords = oduPrincipal
    ? Array.from(corpus.values()).filter(
        (r) => r.odu === oduPrincipal && Array.isArray(r.chacra_referente) && r.chacra_referente.length > 0
      )
    : [];
  const chacraAlvo = oduRecords[0]?.chacra_referente?.[0];
  if (chacraAlvo) {
    const praticasChacra = buscarPorChacra(corpus, chacraAlvo).slice(0, 2);
    for (const p of praticasChacra) fontes.push(recordParaSource(p));
  }

  // 2) Banho do elemento (1 fonte).
  if (elemento) {
    const banhos = buscarPorElemento(corpus, elemento)
      .filter((r) => r.categoria === 'elemento_banho')
      .slice(0, 1);
    for (const b of banhos) fontes.push(recordParaSource(b));
  }

  // 3) Fallback: se nada encontrado, usa preceito do Odu.
  if (fontes.length === 0 && oduPrincipal) {
    const preceitos = Array.from(corpus.values()).filter(
      (r) => r.odu === oduPrincipal && r.categoria === 'preceito'
    );
    if (preceitos[0]) fontes.push(recordParaSource(preceitos[0]));
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  // Conteúdo: junta os textos-fonte em 2-3 frases.
  const base = juntarTextos(fontes, maxFrases);
  const conteudo = limitarFrases(base, maxFrases);

  // Práticas corporais são seguras por padrão; só flag profissional se
  // requires_professional_review do corpus for true.
  const flagProfissional = fontes.some((f) => {
    const rec = corpus.get(f.id);
    return rec?.requires_professional_review === true;
  });

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, Math.min(3, maxFrases)),
    requires_professional_review: flagProfissional,
  };
}
