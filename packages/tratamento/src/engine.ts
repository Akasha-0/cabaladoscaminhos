/**
 * @akasha/tratamento — engine.ts
 *
 * Orquestrador do Synthesis Engine. Recebe um `PilarInput` (subset dos
 * 7 Pilares calculado por `@akasha/core`), consulta o corpus terapêutico
 * (352 arquivos em `packages/tratamento/src/textos/`), e retorna 7
 * camadas terapêuticas em PT-BR + cadeia de pensamento auditável.
 *
 * Estilo: therapeutic-holistic universalist (NÃO cult). Sem termos
 * proprietários (Human Design, Gene Keys, BodyGraph). 'Menos é mais':
 * 1-5 frases por camada, verbos diretos, actionable.
 *
 * Ver: ADR 0002, R-030 §5 (synthesis_v1.md), research-medicina-
 * tradicional-2026-06-23.md, research-numerologia-psicanalise-2026-06-23.md.
 */

import type {
  CadeiaPensamento,
  Camada,
  Corpus,
  EngineOptions,
  PilarInput,
  SynthesisOutput,
} from './types';

import { carregarCorpus } from './corpus-loader';

import { gerarCamada1Diagnostico } from './camadas/camada-1-diagnostico';
import { gerarCamada2Praticas } from './camadas/camada-2-praticas-imediatas';
import { gerarCamada3Areas } from './camadas/camada-3-tratamento-por-area';
import { gerarCamada4Quisilas } from './camadas/camada-4-quisilas';
import { gerarCamada5Alinhamento } from './camadas/camada-5-alinhamento-energetico';
import { gerarCamada6Psicanalise } from './camadas/camada-6-psicanalise';
import { gerarCamada7Coaching } from './camadas/camada-7-coaching';

/** Versão semver do motor. Incrementar em mudanças de schema/lógica. */
export const ENGINE_VERSION = '0.1.0';

/** Disclaimer terapêutico padrão (R-022, R-022b ethics charter). */
export const DISCLAIMER_TERAPEUTICO =
  'Estas orienta\u00e7\u00f5es s\u00e3o baseadas em tradi\u00e7\u00f5es terap\u00eauticas p\u00fablicas (fitoterapia brasileira, ' +
  'numerologia cabal\u00edstica, psican\u00e1lise open-source) e N\u00c3O substituem acompanhamento m\u00e9dico, psicol\u00f3gico ' +
  'ou psiqui\u00e1trico profissional. Em caso de gesta\u00e7\u00e3o, lacta\u00e7\u00e3o, uso cont\u00ednuo de medicamentos ou ' +
  'condi\u00e7\u00f5es cr\u00f4nicas, consulte um profissional de sa\u00fade antes de iniciar qualquer pr\u00e1tica. Para uso ' +
  'lit\u00fargico (Pilar 4): supervisionar com terreiro de If\u00e1/Candombl\u00e9.';

/** Limite default de frases por camada (1-5). */
const DEFAULT_MAX_FRASES = 3;

/**
 * Sintetiza as 7 camadas terapêuticas a partir dos 7 Pilares de uma pessoa.
 *
 * @param input PilarInput com subset dos 7 Pilares + intenção + sinais.
 * @param options.maxFrases Limite de frases por camada (default 3, max 5).
 * @returns SynthesisOutput com 7 camadas, cadeia de pensamento, versão e disclaimer.
 *
 * Estilo: PT-BR, therapeutic-holistic universalist, sem rodeio.
 * Graceful degradation: se corpus ausente para alguma camada, `conteudo: null`.
 */
export function sintetizar(
  input: PilarInput,
  options?: EngineOptions
): SynthesisOutput {
  const maxFrases = Math.max(1, Math.min(5, options?.maxFrases ?? DEFAULT_MAX_FRASES));
  const corpus: Corpus = carregarCorpus();

  // Cadeia de pensamento: sequência ordenada de passos com fontes usadas.
  const cadeia: CadeiaPensamento[] = [];
  let step = 0;
  const proximo = (): number => (step += 1);

  // Step 1: carregar corpus.
  cadeia.push({
    step: proximo(),
    descricao: `Carregar corpus terap\u00eautico (${corpus.size} arquivos indexados).`,
    fontes_usadas: [],
  });

  // Step 2: identificar padr\u00e3o or\u00ed (quente/frio) do Pilar 4.
  cadeia.push({
    step: proximo(),
    descricao: `Identificar padr\u00e3o or\u00ed e Odu principal do Pilar 4: ${input.odu?.odu_principal ?? 'n\u00e3o informado'}.`,
    fontes_usadas: [],
  });

  // Step 3: gerar Camada 1.
  const camada1 = gerarCamada1Diagnostico(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 1 (Diagn\u00f3stico Imediato): ${camada1.conteudo ? camada1.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada1.fontes.map((f) => f.id),
  });

  // Step 4: gerar Camada 2.
  const camada2 = gerarCamada2Praticas(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 2 (Pr\u00e1ticas Imediatas): ${camada2.conteudo ? camada2.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada2.fontes.map((f) => f.id),
  });

  // Step 5: identificar \u00e1reas da vida.
  cadeia.push({
    step: proximo(),
    descricao: `Identificar \u00e1reas da vida (sa\u00fade, rela\u00e7\u00e3o, trabalho, finan\u00e7as, fam\u00edlia, espiritualidade, lazer, sexualidade, intelecto) a partir da inten\u00e7\u00e3o.`,
    fontes_usadas: [],
  });

  // Step 6: gerar Camada 3.
  const camada3 = gerarCamada3Areas(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 3 (Tratamento por \u00c1rea): ${camada3.conteudo ? camada3.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada3.fontes.map((f) => f.id),
  });

  // Step 7: gerar Camada 4.
  const camada4 = gerarCamada4Quisilas(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 4 (Quisilas): ${camada4.conteudo ? camada4.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada4.fontes.map((f) => f.id),
  });

  // Step 8: gerar Camada 5.
  const camada5 = gerarCamada5Alinhamento(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 5 (Alinhamento Energ\u00e9tico): ${camada5.conteudo ? camada5.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada5.fontes.map((f) => f.id),
  });

  // Step 9: detectar padr\u00f5es emocionais repetitivos.
  cadeia.push({
    step: proximo(),
    descricao: `Detectar padr\u00f5es emocionais (mesmo n\u00famero em P1+P4+P5 ou sinal cl\u00ednico agudo).`,
    fontes_usadas: [],
  });

  // Step 10: gerar Camada 6.
  const camada6 = gerarCamada6Psicanalise(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 6 (Psican\u00e1lise): ${camada6.conteudo ? camada6.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada6.fontes.map((f) => f.id),
  });

  // Step 11: gerar Camada 7.
  const camada7 = gerarCamada7Coaching(input, corpus, maxFrases);
  cadeia.push({
    step: proximo(),
    descricao: `Camada 7 (Coaching Longo Prazo): ${camada7.conteudo ? camada7.fontes.length + ' fontes citadas' : 'sem corpus suficiente'}.`,
    fontes_usadas: camada7.fontes.map((f) => f.id),
  });

  return {
    camadas: {
      'camada-1-diagnostico': camada1,
      'camada-2-praticas-imediatas': camada2,
      'camada-3-tratamento-por-area': camada3,
      'camada-4-quisilas': camada4,
      'camada-5-alinhamento-energetico': camada5,
      'camada-6-psicanalise': camada6,
      'camada-7-coaching': camada7,
    },
    cadeia_pensamento: cadeia,
    versao: ENGINE_VERSION,
    disclaimer: DISCLAIMER_TERAPEUTICO,
  };
}
