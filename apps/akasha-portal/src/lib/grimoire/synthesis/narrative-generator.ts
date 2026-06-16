/**
 * Akasha Synthesis — Narrative Generator v3
 * F-232 · Síntese Profunda: todos os 5 pilares por dimensão
 *
 * Princípio: o usuário não quer "teu número é 11".
 * Quer: "O que isso SIGNIFICA na minha vida e o que eu FAÇO com isso?"
 *
 * Cada Pilar entrega uma perspectiva sobre a dimensão.
 * O Generator sintetiza as 5 perspectivas em UMA voz Akasha — fluida,
 * prática, fundamentada em fonte.
 *
 * Mudança v2→v3 (F-232):
 *  - Usa significadosEspecificos() para todos os 5 pilares
 *  - buildPerspectivas usa conteúdo COMPLETO (essencia/missao/sombra/pratica)
 *  - buildSynthesis cruza todos os 5 pilares
 *  - DIM_AREA_MAP expandido para carregar todos os pilares
 *  - gerPerfilGeral com os 5 pilares
 */

import type { PilaresDados, SignificadoCurado } from '../significados-curados';
import { significadoPorPilar, significadosEspecificos } from '../significados-curados';
import { traducaoPara, traducoesDaArea, traducaoDetalhadaPara, traducoesDetalhadasDaArea, type Area } from '../traducao-areas';
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

function OduSignificado(oduId: string): SignificadoCurado | undefined {
  return significadoPorPilar('odu', oduId);
}

function IChingSignificado(hex: number): SignificadoCurado | undefined {
  return significadoPorPilar('iching', hex);
}

// ─── Mapa de áreas por dimensão ─────────────────────────────────────────────

const DIM_AREA_MAP: Record<DimensaoId, Area[]> = {
  saude: ['saude', 'paz'],
  trabalho: ['trabalho', 'dinheiro'],
  sexualidade: ['sexualidade'],
  amor: ['relacoes'],
  criacao: ['criatividade'],
  proposito: ['proposito'],
  familia: ['paz', 'espiritualidade'],
  espiritualidade: ['espiritualidade', 'paz'],
  superacao: ['relacoes', 'espiritualidade'],
};

// ─── Narrativa por Dimensão ─────────────────────────────────────────────────

/**
 * Gera narrativa UNIFICADA para uma dimensão.
 * Pipeline:
 *  1. Identidade — "Você é X no Y" (todos os 5 pilares)
 *  2. Perspectivas — o que CADA pilar fala sobre esta dimensão (conteúdo completo)
 *  3. Síntese Akasha — onde convergem + onde tensionam
 *  4. Missão + Prática (todos os 5 pilares)
 */
export function gerarNarrativaDimensao(
  dimId: DimensaoId,
  pilares: PilaresDados
): string {
  const sigs = significadosEspecificos(pilares);

  const areas = DIM_AREA_MAP[dimId] ?? [];
  const traducs = areas.flatMap((a) => traducoesDaArea(a));
  const traducsDetalhadas = areas.flatMap((a) => traducoesDetalhadasDaArea(a));
  const identidade = buildIdentidadeV3(dimId, pilares, sigs);
  if (!identidade) return 'Sem dados suficientes para gerar narrativa.';

  const perspectivas = buildPerspectivasV3(dimId, traducs, traducsDetalhadas, sigs, pilares);
  const synthesis = buildSynthesisV3(dimId, traducs, traducsDetalhadas, sigs, pilares);
  const missaoPratica = buildMissaoPraticaV3(dimId, traducs, sigs);

  return [identidade, perspectivas, synthesis, missaoPratica]
    .filter(Boolean)
    .join('\n\n');
}

// ─── Sub-builders v3 — usando os 5 pilares ─────────────────────────────────

function buildIdentidadeV3(
  dimId: DimensaoId,
  pilares: PilaresDados,
  sigs: {
    cabala: SignificadoCurado;
    astrologia: SignificadoCurado;
    tantrica: SignificadoCurado;
    odu: SignificadoCurado;
    iching: SignificadoCurado;
  }
): string | null {
  const { cabala: sCabala, astrologia: sAstro, tantrica: sTantra, odu: sOdu, iching: sIChing } = sigs;
  const lp = pilares.cabala?.life_path;
  const solSigno = pilares.astrologia?.sol_signo;
  const corpo = pilares.tantrica?.corpo_predominante;

  switch (dimId) {
    case 'saude':
      if (sTantra && sCabala) {
        return `Você é ${sCabala.titulo} — ${sCabala.essencia} No corpo, isso manifesta-se como ${sTantra.essencia} Seu instrumento físico pede atenção: cuide do corpo como sagrado.`;
      }
      if (sTantra) return `${sTantra.essencia} Seu corpo energético #${corpo} é o ponto de partida para qualquer cura.`;
      return null;

    case 'trabalho':
      if (sCabala && sAstro) {
        return `Você é ${sCabala.titulo} (Caminho ${lp}) — ${sCabala.essencia ?? sCabala.missao} O ${solSigno} adiciona: ${sAstro.essencia} Seu trabalho ideal precisa satisfazer os dois.`;
      }
      if (sCabala) return `Seu caminho de vida ${lp} é ${sCabala.titulo.toLowerCase()} — ${sCabala.missao}`;
      return null;

    case 'sexualidade': {
      const lilith = pilares.astrologia?.lilith_signo;
      const casa8 = pilares.astrologia?.casa_8_signo;
      if (sTantra && lilith && casa8) {
        return `Sexualidade: seu corpo energético #${corpo} é ${sTantra.titulo} — ${sTantra.essencia} Seu desejo oculto: Lilith em ${lilith}. Zona de transformação: Casa 8 em ${casa8}. I Ching ${pilares.iching?.hexagrama_dia}: ${sIChing.essencia}`;
      }
      if (sTantra) return `${sTantra.titulo} é seu corpo energético predominante — ${sTantra.essencia} ${sTantra.missao}`;
      return null;
    }

    case 'amor':
      if (sAstro && sCabala) {
        return `Você ama a partir do ${solSigno} — ${sAstro.essencia} No relacionamento, isso manifesta-se como ${sAstro.missao} Seu caminho de vida ${lp} adiciona: ${sCabala.essencia}`;
      }
      if (sCabala) return `${sCabala.titulo} descreve como você se conecta — ${sCabala.essencia} ${sCabala.missao}`;
      return null;

    case 'criacao':
      if (sCabala && sAstro) {
        return `Sua expressão criativa nasce de ${sCabala.titulo} com ${solSigno} — ${sCabala.essencia} ${sAstro.essencia} Sua criação é ${sAstro.missao}`;
      }
      if (sCabala) return `Você é ${sCabala.titulo} — ${sCabala.essencia} Sua criação reflete isso.`;
      return null;

    case 'proposito':
      if (sCabala) {
        return `Seu contrato de vida é ${lp}: ${sCabala.titulo} — ${sCabala.essencia} ${sCabala.missao} I Ching ${pilares.iching?.hexagrama_dia} aponta: ${sIChing.missao}`;
      }
      return null;

    case 'familia': {
      const oduP = pilares.odu?.odu_principal;
      if (oduP) {
        return `Ancestralidade: Odu ${oduP} — ${sOdu.essencia} ${sOdu.missao} Você carrega ${sOdu.sombra} como gift herdado. Hexagrama natal ${pilares.iching?.hexagrama_natal}: ${sIChing.essencia}`;
      }
      if (sIChing) return `Família é o fluxo descrito pelo hexagrama natal ${pilares.iching?.hexagrama_natal} — ${sIChing.essencia}`;
      return null;
    }

    case 'espiritualidade':
      if (sCabala && sTantra) {
        return `Espiritualidade na interseção de ${sCabala.titulo} e ${sTantra.titulo} — ${sCabala.essencia ?? sCabala.missao} ${sTantra.essencia} Odu ${pilares.odu?.odu_principal}: ${sOdu.missao} I Ching ${pilares.iching?.hexagrama_dia}: ${sIChing.pratica ?? sIChing.essencia}`;
      }
      if (sTantra) return `${sTantra.essencia} Sua espiritualidade passa pelo corpo. Prática: ${sTantra.pratica}`;
      return null;

    case 'superacao':
      if (sCabala && sAstro) {
        return `${sCabala.sombra} é seu desafio central. ${sAstro.sombra ?? ''} ${sCabala.missao} A transformação vem quando você para de evitar e começa a atravessar. I Ching ${pilares.iching?.hexagrama_dia} diz: ${sIChing.pratica ?? sIChing.essencia}`;
      }
      if (sCabala) return `${sCabala.sombra} é sua sombra. Atravessá-la é a missão. Odu ${pilares.odu?.odu_secundario ?? pilares.odu?.odu_principal}: ${sOdu.pratica ?? sOdu.missao}`;
      return null;

    default:
      return null;
  }
}

function buildPerspectivasV3(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  traducsDetalhadas: { pilar: string; frase: string; explicacao: string; convergencia: string; tensao: string; evitar: string; pratica: string }[],
  sigs: {
    cabala: SignificadoCurado;
    astrologia: SignificadoCurado;
    tantrica: SignificadoCurado;
    odu: SignificadoCurado;
    iching: SignificadoCurado;
  },
  pilares: PilaresDados
): string {
  if (traducs.length === 0) return '';

  const { cabala: sCabala, astrologia: sAstro, tantrica: sTantra, odu: sOdu, iching: sIChing } = sigs;

  // Look up detailed content per pillar for this dimension's areas
  const tCabala = traducsDetalhadas.find((t) => t.pilar === 'cabala');
  const tAstro = traducsDetalhadas.find((t) => t.pilar === 'astrologia');
  const tTantra = traducsDetalhadas.find((t) => t.pilar === 'tantrica');
  const tOdu = traducsDetalhadas.find((t) => t.pilar === 'odu');
  const tIChing = traducsDetalhadas.find((t) => t.pilar === 'iching');

  const lines: string[] = [];
  lines.push('**O que cada pilar diz sobre esta dimensão:**');

  // Cabala
  if (sCabala) {
    lines.push(`· Cabala (Caminho ${pilares.cabala?.life_path}): ${tCabala?.explicacao ?? sCabala.essencia}`);
    if (tCabala?.convergencia) lines.push(`  Convergência: ${tCabala.convergencia}`);
    if (tCabala?.tensao) lines.push(`  Tensão: ${tCabala.tensao}`);
    if (tCabala?.evitar) lines.push(`  Evitar: ${tCabala.evitar}`);
    if (tCabala?.pratica) lines.push(`  Prática: ${tCabala.pratica}`);
  }

  // Astrologia
  if (sAstro) {
    lines.push(`· Astrologia (Sol em ${pilares.astrologia?.sol_signo}): ${tAstro?.explicacao ?? sAstro.essencia}`);
    if (tAstro?.convergencia) lines.push(`  Convergência: ${tAstro.convergencia}`);
    if (tAstro?.tensao) lines.push(`  Tensão: ${tAstro.tensao}`);
    if (tAstro?.evitar) lines.push(`  Evitar: ${tAstro.evitar}`);
    if (tAstro?.pratica) lines.push(`  Prática: ${tAstro.pratica}`);
  }

  // Tantra
  if (sTantra) {
    lines.push(`· Tântrica (Corpo ${pilares.tantrica?.corpo_predominante}): ${tTantra?.explicacao ?? sTantra.essencia}`);
    if (tTantra?.convergencia) lines.push(`  Convergência: ${tTantra.convergencia}`);
    if (tTantra?.tensao) lines.push(`  Tensão: ${tTantra.tensao}`);
    if (tTantra?.evitar) lines.push(`  Evitar: ${tTantra.evitar}`);
    if (tTantra?.pratica) lines.push(`  Prática: ${tTantra.pratica}`);
  }

  // Odu
  if (sOdu) {
    lines.push(`· Odu (${pilares.odu?.odu_principal}): ${tOdu?.explicacao ?? sOdu.essencia}`);
    if (tOdu?.convergencia) lines.push(`  Convergência: ${tOdu.convergencia}`);
    if (tOdu?.tensao) lines.push(`  Tensão: ${tOdu.tensao}`);
    if (tOdu?.evitar) lines.push(`  Evitar: ${tOdu.evitar}`);
    if (tOdu?.pratica) lines.push(`  Prática ancestral: ${tOdu.pratica}`);
  }

  // I Ching
  if (sIChing) {
    const hex = pilares.iching?.hexagrama_dia;
    lines.push(`· I Ching (${hex}): ${tIChing?.explicacao ?? sIChing.essencia}`);
    if (tIChing?.convergencia) lines.push(`  Convergência: ${tIChing.convergencia}`);
    if (tIChing?.tensao) lines.push(`  Tensão: ${tIChing.tensao}`);
    if (tIChing?.evitar) lines.push(`  Evitar: ${tIChing.evitar}`);
    if (tIChing?.pratica) lines.push(`  Prática: ${tIChing.pratica}`);
  }

  return lines.join('\n');
}

function buildSynthesisV3(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  traducsDetalhadas: { pilar: string; frase: string; explicacao: string; convergencia: string; tensao: string; evitar: string; pratica: string }[],
  sigs: {
    cabala: SignificadoCurado;
    astrologia: SignificadoCurado;
    tantrica: SignificadoCurado;
    odu: SignificadoCurado;
    iching: SignificadoCurado;
  },
  pilares: PilaresDados
): string {
  if (traducs.length === 0) return '';

  const { cabala: sCabala, astrologia: sAstro, tantrica: sTantra, odu: sOdu, iching: sIChing } = sigs;

  // Detectar convergência: pilares que falam a mesma frequência
  const pilarCount = [sCabala, sAstro, sTantra, sOdu, sIChing].filter(Boolean).length;

  // Detectar tensão: sombras que apontam para direções opostas
  const sombras = [sCabala?.sombra, sAstro?.sombra, sTantra?.sombra, sOdu?.sombra]
    .filter(Boolean) as string[];

  // Collect convergencia/tensao from detailed content across all pillars
  const convergencias = traducsDetalhadas
    .map((t) => t.convergencia)
    .filter(Boolean) as string[];
  const tensoes = traducsDetalhadas
    .map((t) => t.tensao)
    .filter(Boolean) as string[];

  const lines: string[] = [];
  lines.push('**Akasha Synthesis — visão unificada:**');

  lines.push(`Os seus ${pilarCount} mapas convergem: ${sCabala?.titulo ?? 'uma assinatura única'}. ${sCabala?.missao ?? sCabala?.essencia ?? ''}`);

  // Usar convergencia do conteúdo detalhado quando disponível
  if (convergencias.length > 0) {
    lines.push(`Convergência: ${convergencias.join(' ')}`);
  }

  // Aviso de tensão quando há sombras relevantes
  if (sombras.length > 1) {
    lines.push(`Tensão detectada: ${sombras[0]}. Isso não é conflito — é o campo de transformação. Atravesse, não evite.`);
  }

  // Usar tensao do conteúdo detalhado quando disponível
  if (tensoes.length > 0) {
    lines.push(`Tensão estrutural: ${tensoes.join(' ')}`);
  }

  // I Ching como agente de mudança
  const hex = pilares.iching?.hexagrama_dia;
  if (sIChing?.pratica && hex) {
    lines.push(`I Ching ${hex} diz que hoje: ${sIChing.pratica}`);
  }

  return lines.join(' ');
}

function buildMissaoPraticaV3(
  dimId: DimensaoId,
  traducs: { pilar: string; frase: string }[],
  sigs: {
    cabala: SignificadoCurado;
    astrologia: SignificadoCurado;
    tantrica: SignificadoCurado;
    odu: SignificadoCurado;
    iching: SignificadoCurado;
  }
): string {
  const { cabala: sCabala, astrologia: sAstro, tantrica: sTantra, odu: sOdu, iching: sIChing } = sigs;

  const lines: string[] = [];
  lines.push('**O que fazer agora — ação por dimensão:**');

  if (sCabala?.missao) lines.push(`· Cabala: ${sCabala.missao}`);
  if (sAstro?.missao) lines.push(`· Astrologia: ${sAstro.missao}`);
  if (sTantra?.pratica) lines.push(`· Tantra: ${sTantra.pratica}`);
  if (sOdu?.pratica) lines.push(`· Odu: ${sOdu.pratica}`);
  if (sIChing?.pratica) lines.push(`· I Ching: ${sIChing.pratica}`);

  return lines.join('\n');
}

// ─── Sexualidade Deep Dive ───────────────────────────────────────────────────

/**
 * Gera a narrativa DEEP de Sexualidade.
 * Usa os 5 pilares + 3 marcadores astrológicos.
 */
export function gerarNarrativaSexualidade(pilares: PilaresDados): string {
  const astro = pilares.astrologia;
  const tantra = pilares.tantrica;
  const cabala = pilares.cabala;
  const odu = pilares.odu;
  const iching = pilares.iching;

  const corpo = tantra?.corpo_predominante;
  const sTantra = corpo ? TantraSignificado(corpo) : undefined;
  const solSigno = astro?.sol_signo;
  const sAstro = solSigno ? AstroSignificado(solSigno) : undefined;
  const sCabala = cabala?.life_path ? CabralSignificado(cabala.life_path) : undefined;
  const sOdu = odu?.odu_principal ? OduSignificado(odu.odu_principal) : undefined;
  const sIChing = iching?.hexagrama_dia ? IChingSignificado(iching.hexagrama_dia) : undefined;
  const sLilith = astro?.lilith_signo ? AstroSignificado(astro.lilith_signo) : undefined;
  const sCasa8 = astro?.casa_8_signo ? AstroSignificado(astro.casa_8_signo) : undefined;

  const lines: string[] = [];
  lines.push('**Sexualidade — Mapa Completo**\n');

  // Marcador 1: Tantra Body
  if (sTantra) {
    lines.push(`**Teu corpo energético é o #${corpo} — ${sTantra.titulo}**`);
    lines.push(sTantra.essencia);
    lines.push(sTantra.missao);
    if (sTantra.sombra) lines.push(`Sombra: ${sTantra.sombra}`);
    if (sTantra.pratica) lines.push(`Prática corporal: ${sTantra.pratica}`);
    lines.push('');
  }

  // Marcador 2: Lilith
  if (astro?.lilith_signo) {
    lines.push(`**Lilith em ${astro.lilith_signo} — o que te excita em segredo**`);
    if (sLilith) {
      lines.push(sLilith.essencia);
      lines.push(sLilith.missao);
      if (sLilith.sombra) lines.push(`Sombra do desejo: ${sLilith.sombra}`);
    } else {
      lines.push(
        `Seu desejo profundo opera neste signo. O que é proibido, negado ou reprimido aqui é exatamente o que te move.`
      );
    }
    lines.push('');
  }

  // Marcador 3: Casa 8
  if (astro?.casa_8_signo) {
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

  // Cabala: Número e sexualidade
  if (cabala?.life_path) {
    const t = traducaoPara('cabala', 'sexualidade');
    lines.push(`**Life Path ${cabala.life_path} e Sexualidade**`);
    if (t) lines.push(t.frase);
    if ([11, 22, 33].includes(cabala.life_path)) {
      lines.push(`Número Mestre ${cabala.life_path}: você opera em frequência elevada na sexualidade — isso traz profundidade mas também pode criar bloqueio por medo de não estar à altura.`);
    }
    lines.push('');
  }

  // Odu: consentimento e ritual
  if (odu?.odu_principal && sOdu) {
    lines.push(`**Odu ${odu.odu_principal} e Sexualidade**`);
    lines.push(sOdu.essencia);
    if (sOdu.pratica) lines.push(`Ritual: ${sOdu.pratica}`);
    lines.push('');
  }

  // I Ching: transformação sexual
  if (iching?.hexagrama_dia && sIChing) {
    lines.push(`**I Ching ${iching.hexagrama_dia} — energia da transformação sexual**`);
    lines.push(sIChing.essencia);
    if (sIChing.pratica) lines.push(`Prática: ${sIChing.pratica}`);
    lines.push('');
  }

  // Síntese Akasha
  lines.push('**Akasha: o que isso significa na prática**');
  if (sTantra) lines.push(`Corpo energético ${sTantra.titulo}: ${sTantra.essencia}`);
  if (astro?.lilith_signo) lines.push(`Desejo secreto: Lilith em ${astro.lilith_signo} — ${sLilith?.missao ?? 'intensidade e taboo'}`);
  if (astro?.casa_8_signo) lines.push(`Intimidade: Casa 8 em ${astro.casa_8_signo} — ${sCasa8?.essencia ?? 'transformação pelo controle solto'}`);
  lines.push('');
  lines.push('**Akasha Authority:** Se há tensão no corpo emocional, ESPERE o momento certo. Se há paz no corpo e desejo genuíno, AJA com presença. Sexualidade sagrada é presença — não performance.');

  return lines.join('\n');
}

// ─── Perfil Geral ──────────────────────────────────────────────────────────

/**
 * Gera perfil narrativo geral com os 5 pilares: quem é esta pessoa.
 */
export function gerarPerfilGeral(pilares: PilaresDados): string {
  const lp = pilares.cabala?.life_path;
  const solSigno = pilares.astrologia?.sol_signo;
  const luaSigno = pilares.astrologia?.lua_signo;
  const corpo = pilares.tantrica?.corpo_predominante;
  const oduPrinc = pilares.odu?.odu_principal;
  const hexNatal = pilares.iching?.hexagrama_natal;

  const sCabala = lp ? CabralSignificado(lp) : undefined;
  const sAstro = solSigno ? AstroSignificado(solSigno) : undefined;
  const sTantra = corpo ? TantraSignificado(corpo) : undefined;
  const sOdu = oduPrinc ? OduSignificado(oduPrinc) : undefined;
  const sIChing = hexNatal ? IChingSignificado(hexNatal) : undefined;

  const parts: string[] = [];

  if (sCabala) {
    parts.push(
      `Você é ${sCabala.titulo} (Caminho ${lp}) — ${sCabala.essencia}`
    );
    if (sCabala.missao) parts.push(`Missão de vida: ${sCabala.missao}`);
    if (sCabala.sombra) parts.push(`Sombra: ${sCabala.sombra}`);
  }

  if (sAstro) {
    parts.push(`${solSigno} é quem você é no mundo — ${sAstro.essencia} ${sAstro.missao}`);
  }

  if (luaSigno) {
    parts.push(`Lua em ${luaSigno}: sua necessidade emocional pede ${sAstro?.sombra ? 'rotina e presença' : 'segurança e consistência'}.`);
  }

  if (sTantra) {
    parts.push(`Corpo energético #${corpo} — ${sTantra.titulo}: ${sTantra.essencia}`);
    if (sTantra.pratica) parts.push(`Prática: ${sTantra.pratica}`);
  }

  if (sOdu) {
    parts.push(`Odu ${oduPrinc} — frequência ancestral: ${sOdu.essencia} ${sOdu.missao}`);
  }

  if (sIChing) {
    parts.push(`Hexagrama natal ${hexNatal} — ${sIChing.titulo}: ${sIChing.essencia}`);
    if (sIChing.pratica) parts.push(`Prática I Ching: ${sIChing.pratica}`);
  }

  if (parts.length === 0) {
    return 'Akasha ainda não tem dados suficientes para traçar seu perfil. Insira sua data de nascimento para começar.';
  }

  return parts.join(' ');
}
