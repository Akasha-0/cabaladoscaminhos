/**
 * Akasha Synthesis — Narrative Generator v2
 * F-226 · Gera narrativas profundas e unificadas por dimensão.
 *
 * Princípio: o usuário não quer "teu número é 11".
 * Quer: "O que isso SIGNIFICA na minha vida e o que eu FAÇO com isso?"
 *
 * Cada Pilar entrega uma perspectiva sobre a dimensão.
 * O Generator sintetiza as 5 perspectivas em UMA voz Akasha — fluida,
 * prática, fundamentada em fonte.
 */

import type { PilaresDados, SignificadoCurado } from '../significados-curados';
import { significadoPorPilar } from '../significados-curados';
import { traducaoPara, traducoesDaArea, type Area } from '../traducao-areas';
import type { DimensaoId } from './dimensoes';

// ─── Lookup dos significados por Pilar ──────────────────────────────────────

function CabralSignificado(lp: number): SignificadoCurado | undefined {
  return significadoPorPilar('cabala', lp);
}

function AstroSignificado(solSigno: string): SignificadoCurado | undefined {
  return significadoPorPilar('astrologia', solSigno);
}

function TantraSignificado(corpo: number): SignificadoCurado | undefined {
  return significadoPorPilar('tantrica', corpo);
}

// ─── Mapa de áreas por dimensão ─────────────────────────────────────────────

const DIM_AREA_MAP: Record<DimensaoId, Area[]> = {
  saude: ['saude', 'paz'],
  trabalho: ['trabalho', 'dinheiro'],
  sexualidade: ['sexualidade'],
  amor: ['relacoes'],
  criacao: ['criatividade'],
  proposito: ['proposito'],
  familia: [],
  espiritualidade: ['espiritualidade'],
  superacao: [],
};

// ─── Narrativa por Dimensão ─────────────────────────────────────────────────

/**
 * Gera narrativa UNIFICADA para uma dimensão.
 * Pipeline:
 *  1. Identidade — "Você é X no Y"
 *  2. Perspectivas — o que CADA pilar fala sobre esta dimensão
 *  3. Síntese — onde convergem
 *  4. Missão + Prática
 */
export function gerarNarrativaDimensao(
  dimId: DimensaoId,
  pilares: PilaresDados
): string {
  const lp = pilares.cabala?.life_path;
  const solSigno = pilares.astrologia?.sol_signo;
  const corpo = pilares.tantrica?.corpo_predominante;
  const oduPrinc = pilares.odu?.odu_principal;
  const hex = pilares.iching?.hexagrama_dia;
  const lilithSigno = (pilares.astrologia?.lilith_signo ?? undefined) as string | undefined;
  const casa8Signo = (pilares.astrologia?.casa_8_signo ?? undefined) as string | undefined;

  const sCabala = lp ? CabralSignificado(lp) : undefined;
  const sAstro = solSigno ? AstroSignificado(solSigno) : undefined;
  const sTantra = corpo ? TantraSignificado(corpo) : undefined;

  const areas = DIM_AREA_MAP[dimId] ?? [];
  const traducs = areas.flatMap((a) => traducoesDaArea(a));

  const identidade = buildIdentidade(
    dimId, sCabala, sAstro, sTantra, lp, solSigno,
    corpo, lilithSigno, casa8Signo, oduPrinc
  );
  if (!identidade) return 'Sem dados suficientes para gerar narrativa.';

  const perspectivas = buildPerspectivas(dimId, traducs, sCabala, sAstro, sTantra, oduPrinc, hex);
  const synthesis = buildSynthesis(dimId, traducs, sCabala, sAstro);
  const missaoPratica = buildMissaoPratica(dimId, traducs, sCabala, sAstro, sTantra);

  return [identidade, perspectivas, synthesis, missaoPratica]
    .filter(Boolean)
    .join('\n\n');
}

// ─── Sub-builders ───────────────────────────────────────────────────────────

function buildIdentidade(
  dimId: DimensaoId,
  sCabala: SignificadoCurado | undefined,
  sAstro: SignificadoCurado | undefined,
  sTantra: SignificadoCurado | undefined,
  lp: number | undefined,
  solSigno: string | undefined,
  corpo: number | undefined,
  lilithSigno: string | undefined,
  casa8Signo: string | undefined,
  oduPrinc: string | undefined
): string | null {
  switch (dimId) {
    case 'saude':
      if (sTantra && sCabala) {
        return `${sTantra.essencia} Seu corpo é o instrumento principal. ${sCabala.missao}`;
      }
      if (sTantra) return `${sTantra.essencia} Seu corpo pede atenção hoje.`;
      return null;

    case 'trabalho':
      if (sCabala && sAstro) {
        return `Você é ${sCabala.titulo} (Caminho ${lp}) com ${solSigno} como identidade pública. ${sCabala.missao} Seu trabalho ideal precisa satisfazer os dois.`;
      }
      if (sCabala) return `Seu caminho de vida ${lp} é ${sCabala.titulo.toLowerCase()}. ${sCabala.missao}`;
      return null;

    case 'sexualidade': {
      if (lilithSigno && casa8Signo && sTantra) {
        return `Sua sexualidade tem TRÊS marcadores: seu corpo energético (${corpo} — ${sTantra.titulo}), seu desejo oculto (Lilith em ${lilithSigno}) e sua zona de transformação (Casa 8 em ${casa8Signo}). ${sTantra.essencia}`;
      }
      if (sTantra) return `${sTantra.titulo} é seu corpo energético predominante. ${sTantra.essencia}`;
      return null;
    }

    case 'amor':
      if (sAstro && sCabala) {
        return `Você ama a partir do ${solSigno} — ${sAstro.essencia} No relacionamento, isso se manifesta como ${sAstro.missao}`;
      }
      if (sCabala) return `${sCabala.titulo} também descreve como você se conecta: ${sCabala.essencia}`;
      return null;

    case 'criacao':
      if (sCabala && sAstro) {
        return `Sua expressão criativa nasce da combinação de ${sCabala.titulo} com ${solSigno}. ${sCabala.essencia} Sua arte é ${sAstro.essencia.toLowerCase()}`;
      }
      if (sCabala) return `Você é ${sCabala.titulo}. ${sCabala.essencia} Sua criação reflete isso.`;
      return null;

    case 'proposito':
      if (sCabala) {
        return `Seu contrato de vida resumiu-se em um número: ${lp}. ${sCabala.titulo} — ${sCabala.essencia} ${sCabala.missao}`;
      }
      return null;

    case 'familia':
      return oduPrinc
        ? `Sua ancestralidade é mediada pelo Odu ${oduPrinc}. Este signo carrega uma mensagem sobre de onde você vem e o que herdou. Explore sua árvore — as respostas estão nos ancestrais.`
        : null;

    case 'espiritualidade':
      if (sCabala && sTantra) {
        return `Sua espiritualidade opera na interseção de ${sCabala.titulo} e ${sTantra.titulo}. ${sCabala.essencia} ${sTantra.essencia}`;
      }
      if (sTantra) return `${sTantra.essencia} Sua espiritualidade passa pelo corpo.`;
      return null;

    case 'superacao':
      if (sCabala && sAstro) {
        return `${sCabala.sombra} é seu desafio central. ${sAstro.sombra ?? ''} A transformação vem quando você para de evitar e começa a atravessar.`;
      }
      if (sCabala) return `${sCabala.sombra} é sua sombra. Atravessá-la é a missão.`;
      return null;

    default:
      return null;
  }
}

function buildPerspectivas(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  sCabala: SignificadoCurado | undefined,
  sAstro: SignificadoCurado | undefined,
  sTantra: SignificadoCurado | undefined,
  oduPrinc: string | undefined,
  hex: number | undefined
): string {
  if (traducs.length === 0) return '';

  const lines: string[] = [];
  lines.push('**O que cada pilar diz sobre esta dimensão:**');

  const tCabala = traducs.find((t) => t.pilar === 'cabala');
  const tAstro = traducs.find((t) => t.pilar === 'astrologia');
  const tTantra = traducs.find((t) => t.pilar === 'tantrica');
  const tOdu = traducs.find((t) => t.pilar === 'odu');
  const tIching = traducs.find((t) => t.pilar === 'iching');

  if (tCabala) lines.push(`· Cabala: ${tCabala.frase}`);
  if (tAstro) lines.push(`· Astrologia: ${tAstro.frase}`);
  if (tTantra) lines.push(`· Tântrica: ${tTantra.frase}`);
  if (tOdu) lines.push(`· Odu: ${tOdu.frase}`);
  if (tIching) lines.push(`· I Ching: ${tIching.frase}`);

  return lines.join('\n');
}

function buildSynthesis(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  sCabala: SignificadoCurado | undefined,
  sAstro: SignificadoCurado | undefined
): string {
  if (traducs.length === 0) return '';

  const primary = traducs[0];
  if (!primary) return '';

  const pilarNome: Record<string, string> = {
    cabala: 'Cabala', astrologia: 'Astrologia', tantrica: 'Tântrica',
    odu: 'Odu', iching: 'I Ching',
  };

  const nome = pilarNome[primary.pilar] ?? primary.pilar;
  return `**Akasha Synthesis:** ${nome} é o pilar que mais fala sobre esta dimensão. ${primary.frase}`;
}

function buildMissaoPratica(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  sCabala: SignificadoCurado | undefined,
  sAstro: SignificadoCurado | undefined,
  sTantra: SignificadoCurado | undefined
): string {
  const lines: string[] = [];
  lines.push('**O que fazer agora:**');

  if (sCabala?.missao) lines.push(`· ${sCabala.missao}`);
  if (sAstro?.missao) lines.push(`· ${sAstro.missao}`);
  if (sTantra?.pratica) lines.push(`· Prática: ${sTantra.pratica}`);

  // Extrai ação da frase da tradução
  if (traducs[0]) {
    const frase = traducs[0].frase;
    const match = frase.match(/[A-Z][^.!?]*[.!?]/);
    if (match) lines.push(`· ${match[0]}`);
  }

  return lines.join('\n');
}

// ─── Sexualidade Deep Dive ───────────────────────────────────────────────────

/**
 * Gera a narrativa DEEP de Sexualidade.
 * É a dimensão mais complexa — usa 3 marcadores astrológicos +
 * Tantra body + Cabala number + Odu.
 */
export function gerarNarrativaSexualidade(pilares: PilaresDados): string {
  const astro = pilares.astrologia;
  const tantra = pilares.tantrica;
  const cabala = pilares.cabala;
  const odu = pilares.odu;

  const corpo = tantra?.corpo_predominante;
  const sTantra = corpo ? TantraSignificado(corpo) : undefined;
  const solSigno = astro?.sol_signo;
  const sAstro = solSigno ? AstroSignificado(solSigno) : undefined;
  const sCabala = cabala?.life_path ? CabralSignificado(cabala.life_path) : undefined;

  const lines: string[] = [];

  lines.push('**Sexualidade — Mapa Completo**\n');

  // Marcador 1: Tantra Body
  if (sTantra) {
    lines.push(`**Teu corpo energético é o #${corpo} — ${sTantra.titulo}**`);
    lines.push(sTantra.essencia);
    lines.push(sTantra.missao);
    if (sTantra.sombra) lines.push(`Sombra: ${sTantra.sombra}`);
    lines.push('');
  }

  // Marcador 2: Lilith
  if (astro?.lilith_signo) {
    const sLilith = AstroSignificado(astro.lilith_signo);
    lines.push(`**Lilith em ${astro.lilith_signo} — o que te excita em segredo**`);
    if (sLilith) {
      lines.push(sLilith.essencia);
      lines.push(sLilith.missao);
    } else {
      lines.push(
        `Seu desejo profundo opera neste signo. O que é proibido, negado ou reprimido aqui é exatamente o que te move.`
      );
    }
    lines.push('');
  }

  // Marcador 3: Casa 8
  if (astro?.casa_8_signo) {
    const sCasa8 = AstroSignificado(astro.casa_8_signo);
    lines.push(`**Casa 8 em ${astro.casa_8_signo} — como você deseja e o que te faz perder o controle**`);
    if (sCasa8) {
      lines.push(sCasa8.essencia);
      lines.push(sCasa8.missao);
    } else {
      lines.push(
        `A intimidade é zona de transformação para você. O que te faz soltar o controle é também o que te abre para o mais profundo.`
      );
    }
    lines.push('');
  }

  // Cabala: Números Mestres
  if (cabala?.life_path && [11, 22, 33].includes(cabala.life_path)) {
    const t = traducaoPara('cabala', 'sexualidade');
    if (t) {
      lines.push(`**Sexualidade e Número Mestre ${cabala.life_path}**`);
      lines.push(t.frase);
      lines.push('');
    }
  }

  // Odu: consentimento e ritual
  if (odu?.odu_principal) {
    const t = traducaoPara('odu', 'sexualidade');
    if (t) {
      lines.push(`**Odu ${odu.odu_principal} e Sexualidade**`);
      lines.push(t.frase);
      lines.push('');
    }
  }

  // Síntese final
  lines.push('**O que isso significa na prática:**');
  if (sTantra) lines.push(`Você é ${sTantra.titulo.toLowerCase()} na energia sexual.`);
  if (astro?.lilith_signo) lines.push(`Seu desejo secreto é Lilith em ${astro.lilith_signo} — taboo, intensidade, o que não se fala.`);
  if (astro?.casa_8_signo) lines.push(`Na intimidade você busca ${astro.casa_8_signo} — transformação, não só prazer.`);
  lines.push('');
  lines.push('**Akasha Authority:** Se há tensão no Corpo 4 (Mente Negativa), ESPERE. Se há paz no Corpo 3 (Mente Positiva), AJA.');

  return lines.join('\n');
}

// ─── Perfil Geral ──────────────────────────────────────────────────────────

/**
 * Gera perfil narrativo geral: quem é esta pessoa.
 */
export function gerarPerfilGeral(pilares: PilaresDados): string {
  const lp = pilares.cabala?.life_path;
  const solSigno = pilares.astrologia?.sol_signo;
  const corpo = pilares.tantrica?.corpo_predominante;
  const oduPrinc = pilares.odu?.odu_principal;
  const hex = pilares.iching?.hexagrama_dia;

  const sCabala = lp ? CabralSignificado(lp) : undefined;
  const sAstro = solSigno ? AstroSignificado(solSigno) : undefined;
  const sTantra = corpo ? TantraSignificado(corpo) : undefined;

  const parts: string[] = [];

  if (sCabala) {
    parts.push(
      `Você é ${sCabala.titulo} (Caminho ${lp}) — ${sCabala.essencia}`
    );
  }

  if (sAstro) {
    parts.push(`${solSigno} é quem você é no mundo: ${sAstro.essencia}`);
  }

  if (sTantra) {
    parts.push(`Seus corpos sutis operam com ênfase no ${sTantra.titulo} (corpo ${corpo}).`);
  }

  if (oduPrinc) {
    parts.push(`Seu Odu principal é ${oduPrinc} — traz a frequência ancestral que te acompanha.`);
  }

  if (hex) {
    parts.push(`Seu hexagrama natal é ${hex} — o fluxo natural da sua energia.`);
  }

  return parts.join(' ');
}
