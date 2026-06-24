/**
 * Camada 6 — Psicanálise
 *
 * Detecta padrões emocionais (mesmo nº em P1+P4+P5, ou padrão repetitivo
 * nos sinais clínicos). Sugere 1 pergunta socrática + convite de insight.
 *
 * Aciona `requires_professional_review=true` se houver indicação de
 * trauma ou dissociação.
 *
 * Ref: `packages/tratamento/src/textos/09-camadas-7/camada-6-psicanalise.json`
 */

import type { Camada, Corpus, PilarInput, TextSource } from '../types';
import {
  buscarPorCategoria,
  camadaVazia,
  juntarTextos,
  limitarFrases,
  recordParaSource,
} from './_helpers';

export function gerarCamada6Psicanalise(
  input: PilarInput,
  corpus: Corpus,
  maxFrases: number
): Camada {
  const id = 'camada-6-psicanalise';
  const titulo = 'Psicanálise (padrões emocionais)';

  // 1) Detectar padrão repetido nos números dos pilares.
  const lp = input.cabala?.life_path;
  const oduPrincipal = input.odu?.odu_principal;
  const hex = input.iching?.hexagrama_natal;

  const oduNum = oduPrincipal ? parseInt((oduPrincipal.match(/\((\d+)\)/)?.[1]) ?? '0', 10) : 0;
  const temRepeticao =
    lp !== undefined && (oduNum === lp || hex === lp);

  // 2) Detectar sinal agudo (dissociação/trauma) na intenção + sinais.
  const textoSinais = [input.intencao, ...(input.sinais_clinicos ?? [])].join(' ').toLowerCase();
  const flagAgudo = /\b(trauma|dissocia|abuso|viol[êe]ncia|desespero|p[aâ]nico)\b/.test(textoSinais);

  // 3) Selecionar perguntas clínicas (1-2) + essência/sombra do caminho.
  const fontes: TextSource[] = [];

  const perguntas = buscarPorCategoria(corpus, 'pergunta_clinica')
    .filter((r) => typeof r.grupo === 'string')
    .slice(0, 2);
  for (const p of perguntas) fontes.push(recordParaSource(p));

  // Essência/sombra do caminho se houver match numérico.
  if (lp && lp >= 1 && lp <= 22) {
    const essencia = Array.from(corpus.values()).find(
      (r) => r.categoria === 'caminho_essencia' && r.caminho_numero === lp
    );
    const sombra = Array.from(corpus.values()).find(
      (r) => r.categoria === 'caminho_sombra' && r.caminho_numero === lp
    );
    if (essencia) fontes.push(recordParaSource(essencia));
    if (sombra) fontes.push(recordParaSource(sombra));
  }

  if (fontes.length === 0) {
    return camadaVazia(id, titulo);
  }

  // 4) Montar conteúdo: padrão detectado + pergunta + convite.
  const base = juntarTextos(fontes, maxFrases);
  const introPadrao = temRepeticao
    ? `Detectamos repeti\u00e7\u00e3o num\u00e9rica entre Pilares (${lp ?? '?'} repete). Padr\u00e3o emocional central:`
    : 'Padr\u00e3o emocional central:';
  const convite = flagAgudo
    ? 'Considere acompanhamento profissional antes de aprofundar sozinho.'
    : 'Convite de insight: responda a pergunta acima em uma frase por dia.';
  const conteudo = limitarFrases(`${introPadrao} ${base} ${convite}`, maxFrases);

  return {
    id,
    titulo,
    conteudo,
    fontes: fontes.slice(0, 3),
    requires_professional_review: flagAgudo,
  };
}
