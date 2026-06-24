/**
 * Camada 7 — Coaching Longo Prazo
 *
 * Metas em 30/90/365 dias + hábito semanal + marcador de progresso.
 * Honra autonomia da pessoa; nunca prescreve 'terapia X' sem consentimento.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-7-coaching-longo-prazo.json`
 */

import type { Camada, Corpus, PilarInput, TextSource } from '../types';
import {
  buscarPorOdu,
  camadaVazia,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada7Coaching(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-7-coaching';
  const titulo = 'Coaching Longo Prazo';

  const oduPrincipal = input.odu?.odu_principal;
  if (!oduPrincipal) {
    return camadaVazia(id, titulo);
  }

  const fontes: TextSource[] = [];

  // 1) Preceitos 'movimento'/'ação' do Odu como base dos hábitos.
  const preceitos = buscarPorOdu(corpus, oduPrincipal)
    .filter((r) => r.categoria === 'preceito')
    .slice(0, 2);
  for (const p of preceitos) fontes.push(recordParaSource(p));

  // 2) Essência do caminho de vida (Pilar 1) para a meta 365d.
  const lp = input.cabala?.life_path;
  if (lp && lp >= 1 && lp <= 22) {
    const essencia = Array.from(corpus.values()).find(
      (r) => r.categoria === 'caminho_essencia' && r.caminho_numero === lp
    );
    if (essencia) fontes.push(recordParaSource(essencia));
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  // 3) Texto PT-BR com estrutura 30/90/365 dias.
  const base = juntarTextos(fontes, maxFrases);
  const meta30 = input.intencao
    ? `Defina uma aç\u00e3o di\u00e1ria ligada a: ${input.intencao.slice(0, 60)}.`
    : 'Escolha 1 aç\u00e3o di\u00e1ria (5 min) ligada ao Pilar 4.';
  const meta90 = `Em 90 dias: revisar o preceito "${fontes[0]?.conteudo?.split('.')[0] ?? 'ação contínua'}".`;
  const meta365 = 'Em 365 dias: meta anual alinhada com seu caminho de vida.';
  const habito = `H\u00e1bito semanal: ${base.split('.')[0] ?? 'pr\u00e1tica regular'}.`;
  const checkin = 'Check-in quinzenal com auto-avalia\u00e7\u00e3o (1-5).';

  const conteudo = limitarFrases(
    `${meta30} ${meta90} ${meta365} ${habito} ${checkin}`,
    maxFrases
  );

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, 3),
    // Camada 7 SEMPRE recomenda consentimento explícito + check-in.
    requires_professional_review: true,
  };
}
