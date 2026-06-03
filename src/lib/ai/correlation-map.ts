// ============================================================
// CORRELATION MAP — As 36 Casas da Mesa Real
// ============================================================
// Dicionário de delegação determinística: para cada casa (1-36),
// quais aspectos do mapa natal injetar no prompt.
//
// Fonte canônica: docs/06_ai-engine-spec.md §3.1 (as 36 entradas).
// Regra inviolável (Doc 09 §5.7): cada casa recebe APENAS os dados
// mapeados para ela aqui — nunca dados genéricos.

export type SystemBlock = {
  /** Rótulos legíveis dos aspectos (para o LLM entender o contexto). */
  aspects: string[];
  /** Caminhos de extração (dot-path) sobre o respectivo *Map JSON do Client. */
  extractionKeys: string[];
};

export type CorrelationEntry = {
  houseId: number;
  houseName: string;
  /** Tema da casa — contexto para o LLM. */
  houseTheme: string;
  astrology: {
    /** Casas astrológicas relevantes. */
    primaryHouses: number[];
    /** Planetas mais importantes. */
    primaryPlanets: string[];
    /** Keys para extrair do astrologyMap JSON. */
    extractionKeys: string[];
  };
  kabalah: SystemBlock;
  tantric: SystemBlock;
  /** Extensão futura (Doc 14): novos sistemas oraculares entram como blocos opcionais. */
  iching?: SystemBlock;
};

export const CORRELATION_MAP: Record<number, CorrelationEntry> = {
  1: {
    houseId: 1, houseName: 'O Cavaleiro',
    houseTheme: 'Notícias, movimento, o primeiro impulso, como a pessoa chega ao mundo',
    astrology: { primaryHouses: [1], primaryPlanets: ['ascendant', 'mars'], extractionKeys: ['ascendant', 'planets.mars.sign', 'planets.mars.house', 'houses.1'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  2: {
    houseId: 2, houseName: 'O Trevo',
    houseTheme: 'Pequenas sortes, oportunidades rápidas, a fé que sustenta',
    astrology: { primaryHouses: [], primaryPlanets: ['jupiter'], extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  3: {
    houseId: 3, houseName: 'O Navio',
    houseTheme: 'Viagens, negócios à distância, mudanças de horizonte',
    astrology: { primaryHouses: [3, 9], primaryPlanets: ['mercury'], extractionKeys: ['houses.9', 'houses.3', 'planets.mercury.sign', 'planets.mercury.house'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Caminho Total'], extractionKeys: ['tantricPath'] },
  },
  4: {
    houseId: 4, houseName: 'A Casa',
    houseTheme: 'Lar físico, família, moradia, base de vida, ancestralidade',
    astrology: { primaryHouses: [4], primaryPlanets: ['moon'], extractionKeys: ['houses.4', 'planets.moon.sign', 'planets.moon.house'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  5: {
    houseId: 5, houseName: 'A Árvore',
    houseTheme: 'Saúde, vitalidade, energia vital, raízes, ancestralidade',
    astrology: { primaryHouses: [6], primaryPlanets: ['sun'], extractionKeys: ['houses.6', 'sun.sign', 'sun.house'] },
    kabalah: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  6: {
    houseId: 6, houseName: 'As Nuvens',
    houseTheme: 'Confusão mental, dúvidas, nebulosidade, indecisão',
    astrology: { primaryHouses: [12], primaryPlanets: ['neptune'], extractionKeys: ['houses.12', 'planets.neptune.sign', 'planets.neptune.house'] },
    kabalah: { aspects: ['Números de Desafio (1º e 2º)'], extractionKeys: ['challenges.first', 'challenges.second'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  7: {
    houseId: 7, houseName: 'A Serpente',
    houseTheme: 'Perigo, traição, forças ocultas, sexualidade, sabedoria oculta',
    astrology: { primaryHouses: [8], primaryPlanets: ['lilith', 'pluto'], extractionKeys: ['planets.lilith.sign', 'planets.lilith.house', 'planets.pluto.sign', 'planets.pluto.house'] },
    kabalah: { aspects: ['Dívidas Kármicas / Lições'], extractionKeys: ['karmicDebts', 'karmicLessons'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  8: {
    houseId: 8, houseName: 'O Caixão',
    houseTheme: 'Fim de ciclos, transformação profunda, crises, renascimento',
    astrology: { primaryHouses: [8], primaryPlanets: ['pluto'], extractionKeys: ['houses.8', 'planets.pluto.sign', 'planets.pluto.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  9: {
    houseId: 9, houseName: 'Os Buquês',
    houseTheme: 'Presentes, surpresas felizes, reconhecimento, beleza, alegria',
    astrology: { primaryHouses: [5], primaryPlanets: ['venus'], extractionKeys: ['planets.venus.sign', 'planets.venus.house', 'houses.5'] },
    kabalah: { aspects: ['Dons Nativos'], extractionKeys: ['nativeDayNumber'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  10: {
    houseId: 10, houseName: 'A Foice',
    houseTheme: 'Cortes necessários, decisões definitivas, colheita, perigos imediatos',
    astrology: { primaryHouses: [8], primaryPlanets: ['saturn'], extractionKeys: ['planets.saturn.sign', 'planets.saturn.house', 'houses.8'] },
    kabalah: { aspects: ['Desafio Principal'], extractionKeys: ['challenges.main'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  11: {
    houseId: 11, houseName: 'O Chicote',
    houseTheme: 'Conflitos, repetição de padrões, estresse, agressividade, disputas',
    astrology: { primaryHouses: [], primaryPlanets: ['mars'], extractionKeys: ['planets.mars.sign', 'planets.mars.house'] },
    kabalah: { aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.second', 'challenges.main'] },
    tantric: { aspects: ['Número de Karma (Corpo Prânico)'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  12: {
    houseId: 12, houseName: 'Os Pássaros',
    houseTheme: 'Comunicação, parcerias dinâmicas, nervosismo, trocas rápidas',
    astrology: { primaryHouses: [3], primaryPlanets: ['mercury'], extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'houses.3'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  13: {
    houseId: 13, houseName: 'A Criança',
    houseTheme: 'Novos começos, projetos iniciais, inocência, renovação, vulnerabilidade',
    astrology: { primaryHouses: [1], primaryPlanets: ['ascendant', 'jupiter'], extractionKeys: ['ascendant', 'houses.1', 'planets.jupiter.sign', 'planets.jupiter.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  14: {
    houseId: 14, houseName: 'A Raposa',
    houseTheme: 'Astúcia, estratégia, autossuficiência, cautela, discernimento',
    astrology: { primaryHouses: [], primaryPlanets: ['mercury', 'uranus'], extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'planets.uranus.sign', 'planets.uranus.house'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  15: {
    houseId: 15, houseName: 'O Urso',
    houseTheme: 'Poder pessoal, autoridade, finanças de grande porte, proteção, liderança',
    astrology: { primaryHouses: [10], primaryPlanets: ['sun', 'pluto'], extractionKeys: ['sun.sign', 'sun.house', 'houses.10', 'planets.pluto.sign', 'planets.pluto.house'] },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  16: {
    houseId: 16, houseName: 'A Estrela',
    houseTheme: 'Esperança, espiritualidade, guia divino, sonhos, missão de alma',
    astrology: { primaryHouses: [9], primaryPlanets: ['neptune'], extractionKeys: ['planets.neptune.sign', 'planets.neptune.house', 'houses.9'] },
    kabalah: { aspects: ['Caminho de Vida (números mestres)'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  17: {
    houseId: 17, houseName: 'A Cegonha',
    houseTheme: 'Mudanças significativas, renovação, melhoria, movimentos inesperados',
    astrology: { primaryHouses: [], primaryPlanets: ['northNode', 'uranus'], extractionKeys: ['northNode.sign', 'northNode.house', 'planets.uranus.sign', 'planets.uranus.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },
  18: {
    houseId: 18, houseName: 'O Cachorro',
    houseTheme: 'Lealdade, amizade, aliados, proteção, confiança',
    astrology: { primaryHouses: [11], primaryPlanets: ['venus'], extractionKeys: ['houses.11', 'planets.venus.sign', 'planets.venus.house'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  19: {
    houseId: 19, houseName: 'A Torre',
    houseTheme: 'Isolamento, solidão consciente, ego, autoridade institucional, introspecção',
    astrology: { primaryHouses: [12], primaryPlanets: ['saturn'], extractionKeys: ['houses.12', 'planets.saturn.sign', 'planets.saturn.house'] },
    kabalah: { aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.second', 'challenges.main'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  20: {
    houseId: 20, houseName: 'O Jardim',
    houseTheme: 'Vida social, público, eventos, exposição, coletividade',
    astrology: { primaryHouses: [11, 7], primaryPlanets: [], extractionKeys: ['houses.11', 'houses.7'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  21: {
    houseId: 21, houseName: 'A Montanha',
    houseTheme: 'Obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros',
    astrology: { primaryHouses: [12], primaryPlanets: ['saturn'], extractionKeys: ['planets.saturn.sign', 'planets.saturn.house', 'houses.12', 'aspects'] },
    kabalah: { aspects: ['Números de Desafio', 'Dívidas Kármicas'], extractionKeys: ['challenges.main', 'karmicDebts'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  22: {
    houseId: 22, houseName: 'Os Caminhos',
    houseTheme: 'Escolhas, bifurcação, decisões cruciais, possibilidades múltiplas',
    astrology: { primaryHouses: [1, 7], primaryPlanets: ['northNode', 'southNode'], extractionKeys: ['northNode.sign', 'northNode.house', 'southNode.sign', 'southNode.house', 'houses.1', 'houses.7'] },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Caminho Total'], extractionKeys: ['tantricPath'] },
  },
  23: {
    houseId: 23, houseName: 'O Rato',
    houseTheme: 'Perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez',
    astrology: { primaryHouses: [12], primaryPlanets: ['neptune', 'saturn'], extractionKeys: ['houses.12', 'planets.neptune.sign', 'planets.neptune.house', 'planets.saturn.sign', 'planets.saturn.house'] },
    kabalah: { aspects: ['Dívidas Kármicas / Lições'], extractionKeys: ['karmicDebts', 'karmicLessons'] },
    tantric: { aspects: ['Número de Karma (Corpo Prânico)'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  24: {
    houseId: 24, houseName: 'O Coração',
    houseTheme: 'Amor, emoções profundas, desejos do coração, afetos',
    astrology: { primaryHouses: [5], primaryPlanets: ['venus', 'moon'], extractionKeys: ['planets.venus.sign', 'planets.venus.house', 'planets.moon.sign', 'planets.moon.house', 'houses.5'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  25: {
    houseId: 25, houseName: 'O Anel',
    houseTheme: 'Contratos, comprometimentos, alianças, casamento, acordos formais',
    astrology: { primaryHouses: [7], primaryPlanets: ['saturn'], extractionKeys: ['houses.7', 'planets.saturn.sign', 'planets.saturn.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },
  26: {
    houseId: 26, houseName: 'O Livro',
    houseTheme: 'Segredos, conhecimento oculto, estudos, mistérios guardados',
    astrology: { primaryHouses: [9, 12], primaryPlanets: ['mercury'], extractionKeys: ['houses.9', 'houses.12', 'planets.mercury.sign', 'planets.mercury.house'] },
    kabalah: { aspects: ['Caminho de Vida', 'Número de Expressão'], extractionKeys: ['lifePath', 'lifePathMaster', 'expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  27: {
    houseId: 27, houseName: 'A Carta',
    houseTheme: 'Documentos, notícias escritas, mensagens formais, comunicação oficial',
    astrology: { primaryHouses: [3], primaryPlanets: ['mercury'], extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'houses.3'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  28: {
    houseId: 28, houseName: 'O Cigano',
    houseTheme: 'O consulente masculino ou a energia masculina/ativa principal na situação',
    astrology: { primaryHouses: [], primaryPlanets: ['sun', 'mars'], extractionKeys: ['sun.sign', 'sun.house', 'planets.mars.sign', 'planets.mars.house'] },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Caminho Total'], extractionKeys: ['tantricPath'] },
  },
  29: {
    houseId: 29, houseName: 'A Cigana',
    houseTheme: 'O consulente feminino ou a energia feminina/receptiva principal na situação',
    astrology: { primaryHouses: [], primaryPlanets: ['moon', 'venus'], extractionKeys: ['planets.moon.sign', 'planets.moon.house', 'planets.venus.sign', 'planets.venus.house'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  30: {
    houseId: 30, houseName: 'Os Lírios',
    houseTheme: 'Paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade',
    astrology: { primaryHouses: [9], primaryPlanets: ['jupiter'], extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house', 'houses.9'] },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },
  31: {
    houseId: 31, houseName: 'O Sol',
    houseTheme: 'Sucesso máximo, clareza total, vitória, o ápice da realização',
    astrology: { primaryHouses: [10], primaryPlanets: ['sun'], extractionKeys: ['houses.10', 'sun.sign', 'sun.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  32: {
    houseId: 32, houseName: 'A Lua',
    houseTheme: 'Intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele',
    astrology: { primaryHouses: [12], primaryPlanets: ['moon', 'neptune'], extractionKeys: ['planets.moon.sign', 'planets.moon.house', 'planets.neptune.sign', 'planets.neptune.house', 'houses.12'] },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },
  33: {
    houseId: 33, houseName: 'A Chave',
    houseTheme: 'A solução que se revela, abertura de portas, a resposta esperada, importância',
    astrology: { primaryHouses: [], primaryPlanets: ['jupiter', 'northNode'], extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house', 'northNode.sign', 'northNode.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  34: {
    houseId: 34, houseName: 'Os Peixes',
    houseTheme: 'Dinheiro, fluxo financeiro, abundância material, negócios',
    astrology: { primaryHouses: [2], primaryPlanets: ['venus'], extractionKeys: ['houses.2', 'planets.venus.sign', 'planets.venus.house', 'planetsInHouses.2'] },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Número de Karma (Material)'], extractionKeys: ['karma', 'karmaDescription'] },
  },
  35: {
    houseId: 35, houseName: 'A Âncora',
    houseTheme: 'Estabilidade, trabalho fixo, permanência, segurança de longo prazo',
    astrology: { primaryHouses: [6, 10], primaryPlanets: ['saturn'], extractionKeys: ['houses.6', 'houses.10', 'planets.saturn.sign', 'planets.saturn.house'] },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Dom Divino (Corpo Físico)'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },
  36: {
    houseId: 36, houseName: 'A Cruz',
    houseTheme: 'Fardo kármico, teste espiritual máximo, responsabilidade, superação do destino',
    astrology: { primaryHouses: [12], primaryPlanets: ['southNode', 'saturn'], extractionKeys: ['southNode.sign', 'southNode.house', 'planets.saturn.sign', 'planets.saturn.house', 'houses.12'] },
    kabalah: { aspects: ['Karma de Vida + Dívidas Kármicas'], extractionKeys: ['karmicDebts', 'karmicLessons'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
};

/**
 * Busca a entrada de correlação de uma casa (1-36).
 * @throws se a casa estiver fora do intervalo.
 */
export function getCorrelationEntry(house: number): CorrelationEntry {
  const entry = CORRELATION_MAP[house];
  if (!entry) throw new Error(`Casa ${house} não encontrada no mapa de correlação`);
  return entry;
}

/**
 * Extrai de um *Map JSON apenas os valores apontados por `keys` (dot-paths).
 * Mantém o cruzamento determinístico: nada além das keys mapeadas é lido.
 */
export function extractFromMap(
  map: Record<string, unknown> | null | undefined,
  keys: string[]
): Record<string, unknown> {
  if (!map) return {};
  return keys.reduce<Record<string, unknown>>((acc, key) => {
    const parts = key.split('.');
    let value: unknown;
    const first = parts[0];
    const second = parts[1];
    if (first === 'planets' && second) {
      // Handle array-based planets: planets.mars.sign → find by .planet name
      const planets = map['planets'] as Array<{ planet: string; [k: string]: unknown }> | undefined;
      if (Array.isArray(planets)) {
        const planet = planets.find(p => p.planet === second);
        value = parts.slice(2).reduce<unknown>((obj, k) => {
          if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
          return undefined;
        }, planet);
      } else {
        // Fallback to old flat format: planets.mars.sign → planets.mars.sign
        value = parts.reduce<unknown>((obj, k) => {
          if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
          return undefined;
        }, map);
      }
    } else if (first === 'houses' && second) {
      // Handle array-based houses: houses.2 → find by .house number
      const houses = map['houses'] as Array<{ house: number; sign: string; degree?: number }> | undefined;
      if (Array.isArray(houses)) {
        const houseNum = Number(second);
        const house = houses.find(h => h.house === houseNum);
        if (parts.length === 2) {
          // Just 'houses.2' → return the sign string
          value = house?.sign;
        } else {
          // 'houses.2.degree' → drill further
          value = parts.slice(2).reduce<unknown>((obj, k) => {
            if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
            return undefined;
          }, house);
        }
      } else {
        // Fallback to old flat format: houses.2 → houses[2]
        value = (map['houses'] as Record<string, unknown>)?.[second];
      }
    } else {
      // Default: dot-path traversal
      value = parts.reduce<unknown>((obj, k) => {
        if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
        return undefined;
      }, map);
    }
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});
}
