import type { ChatMessage } from './types';
import type { UserSpiritualData } from './types';
import { spiritualData, type SpiritualData } from '../spiritual-data/spiritual-data';

// ============================================================
// CONFIGURATION
// ============================================================

const MINIMAX_API_TOKEN = 'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
const MINIMAX_API_BASE = 'https://api.minimax.chat/v1';
const MINIMAX_MODEL = 'minimax/m3';

// ============================================================
// TYPES
// ============================================================

export interface TraditionConnection {
  source_tradition: string;
  target_tradition: string;
  connection_type: 'energy' | 'symbol' | 'archetype' | 'timing';
  strength: number; // 0-1
  description: string;
  shared_symbols: string[];
}

export interface TraditionMapData {
  nodes: { id: string; label: string; strength: number }[];
  edges: { source: string; target: string; weight: number }[];
}

// ============================================================
// COMPREHENSIVE CROSS-SYSTEM MAPPINGS
// ============================================================

// All 16 Principal Odús with their correspondences
export const ODU_MAPPINGS: Record<string, {
  tarot: number[];
  sephirot: string[];
  orixa: string[];
  planeta: string;
  elemento: string;
  dia: string;
  chakra: string;
  signo: string;
  descricao: string;
}> = {
  'Ogbe': {
    tarot: [0],
    sephirot: ['Keter', 'Chokhmah'],
    orixa: ['Olodumare', 'Obatalá'],
    planeta: 'Sol',
    elemento: 'Fogo',
    dia: 'Domingo',
    chakra: 'Sahasrara',
    signo: 'Aries',
    descricao: 'O Começo - Representa criação, início de jornada espiritual, potencial divino',
  },
  'Oyeku': {
    tarot: [1],
    sephirot: ['Binah', 'Daat'],
    orixa: ['Omulu', 'Iemanjá'],
    planeta: 'Lua',
    elemento: 'Água',
    dia: 'Segunda-feira',
    chakra: 'Ajna',
    signo: 'Câncer',
    descricao: 'O Livro - Representa conhecimento oculto, sabedoria ancestral, mistério',
  },
  'Iwori': {
    tarot: [2],
    sephirot: ['Chokhmah', 'Keter'],
    orixa: ['Oxossi', 'Obatalá'],
    planeta: 'Mercúrio',
    elemento: 'Ar',
    dia: 'Quarta-feira',
    chakra: 'Vishuddha',
    signo: 'Gêmeos',
    descricao: 'A Sabedoria - Representa busca do conhecimento, comunicação, travel',
  },
  'Odi': {
    tarot: [3],
    sephirot: ['Malkuth', 'Yesod'],
    orixa: ['Iemanjá', 'Oxum'],
    planeta: 'Vênus',
    elemento: 'Água',
    dia: 'Sexta-feira',
    chakra: 'Anahata',
    signo: 'Touro',
    descricao: 'A Imperatriz - Representa fertilidade, abundância, natureza, sensualidade',
  },
  'Irosun': {
    tarot: [4],
    sephirot: ['Gevurah', 'Chesed'],
    orixa: ['Ogum', 'Xangô'],
    planeta: 'Marte',
    elemento: 'Fogo',
    dia: 'Terça-feira',
    chakra: 'Manipura',
    signo: 'Escorpião',
    descricao: 'O Imperador - Representa autoridade, estruturas, disciplina, conquista',
  },
  'Oxossi': {
    tarot: [5],
    sephirot: ['Netzach', 'Hod'],
    orixa: ['Oxossi'],
    planeta: 'Mercúrio',
    elemento: 'Ar',
    dia: 'Quarta-feira',
    chakra: 'Vishuddha',
    signo: 'Gêmeos',
    descricao: 'O Hierofante - Representa guia espiritual, caça, busca, sabedoria natural',
  },
  'Obatala': {
    tarot: [6],
    sephirot: ['Chesed', 'Gevurah'],
    orixa: ['Obatalá', 'Olodumare'],
    planeta: 'Júpiter',
    elemento: 'Terra',
    dia: 'Quinta-feira',
    chakra: 'Anahata',
    signo: 'Sagitário',
    descricao: 'Os Enamorados - Representa escolhas, uniões, pureity, decisão sagrada',
  },
  'Ogun': {
    tarot: [7],
    sephirot: ['Gevurah', 'Netzach'],
    orixa: ['Ogum', 'Xangô'],
    planeta: 'Marte',
    elemento: 'Fogo',
    dia: 'Terça-feira',
    chakra: 'Muladhara',
    signo: 'Aries',
    descricao: 'O Carro - Representa vitória, determinação, ferro, trabalho, proteção',
  },
  'Ogunda': {
    tarot: [8],
    sephirot: ['Netzach', 'Tipheret'],
    orixa: ['Ogum', 'Oxossi'],
    planeta: 'Marte',
    elemento: 'Fogo',
    dia: 'Terça-feira',
    chakra: 'Svadhisthana',
    signo: 'Escorpião',
    descricao: 'A Força - Representa coragem, poder, trabalho, engenharia, precisão',
  },
  'Osa': {
    tarot: [9],
    sephirot: ['Hod', 'Yesod'],
    orixa: ['Oxum', 'Iansã'],
    planeta: 'Vênus',
    elemento: 'Ar',
    dia: 'Sexta-feira',
    chakra: 'Ajna',
    signo: 'Libra',
    descricao: 'O Eremita - Representa introspecção, busca interior, sabedoria solitária',
  },
  'Ofun': {
    tarot: [10],
    sephirot: ['Tipheret', 'Malkuth'],
    orixa: ['Omulu', 'Obatalá'],
    planeta: 'Júpiter',
    elemento: 'Terra',
    dia: 'Quinta-feira',
    chakra: 'Anahata',
    signo: 'Sagitário',
    descricao: 'A Roda da Fortuna - Representa destino, ciclos, karma, transformação',
  },
  'Oni': {
    tarot: [11],
    sephirot: ['Din', 'Gevurah'],
    orixa: ['Eshu', 'Ogum'],
    planeta: 'Saturno',
    elemento: 'Terra',
    dia: 'Sábado',
    chakra: 'Muladhara',
    signo: 'Capricornio',
    descricao: 'A Justiça - Representa verdade, causa e efeito, equidade, 카르마',
  },
  'Meji': {
    tarot: [12],
    sephirot: ['Tipheret', 'Yesod'],
    orixa: ['Oxum', 'Iemanjá'],
    planeta: 'Sol',
    elemento: 'Fogo',
    dia: 'Domingo',
    chakra: 'Ajna',
    signo: 'Leão',
    descricao: 'O Enforcado - Representa sacrifício, pausa,新的视角, entrega',
  },
  'Ika': {
    tarot: [13],
    sephirot: ['Malkuth', 'Yesod'],
    orixa: ['Omulu', 'Iemanjá'],
    planeta: 'Plutão',
    elemento: 'Água',
    dia: 'Segunda-feira',
    chakra: 'Anahata',
    signo: 'Escorpião',
    descricao: 'A Morte - Representa transformação, fim de ciclo, renascimento, evolução',
  },
  'Ikate': {
    tarot: [14],
    sephirot: ['Netzach', 'Hod'],
    orixa: ['Oxum', 'Iansã'],
    planeta: 'Vênus',
    elemento: 'Água',
    dia: 'Sexta-feira',
    chakra: 'Vishuddha',
    signo: 'Touro',
    descricao: 'A Temperança - Representa equilíbrio, paciência, alquimia interior',
  },
  'Ikite': {
    tarot: [15],
    sephirot: ['Malkuth'],
    orixa: ['Eshu', 'Ogum'],
    planeta: 'Saturno',
    elemento: 'Terra',
    dia: 'Sábado',
    chakra: 'Muladhara',
    signo: 'Capricornio',
    descricao: 'O Diabo - Representa apegos, sombras, provas cármicas, limitações',
  },
};

// Major Arcana (22 cards) to Odús, elements, chakras
export const TAROT_MAJOR_MAPPINGS: Record<number, {
  odu: string[];
  elemento: string;
  chakra: string;
  orixa: string[];
  sephirot: string;
  planeta: string;
  descricao: string;
}> = {
  0: {
    odu: ['Ogbe'],
    elemento: 'Ar',
    chakra: 'Ajna',
    orixa: ['Oxum'],
    sephirot: 'Keter',
    planeta: 'Mercúrio',
    descricao: 'O Louco - Início da jornada, liberdade, fé no divino, salto de fé',
  },
  1: {
    odu: ['Oyeku'],
    elemento: 'Água',
    chakra: 'Sahasrara',
    orixa: ['Iemanjá'],
    sephirot: 'Chokhmah',
    planeta: 'Lua',
    descricao: 'O Mago - Poder pessoal, manifestação, vontade, habilidades latentes',
  },
  2: {
    odu: ['Iwori'],
    elemento: 'Água',
    chakra: 'Sahasrara',
    orixa: ['Obatalá'],
    sephirot: 'Binah',
    planeta: 'Lua',
    descricao: 'A Alta Sacerdotisa - Intuição, mistério, conhecimento oculto, profundidade',
  },
  3: {
    odu: ['Odi'],
    elemento: 'Terra',
    chakra: 'Anahata',
    orixa: ['Oxum'],
    sephirot: 'Chesed',
    planeta: 'Vênus',
    descricao: 'A Imperatriz - Abundância, fertilidade, natureza, sensualidade, criatividade',
  },
  4: {
    odu: ['Irosun'],
    elemento: 'Fogo',
    chakra: 'Manipura',
    orixa: ['Ogum'],
    sephirot: 'Gevurah',
    planeta: 'Marte',
    descricao: 'O Imperador - Autoridade, estrutura, disciplina, líder, organização',
  },
  5: {
    odu: ['Oxossi'],
    elemento: 'Ar',
    chakra: 'Vishuddha',
    orixa: ['Oxossi'],
    sephirot: 'Tipheret',
    planeta: 'Mercúrio',
    descricao: 'O Hierofante - Tradição espiritual, guia, ensinamentos, sacramentos',
  },
  6: {
    odu: ['Obatala'],
    elemento: 'Ar',
    chakra: 'Anahata',
    orixa: ['Obatalá'],
    sephirot: 'Tipheret',
    planeta: 'Vênus',
    descricao: 'Os Enamorados - Escolhas, uniões, dualidade, amor,werdek',
  },
  7: {
    odu: ['Ogun'],
    elemento: 'Fogo',
    chakra: 'Muladhara',
    orixa: ['Ogum'],
    sephirot: 'Netzach',
    planeta: 'Marte',
    descricao: 'O Carro - Vitória, determinação, controle, sucesso através da vontade',
  },
  8: {
    odu: ['Ogunda'],
    elemento: 'Fogo',
    chakra: 'Svadhisthana',
    orixa: ['Ogum'],
    sephirot: 'Gevurah',
    planeta: 'Marte',
    descricao: 'A Força - Coragem, poder, compaixão como força, domínio interior',
  },
  9: {
    odu: ['Osa'],
    elemento: 'Ar',
    chakra: 'Ajna',
    orixa: ['Oxum'],
    sephirot: 'Hod',
    planeta: 'Mercúrio',
    descricao: 'O Eremita - Introspecção, busca interior, sabedoria solitária, iluminação',
  },
  10: {
    odu: ['Ofun'],
    elemento: 'Fogo',
    chakra: 'Anahata',
    orixa: ['Omulu'],
    sephirot: 'Yesod',
    planeta: 'Júpiter',
    descricao: 'A Roda da Fortuna - Destino, ciclos, mudança, 카르마, destino',
  },
  11: {
    odu: ['Oni'],
    elemento: 'Terra',
    chakra: 'Muladhara',
    orixa: ['Eshu'],
    sephirot: 'Malkuth',
    planeta: 'Saturno',
    descricao: 'A Justiça - Verdade, equidade, causa e efeito, integridade, lei',
  },
  12: {
    odu: ['Meji'],
    elemento: 'Fogo',
    chakra: 'Ajna',
    orixa: ['Oxum'],
    sephirot: 'Tipheret',
    planeta: 'Sol',
    descricao: 'O Enforcado - Sacrifício, nova perspectiva, entrega, pausa voluntaria',
  },
  13: {
    odu: ['Ika'],
    elemento: 'Água',
    chakra: 'Anahata',
    orixa: ['Omulu'],
    sephirot: 'Malkuth',
    planeta: 'Plutão',
    descricao: 'A Morte - Transformação, fim de ciclo, renascimento, evolução espiritual',
  },
  14: {
    odu: ['Ikate'],
    elemento: 'Água',
    chakra: 'Vishuddha',
    orixa: ['Oxum'],
    sephirot: 'Netzach',
    planeta: 'Vênus',
    descricao: 'A Temperança - Equilíbrio, alquimia interior, paciência, moderação',
  },
  15: {
    odu: ['Ikite'],
    elemento: 'Terra',
    chakra: 'Muladhara',
    orixa: ['Eshu'],
    sephirot: 'Malkuth',
    planeta: 'Saturno',
    descricao: 'O Diabo - Provas cármicas, sombras, apegos materiais, armadilhas',
  },
  16: {
    odu: ['Oturupon'],
    elemento: 'Fogo',
    chakra: 'Ajna',
    orixa: ['Xangô'],
    sephirot: 'Gevurah',
    planeta: 'Marte',
    descricao: 'A Torre - Revelação súbita, upheaval, libertação de ilusões',
  },
  17: {
    odu: ['Iwori-Meji'],
    elemento: 'Água',
    chakra: 'Sahasrara',
    orixa: ['Iemanjá'],
    sephirot: 'Chokhmah',
    planeta: 'Lua',
    descricao: 'A Estrela - Esperança, renovação, inspiração, conexão celestial',
  },
  18: {
    odu: ['Oka'],
    elemento: 'Água',
    chakra: 'Ajna',
    orixa: ['Iemanjá'],
    sephirot: 'Yesod',
    planeta: 'Lua',
    descricao: 'A Lua - Ilusão,直觉, 海外, inimigos ocultos, medo',
  },
  19: {
    odu: ['Ogbe-Meji'],
    elemento: 'Fogo',
    chakra: 'Sahasrara',
    orixa: ['Oxum'],
    sephirot: 'Keter',
    planeta: 'Sol',
    descricao: 'O Sol - Alegria, sucesso, vitalidade, saúde, clareza, criança interior',
  },
  20: {
    odu: ['Ogunda-Meji'],
    elemento: 'Fogo',
    chakra: 'Vishuddha',
    orixa: ['Ogum'],
    sephirot: 'Netzach',
    planeta: 'Marte',
    descricao: 'O Julgamento - Despertar, redenção, resurrect, chamado divino',
  },
  21: {
    odu: ['Osa-Meji'],
    elemento: 'Terra',
    chakra: 'Anahata',
    orixa: ['Oxalufa'],
    sephirot: 'Malkuth',
    planeta: 'Terra',
    descricao: 'O Mundo - Completude, realização, integração, dances cósmico',
  },
};

// 10 Sephirot with planet, sign, and Orixá mappings
export const SEPHIROT_MAPPINGS: Record<string, {
  planeta: string;
  signo: string;
  orixa: string[];
  elemento: string;
  chakra: string;
  caminho: string[];
  descricao: string;
}> = {
  'Keter': {
    planeta: 'Sem planeta (Caos Primordial)',
    signo: 'Além do Zodíaco',
    orixa: ['Olodumare'],
    elemento: 'Fogo Divine',
    chakra: 'Sahasrara',
    caminho: ['Ogbe', 'The Fool'],
    descricao: 'A Coroa - Representa a coroa divina, vontade suprema, inconsciência do Ser',
  },
  'Chokhmah': {
    planeta: 'Sem planeta (Primeiro Movimento)',
    signo: 'Aries',
    orixa: ['Oxossi'],
    elemento: 'Fogo',
    chakra: 'Ajna',
    caminho: ['Ogbe', 'Iwori', 'The Magician'],
    descricao: 'A Sabedoria - Representa primeira revelação, energia masculina, visão intuitiva',
  },
  'Binah': {
    planeta: 'Saturno',
    signo: 'Capricornio',
    orixa: ['Omulu', 'Obatalá'],
    elemento: 'Água',
    chakra: 'Ajna',
    caminho: ['Oyeku', 'The High Priestess'],
    descricao: 'O Entendimento - Representa compreensão, limitação sagrada, energia feminina',
  },
  'Chesed': {
    planeta: 'Júpiter',
    signo: 'Sagitário',
    orixa: ['Obatalá'],
    elemento: 'Água',
    chakra: 'Anahata',
    caminho: ['Obatala', 'The Emperor'],
    descricao: 'A Misericórdia - Representa compaixão, generosidade, expansão, 그리움',
  },
  'Gevurah': {
    planeta: 'Marte',
    signo: 'Escorpião',
    orixa: ['Ogum', 'Xangô'],
    elemento: 'Fogo',
    chakra: 'Manipura',
    caminho: ['Irosun', 'Ogun', 'Strength'],
    descricao: 'A Severidade - Representa força, julgamento, limites, poder do fogo',
  },
  'Tipheret': {
    planeta: 'Sol',
    signo: 'Leão',
    orixa: ['Oxum'],
    elemento: 'Fogo',
    chakra: 'Anahata',
    caminho: ['Meji', 'The Lovers'],
    descricao: 'A Beleza - Representa harmonia, equilíbrio, amor, centro do-ser',
  },
  'Netzach': {
    planeta: 'Vênus',
    signo: 'Touro',
    orixa: ['Oxum', 'Iansã'],
    elemento: 'Ar',
    chakra: 'Vishuddha',
    caminho: ['Oxossi', 'Ogunda', 'The Hierophant'],
    descricao: 'A Vitória - Representa vitória, resistência, prazer, criatividade',
  },
  'Hod': {
    planeta: 'Mercúrio',
    signo: 'Gêmeos',
    orixa: ['Oxossi'],
    elemento: 'Ar',
    chakra: 'Vishuddha',
    caminho: ['Osa', 'The Hermit'],
    descricao: 'A Gloria - Representa glória, split, comunicação, inteligência',
  },
  'Yesod': {
    planeta: 'Lua',
    signo: 'Câncer',
    orixa: ['Iemanjá'],
    elemento: 'Água',
    chakra: 'Ajna',
    caminho: ['Odi', 'The Moon'],
    descricao: 'O Fundamento - Representa foundation,想象力,连接 ao mundo astral',
  },
  'Malkuth': {
    planeta: 'Terra',
    signo: 'Virgem',
    orixa: ['Obatalá'],
    elemento: 'Terra',
    chakra: 'Muladhara',
    caminho: ['Odi', 'The World'],
    descricao: 'O Reino - Representa o mundo material,terra, prática, presença',
  },
};

// ============================================================
// INTERNAL TYPES
// ============================================================

interface TraditionInfo {
  name: string;
  origin: string;
  keywords: string[];
}

// ============================================================
// TRADITION MAPPER CLASS
// ============================================================

export class TraditionMapper {
  private traditionCache: Map<string, TraditionInfo[]> | null = null;

  /**
   * Get full Odu mapping with all correspondences
   */
  getOduMapping(oduName: string) {
    return ODU_MAPPINGS[oduName] || null;
  }

  /**
   * Get full Tarot Major Arcana mapping with all correspondences
   */
  getTarotMapping(arcanaNumber: number) {
    return TAROT_MAJOR_MAPPINGS[arcanaNumber] || null;
  }

  /**
   * Get full Sephirah mapping with all correspondences
   */
  getSephirahMapping(sephirahName: string) {
    return SEPHIROT_MAPPINGS[sephirahName] || null;
  }

  /**
   * Map all connections between traditions for a user
   */
  mapTraditionConnections(userData: UserSpiritualData): TraditionConnection[] {
    const userTraditions = this.getUserTraditions(userData);
    const connections: TraditionConnection[] = [];

    // Compare each pair of user traditions
    for (let i = 0; i < userTraditions.length; i++) {
      for (let j = i + 1; j < userTraditions.length; j++) {
        const source = userTraditions[i];
        const target = userTraditions[j];

        const connection = this.findConnection(source, target);
        if (connection && connection.strength > 0.1) {
          connections.push(connection);
        }
      }
    }

    return this.sortByStrength(connections);
  }

  /**
   * Find strongest connections (strength >= 0.7)
   */
  findStrongestConnections(connections: TraditionConnection[]): TraditionConnection[] {
    return connections
      .filter(c => c.strength >= 0.7)
      .sort((a, b) => b.strength - a.strength);
  }

  /**
   * Generate connection explanation using Minimax AI
   */
  async explainConnection(connection: TraditionConnection): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a spiritual traditions expert. Explain the connection between two spiritual traditions in clear, concise language. Focus on the shared elements and their significance.`
      },
      {
        role: 'user',
        content: `Explain the connection between ${connection.source_tradition} and ${connection.target_tradition}:

Connection Type: ${connection.connection_type}
Strength: ${(connection.strength * 100).toFixed(0)}%
Shared Symbols: ${connection.shared_symbols.join(', ') || 'None specified'}

Provide a 2-3 sentence explanation of how these traditions connect and why this relationship matters for spiritual practice.`
      }
    ];

    try {
      const response = await this.callMinimax(messages);
      return response;
    } catch (error) {
      return this.getFallbackExplanation(connection);
    }
  }

  /**
   * Create visual map data for the dashboard
   */
  createMapData(connections: TraditionConnection[]): TraditionMapData {
    const nodeMap = new Map<string, { id: string; label: string; strength: number }>();
    const edges: { source: string; target: string; weight: number }[] = [];

    // Build nodes from connections
    for (const conn of connections) {
      if (!nodeMap.has(conn.source_tradition)) {
        nodeMap.set(conn.source_tradition, {
          id: conn.source_tradition,
          label: conn.source_tradition,
          strength: 0
        });
      }
      if (!nodeMap.has(conn.target_tradition)) {
        nodeMap.set(conn.target_tradition, {
          id: conn.target_tradition,
          label: conn.target_tradition,
          strength: 0
        });
      }

      // Accumulate strength for nodes
      const sourceNode = nodeMap.get(conn.source_tradition)!;
      const targetNode = nodeMap.get(conn.target_tradition)!;
      sourceNode.strength += conn.strength;
      targetNode.strength += conn.strength;
    }

    // Normalize node strengths (divide by max possible connections)
    const maxStrength = Math.max(...Array.from(nodeMap.values()).map(n => n.strength), 1);
    for (const node of nodeMap.values()) {
      node.strength = node.strength / maxStrength;
    }

    // Build edges
    for (const conn of connections) {
      edges.push({
        source: conn.source_tradition,
        target: conn.target_tradition,
        weight: conn.strength
      });
    }

    return {
      nodes: Array.from(nodeMap.values()),
      edges
    };
  }

  /**
   * Generate comprehensive spiritual map for user
   */
  generateSpiritualMap(userData: UserSpiritualData) {
    const map = {
      odu: userData.odu ? this.getOduMapping(userData.odu) : null,
      tarot: userData.arcoMaior?.map(n => this.getTarotMapping(n)) || [],
      sephirot: userData.sefirotDominante?.map(s => this.getSephirahMapping(s)) || [],
      correlations: this.mapTraditionConnections(userData),
      strongestConnections: this.findStrongestConnections(this.mapTraditionConnections(userData)),
    };

    return map;
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Get traditions relevant to the user based on their spiritual data
   */
  // fallow-ignore-next-line complexity
  private getUserTraditions(userData: UserSpiritualData): TraditionInfo[] {
    const traditions = new Set<TraditionInfo>();

    // Get all spiritual data entries and group by origin
    const entriesByOrigin = new Map<string, SpiritualData[]>();
    for (const entry of spiritualData) {
      const origin = entry.origin;
      if (!entriesByOrigin.has(origin)) {
        entriesByOrigin.set(origin, []);
      }
      entriesByOrigin.get(origin)!.push(entry);
    }

    // Add traditions based on user's spiritual profile
    // Yoruba/Ifá tradition from odu
    if (userData.odu) {
      const yorubaTraditions = entriesByOrigin.get('Tradição Iorubá');
      if (yorubaTraditions) {
        traditions.add({
          name: 'Tradição Iorubá',
          origin: 'Tradição Iorubá',
          keywords: yorubaTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Hindu/Yoga tradition from chakras or orixa
    if (userData.orixaRegente) {
      const hinduTraditions = entriesByOrigin.get('Tradição Hindu');
      if (hinduTraditions) {
        traditions.add({
          name: 'Tradição Hindu',
          origin: 'Tradição Hindu',
          keywords: hinduTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Western/Tarot tradition from arco maior
    if (userData.arcoMaior && userData.arcoMaior.length > 0) {
      const westernTraditions = entriesByOrigin.get('Tradição Ocidental');
      if (westernTraditions) {
        traditions.add({
          name: 'Tradição Ocidental',
          origin: 'Tradição Ocidental',
          keywords: westernTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Celtic tradition from element
    const elementTraditions = entriesByOrigin.get('Tradição Celta');
    if (elementTraditions) {
      traditions.add({
        name: 'Tradição Celta',
        origin: 'Tradição Celta',
        keywords: elementTraditions.flatMap(t => t.keywords)
      });
    }

    // Kabbalistic tradition from sefirot
    if (userData.sefirotDominante && userData.sefirotDominante.length > 0) {
      const kabbalahTraditions = entriesByOrigin.get('Tradição Cabalística');
      if (kabbalahTraditions) {
        traditions.add({
          name: 'Tradição Cabalística',
          origin: 'Tradição Cabalística',
          keywords: kabbalahTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Numerology/Pythagorean tradition
    if (userData.numeroPessoal) {
      const pythagoreanTraditions = entriesByOrigin.get('Tradição Pitagórica');
      if (pythagoreanTraditions) {
        traditions.add({
          name: 'Tradição Pitagórica',
          origin: 'Tradição Pitagórica',
          keywords: pythagoreanTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Native American tradition
    const nativeTraditions = entriesByOrigin.get('Tradição Native Americana');
    if (nativeTraditions) {
      traditions.add({
        name: 'Tradição Native Americana',
        origin: 'Tradição Native Americana',
        keywords: nativeTraditions.flatMap(t => t.keywords)
      });
    }

    // Vedic/Astral tradition from rashi
    if (userData.rashi) {
      const astralTraditions = entriesByOrigin.get('Tradição Astral');
      if (astralTraditions) {
        traditions.add({
          name: 'Tradição Astral',
          origin: 'Tradição Astral',
          keywords: astralTraditions.flatMap(t => t.keywords)
        });
      }
    }

    // Fallback: add all major traditions if user has minimal data
    if (traditions.size < 3) {
      for (const [origin, entries] of entriesByOrigin) {
        if (this.isMajorTradition(origin)) {
          traditions.add({
            name: origin,
            origin,
            keywords: entries.flatMap(t => t.keywords)
          });
        }
      }
    }

    return Array.from(traditions);
  }

  /**
   * Determine if a tradition is a major tradition
   */
  private isMajorTradition(origin: string): boolean {
    const majorTraditions = [
      'Tradição Hindu',
      'Tradição Ocidental',
      'Tradição Cabalística',
      'Tradição Pitagórica',
      'Tradição Iorubá',
      'Tradição Native Americana',
      'Tradição Celta',
      'Tradição Astral'
    ];
    return majorTraditions.includes(origin);
  }

  /**
   * Find connection between two traditions
   */
  private findConnection(source: TraditionInfo, target: TraditionInfo): TraditionConnection | null {
    // Calculate keyword overlap
    const sourceKeywords = new Set(source.keywords.map(k => k.toLowerCase()));
    const targetKeywords = new Set(target.keywords.map(k => k.toLowerCase()));
    const sharedKeywords = [...sourceKeywords].filter(k => targetKeywords.has(k));

    // Determine connection type based on shared keywords
    const connectionType = this.determineConnectionType(sharedKeywords);

    // Calculate strength based on shared elements
    const maxKeywords = Math.max(sourceKeywords.size, targetKeywords.size);
    const strength = maxKeywords > 0 ? sharedKeywords.length / maxKeywords : 0;

    if (strength < 0.05 && !this.hasSymbolicOverlap(source, target)) {
      return null;
    }

    return {
      source_tradition: source.name,
      target_tradition: target.name,
      connection_type: connectionType,
      strength: Math.min(strength * 2, 1), // Amplify for significance
      description: this.generateConnectionDescription(source, target, connectionType, sharedKeywords),
      shared_symbols: sharedKeywords.slice(0, 5)
    };
  }

  /**
   * Determine the primary connection type
   */
  private determineConnectionType(sharedKeywords: string[]): 'energy' | 'symbol' | 'archetype' | 'timing' {
    const energyKeywords = ['energia', 'força', 'poder', 'vitalidade', 'transformação', 'kundalini'];
    const symbolKeywords = ['símbolo', 'significado', 'signo', 'representação'];
    const archetypeKeywords = ['arquetipo', 'padrão', 'modelo', 'mistério', 'inconsciente'];
    const timingKeywords = ['ciclo', 'tempo', 'estação', 'fase', 'momento'];

    for (const keyword of sharedKeywords) {
      if (energyKeywords.some(e => keyword.includes(e))) return 'energy';
      if (symbolKeywords.some(s => keyword.includes(s))) return 'symbol';
      if (archetypeKeywords.some(a => keyword.includes(a))) return 'archetype';
      if (timingKeywords.some(t => keyword.includes(t))) return 'timing';
    }

    return 'archetype'; // Default
  }

  /**
   * Check for symbolic overlap between traditions
   */
  private hasSymbolicOverlap(source: TraditionInfo, target: TraditionInfo): boolean {
    const sourceOrigin = source.origin.toLowerCase();
    const targetOrigin = target.origin.toLowerCase();

    // Check for related traditions
    const relatedPairs: [string, string][] = [
      ['hindu', 'celtas'],
      ['ocidental', 'cabalística'],
      ['pitagórica', 'astral'],
      ['iorubá', 'native americana'],
      ['celtas', 'native americana']
    ];

    return relatedPairs.some(([a, b]) =>
      (sourceOrigin.includes(a) && targetOrigin.includes(b)) ||
      (sourceOrigin.includes(b) && targetOrigin.includes(a))
    );
  }

  /**
   * Generate a description for the connection
   */
  private generateConnectionDescription(
    source: TraditionInfo,
    target: TraditionInfo,
    connectionType: string,
    sharedKeywords: string[]
  ): string {
    const typeLabels = {
      energy: 'energia',
      symbol: 'símbolo',
      archetype: 'arquetipo',
      timing: 'tempo'
    };

    const label = typeLabels[connectionType as keyof typeof typeLabels] || connectionType;

    if (sharedKeywords.length > 0) {
      return `Conexão de ${label} entre ${source.name} e ${target.name} através de: ${sharedKeywords.slice(0, 3).join(', ')}`;
    }

    return `A ${source.name} e ${target.name} compartilham princípios arquetípicos fundamentais que ressoam através de suas práticas espirituais distintas.`;
  }

  /**
   * Sort connections by strength descending
   */
  private sortByStrength(connections: TraditionConnection[]): TraditionConnection[] {
    return [...connections].sort((a, b) => b.strength - a.strength);
  }

  /**
   * Call Minimax API for AI explanation
   */
  private async callMinimax(messages: ChatMessage[]): Promise<string> {
    const url = `${MINIMAX_API_BASE}/text/chatcompletion_v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Minimax API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    throw new Error('Invalid Minimax response format');
  }

  /**
   * Fallback explanation when AI is unavailable
   */
  private getFallbackExplanation(connection: TraditionConnection): string {
    const typeDescriptions = {
      energy: 'compartilham uma linguagem energética comum que transcende suas origens culturais distintas.',
      symbol: 'utilizam símbolos e significados que se ecoam através de suas tradições separadas.',
      archetype: 'pregam arquétipos universais que se manifestam de formas diferentes porém complementares.',
      timing: 'reconhecem ciclos e temporalidades que seguem padrões similares.'
    };

    const description = typeDescriptions[connection.connection_type] || 'possuem conexões profundas que merecem exploração.';

    return `${connection.source_tradition} e ${connection.target_tradition} ${description} A força desta conexão é ${(connection.strength * 100).toFixed(0)}%, indicando um vínculo significativo para sua jornada espiritual.`;
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export const traditionMapper = new TraditionMapper();
export default traditionMapper;