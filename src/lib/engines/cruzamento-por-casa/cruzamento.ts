/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · MAIN ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * cruzamentoPorCasa(mesa, mapa) → CruzamentoCasa[36]
 *
 * For each mesa casa c (1..36):
 *   1. Look up tema from TEMAS_CASAS[c]
 *   2. Compute contribuicoes from each of 4 maps (when available):
 *      - Astrologia: natal cusp sign of casa c (if c <= 12, else wraps)
 *      - Numerologia: numero = (numeroDestino + c) % 9 || 9
 *      - Odu: odu + orixás
 *      - Cigano: carta drawn at position c (lookup by cartaCiganaId)
 *   3. Build sintese: 2-3 sentences citing at least one symbol per source
 *   4. Return CruzamentoCasa with fontes subset of contribuicoes.tradicao
 *
 * No I/O, no React, no crypto — pure function for spec/smoke testability.
 */

import {
  CASAS_ORDENADAS,
  KEYWORDS_ODUS,
  NOMES_CARTAS_CIGANAS,
  TEMAS_CASAS,
} from './constants.ts';
import type {
  CasaId,
  Contribuicao,
  CruzamentoCasa,
  MapaConsulente,
  MesaCard,
  MesaRealState,
  Tradicao,
} from './types.ts';

// ════════════════════════════════════════════════════════════════════════════
// CONTRIBUTIONS — PER MAP
// ════════════════════════════════════════════════════════════════════════════

/**
 * Astrologia contribution: pulls the natal cusp sign for casa c.
 * For mesa casas > 12, wraps modulo 12 (casa 13 = astrologia 1, etc.).
 * Returns null if the natal entry is empty (defensive).
 */
function contribuicaoAstrologia(
  c: CasaId,
  mapa: MapaConsulente,
): Contribuicao | null {
  const cAstro = ((c - 1) % 12) + 1;
  const sign = mapa.astrologia.casas[cAstro];
  if (typeof sign !== 'string' || sign.length === 0) return null;
  return {
    tradicao: 'astrologia',
    texto: `Casa astrológica ${cAstro} em ${sign} ilumina ${TEMAS_CASAS[c]}`,
    ref: `casa-${cAstro}-${sign}`,
  };
}

/**
 * Numerologia contribution: computes (numeroDestino + c) % 9 with master
 * correction (|| 9 to keep 1..9 range). Text cites the vibration number
 * and the casa's theme.
 */
function contribuicaoNumerologia(
  c: CasaId,
  mapa: MapaConsulente,
): Contribuicao {
  const sum = mapa.numerologia.numeroDestino + c;
  let numero = sum % 9;
  if (numero === 0) numero = 9;
  return {
    tradicao: 'numerologia',
    texto: `Número ${numero} — vibração do destino ${mapa.numerologia.numeroDestino} sobre ${TEMAS_CASAS[c]}`,
    ref: `numero-${numero}-casa-${c}`,
  };
}

/**
 * Odu contribution: cites the consulente's odu + its keyword + the casa's
 * theme. References both orixás (regente + atenção) so downstream can
 * identify which is active and which is asking passage.
 */
function contribuicaoOdu(
  c: CasaId,
  mapa: MapaConsulente,
): Contribuicao {
  const keyword = KEYWORDS_ODUS[mapa.odu.odu] ?? 'movimento';
  return {
    tradicao: 'orixas',
    texto: `${mapa.odu.odu} (${keyword}) — ${mapa.odu.orixaRegente} regente, ${mapa.odu.orixaAtencao} pede passagem em ${TEMAS_CASAS[c]}`,
    ref: `odu-${mapa.odu.odu}`,
  };
}

/**
 * Cigano contribution: pulls the card drawn at position c. Looks up the
 * card name from the deck catalog (NOMES_CARTAS_CIGANAS).
 */
function contribuicaoCigano(
  c: CasaId,
  carta: MesaCard,
): Contribuicao {
  const nome = NOMES_CARTAS_CIGANAS[carta.cartaCiganaId] ?? `Carta ${carta.cartaCiganaId}`;
  const pos = carta.posicao === 'baixo' ? 'invertida' : 'em pé';
  return {
    tradicao: 'cigano',
    texto: `Carta ${nome} ${pos} em ${TEMAS_CASAS[c]}`,
    ref: `carta-${carta.cartaCiganaId}`,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SINTESE — 2-3 SENTENCE SYNTHESIS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Builds the sintese string. Cites one specific symbol from each
 * contributing map. The sintese is SURGICAL: it names the casa's tema,
 * the natal cusp sign, the destination number, the odu keyword, and the
 * card name — so a reader can verify the cross-reference without
 * consulting the underlying maps.
 */
function buildSintese(
  c: CasaId,
  tema: string,
  contribs: ReadonlyArray<Contribuicao>,
  mapa: MapaConsulente,
): string {
  const parts: string[] = [];

  // Sentence 1 — Astrologia (if present)
  const astro = contribs.find((x) => x.tradicao === 'astrologia');
  if (astro) {
    parts.push(
      `Na casa de ${tema}, o mapa natal aponta a cuspide ${astro.texto.split(' em ')[0]?.split('ilumina ')[0]?.trim() ?? 'o signo'} como veiculo da questão`,
    );
  } else {
    parts.push(`Na casa de ${tema}, a questao pede leitura simbolica`);
  }

  // Sentence 2 — Numerologia + Odu
  const num = contribs.find((x) => x.tradicao === 'numerologia');
  const odu = contribs.find((x) => x.tradicao === 'orixas');
  if (num && odu) {
    parts.push(
      `o numero ${num.texto.match(/Número (\d+)/)?.[1] ?? '?'} vibra em sintonia com ${mapa.odu.odu}, e o orixá ${mapa.odu.orixaRegente} sustenta a regencia enquanto ${mapa.odu.orixaAtencao} pede passagem`,
    );
  } else if (num) {
    parts.push(
      `o numero ${num.texto.match(/Número (\d+)/)?.[1] ?? '?'} carrega a vibracao da casa`,
    );
  } else if (odu) {
    parts.push(
      `${mapa.odu.odu} rege a regiao com ${mapa.odu.orixaRegente} como patrono`,
    );
  }

  // Sentence 3 — Cigano (always present if mesa has cards)
  const cigano = contribs.find((x) => x.tradicao === 'cigano');
  if (cigano) {
    const cardName = cigano.texto.match(/Carta ([^\s]+(?:\s+[^\s]+)?)/)?.[1] ?? 'a carta';
    parts.push(`A carta ${cardName} confirma o caminho e fecha a leitura da casa`);
  }

  return parts.join('. ') + '.';
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Public entry point. Computes the cruzamento for all 36 mesa casas.
 *
 * Returns a frozen array of 36 CruzamentoCasa records in order 1..36.
 *
 * Algorithm:
 *   1. Build a casa→carta lookup from the mesa
 *   2. For each casa c in CASAS_ORDENADAS:
 *      a. Look up tema from TEMAS_CASAS[c]
 *      b. Compute contribuicoes (1-4 entries)
 *      c. Build sintese citing each contributing map
 *      d. Emit CruzamentoCasa with fontes subset
 */
export function cruzamentoPorCasa(
  mesa: MesaRealState,
  mapa: MapaConsulente,
): ReadonlyArray<CruzamentoCasa> {
  // Build casa→carta lookup once
  const cartaPorCasa = new Map<CasaId, MesaCard>();
  for (const carta of mesa.cartas) {
    cartaPorCasa.set(carta.casa, carta);
  }

  const result: CruzamentoCasa[] = [];

  for (const c of CASAS_ORDENADAS) {
    const tema = TEMAS_CASAS[c] ?? 'Tema desconhecido';

    // Compute contribuicoes
    const contribuicoes: Contribuicao[] = [];

    const astro = contribuicaoAstrologia(c, mapa);
    if (astro) contribuicoes.push(astro);

    contribuicoes.push(contribuicaoNumerologia(c, mapa));
    contribuicoes.push(contribuicaoOdu(c, mapa));

    const carta = cartaPorCasa.get(c);
    if (carta) {
      contribuicoes.push(contribuicaoCigano(c, carta));
    }

    // Build sintese
    const sintese = buildSintese(c, tema, contribuicoes, mapa);

    // Fontes — subset of Tradiacao from contributing tradicoes
    const fontes: Tradicao[] = [];
    for (const cb of contribuicoes) {
      if (!fontes.includes(cb.tradicao)) fontes.push(cb.tradicao);
    }

    result.push(
      Object.freeze({
        casa: c,
        tema,
        contribuicoes: Object.freeze(contribuicoes.slice()),
        sintese,
        fontes: Object.freeze(fontes),
      }),
    );
  }

  return Object.freeze(result);
}