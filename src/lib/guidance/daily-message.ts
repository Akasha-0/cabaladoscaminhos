/**
 * Daily Cosmic Message Generator
 * Provides spiritual guidance based on day, moon phase, and planetary positions
 */

 // ============================================================================

export interface DailyMessage {
  /** Current day identifier */
  dia: number;
  /** Moon phase name in Portuguese */
  faseLua: string;
  /** Moon phase emoji */
  faseLuaSimbolo: string;
  /** Primary governing planet */
  planetaRegente: string;
  /** Affirmation for the day */
  afirmacao: Afirmacao;
  /** Practical spiritual tip */
  dica: string;
  /** Reflection question */
  reflexao: string;
}

export interface Afirmacao {
  texto: string;
  fonte: string;
}

// ============================================================================
// Moon Phase Data
// ============================================================================

const FASES_LUA: Record<number, { nome: string; simbolo: string }> = {
  0: { nome: 'Lua Nova', simbolo: '🌑' },
  1: { nome: 'Lua Crescente', simbolo: '🌓' },
  2: { nome: 'Lua Gibosa Crescente', simbolo: '🌒' },
  3: { nome: 'Quarto Crescente', simbolo: '⛈️' },
  4: { nome: 'Lua Cheia', simbolo: '🌕' },
  5: { nome: 'Lua Gibosa Minguante', simbolo: '🌖' },
  6: { nome: 'Quarto Minguante', simbolo: '🌗' },
  7: { nome: 'Lua Minguante', simbolo: '🌘' },
};

// ============================================================================
// Planetary Rulers by Day of Week
// ============================================================================

const PLANETAS_DIAS: Record<number, string> = {
  0: 'Sol',     // Domingo - Sol
  1: 'Lua',     // Segunda - Lua
  2: 'Mercúrio', // Terça - Marte
  3: 'Júpiter',  // Quarta - Mercúrio
  4: 'Vênus',   // Quinta - Júpiter
  5: 'Saturno',  // Sexta - Vênus
  6: 'Saturno',  // Sábado - Saturno
};

// ============================================================================
// Affirmations by Moon Phase
// ============================================================================

const AFIRMACOES_POR_FASE: Record<number, Afirmacao[]> = {
  0: [
    { texto: 'Um novo ciclo começa em mim. Abrindo espaço para luz e renovação.', fonte: 'Tradição Cabalística' },
    { texto: 'Eu permito que novas possibilidades floresçam em minha vida.', fonte: 'Caminho Interior' },
  ],
  1: [
    { texto: 'Minha energia cresce a cada passo que dou nesta jornada.', fonte: 'Caminho Interior' },
    { texto: 'A luz da consciência ilumina meu caminho de crescimento.', fonte: 'Tradição Hermética' },
  ],
  2: [
    { texto: 'A intenção que semeei germina em abundância em minha vida.', fonte: 'Caminho Interior' },
    { texto: 'Cada ação consciente aproxima-me da minha verdade interior.', fonte: 'Tradição Hermética' },
  ],
  3: [
    { texto: 'Minha voz interior ecoa com clareza e sabedoria.', fonte: 'Caminho Interior' },
    { texto: 'O poder decisório emana do meu centro sagrado.', fonte: 'Tradição Cabalística' },
  ],
  4: [
    { texto: 'A plenitude do universo flui através de mim para o mundo.', fonte: 'Caminho Interior' },
    { texto: 'Akó querubyn, eu sou luz. Eu sou paz. Eu sou caminho.', fonte: 'Tradição Cabalística' },
  ],
  5: [
    { texto: 'A sabedoria acumulada transforma-se em discernimento.', fonte: 'Caminho Interior' },
    { texto: 'Libero o que não serve e abraço o que é verdadeiro.', fonte: 'Tradição Hermética' },
  ],
  6: [
    { texto: 'O descanso é parte sagrada do meu processo de integração.', fonte: 'Caminho Interior' },
    { texto: 'Na quietude, encontro respostas para minhas perguntas mais profundas.', fonte: 'Tradição Hermética' },
  ],
  7: [
    { texto: 'Preparo o terreno interno para o próximo ciclo de renovação.', fonte: 'Caminho Interior' },
    { texto: 'Cada término carrega em si a semente de um novo começo.', fonte: 'Tradição Cabalística' },
  ],
};

// ============================================================================
// Tips by Planet
// ============================================================================

const DICAS_POR_PLANETA: Record<string, string[]> = {
  'Sol': [
    'Manifeste sua individualidade através da expressão criativa.',
    'Reserve um momento para se conectar com seu propósito de vida.',
    'Honre sua essência radiante acolheraando sua luz interior.',
  ],
  'Lua': [
    'Permita-se fluir com as emoções sem lutar contra elas.',
    'Cuide do seu mundo interior através de práticas contemplativas.',
    'Honre seus ciclos emocionais como parte da sua natureza sagrada.',
  ],
  'Mercúrio': [
    'Pratique a escuta profunda antes de emitir palavras.',
    'Reverie sua comunicação interior por meio da escrita ou reflexão.',
    'Conecte mente e coração através da meditação silenciosa.',
  ],
  'Marte': [
    'Canalize sua energia vital para ações que alinhem com seu bem maior.',
    'Pratique a paciência como forma de fortalecer sua vontade interior.',
    'Honre sua força interior sem agressividade.',
  ],
  'Júpiter': [
    'Expanda sua consciência através da prática de gratidão.',
    'Busque sabedoria em tradições espirituais que ressoem com você.',
    'Permita-se enxergar além das limitações do tempo e espaço.',
  ],
  'Vênus': [
    'Cultive a beleza em seu ambiente como espelho da sua vida interior.',
    'Honre os relacionamentos como espelhos da sua relação consigo mesmo.',
    'Pratique o amor próprio como prática espiritual fundamental.',
  ],
  'Saturno': [
    'Estabeleça limites sagrados que protejam seu tempo e energia.',
    'Pratique a disciplina alegre em suas práticas espirituais.',
    'Honre a estrutura como base para a verdadeira liberdade.',
  ],
};

// ============================================================================
// Reflections by Day of Week
// ============================================================================

const REFLEXOES_POR_DIA: Record<number, string[]> = {
  0: [
    'Qual aspecto da minha individuality estou pronto para expressar mais plenamente?',
    'O que meu coração verdadeiramente deseja neste momento?',
  ],
  1: [
    'Como posso honrar minhas emoções sem ser dominado por elas?',
    'Que necessidades emocionais precisam de minha atenção hoje?',
  ],
  2: [
    'Que mensagens minha mente interior está tentando me transmitir?',
    'Como posso comunicar minhas verdades com mais clareza e compaixão?',
  ],
  3: [
    'Que sabedoria estou pronto para receber e integrar?',
    'Como posso alinhar meus pensamentos com minha intuição?',
  ],
  4: [
    'Por que sou grato nesta fase da minha jornada?',
    'Como posso expandir minha visão do que é possível para mim?',
  ],
  5: [
    'Que relacionamentos nutrem minha alma?',
    'Como posso cultivar mais harmonia em meu ambiente?',
  ],
  6: [
    'Que estruturas em minha vida precisam ser fortalecidas?',
    'Como posso honrar meus compromissos comigo mesmo?',
  ],
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get the day of year (1-366)
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate moon phase index (0-7)
 * Based on lunar synodic cycle approximation
 */
function getMoonPhaseIndex(date: Date = new Date()): number {
  // Simplified moon phase calculation
  // Known new moon: January 6, 2000 (JD 2451550.1)
  const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
  const synodicMonth = 29.530588853; // days
  const daysSinceNewMoon = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const lunarAge = ((daysSinceNewMoon % synodicMonth) + synodicMonth) % synodicMonth;
  // Divide into 8 phases
  const phaseLength = synodicMonth / 8;
  return Math.floor(lunarAge / phaseLength) % 8;
}

/**
 * Get element for planet (for themed content)
 */
function getPlanetaElemento(planeta: string): string {
  const elementos: Record<string, string> = {
    'Sol': 'Fogo',
    'Lua': 'Água',
    'Mercúrio': 'Ar',
    'Marte': 'Fogo',
    'Júpiter': 'Fogo',
    'Vênus': 'Terra',
    'Saturno': 'Terra',
  };
  return elementos[planeta] || 'Água';
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Generates a daily cosmic message based on the current day,
 * moon phase, and planetary positions.
 *
 * @returns DailyMessage with affirmation, tip, and reflection
 */
export function getDailyMessage(date: Date = new Date()): DailyMessage {
  const dayOfYear = getDayOfYear(date);
  const dayOfWeek = date.getDay();
  const moonPhaseIndex = getMoonPhaseIndex(date);
  const planetaRegente = PLANETAS_DIAS[dayOfWeek];

  const faseLuaData = FASES_LUA[moonPhaseIndex];
  const afirmacoes = AFIRMACOES_POR_FASE[moonPhaseIndex];
  const dicas = DICAS_POR_PLANETA[planetaRegente];
  const reflexoes = REFLEXOES_POR_DIA[dayOfWeek];

  // Deterministic selection based on day of year
  const affirmationIndex = dayOfYear % afirmacoes.length;
  const tipIndex = dayOfYear % dicas.length;
  const reflectionIndex = dayOfYear % reflexoes.length;

  return {
    dia: dayOfYear,
    faseLua: faseLuaData.nome,
    faseLuaSimbolo: faseLuaData.simbolo,
    planetaRegente,
    afirmacao: afirmacoes[affirmationIndex],
    dica: dicas[tipIndex],
    reflexao: reflexoes[reflectionIndex],
  };
}
