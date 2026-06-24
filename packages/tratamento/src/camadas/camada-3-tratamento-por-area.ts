/**
 * Camada 3 — Tratamento por Área
 *
 * Split por 9 áreas da vida (saúde, relação, trabalho, finanças, família,
 * espiritualidade, lazer, sexualidade, intelecto). Identifica 1-3 áreas
 * a partir da intenção livre e dos sinais clínicos.
 *
 * Para cada área, mapeia preceitos/quisilas do Odu principal cujo
 * `aspecto` (campo presente em preceito/quisila) bate com a área.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-3-tratamento-por-area.json`
 */

import type {
  AreaTratamento,
  Camada,
  Corpus,
  PilarInput,
  TextSource,
} from '../types';
import {
  camadaVazia,
  identificarAreas,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

const MAPA_AREA_ASPECTOS: Record<AreaTratamento, string[]> = {
  saude: ['corpo', 'respiração', 'movimento', 'meditação'],
  relacao: ['relacionamento', 'comunicação', 'diálogo', 'escuta'],
  trabalho: ['trabalho', 'planejamento', 'liderança', 'foco'],
  financas: ['dinheiro', 'planejamento', 'economia', 'gestão'],
  familia: ['família', 'cuidado', 'comunicação', 'diálogo'],
  espiritualidade: ['meditação', 'orová', 'conexão', 'missão'],
  lazer: ['lazer', 'descanso', 'movimento', 'corpo'],
  sexualidade: ['corpo', 'energia', 'movimento', 'intimidade'],
  intelecto: ['foco', 'estudo', 'leitura', 'planejamento'],
};

export function gerarCamada3Areas(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-3-tratamento-por-area';
  const titulo = 'Tratamento por Área';

  const oduPrincipal = input.odu?.odu_principal;
  const areas = identificarAreas(input.intencao, input.sinais_clinicos);

  if (!oduPrincipal || areas.length === 0) {
    return camadaVazia(id, titulo);
  }

  const fontes: TextSource[] = [];
  const oduRecords = Array.from(corpus.values()).filter(
    (r) => r.odu === oduPrincipal && (r.categoria === 'preceito' || r.categoria === 'quisila')
  );

  // Para cada área, pega 1 registro cujo `aspecto` casa com a área.
  for (const area of areas) {
    const aspectos = MAPA_AREA_ASPECTOS[area];
    const match = oduRecords.find(
      (r) =>
        typeof r.aspecto === 'string' &&
        aspectos.some((a) => r.aspecto!.toLowerCase().includes(a.toLowerCase()))
    );
    if (match) {
      fontes.push(recordParaSource(match));
    }
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  const base = juntarTextos(fontes, maxFrases);
  const areasLabel = areas.join(', ');
  const conteudo = limitarFrases(`${base} Foco em: ${areasLabel}.`, maxFrases);

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, 3),
    requires_professional_review: false,
  };
}
