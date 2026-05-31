/**
 * Moon-Planet Spiritual Correlation Module
 * Maps the 8 lunar phases to the 7 classical planets (including Sun and Moon)
 * with spiritual meanings and elemental connections.
 * 
 * Based on Cabala dos Caminhos hermetic principles and astrological correspondences.
 */

export type Planeta = 
  | 'Lua'
  | 'Mercúrio'
  | 'Vênus'
  | 'Sol'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno'
  | 'Netuno';

export type FaseLua = 
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export interface MoonPlanetMapping {
  fase: string;
  nome_fase: string;
  planeta: Planeta;
  planeta_detalhes: {
    simbolo: string;
    qualidade: string;
    dia_semana: string;
    metal: string;
  };
  elemento_conexao: string;
  qualidades_espirituais: {
    energia: string;
    dominio: string;
    missao: string;
    lição: string;
  };
  praticas_espirituais: {
    meditacao: string[];
    ritual: string[];
    cores: string[];
    cristais: string[];
    aromas: string[];
    mantras: string[];
  };
  archote_correspondente: string;
  sefira_correspondente: string;
}

/**
 * Complete mapping of lunar phases to planets and spiritual correspondences.
 * Derived from hermetic astrology and cabalist planetary correspondences.
 */
export const MOON_PLANET_MAPPINGS: Record<FaseLua, MoonPlanetMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    planeta: 'Saturno',
    planeta_detalhes: {
      simbolo: '♄',
      qualidade: 'Limitação e estrutura',
      dia_semana: 'Sábado',
      metal: 'Chumbo',
    },
    elemento_conexao: 'Terra',
    qualidades_espirituais: {
      energia: 'Receptiva e silenciosa',
      dominio: 'Renovação e proteção',
      missao: 'Sementeira de novas intenções',
      lição: 'Confiar no silêncio antes do amanhecer',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Saturno - restrição e paciência', 'Visualização de sementes no escuro', 'Conexão com ancestrais'],
      ritual: ['Plântulas de intenciones', 'Cerimônias de novos começos', 'Assentamentos'],
      cores: ['Preto', 'Marrom', 'Cinza'],
      cristais: ['Obsidiana', 'Turmalina negra', 'Shungite'],
      aromas: ['Patchouli', 'Benjoim', 'Mirra'],
      mantras: ['Om', 'So Hum', 'Eu sou aquele que renasce'],
    },
    archote_correspondente: 'Tzadkiel',
    sefira_correspondente: 'Binah (Compreensão)',
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    planeta: 'Júpiter',
    planeta_detalhes: {
      simbolo: '♃',
      qualidade: 'Expansão e abundância',
      dia_semana: 'Quinta-feira',
      metal: 'Estanho',
    },
    elemento_conexao: 'Água',
    qualidades_espirituais: {
      energia: 'Crescente e nutridora',
      dominio: 'Prosperidade e proteção',
      missao: 'Atração de abundancia e proteção',
      lição: 'A luz cresce para aqueles que a buscam',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Júpiter - expansão ilimitada', 'Visualização de chuva de bênçãos', 'Gratidão amplificada'],
      ritual: ['Rituais de abertura de caminhos', 'Banhos de prosperidade', 'Oferendas de GRATIDÃO'],
      cores: ['Azul royal', 'Roxo', 'Dourado'],
      cristais: ['Ametista', 'Citrino', 'Topázio azul'],
      aromas: ['Jasmim', 'Sândalo', 'Canela'],
      mantras: ['Om Namah Shivaya', 'A expansão é meu direito divino'],
    },
    archote_correspondente: 'Chesed',
    sefira_correspondente: 'Chesed (Misericórdia)',
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    planeta: 'Marte',
    planeta_detalhes: {
      simbolo: '♂',
      qualidade: 'Força e coragem',
      dia_semana: 'Terça-feira',
      metal: 'Ferro',
    },
    elemento_conexao: 'Fogo',
    qualidades_espirituais: {
      energia: 'Ativa e desafiadora',
      dominio: 'Ação e proteção',
      missao: 'Quebrar obstáculos e defender verdades',
      lição: 'A coragem transforma medo em poder',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Marte - fogo guerrreiro', 'Visualização solar', 'Pranayama de energia'],
      ritual: ['Rituais de defesa e proteção', 'Quebra de demandas', 'Ativação da vontade'],
      cores: ['Vermelho', 'Laranja', 'Amarelo'],
      cristais: ['Rubi', 'Piropo', 'Heliólita'],
      aromas: ['Canela', 'Gengibre', 'Alecrim'],
      mantras: ['Om Ram', 'Eu tenho força, eu tenho coragem'],
    },
    archote_correspondente: 'Gamaliel',
    sefira_correspondente: 'Gevurah (Força/Juízo)',
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    planeta: 'Lua',
    planeta_detalhes: {
      simbolo: '☾',
      qualidade: 'Intuição e ciclos',
      dia_semana: 'Segunda-feira',
      metal: 'Prata',
    },
    elemento_conexao: 'Água',
    qualidades_espirituais: {
      energia: 'Manifestadora e iluminada',
      dominio: 'Culminação e magia',
      missao: 'Manifestar intenções e purificar emoções',
      lição: 'Na luz total, as verdades se revelam',
    },
    praticas_espirituais: {
      meditacao: ['Meditação sob a lua cheia', 'Banho de luar', 'Lágrimas de libertação'],
      ritual: ['Alta magia de atração', 'Consagrações', 'Rituais de amor e cura'],
      cores: ['Branco', 'Prata', 'Azul lunar'],
      cristais: ['Selenita', 'Quartzo lunar', 'Moldavita'],
      aromas: ['Lavanda', 'Sândalo', 'Lótus'],
      mantras: ['Om Chandraya Namaha', 'Eu reflito a luz divina'],
    },
    archote_correspondente: 'Gabriel',
    sefira_correspondente: 'Yesod (Fundação)',
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    planeta: 'Vênus',
    planeta_detalhes: {
      simbolo: '♀',
      qualidade: 'Harmonia e amor',
      dia_semana: 'Sexta-feira',
      metal: 'Cobre',
    },
    elemento_conexao: 'Ar',
    qualidades_espirituais: {
      energia: 'Dissolutiva e libertadora',
      dominio: 'Libertação e amor',
      missao: 'Dissolver o que não serve para dar espaço ao amor',
      lição: 'Soltar é um ato de amor-próprio',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Vênus - coração aberto', 'Pranayama de amor', 'Sopro de transformação'],
      ritual: ['Rituais de limpeza emocional', 'Descarrego de mágoas', 'Dissolução de padrões'],
      cores: ['Rosa', 'Verde', 'Turquesa'],
      cristais: ['Quartzo rosa', 'Rodocrosita', 'Esmeralda'],
      aromas: ['Rosa', 'Ylang-ylang', 'Bergamota'],
      mantras: ['Om Shukray Namaha', 'Eu mereço amor, eu sou amável'],
    },
    archote_correspondente: 'Haniel',
    sefira_correspondente: 'Hod (Glória)',
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    planeta: 'Mercúrio',
    planeta_detalhes: {
      simbolo: '☿',
      qualidade: 'Comunicação e inteligência',
      dia_semana: 'Quarta-feira',
      metal: 'Mercúrio',
    },
    elemento_conexao: 'Éter',
    qualidades_espirituais: {
      energia: 'Transmutadora e reveladora',
      dominio: 'Revelação e comunicação',
      missao: 'Desvendar verdades ocultas e integrar sabedoria',
      lição: 'Na escuridão, a mente revela o que os olhos não veem',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Mercúrio - mente clara', 'Visualização de dissolução', 'Silêncio profundo'],
      ritual: ['Rituais de cura profunda', 'Descomplicação kármica', 'Mergulho no inconsciente'],
      cores: ['Azul', 'Amarelo', 'Laranja'],
      cristais: ['Ágata azul', 'Fluorite', 'Lápis-lazúli'],
      aromas: ['Olíbano', 'Lavanda', 'Eucalipto'],
      mantras: ['Om Budday Namaha', 'Minha mente é clara, minha visão é profunda'],
    },
    archote_correspondente: 'Michael',
    sefira_correspondente: 'Tiferet (Beleza/Harmonia)',
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    planeta: 'Sol',
    planeta_detalhes: {
      simbolo: '☉',
      qualidade: 'Vitalidade e verdade',
      dia_semana: 'Domingo',
      metal: 'Ouro',
    },
    elemento_conexao: 'Terra',
    qualidades_espirituais: {
      energia: 'Integradora e reflexiva',
      dominio: 'Integração e perdão',
      missao: 'Integrar aprendizados e preparar-se para o novo ciclo',
      lição: 'A verdadeira luz vem da integração das sombras',
    },
    praticas_espirituais: {
      meditacao: ['Meditação solar - integração', 'Grounding profundo', 'Conexão com a verdade interior'],
      ritual: ['Rituais de perdão', 'Enterro de mágoas', 'Sementeira para o próximo ciclo'],
      cores: ['Dourado', 'Amarelo', 'Laranja'],
      cristais: ['Heliólita', 'Citrino', 'Ágata de fogo'],
      aromas: ['Girassol', 'Baunilha', 'Laranja'],
      mantras: ['Om Suryaya Namaha', 'Eu sou a luz que integra todas as partes de mim'],
    },
    archote_correspondente: 'Raphael',
    sefira_correspondente: 'Netzach (Vitória/Eternidade)',
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    planeta: 'Netuno',
    planeta_detalhes: {
      simbolo: '♆',
      qualidade: 'Transcendência e dissolução',
      dia_semana: 'Quarta-feira (netuno)',
      metal: ' estanho',
    },
    elemento_conexao: 'Água',
    qualidades_espirituais: {
      energia: 'Ancestral e limiar',
      dominio: 'Ancestralidade e dissolução',
      missao: 'Comunicação com ancestrais e preparo para renascimento',
      lição: 'No limiar entre mundos, a alma encontra seus ancestrais',
    },
    praticas_espirituais: {
      meditacao: ['Meditação de Netuno - sonho profundo', 'Viagem xamânica', 'Comunicação ancestral'],
      ritual: ['Rituais de descarrego final', 'Despedidas', 'Transição entre ciclos'],
      cores: ['Índigo', 'Violeta', 'Preto azulado'],
      cristais: ['Amatrolite', 'Charoíte', 'Sugilite'],
      aromas: ['Absinto', 'Artemísia', 'Lavanda seca'],
      mantras: ['Om Neptune', 'Dissolvo-me na wisdom ancestral'],
    },
    archote_correspondente: 'Cassiel',
    sefira_correspondente: 'Chokmah (Sabedoria)',
  },
};

/**
 * Returns the complete moon-planet mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonPlanetMapping or null if phase not found
 */
export function getMoonPlanet(fase: string): MoonPlanetMapping | null {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return MOON_PLANET_MAPPINGS[faseNormalizada] || null;
}

/**
 * Get the associated planet for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The planet or null if not found
 */
export function getPlanetMoon(fase: string): Planeta | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.planeta || null;
}

/**
 * Get all moon-planet mappings.
 * @returns Array of all MoonPlanetMapping
 */
export function getAllMoonPlanets(): MoonPlanetMapping[] {
  return Object.values(MOON_PLANET_MAPPINGS);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailableMoonPhases(): FaseLua[] {
  return Object.keys(MOON_PLANET_MAPPINGS) as FaseLua[];
}

/**
 * Get the spiritual practices for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The spiritual practices or null if not found
 */
export function getSpiritualPractices(fase: string): MoonPlanetMapping['praticas_espirituais'] | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.praticas_espirituais || null;
}

/**
 * Get the element connection for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementConnection(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.elemento_conexao || null;
}

/**
 * Get the archangel corresponding to a lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The archangel or null if not found
 */
export function getArchangel(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.archote_correspondente || null;
}

/**
 * Get the sefira corresponding to a lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The sefira or null if not found
 */
export function getSefira(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.sefira_correspondente || null;
}

/**
 * Get all mappings for a specific planet.
 * @param planeta - The planet to filter by
 * @returns Array of MoonPlanetMapping where the planet matches
 */
export function getMoonByPlanet(planeta: string): MoonPlanetMapping[] {
  return getAllMoonPlanets().filter(
    (mapping) => mapping.planeta.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Get the planet details for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The planet details or null if not found
 */
export function getPlanetDetails(fase: string): MoonPlanetMapping['planeta_detalhes'] | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.planeta_detalhes || null;
}

/**
 * Get all available planets.
 * @returns Array of unique planet names
 */
export function getAvailablePlanets(): Planeta[] {
  const planets = getAllMoonPlanets().map((m) => m.planeta);
  return [...new Set(planets)];
}
/**
 * Get all unique planet names sorted alphabetically.
 * @returns Array of unique planet names
 */
export function getAvailablePlanetsAlphabetical(): Planeta[] {
  return Array.from(getAvailablePlanets()).sort();
}