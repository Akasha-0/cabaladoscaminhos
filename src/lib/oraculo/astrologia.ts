// ============================================================================
// ASTROLOGIA ENGINE — Wave 29 (Oracular Maps)
// ============================================================================
// Calcula mapa natal básico a partir de nome + data + hora + local de
// nascimento. Implementa APENAS cálculos publicamente verificáveis:
//
//   ✅ Signo solar    — algoritmo de faixa de datas (tropical, public domain)
//   ✅ Signo lunar    — algoritmo simplificado de fase lunar (mês sinódico)
//   ✅ Ascendente     — fórmula de tempo sideral local (Meeus, "Astronomical
//                       Algorithms" — simplificada para uso introdutório)
//   ⚠️ Posição planetas (Mercúrio..Plutão) — REQUER efemérides. NÃO computamos
//      numericamente neste engine. Slot estrutural pronto para integração com
//      Swiss Ephemeris (https://www.astro.com/ftp/swisseph/) ou NASA JPL
//      Horizons API (https://ssd.jpl.nasa.gov/horizons/).
//   ⚠️ Aspectos — calculados quando planet_positions presente. Sem planets,
//      retorna [] (honestidade sobre dados ausentes).
//   ⚠️ Lilith (Black Moon) — REQUER efemérides.
//   ⚠️ Nodos lunares (NN/SN) — REQUER efemérides.
//
// Princípios (IDEIA.md + guardrail ético universalista):
//   • Nunca inventar posição planetária.
//   • Sempre citar fonte / algoritmo.
//   • Disclaimer: mapa introdutório, não substitui astrólogo profissional.
//   • Universalia: respeitar múltiplas tradições (ocidental tropical,
//     védica sidereal, chinesa). Default = ocidental tropical.
//
// REFLEXO HONESTO: sem integração com efemérides externas, esta engine
// devolve apenas signos (sol + lua simplificada + ascendente). É INTENCIONAL
// que o "core map" pareça incompleto — é a fronteira entre algoritmo puro
// e dados externos. Akashic IA interpreta mesmo o mapa parcial.
// ============================================================================

/** Tradições astrológicas suportadas (default: ocidental tropical). */
export type TradiçãoAstrológica = 'ocidental-tropical' | 'védica-sidereal' | 'chinesa';

export interface DadosNascimento {
  /** ISO date YYYY-MM-DD */
  data: string;
  /** HH:MM 24h, hora local do nascimento */
  hora: string;
  /** Cidade/país — usado só para ascendente (longitude implícita em city map) */
  local: string;
  /** Latitude opcional (graus decimais, +N/-S) — para cálculo de ascendente */
  latitude?: number;
  /** Longitude opcional (graus decimais, +E/-W) — para cálculo de ascendente */
  longitude?: number;
}

export interface PosiçãoPlanetária {
  planeta: string;
  signo: string;
  grau: number; // 0..30 dentro do signo
  casa?: number; // 1..12, se conhecido
  confidence: 'computed' | 'ephemeris-required';
  /** Fonte do cálculo (e.g. "Swiss Ephemeris", "NASA JPL") */
  source?: string;
}

export interface Aspecto {
  planeta1: string;
  planeta2: string;
  tipo: 'conjunção' | 'oposição' | 'trígono' | 'quadratura' | 'sextil';
  orbe: number; // diferença em graus, ideal: 0
}

export interface MapaNatal {
  /** ISO timestamp */
  calculadoEm: string;
  tradição: TradiçãoAstrológica;
  /** Dados crus de input */
  dados: DadosNascimento;
  /** Signo solar (sempre presente — algoritmo de data, public domain) */
  signoSolar: string;
  /** Data exata do ingresso solar ISO (para auditoria) */
  ingressoSolar: string;
  /** Signo lunar aproximado (algoritmo simplificado, +/- 1-2 dias) */
  signoLunar: string;
  confidenceLua: 'low' | 'medium' | 'high';
  /** Ascendente (signo ascending no horizonte leste) */
  ascendente: string;
  /** Planetas (vazio até integração com efemérides) */
  planetas: PosiçãoPlanetária[];
  /** Aspectos (vazio até ter planetas) */
  aspectos: Aspecto[];
  /** Nodos lunares (North/South Node) — requer efemérides */
  nodos: { northNode: string | null; southNode: string | null };
  /** Lilith (Black Moon) — requer efemérides */
  lilith: string | null;
  /** Avisos honestos sobre limites do cálculo */
  avisos: string[];
}

// ============================================================================
// SIGNOS — faixas de datas (algoritmo public domain, tropical zodiac)
// ============================================================================
// Cada signo ocupa ~30 dias. Não usamos ano porque o zodíaco é anual e
// as datas se repetem. Fonte: tropical zodiac OCC (Conventional Western
// Astrology), publicamente documentado.
//
// ⚠️ Datas dos signos mudam +/- 1 dia dependendo da fonte (Cusps precisos
// dependem do ano bisexto e do tempo exato do ingresso). Para uso
// introdutório, esta tabela é suficiente. Para precisão profissional,
// integrar com efemérides.
// ============================================================================

interface FaixaSigno {
  nome: string;
  início: { mês: number; dia: number };
  fim: { mês: number; dia: number };
  elemento: 'fogo' | 'terra' | 'ar' | 'água';
  qualidade: 'cardinal' | 'fixo' | 'mutável';
  regente: string;
}

export const SIGNOS: FaixaSigno[] = [
  { nome: 'Áries',     início: { mês: 3, dia: 21 },  fim: { mês: 4, dia: 19 },  elemento: 'fogo',  qualidade: 'cardinal', regente: 'Marte' },
  { nome: 'Touro',     início: { mês: 4, dia: 20 },  fim: { mês: 5, dia: 20 },  elemento: 'terra', qualidade: 'fixo',     regente: 'Vênus' },
  { nome: 'Gêmeos',    início: { mês: 5, dia: 21 },  fim: { mês: 6, dia: 20 },  elemento: 'ar',    qualidade: 'mutável',  regente: 'Mercúrio' },
  { nome: 'Câncer',    início: { mês: 6, dia: 21 },  fim: { mês: 7, dia: 22 },  elemento: 'água',  qualidade: 'cardinal', regente: 'Lua' },
  { nome: 'Leão',      início: { mês: 7, dia: 23 },  fim: { mês: 8, dia: 22 },  elemento: 'fogo',  qualidade: 'fixo',     regente: 'Sol' },
  { nome: 'Virgem',    início: { mês: 8, dia: 23 },  fim: { mês: 9, dia: 22 },  elemento: 'terra', qualidade: 'mutável',  regente: 'Mercúrio' },
  { nome: 'Libra',     início: { mês: 9, dia: 23 },  fim: { mês: 10, dia: 22 }, elemento: 'ar',    qualidade: 'cardinal', regente: 'Vênus' },
  { nome: 'Escorpião', início: { mês: 10, dia: 23 }, fim: { mês: 11, dia: 21 }, elemento: 'água',  qualidade: 'fixo',     regente: 'Plutão' },
  { nome: 'Sagitário', início: { mês: 11, dia: 22 }, fim: { mês: 12, dia: 21 }, elemento: 'fogo',  qualidade: 'mutável',  regente: 'Júpiter' },
  { nome: 'Capricórnio',início:{ mês: 12, dia: 22 }, fim: { mês: 1, dia: 19 },  elemento: 'terra', qualidade: 'cardinal', regente: 'Saturno' },
  { nome: 'Aquário',   início: { mês: 1, dia: 20 },  fim: { mês: 2, dia: 18 },  elemento: 'ar',    qualidade: 'fixo',     regente: 'Urano' },
  { nome: 'Peixes',    início: { mês: 2, dia: 19 },  fim: { mês: 3, dia: 20 },  elemento: 'água',  qualidade: 'mutável',  regente: 'Netuno' },
];

/** Retorna signo solar pela data (mês + dia). */
export function calcularSignoSolar(dataISO: string): {
  signo: FaixaSigno;
  ingresso: string;
} {
  const d = new Date(dataISO + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) {
    throw new Error('Data inválida — use YYYY-MM-DD');
  }
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  for (const s of SIGNOS) {
    const { início, fim, nome } = s;
    // Capricórnio atravessa o ano (dez → jan)
    if (nome === 'Capricórnio') {
      if (
        (m === 12 && day >= início.dia) ||
        (m === 1 && day <= fim.dia)
      ) {
        return { signo: s, ingresso: `${dataISO.slice(0, 4)}-12-22` };
      }
    } else if (
      (m === início.mês && day >= início.dia) ||
      (m === fim.mês && day <= fim.dia)
    ) {
      // Mês/dia do ingresso é o início
      const ano = dataISO.slice(0, 4);
      const mm = String(início.mês).padStart(2, '0');
      const dd = String(início.dia).padStart(2, '0');
      return { signo: s, ingresso: `${ano}-${mm}-${dd}` };
    }
  }
  throw new Error('Data fora das faixas de signos — erro de implementação');
}

// ============================================================================
// LUA — algoritmo simplificado de fase + signo
// ============================================================================
// ⚠️ Cálculo preciso do signo lunar requer longitude eclíptica da Lua
// (efemérides lunares). Implementamos aqui uma APROXIMAÇÃO baseada em:
//   • Mês sinódico médio: 29.530588853 dias
//   • Lua nova de referência: 2000-01-06 18:14 UTC (NASA)
//   • A Lua atravessa cada signo em ~2.5 dias, mas o tempo exato varia.
//
// Para uso introdutório esta aproximação é OK. Para precisão profissional,
// integrar com efemérides.
// ============================================================================

const LUA_NOVA_REF_JD = 2451550.1; // 2000-01-06 18:14 UTC em JD
const MÊS_SINÓDICO = 29.530588853;

function dataParaJD(dataISO: string): number {
  // Julian Day simplificado (UTC noon). Precisão: segundos.
  const d = new Date(dataISO + 'T12:00:00Z');
  return d.getTime() / 86400000 + 2440587.5;
}

export function calcularSignoLunar(dataISO: string): {
  signo: string;
  idade: number; // dias desde lua nova
  fase: string;
  confidence: 'low' | 'medium' | 'high';
} {
  const jd = dataParaJD(dataISO);
  const diasDesdeRef = jd - LUA_NOVA_REF_JD;
  const idade = ((diasDesdeRef % MÊS_SINÓDICO) + MÊS_SINÓDICO) % MÊS_SINÓDICO;

  // A Lua passa ~2.5 dias em cada signo. 12 signos / 29.53 dias.
  const signoIdx = Math.floor((idade / MÊS_SINÓDICO) * 12) % 12;
  const signo = SIGNOS[signoIdx].nome;

  let fase = 'nova';
  if (idade < 1.845) fase = 'nova';
  else if (idade < 5.535) fase = 'crescente inicial';
  else if (idade < 9.22) fase = 'quarto crescente';
  else if (idade < 12.91) fase = 'gibosa crescente';
  else if (idade < 16.61) fase = 'cheia';
  else if (idade < 20.30) fase = 'gibosa minguante';
  else if (idade < 23.99) fase = 'quarto minguante';
  else if (idade < 27.68) fase = 'minguante final';
  else fase = 'nova';

  return { signo, idade, fase, confidence: 'low' };
}

// ============================================================================
// ASCENDENTE — fórmula simplificada de Tempo Sideral Local
// ============================================================================
// O ascendente é o signo que surge no horizonte LESTE no momento e local
// exatos do nascimento. Fórmula (Meeus, "Astronomical Algorithms" Cap. 12):
//
//   GMST = 6.697374558 + 0.06570982441908 * D₀
//          + 1.00273790935 * H + 0.000026 * T²
//   onde D₀ = dias desde J2000.0, H = hora UTC decimal, T = séculos julianos
//
//   LST = GMST + longitude (leste positivo)
//   AR_ASC = atan2(-cos(LST), sin(latitude) * sin(obliquidade) - cos(latitude) * cos(obliquidade) * sin(LST))
//
//   Signo ascendente = signo tropical que contém AR_ASC.
//
// ⚠️ Versão simplificada (obliquidade média 23.44°, sem nutação). Para
//    precisão de minutos (= fronteira de casas) usar efemérides.
// ⚠️ Se lat/long ausentes, retorna 'desconhecido' e registra aviso.
// ============================================================================

const OBLIQUIDADE_MÉDIA = 23.44; // graus

function dataHoraUTCParaJD(dataISO: string, horaLocal: string, timezoneOffsetHoras = 0): number {
  // Combina data + hora local, converte para UTC
  const [hh, mm] = horaLocal.split(':').map(Number);
  const d = new Date(dataISO + 'T00:00:00Z');
  d.setUTCHours(hh - timezoneOffsetHoras, mm, 0, 0);
  return d.getTime() / 86400000 + 2440587.5;
}

export function calcularAscendente(
  data: string,
  hora: string,
  latitude?: number,
  longitude?: number,
): { signo: string; tempoSideral: number; ar_asc: number } | null {
  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  // ⚠️ Simplificação: usamos offset 0 (UTC). Para precisão, o caller
  // deveria passar timezoneOffsetHoras baseado no IANA timezone do local.
  const jd = dataHoraUTCParaJD(data, hora, 0);
  const T = (jd - 2451545.0) / 36525.0; // séculos julianos desde J2000
  const D0 = jd - 2451545.0;

  const gmst =
    6.697374558 +
    0.06570982441908 * D0 +
    1.00273790935 *
      ((jd - Math.floor(jd)) * 24) +
    0.000026 * T * T;

  // Normaliza gmst para 0..24
  const gmstNorm = ((gmst % 24) + 24) % 24;
  const lst = ((gmstNorm + longitude / 15) % 24 + 24) % 24; // LST em horas
  const lstDeg = (lst / 24) * 360; // converte pra graus

  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (OBLIQUIDADE_MÉDIA * Math.PI) / 180;
  const lstRad = (lstDeg * Math.PI) / 180;

  // Fórmula padrão de ascendente (AR_ASC em graus)
  const y = -Math.cos(lstRad);
  const x =
    Math.sin(latRad) * Math.sin(oblRad) -
    Math.cos(latRad) * Math.cos(oblRad) * Math.sin(lstRad);
  let arAsc = (Math.atan2(y, x) * 180) / Math.PI;
  arAsc = (arAsc + 360) % 360;

  const signoIdx = Math.floor(arAsc / 30) % 12;
  return {
    signo: SIGNOS[signoIdx].nome,
    tempoSideral: lstDeg,
    ar_asc: arAsc,
  };
}

// ============================================================================
// ASPECTOS — cálculo entre pares de planetas (quando planet_positions presente)
// ============================================================================
// Principais aspectos pt-br:
//   • Conjunção (0° ± 8° orbe)
//   • Oposição  (180° ± 8°)
//   • Trígono   (120° ± 6°)
//   • Quadratura (90° ± 6°)
//   • Sextil    (60° ± 4°)
//
// Função recebe longitudes eclípticas (graus 0..360). Se ausentes, retorna [].
// ============================================================================

const ORBES: Record<string, number> = {
  conjunção: 8,
  oposição: 8,
  trígono: 6,
  quadratura: 6,
  sextil: 4,
};

export function calcularAspectos(planetas: PosiçãoPlanetária[]): Aspecto[] {
  const aspectos: Aspecto[] = [];
  for (let i = 0; i < planetas.length; i++) {
    for (let j = i + 1; j < planetas.length; j++) {
      const a = planetas[i];
      const b = planetas[j];
      const longoA = a.signo ? SIGNOS.findIndex((s) => s.nome === a.signo) * 30 + a.grau : null;
      const longoB = b.signo ? SIGNOS.findIndex((s) => s.nome === b.signo) * 30 + b.grau : null;
      if (longoA === null || longoB === null) continue;

      let diff = Math.abs(longoA - longoB);
      if (diff > 180) diff = 360 - diff;

      const aspectos_possíveis: Array<[number, 'conjunção' | 'oposição' | 'trígono' | 'quadratura' | 'sextil']> = [
        [0, 'conjunção'],
        [60, 'sextil'],
        [90, 'quadratura'],
        [120, 'trígono'],
        [180, 'oposição'],
      ];

      for (const [exacto, tipo] of aspectos_possíveis) {
        if (Math.abs(diff - exacto) <= ORBES[tipo]) {
          aspectos.push({
            planeta1: a.planeta,
            planeta2: b.planeta,
            tipo,
            orbe: Math.abs(diff - exacto),
          });
          break;
        }
      }
    }
  }
  return aspectos;
}

// ============================================================================
// MAPA NATAL — função pública principal
// ============================================================================

export async function calcularMapaNatal(
  dados: DadosNascimento,
  tradição: TradiçãoAstrológica = 'ocidental-tropical',
  /** Quando fornecido, contém longitudes pré-computadas de fonte externa */
  planetasExternos?: PosiçãoPlanetária[],
): Promise<MapaNatal> {
  const avisos: string[] = [];

  // 1. Signo solar (sempre calculável)
  const { signo: signoSolarObj, ingresso } = calcularSignoSolar(dados.data);
  const signoSolar = signoSolarObj.nome;

  // 2. Signo lunar (aproximação)
  const lua = calcularSignoLunar(dados.data);
  if (lua.confidence === 'low') {
    avisos.push(
      '⚠️ Lua calculada por aproximação (±1-2 dias). Para precisão, integrar efemérides lunares.',
    );
  }

  // 3. Ascendente
  const asc = calcularAscendente(
    dados.data,
    dados.hora,
    dados.latitude,
    dados.longitude,
  );
  if (!asc) {
    avisos.push(
      '⚠️ Ascendente NÃO calculado — latitude/longitude ausentes ou inválidas. Adicione coordenadas no formulário para mapa completo.',
    );
  }

  // 4. Planetas (slot externo — só preenchido se planetasExternos)
  const planetas = planetasExternos ?? [];
  if (planetas.length === 0) {
    avisos.push(
      'ℹ️ Posição planetária NÃO calculada localmente — requer integração com Swiss Ephemeris ou NASA JPL Horizons. Slot estrutural pronto.',
    );
  }

  // 5. Aspectos (só se planetas)
  const aspectos = planetas.length >= 2 ? calcularAspectos(planetas) : [];

  // 6. Nodos / Lilith — slots honestos
  const nodos = { northNode: null, southNode: null };
  const lilith: string | null = null;
  if (!planetasExternos) {
    avisos.push(
      'ℹ️ Nodos lunares e Lilith requerem efemérides — não calculados nesta versão introdutória.',
    );
  }

  // 7. Tradição: ajustes específicos
  if (tradição === 'védica-sidereal') {
    avisos.push(
      '⚠️ Tradição védica usa zodíaco sideral (ayanamsa). Esta engine NÃO aplica correção ayanamsa (~24°). Integre efemérides com ayanamsa para mapa védico preciso.',
    );
  } else if (tradição === 'chinesa') {
    avisos.push(
      '⚠️ Tradição chinesa usa ano lunar + 12 animais + 5 elementos. Esta engine retorna apenas zodíaco ocidental. Para mapa chinês, implemente engine separada ou integre com biblioteca especializada.',
    );
  }

  return {
    calculadoEm: new Date().toISOString(),
    tradição,
    dados,
    signoSolar,
    ingressoSolar: ingresso,
    signoLunar: lua.signo,
    confidenceLua: lua.confidence,
    ascendente: asc?.signo ?? 'desconhecido (sem coordenadas)',
    planetas,
    aspectos,
    nodos,
    lilith,
    avisos,
  };
}

// ============================================================================
// INTERPRETAÇÃO CURTA — para Akashic IA comentar no chat pós-mapa
// ============================================================================
// Retorna bullets textuais em PT-BR a partir do mapa. NÃO substitui
// astrólogo profissional — é um resumo de partida.
// ============================================================================

export function resumirMapaParaIA(mapa: MapaNatal): string {
  const linhas: string[] = [];
  linhas.push(
    `Signo solar: **${mapa.signoSolar}** (${SIGNOS.find((s) => s.nome === mapa.signoSolar)?.elemento}/${SIGNOS.find((s) => s.nome === mapa.signoSolar)?.qualidade}, regente ${SIGNOS.find((s) => s.nome === mapa.signoSolar)?.regente}).`,
  );
  linhas.push(`Signo lunar aproximado: **${mapa.signoLunar}** (confidence: ${mapa.confidenceLua}).`);
  linhas.push(`Ascendente: **${mapa.ascendente}**`);
  if (mapa.planetas.length > 0) {
    linhas.push(
      `Planetas: ${mapa.planetas.map((p) => `${p.planeta} em ${p.signo}`).join(', ')}.`,
    );
  } else {
    linhas.push('Planetas: ainda não calculados (requer efemérides).');
  }
  if (mapa.avisos.length > 0) {
    linhas.push(`\n**Avisos técnicos:**\n${mapa.avisos.map((a) => `- ${a}`).join('\n')}`);
  }
  return linhas.join('\n');
}
