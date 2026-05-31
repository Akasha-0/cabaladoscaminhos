/**
 * Tarot Major Arcana - Planet Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns Tarot Major Arcana cards with the 7 classical planets
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and a planet
 */
export interface TarotPlanetMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The classical planet name */
  planeta: string;
  /** The element associated with this correlation (Fire, Water, Air, Earth) */
  elemento_conexao: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Tarot Major Arcana to Planet Mapping ─────────────────────────────────────

export const TAROT_PLANET_MAPPINGS: Record<string, TarotPlanetMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    planeta: 'Urano',
    elemento_conexao: 'Ar',
    significado_espiritual:
      'Liberdade absoluta, inovação, ruptura com o passado e salto no desconhecido. O despertar da consciência individual.',
    interpretacao:
      'Dia de abraçar mudanças radicais, seguir sua intuição sem medo e quebrar padrões limitantes. Favorece inovações e novos começos.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    planeta: 'Lua',
    elemento_conexao: 'Água',
    significado_espiritual:
      'Intuição profunda, conhecimento oculto, o véu entre dois mundos e os mistérios da lua. Sabedoria silenciosa.',
    interpretacao:
      'Período propício para trabalho interno, meditação e acesso ao conhecimento intuitivo. Confie nos seus sonhos e percepções sutis.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    planeta: 'Vênus',
    elemento_conexao: 'Terra',
    significado_espiritual:
      'Fertilidade, criação abundante, amor incondicional e conexão com o divino feminino. A mãe natureza que nutre e prospera.',
    interpretacao:
      'Dia de harmonização, doçura e magnetismo pessoal. Ideal para trabalhos de amor, cura emocional e atratividade. Cuide do coração.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    planeta: 'Marte',
    elemento_conexao: 'Fogo',
    significado_espiritual:
      'Força de vontade, liderança marcial, estratégia militar e autoridade. O guerreiro que ordena o caos através da disciplina.',
    interpretacao:
      'Dia de ação decisiva, coragem e força de vontade. Ideal para iniciar batalhas, quebrar resistência e impor limites. Evite conflitos desnecessários.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    planeta: 'Júpiter',
    elemento_conexao: 'Ar',
    significado_espiritual:
      'Expansão espiritual, sabedoria sagrada, tradição e fé. O mestre que transmite a doutrina divina e abre portais de conhecimento.',
    interpretacao:
      'Dia de buscar conhecimento profundo, expandir horizontes mentais e conectar-se com tradições espirituais. Favorece rituais de fartura e cura.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    planeta: 'Mercúrio',
    elemento_conexao: 'Ar',
    significado_espiritual:
      'Poder mental, comunicação, maestria das ferramentas internas e manipulação da energia através da palavra e do pensamento.',
    interpretacao:
      'Momento de manifestar através da mente, diplomácia e estratégia verbal. Use a comunicação como ferramenta de transformação. Favorece estudos e negócios.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    planeta: 'Lua',
    elemento_conexao: 'Água',
    significado_espiritual:
      'Intuição profunda, o inconsciente, ilusões e flutuação emocional. Ciclo noturno da mente e conexão com a água.',
    interpretacao:
      'Período propício para trabalho interno, meditação, sonhos e processos de limpeza emocional. Confie na intuição, mas evite decisões impulsivas.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    planeta: 'Sol',
    elemento_conexao: 'Fogo',
    significado_espiritual:
      'Vitalidade, irradiação do poder pessoal, sucesso e alinhamento com o propósito de vida. Clareza interior e brilho próprio.',
    interpretacao:
      'Dia de maximizar a energia pessoal, buscar reconhecimento, assumir liderança e manifestar seus talentos. Foque no brilho próprio e na energia Yang.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    planeta: 'Saturno',
    elemento_conexao: 'Terra',
    significado_espiritual:
      'Completude, encerramento de ciclos, transformação final e realização terrena. A dança cósmica que completa uma jornada.',
    interpretacao:
      'Dia de finalizações, rituais de encerramento e manifestação de projetos de longa duração. Favorece a conclusão de ciclos kármicos e a estabilidade.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_PLANET_MAPPINGS);
Object.values(TAROT_PLANET_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

export function getTarotPlanet(arcano: string): TarotPlanetMapping | null {
  return TAROT_PLANET_MAPPINGS[arcano] ?? null;
}

export function getPlanetTarot(planeta: string): string | null {
  const entry = Object.values(TAROT_PLANET_MAPPINGS).find(
    (mapping) => mapping.planeta === planeta
  );
  return entry?.arcano ?? null;
}

export function getAllTarotPlanets(): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAPPINGS);
}

export function getAllArcanos(): string[] {
  return Object.keys(TAROT_PLANET_MAPPINGS);
}

export function getAllPlanets(): string[] {
  const planets = Object.values(TAROT_PLANET_MAPPINGS).map(
    (mapping) => mapping.planeta
  );
  return [...new Set(planets)];
}

export function hasTarotPlanet(arcano: string): boolean {
  return arcano in TAROT_PLANET_MAPPINGS;
}

export function hasPlanetTarot(planeta: string): boolean {
  return getPlanetTarot(planeta) !== null;
}

export function getPlanetByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_PLANET_MAPPINGS).find(
    (mapping) => mapping.numero_carta === numero
  );
  return entry?.planeta ?? null;
}

export function getArcanoByNumber(numero: number): string | null {
  const entry = Object.values(TAROT_PLANET_MAPPINGS).find(
    (mapping) => mapping.numero_carta === numero
  );
  return entry?.arcano ?? null;
}

export function getPlanetByArcano(arcano: string): string | null {
  return TAROT_PLANET_MAPPINGS[arcano]?.planeta ?? null;
}

export function getElementByArcano(arcano: string): string | null {
  return TAROT_PLANET_MAPPINGS[arcano]?.elemento_conexao ?? null;
}

export function getSignificadoByArcano(arcano: string): string | null {
  return TAROT_PLANET_MAPPINGS[arcano]?.significado_espiritual ?? null;
}

export function getInterpretacaoByArcano(arcano: string): string | null {
  return TAROT_PLANET_MAPPINGS[arcano]?.interpretacao ?? null;
}

export function getArcanosByElement(elemento: string): string[] {
  return Object.values(TAROT_PLANET_MAPPINGS)
    .filter((mapping) => mapping.elemento_conexao === elemento)
    .map((mapping) => mapping.arcano);
}

export function getPlanetsByElement(elemento: string): string[] {
  const planets = Object.values(TAROT_PLANET_MAPPINGS)
    .filter((mapping) => mapping.elemento_conexao === elemento)
    .map((mapping) => mapping.planeta);
  return [...new Set(planets)];
}

export default {
  getTarotPlanet,
  getPlanetTarot,
  getAllTarotPlanets,
  getAllArcanos,
  getAllPlanets,
  hasTarotPlanet,
  hasPlanetTarot,
  getPlanetByNumber,
  getArcanoByNumber,
  getPlanetByArcano,
  getElementByArcano,
  getSignificadoByArcano,
  getInterpretacaoByArcano,
  getArcanosByElement,
  getPlanetsByElement,
  TAROT_PLANET_MAPPINGS,
};
