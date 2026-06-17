/**
 * @akasha/core — Akasha Synthesis Engine
 * Agrega as contribuições de 5 tradições em primitivos unificados.
 */

import type {
  Primitivo,
  Polaridade,
  PrimitiveContribution,
  Tradicao,
  Dominio,
} from './types';
import { PESOS_TRADICAO_DOMINIO, PRIMITIVOS } from './types';
import { NUMEROS_CABALA, getNumeroCabala } from './cabala/numeros';
import { ODUS_NUMEROLOGIA } from './odu/numeros';
import type {
  PilarIChing,
  PilarCabala,
  PilarAstrologia,
  PilarTantrica,
  PilarOdu,
} from '../akasha-core';

// ─── Helpers de domínio ────────────────────────────────────────────────────────

/** Contexto de primitivo após agregação de todas as tradições. */
export interface SynthesizedPrimitivo {
  primitivo: Primitivo;
  magnitude: number;
  convergencia: number;
  polaridade: Polaridade;
  dominante: boolean;
  contributions: PrimitiveContribution[];
}

// ─── Tensão entre primitivos opostos ─────────────────────────────────────────

export interface Tensao {
  primitivoA: Primitivo;
  primitivoB: Primitivo;
  descricao: string;
}

/** Pares de primitivos com polaridade oposta que geram tensão interna. */
const PARES_TENSOES: Array<[Primitivo, Primitivo, string]> = [
  ['Transformacao', 'Ordem', 'Ruptura vs. Estabilidade — o impulso de mudar tudo em conflito com a necessidade de estrutura.'],
  ['Expansao', 'Materializacao', 'Expansão infinita vs. concretude — o desejo de ir além vs. a necessidade deanker fundamento.'],
  ['Poder', 'Amor', 'Força assertiva vs. entrega receptiva — comando vs. entrega.'],
  ['Sabedoria', 'Expressao', 'Conhecimento interior vs. manifestação exterior — contemplação vs. comunicação.'],
  ['Movimento', 'Conexao', 'Dinamismo errante vs. ancoramento relacional — movimento constante vs. profundidade estática.'],
];

// ─── I Ching ──────────────────────────────────────────────────────────────────

/** Mapeamento directo de hexagrama → primitivo + intensidade + polaridade (dados do iching.json). */
const HEXAGRAMA_PRIMITIVOS: Record<number, { primitivo: Primitivo; intensidade: number; polaridade: Polaridade; fonte: string }> = {
  1:  { primitivo: 'Expansao',      intensidade: 9, polaridade: 'luz',    fonte: 'I Ching Wilhelm/Baynes — Hexagrama 1 (Qián/Criação) = céu, força criativa yang' },
  2:  { primitivo: 'Amor',          intensidade: 9, polaridade: 'luz',    fonte: 'I Ching Wilhelm/Baynes — Hexagrama 2 (Kūn/Receção) = terra, nutrição' },
  3:  { primitivo: 'Transformacao', intensidade: 6, polaridade: 'ambas',  fonte: 'I Ching — Hexagrama 3 (Zhūn/Dificuldade Inicial) = germinação, começo difícil' },
  4:  { primitivo: 'Intuicao',      intensidade: 6, polaridade: 'sombra',  fonte: 'I Ching — Hexagrama 4 (Méng/Inocência) = ingenuidade, falta de experiência' },
  5:  { primitivo: 'Sabedoria',      intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 5 (Xū/Espera) = espera, paciência com propósito' },
  6: { primitivo: 'Transformacao', intensidade: 6, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 6 (Sòng/Conflito) = conflito, tensão não resolvida — tensão como forma de Transformacao' },
  7:  { primitivo: 'Ordem',          intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 7 (Shī/Multidão) = exército, disciplina coletiva' },
  8:  { primitivo: 'Conexao',       intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 8 (Bǐ/União) = união, solidariedade' },
  9:  { primitivo: 'Movimento',     intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 9 (Xiǎojié/ Pequeno Aprisco) = contenção, progresso modesto' },
  10: { primitivo: 'Expressao',     intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 10 (Lǚ/Conduta) = pisar, comportar-se com cautela' },
  11: { primitivo: 'Amor',          intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 11 (Tài/Paz) = paz, harmonia universal' },
  12: { primitivo: 'Transformacao', intensidade: 6, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 12 (Pǐ/Estagnação) = estagnação, obstrução' },
  13: { primitivo: 'Conexao',       intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 13 (Tóng Rén/Concordância) = comunidade, shared humanity' },
  14: { primitivo: 'Poder',         intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 14 (Dà Yòu/Grandes Posses) = abundância, poderio' },
  15: { primitivo: 'Ordem',         intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 15 (Qián/Humildade) =谦虚, modéstia' },
  16: { primitivo: 'Expressao',     intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 16 (Yù/Entusiasmo) = entusiasmo, energia vibrante' },
  17: { primitivo: 'Movimento',     intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 17 (Suí/Seguimento) = seguimento, adaptabilidade' },
  18: { primitivo: 'Transformacao', intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 18 (Gǔ/Trabalho de Corrupção) = trabalho sobre o legado, cura do passado' },
  19: { primitivo: 'Expansao',      intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 19 (Lín/Aproximação) = aproximação, expansão' },
  20: { primitivo: 'Intuicao',      intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 20 (Guān/Contemplação) = contemplação, observação silenciosa' },
  21: { primitivo: 'Poder',         intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 21 (Shì Kè/Morder Atravessando) = mordida, ação decisive' },
  22: { primitivo: 'Expressao',     intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 22 (Bì/Elegância) = elegância, graça pessoal' },
  23: { primitivo: 'Transformacao', intensidade: 6, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 23 (Bō/Dissolução) = dissolução, colapso estrutural' },
  24: { primitivo: 'Transformacao', intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 24 (Fù/Retorno) = retorno, renovação cíclica' },
  25: { primitivo: 'Intuicao',      intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 25 (Wú Wàng/Inocência) = innocência, ausência de expectativas' },
  26: { primitivo: 'Ordem',         intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 26 (Dà Chù/Grande Força de Caráter) = contenção do grande, autodisciplina' },
  27: { primitivo: 'Servico',       intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 27 (Yí/Nutrição) = nutricao, cuidado de si e outros' },
  28: { primitivo: 'Expansao',      intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 28 (Guò/Excesso) = excesso, grandes atividades' },
  29: { primitivo: 'Transformacao', intensidade: 9, polaridade: 'ambas', fonte: 'I Ching — Hexagrama 29 (Kǎn/Abismo) = abismo, perigo e renovação' },
  30: { primitivo: 'Sabedoria',      intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 30 (Lì/Claridade) = clareza, luz, discernment' },
  31: { primitivo: 'Conexao',       intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 31 (Xián/Influência) = influência mútua, mutual attraction' },
  32: { primitivo: 'Movimento',     intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 32 (Héng/Duração) = duração, constância no tempo' },
  33: { primitivo: 'Ordem',         intensidade: 6, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 33 (Tùn/Retirada) = retirada, estratégico recuo' },
  34: { primitivo: 'Poder',         intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 34 (Dà Zhuàng/Grande Força) = grande poder, força irrestrita' },
  36: { primitivo: 'Sabedoria',    intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 36 (Míng Yí/Ocultação da Luz) = luz oculta, sabedoria em dificuldade' },
  37: { primitivo: 'Conexao',     intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 37 (Jiā Rén/Família) = família, ordem doméstica, estrutura relacional' },
  38: { primitivo: 'Expressao', intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 38 (Kuè/Oposição) = oposição, perspectiva diferente, conflito de visão' },
  39: { primitivo: 'Movimento', intensidade: 7, polaridade: 'luz', fonte: 'I Ching — Hexagrama 39 (Jiǎn/Obstáculo) = obstáculo, movimento lateral necessário' },
  40: { primitivo: 'Transformacao', intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 40 (Xiè/Libertação) = libertação, resolução do obstáculo' },
  41: { primitivo: 'Sabedoria',      intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 41 (Sǔn/ Diminuição) = diminuição, perda para ganhar insight' },
  42: { primitivo: 'Expansao',      intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 42 (Yì/Aumento) = aumento, crescimento orgânico' },
  43: { primitivo: 'Poder',         intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 43 (Guài/ Ruptura) = ruptura, decisão decisive' },
  44: { primitivo: 'Intuicao',      intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 44 (Gòu/Encontro) = encontro, sedução perigosa' },
  45: { primitivo: 'Conexao',       intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 45 (Cuì/Agrupamento) = agrupamento, сбор comunidade' },
  46: { primitivo: 'Expansao',      intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 46 (Shēng/Subida) = subida, ascenção social' },
  47: { primitivo: 'Poder',         intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 47 (Kùn/Opressão) = opressão, exaustão de recursos' },
  48: { primitivo: 'Sabedoria',      intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 48 (Jǐng/Poço) = poço, fonte perene de sabedoria' },
  49: { primitivo: 'Transformacao', intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 49 (Gé/Revolução) = revolução, mudança de natureza' },
  50: { primitivo: 'Materializacao', intensidade: 8, polaridade: 'luz',  fonte: 'I Ching — Hexagrama 50 (Dǐng/Tigela) = tigela, recipiente, forma que sustenta' },
  51: { primitivo: 'Movimento',     intensidade: 8, polaridade: 'ambas', fonte: 'I Ching — Hexagrama 51 (Zhèn/Trovão) = trovão, choque, movimento repentino' },
  52: { primitivo: 'Ordem',         intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 52 (Gèn/Montanha) = montanha, parar, quietude' },
  53: { primitivo: 'Conexao',       intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 53 (Jiān/Desenvolvimento) = desenvolvimento gradual, casamento' },
  54: { primitivo: 'Expressao',     intensidade: 7, polaridade: 'sombra', fonte: 'I Ching — Hexagrama 54 (Guài/Madastra) = energia jovem não desenvolvida, casamento desigual' },
  55: { primitivo: 'Expansao',      intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 55 (Fēng/Abundância) = abundância, plenitude, máxima expansão' },
  56: { primitivo: 'Movimento',     intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 56 (Lǚ/Andarilho) = viajante, wanderer, movimento constante' },
  57: { primitivo: 'Intuicao',      intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 57 (Xùn/Suave) = suave, penetração gentil, intuição' },
  58: { primitivo: 'Amor',          intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 58 (Duì/Lago) = lago, alegria, abertura relacional' },
  59: { primitivo: 'Conexao',       intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 59 (Huàn/Dispersão) = dispersão, dissolução de obstáculos para reunião' },
  60: { primitivo: 'Ordem',         intensidade: 7, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 60 (Jié/Limitação) = limitação, disciplina e moderação' },
  61: { primitivo: 'Intuicao',      intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 61 (Zhōng Fú/Verdade Interior) = centro, verdade interior, Paz do coração' },
  62: { primitivo: 'Intuicao',      intensidade: 8, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 62 (Xiǎo Guò/Excesso Menor) = excesso menor, perfeição nos detalhes' },
  63: { primitivo: 'Amor',          intensidade: 9, polaridade: 'luz',   fonte: 'I Ching — Hexagrama 63 (Jì Jīe/Após a Conclusão) = después del éxito, cuidado com a complacência' },
  64: { primitivo: 'Movimento',     intensidade: 8, polaridade: 'ambas', fonte: 'I Ching — Hexagrama 64 (Wèi Jì/Antes da Conclusão) = quase completo, transição, movimento final' },
};

/**
 * Nível I Ching → multiplicador de intensidade (shadow/gift/siddhi).
 * Levels mais altos amplificam a contribuição.
 */
const LEVEL_MULTIPLIER: Record<string, number> = {
  shadow: 0.75,
  gift:   1.0,
  siddhi: 1.25,
};

/**
 * Obtém as PrimitiveContributions de um hexagrama para um dado nível.
 * @param hexagram  1–64
 * @param level     shadow | gift | siddhi
 */
export function getIChingContribution(
  hexagram: number,
  level: string,
): PrimitiveContribution[] {
  const base = HEXAGRAMA_PRIMITIVOS[hexagram];
  if (!base) return [];
  const mult = LEVEL_MULTIPLIER[level] ?? 1.0;
  const intensidade = Math.min(10, Math.round(base.intensidade * mult));
  return [{
    primitivo: base.primitivo,
    intensidade,
    polaridade: base.polaridade,
    fonte: base.fonte,
  }];
}

// ─── Tradutores por tradição ─────────────────────────────────────────────────

/**
 * Tradutor I Ching — deriva PrimitiveContributions do PilarIChing.
 * Usa getIChingContribution para cada hexagrama (natal + dia).
 */
function traduzIChing(iching: PilarIChing): PrimitiveContribution[] {
  const natal = getIChingContribution(iching.hexagrama_natal, iching.level);
  const dia   = getIChingContribution(iching.hexagrama_dia,   iching.level);
  // Hexagrama do dia pesa 60% do natal
  return [
    ...natal,
    ...dia.map(c => ({ ...c, intensidade: Math.round(c.intensidade * 0.6) })),
  ];
}

/**
 * Tradutor Cabala — deriva PrimitiveContributions do PilarCabala.
 *
 * Usa NUMEROS_CABALA (mapeamentos/cabala/numeros.ts) para cada número:
 * Life Path (peso primário), Expression (peso 60%), Ano Pessoal (peso 40%).
 * Master numbers (11, 22, 33) recebem intensidade 8; Agreement LP=Exp = +1.
 * Cada PrimitiveContribution carrega séfira, elemento e fonte enriquecida.
 */
function traduzCabala(cabala: PilarCabala): PrimitiveContribution[] {
  const results: PrimitiveContribution[] = [];

  // ── Life Path (peso primário) ──────────────────────────────────────────
  const lpData = getNumeroCabala(cabala.life_path);
  if (lpData) {
    const isAgreement = cabala.expression === cabala.life_path;
    const isMaster = lpData.mestre !== null;
    const baseIntensity = isMaster ? 8 : 5;
    const finalIntensity = isAgreement ? Math.min(10, baseIntensity + 1) : baseIntensity;
    const masters = isMaster
      ? ` (Número Mestre ${lpData.numero}, séfira ${lpData.sefira})`
      : '';
    const convergence = isAgreement ? ', convergência com Expression' : '';
    results.push({
      primitivo: lpData.primitivo,
      intensidade: finalIntensity,
      polaridade: lpData.polaridade,
      fonte: `Cabalá — Life Path ${cabala.life_path}${masters} → ${lpData.primitivo} (${lpData.arquetipo})${convergence}. Elemento: ${lpData.elemento}. Caminho: ${lpData.caminhoTreeOfLife ?? 'séfira direta'}. [${lpData.fonte}]`,
    });
  }

  // ── Expression number (peso secundário 60%) ───────────────────────────
  const expData = getNumeroCabala(cabala.expression);
  if (expData && expData.numero !== cabala.life_path) {
    const intensidade = Math.round(5 * 0.6);
    results.push({
      primitivo: expData.primitivo,
      intensidade,
      polaridade: expData.polaridade,
      fonte: `Cabalá — Expression ${cabala.expression} → ${expData.primitivo} (${expData.arquetipo}, séfira ${expData.sefira}). Peso secundário (60%). [${expData.fonte}]`,
    });
  }

  // ── Ano Pessoal (peso terciário 40%) ─────────────────────────────────
  const apData = getNumeroCabala(cabala.ano_pessoal);
  if (apData) {
    const intensidade = Math.round(4 * 0.4);
    results.push({
      primitivo: apData.primitivo,
      intensidade,
      polaridade: apData.polaridade,
      fonte: `Cabalá — Ano Pessoal ${cabala.ano_pessoal} → ${apData.primitivo}. Ciclo de ${apData.descricao.slice(0, 80)}... [${apData.fonte}]`,
    });
  }

  return results;
}

/**
 * Tradutor Astrologia — deriva PrimitiveContributions do PilarAstrologia.
 *
 * Mapeamento por elemento (signo solar):
 *   Fogo (Áries/Leão/Sagitário)  → Transformacao, Expressao
 *   Terra (Touro/Virgem/Capricórnio) → Materializacao, Ordem
 *   Ar   (Gêmeos/Libra/Aquário)  → Sabedoria, Intuicao
 *   Água  (Câncer/Escorpião/Peixes) → Conexao, Amor
 *
 * Ascendente adiciona peso quando disponível (30% extra).
 */
const ELEMENTO_PRIMITIVOS: Record<string, [Primitivo, Primitivo]> = {
  aries:       ['Transformacao', 'Expressao'],
  leao:        ['Expressao', 'Transformacao'],
  sagitario:   ['Expansao', 'Expressao'],
  touro:       ['Materializacao', 'Ordem'],
  virgem:      ['Ordem', 'Sabedoria'],
  capricornio: ['Ordem', 'Materializacao'],
  gemeos:      ['Intuicao', 'Expressao'],
  libra:       ['Conexao', 'Expressao'],
  aquario:     ['Intuicao', 'Sabedoria'],
  cancer:      ['Conexao', 'Amor'],
  escorpiao:   ['Transformacao', 'Conexao'],
  peixes:      ['Intuicao', 'Conexao'],
};

function traduzAstrologia(astrologia: PilarAstrologia): PrimitiveContribution[] {
  const results: PrimitiveContribution[] = [];

  const solarPrims = ELEMENTO_PRIMITIVOS[astrologia.sol_signo];
  if (solarPrims) {
    const [prim1, prim2] = solarPrims;
    // Trindade domina → intensidade alta
    const base = astrologia.trinity_dominante === 'sombra' ? 6
      : astrologia.trinity_dominante === 'graca'  ? 8
      : 7;
    results.push({
      primitivo: prim1,
      intensidade: base,
      polaridade: astrologia.trinity_dominante === 'sombra' ? 'sombra' : 'luz',
      fonte: `Astrologia — Sol em ${astrologia.sol_signo} (elemento ${getElemento(astrologia.sol_signo)}) → ${prim1}`,
    });
    results.push({
      primitivo: prim2,
      intensidade: Math.max(4, base - 2),
      polaridade: 'ambas',
      fonte: `Astrologia — Sol em ${astrologia.sol_signo} → ${prim2} (secundário)`,
    });
  }

  // Lua — adiciona 30% do peso
  const luaPrims = ELEMENTO_PRIMITIVOS[astrologia.lua_signo];
  if (luaPrims && luaPrims[0] !== solarPrims?.[0]) {
    const intensidade = Math.max(3, Math.round(6 * 0.4));
    results.push({
      primitivo: luaPrims[0],
      intensidade,
      polaridade: 'luz',
      fonte: `Astrologia — Lua em ${astrologia.lua_signo} → ${luaPrims[0]} (peso lunar)`,
    });
  }

  // Ascendente — adiciona 30% do peso quando presente
  if (astrologia.asc_signo) {
    const ascPrims = ELEMENTO_PRIMITIVOS[astrologia.asc_signo];
    if (ascPrims) {
      const intensidade = Math.max(3, Math.round(5 * 0.35));
      results.push({
        primitivo: ascPrims[0],
        intensidade,
        polaridade: 'ambas',
        fonte: `Astrologia — Ascendente em ${astrologia.asc_signo} → ${ascPrims[0]} (peso ascendente)`,
      });
    }
  }

  return results;
}

function getElemento(sign: string): string {
  const fire    = ['Áries', 'Leão', 'Sagitário'];
  const earth   = ['Touro', 'Virgem', 'Capricórnio'];
  const air     = ['Gêmeos', 'Libra', 'Aquário'];
  const water   = ['Câncer', 'Escorpião', 'Peixes'];
  if (fire.includes(sign))   return 'Fogo';
  if (earth.includes(sign)) return 'Terra';
  if (air.includes(sign))   return 'Ar';
  if (water.includes(sign)) return 'Água';
  return 'Desconhecido';
}

/**
 * Tradutor Tantra — deriva PrimitiveContributions do PilarTantrica.
 *
 * Corpo predominante → primitivos:
 *   1:Físico   → Materializacao + Movimento
 *   2:Astral   → Conexao + Transformacao
 *   3:Mental   → Sabedoria + Intuicao
 *
 * Temperamento modula intensidade:
 *   colérico +2, melancólico +1, fleumático ±0, sanguíneo -1
 */
function traduzTantra(tantra: PilarTantrica): PrimitiveContribution[] {
  const base: [Primitivo, Primitivo] =
    tantra.corpo_predominante === 1 ? ['Materializacao', 'Movimento']
    : tantra.corpo_predominante === 2 ? ['Conexao', 'Transformacao']
    : ['Sabedoria', 'Intuicao'];

  const temperamentoBonus: Record<string, number> = {
    colerico: 2,
    melancolico: 1,
    fleumatico: 0,
    sanguineo: -1,
  };
  const bonus = temperamentoBonus[tantra.temperamento_atual] ?? 0;

  return [
    {
      primitivo: base[0],
      intensidade: Math.min(10, Math.max(4, 6 + bonus)),
      polaridade: 'luz',
      fonte: `Tantra — Corpo ${tantra.corpo_predominante} (${tantra.trigemeo}) → ${base[0]}; temperamento ${tantra.temperamento_atual}`,
    },
    {
      primitivo: base[1],
      intensidade: Math.min(10, Math.max(3, 5 + bonus)),
      polaridade: 'ambas',
      fonte: `Tantra — Corpo ${tantra.corpo_predominante} → ${base[1]}`,
    },
  ];
}

/**
 * Tradutor Odu — deriva PrimitiveContributions do PilarOdu.
 *
 * Mapeamento do odu principal para primitivo (dados de odu.json):
 *   Ogbe    → Expansao (9, luz)
 *   Oyeku  → Materializacao (8, sombra)
 *   Ogundí → Movimento (8, ambas)
 *   Irosun → Transformacao (7, sombra)
 *   Obara  → Poder (8, luz)
 *   Okanran → Conexao (7, sombra)
 *   Owonrin → Sabedoria (7, luz)
 *   Oddí   → Intuicao (8, ambas)
 *   etc.
 */
const ODU_PRIMITIVOS: Record<string, { primitivo: Primitivo; intensidade: number; polaridade: Polaridade; fonte: string }> = {
  Ogbe:    { primitivo: 'Expansao',       intensidade: 9, polaridade: 'luz',    fonte: 'Ifá Merindilogun — Ogbe = quatro, começo, criação, expansão inicial' },
  Oyeku:  { primitivo: 'Materializacao', intensidade: 8, polaridade: 'sombra', fonte: 'Ifá — Oyeku = perda, noite, contração, materialização bloqueada' },
  Ogundi: { primitivo: 'Movimento',      intensidade: 8, polaridade: 'ambas', fonte: 'Ifá — Ogundí = ferro, ação, corte, mudança rápida' },
  Irosun: { primitivo: 'Transformacao',  intensidade: 7, polaridade: 'sombra', fonte: 'Ifá — Irosun = seis, melancolia, reflexão profunda, transformação interior' },
  Obara:  { primitivo: 'Poder',          intensidade: 8, polaridade: 'luz',    fonte: 'Ifá — Obara = cinco, retidão, força moral, poder justo' },
  Okanran:{ primitivo: 'Conexao',         intensidade: 7, polaridade: 'sombra', fonte: 'Ifá — Okanran = treze,ahoo, relações perturbadas, koneksi yang terputus' },
  Owonrin:{ primitivo: 'Sabedoria',       intensidade: 7, polaridade: 'luz',    fonte: 'Ifá — Owonrin = sete, ophthalmia, visão ampla, sabedoria profética' },
  Odi:    { primitivo: 'Intuicao',        intensidade: 8, polaridade: 'ambas', fonte: 'Ifá — Odi = oito, destino, destino inescapable, intuição do destino' },
  Ejioko: { primitivo: 'Ordem',            intensidade: 7, polaridade: 'ambas', fonte: 'Ifá — Ejiokô = dois pedaços de osso, dualidade e equilíbrio, ordem cósmica' },
  Alubara:{ primitivo: 'Poder',            intensidade: 9, polaridade: 'luz',   fonte: 'Ifá — Alubara = BAKU, poder de resolver problemas, expansão de consciência' },
  Merinla:{ primitivo: 'Expansao',          intensidade: 8, polaridade: 'luz',   fonte: 'Ifá — Merinla = abundância, expansão múltipla, muitos caminhos' },
  Emi:    { primitivo: 'Amor',             intensidade: 9, polaridade: 'luz',   fonte: 'Ifá — Emi = alma, sopro de vida, amor que sustenta, espiritualidade' },
};

function traduzOdu(odu: PilarOdu): PrimitiveContribution[] {
  const principal = ODU_PRIMITIVOS[odu.odu_principal];

  // Look up enriched Odu data for fonte enrichment
  const oduEntry = ODUS_NUMEROLOGIA[odu.odu_principal] ?? null;

  if (!principal) {
    return [{
      primitivo: 'Conexao',
      intensidade: 5,
      polaridade: 'ambas',
      fonte: `Ifá — Odu ${odu.odu_principal} não mapeado; fallback para Conexão`,
    }];
  }

  // Build enriched fonte with orixá, elemento, frequência, proibição
  const enrichedFonte = oduEntry
    ? `${principal.fonte}; orixá(s): ${oduEntry.orixas.join('/')}, ` +
      `elemento: ${oduEntry.elemento}, frequência: ${oduEntry.frequencia}, ` +
      `proibição: ${oduEntry.proibicao.split(';')[0].split(',')[0]} [${odu.fonte}]`
    : `${principal.fonte} [${odu.fonte}]`;

  const results: PrimitiveContribution[] = [{
    primitivo: principal.primitivo,
    intensidade: principal.intensidade,
    polaridade: principal.polaridade,
    fonte: enrichedFonte,
  }];

  // Odu secundário pesa 50%
  if (odu.odu_secundario) {
    const sec = ODU_PRIMITIVOS[odu.odu_secundario];
    const secEntry = ODUS_NUMEROLOGIA[odu.odu_secundario] ?? null;
    if (sec) {
      const secEnrichedFonte = secEntry
        ? `${sec.fonte}; orixá(s): ${secEntry.orixas.join('/')}, ` +
          `elemento: ${secEntry.elemento}, frequência: ${secEntry.frequencia}, ` +
          `proibição: ${secEntry.proibicao.split(';')[0].split(',')[0]} (secundário) [${odu.fonte}]`
        : `${sec.fonte} (secundário) [${odu.fonte}]`;
      results.push({
        primitivo: sec.primitivo,
        intensidade: Math.round(sec.intensidade * 0.5),
        polaridade: sec.polaridade,
        fonte: secEnrichedFonte,
      });
    }
  }

  return results;
}

// ─── Tipo de retorno da síntese ──────────────────────────────────────────────

export interface SynthesizedProfile {
  primitivos: SynthesizedPrimitivo[];
  dominioPredominante: Dominio;
  tensaoPrincipal?: Tensao;
  narrativaCentral: string;
}

// ─── Síntese principal ───────────────────────────────────────────────────────

/**
 * Agrega os 5 pilares em primitivos unificados.
 *
 * Algoritmo:
 *  1. Cada tradutor devolve PrimitiveContribution[].
 *  2. Para cada primitivo: agregar magnitude (soma ponderada por domínio).
 *  3. Convergência = fontes que concordam / total de fontes que tocaram esse primitivo.
 *  4. Dominante = top-3 magnitude.
 *  5. Tensão: dois primitivos alta-magnitude com polaridades opostas.
 *  6. Narrativa: gerada a partir dos top-3 dominantes.
 *
 * @param pilares  AkashaLeitura['pilares']
 */
export function synthesizePrimitives(
  pilares: {
    iching:    PilarIChing;
    cabala:    PilarCabala;
    astrologia: PilarAstrologia;
    tantrica:   PilarTantrica;
    odu:        PilarOdu;
  },
): SynthesizedProfile {
  // 1. Coletar contribuições de cada tradutor (todos sync — Promise.all desnecessário)
  const [ichingC, cabalaC, astroC, tantraC, oduC] = [
    traduzIChing(pilares.iching),
    traduzCabala(pilares.cabala),
    traduzAstrologia(pilares.astrologia),
    traduzTantra(pilares.tantrica),
    traduzOdu(pilares.odu),
  ];

  // All contributions flat
  const all: PrimitiveContribution[] = [
    ...ichingC,
    ...cabalaC,
    ...astroC,
    ...tantraC,
    ...oduC,
  ];

  // 2. Agregar por primitivo — mapa de primitivo → contribuições
  const byPrim: Partial<Record<Primitivo, PrimitiveContribution[]>> = {};
  for (const c of all) {
    if (!byPrim[c.primitivo]) byPrim[c.primitivo] = [];
    byPrim[c.primitivo]!.push(c);
  }

  // Dominio predominante: soma dos pesos das fontes por domínio
  const dominioScores: Partial<Record<Dominio, number>> = {};
  const tradicoes: Tradicao[] = ['iching', 'cabala', 'astrologia', 'tantra', 'odu'];
  const contribsPerTrad: Array<{ trad: Tradicao; contribs: PrimitiveContribution[] }> = [
    { trad: 'iching',    contribs: ichingC },
    { trad: 'cabala',    contribs: cabalaC },
    { trad: 'astrologia', contribs: astroC },
    { trad: 'tantra',    contribs: tantraC },
    { trad: 'odu',       contribs: oduC },
  ];

  for (const { trad, contribs } of contribsPerTrad) {
    const pesos = PESOS_TRADICAO_DOMINIO[trad];
    for (const c of contribs) {
      // Para cada domínio, soma o peso da tradição × intensidade
      for (const dominio of Object.keys(pesos) as Dominio[]) {
        if (!dominioScores[dominio]) dominioScores[dominio] = 0;
        dominioScores[dominio]! += pesos[dominio] * c.intensidade;
      }
    }
  }

  // Dominio com maior score
  const dominioPredominante = (Object.entries(dominioScores) as [Dominio, number][])
    .sort((a, b) => b[1] - a[1])[0]![0];

  // 3. Construir SynthesizedPrimitivo para cada primitivo
  const synthesized: SynthesizedPrimitivo[] = PRIMITIVOS.map(prim => {
    const contribs = byPrim[prim] ?? [];

    // magnitude = soma das intensidades capped a 10 (para ser comparável entre perfis)
    const magnitude = Math.min(10, contribs.reduce((sum, c) => sum + c.intensidade, 0));

    // convergência: quantas fontes distintas contribuíram para este primitivo
    // normalizado pelo total de fontes (5 tradições)
    const convergingSources = contribs.length;
    const convergencia = Math.min(1, convergingSources / 5);

    // polaridade dominante:投票
    const polCounts: Record<Polaridade, number> = { luz: 0, sombra: 0, ambas: 0 };
    for (const c of contribs) polCounts[c.polaridade]++;
    const polaridade = (Object.entries(polCounts) as [Polaridade, number][])
      .sort((a, b) => b[1] - a[1])[0]![0] ?? 'ambas';

    return { primitivo: prim, magnitude, convergencia, polaridade, dominante: false, contributions: contribs };
  });

  // 4. Marcar dominantes: top-3 por magnitude
  const sorted = [...synthesized].sort((a, b) => b.magnitude - a.magnitude);
  for (const s of sorted.slice(0, 3)) s.dominante = true;

  // 5. Detectar tensão entre primitivos de alta magnitude com polaridades opostas
  let tensaoPrincipal: Tensao | undefined;
  for (const [primA, primB, desc] of PARES_TENSOES) {
    const a = synthesized.find(s => s.primitivo === primA);
    const b = synthesized.find(s => s.primitivo === primB);
    if (
      a && b &&
      a.magnitude > 3 &&
      b.magnitude > 3 &&
      a.polaridade !== b.polaridade &&
      a.polaridade !== 'ambas' &&
      b.polaridade !== 'ambas'
    ) {
      tensaoPrincipal = { primitivoA: primA, primitivoB: primB, descricao: desc };
      break; // só a tensão mais saliente
    }
  }

  // 6. Narrativa central: baseada nos top-3 dominantes
  const top3 = sorted.filter(s => s.dominante).slice(0, 3);
  const narrativaCentral = gerarNarrativa(top3);

  return {
    primitivos: synthesized,
    dominioPredominante,
    tensaoPrincipal,
    narrativaCentral,
  };
}

// ─── Narrativa central ────────────────────────────────────────────────────────

function polaridadeLabel(p: Polaridade): string {
  if (p === 'luz')    return 'luz (integrada)';
  if (p === 'sombra') return 'sombra (em修炼)';
  return 'em equilíbrio';
}

function gerarNarrativa(top: SynthesizedPrimitivo[]): string {
  if (top.length === 0) return 'Perfil em formação — mais tradições são necessárias para um síntese confiável.';

  const parts = top.map(s =>
    `${s.primitivo} (${polaridadeLabel(s.polaridade)}, magnitude ${s.magnitude})`
  );

  if (parts.length === 1) {
    return `Seu eixo central é ${parts[0]}. As demais tradições gravitam em torno deste polo.`;
  }
  if (parts.length === 2) {
    return `Duas forças comandam seu campo: ${parts[0]} e ${parts[1]}. Trazer consciência para esta dualidade é seu trabalho de integração.`;
  }
  return `Três forças dominam seu perfil: ${parts[0]}; ${parts[1]}; ${parts[2]}. Esta trilogia define sua missão e seu caminho de evolução.`;
}

// ─── Re-export para conveniência ─────────────────────────────────────────────

export { PRIMITIVOS, PESOS_TRADICAO_DOMINIO } from './types';
export type {
  Primitivo,
  Polaridade,
  PrimitiveContribution,
  Tradicao,
  Dominio,
} from './types';
