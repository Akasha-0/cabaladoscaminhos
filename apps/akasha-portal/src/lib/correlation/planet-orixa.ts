/**
 * Planet-Orixá Spiritual Correlation
 * Based on IDEIA.md Cabala dos Caminhos system data
 * Maps the seven classical planets to their Orixá correspondences
 */

export type Planeta = 'Sol' | 'Lua' | 'Mercúrio' | 'Vênus' | 'Marte' | 'Júpiter' | 'Saturno';

export type Orixa = 'Xangô' | 'Iemanjá' | 'Oxumaré' | 'Oxum' | 'Ogum' | 'Oxalá' | 'Omolu';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface PlanetOrixaMapping {
  /** Planet name */
  planeta: Planeta;
  /** Associated Orixá */
  orixa: Orixa;
  /** Element of the Orixá */
  elemento: Elemento;
  /** Chakra correspondent */
  chakra: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Spiritual meaning / associations */
  significado_espiritual: string[];
  /** Archetype and personality */
  arquetipo: string;
  /** Dominant quality */
  qualidade: string;
  /** Ebós (offerings) */
  ebos: string[];
  /** Banhos (spiritual baths) */
  banhos: string[];
  /** Defumações (smudgings) */
  defumacoes: string[];
  /** Affirmations for spiritual work */
  affirmacoes: string[];
}

// ─── Planet-to-Orixá Mapping ────────────────────────────────────────────────

export const PLANET_ORIXA_MAPPINGS: Record<Planeta, PlanetOrixaMapping> = {
  Sol: {
    planeta: 'Sol',
    orixa: 'Xangô',
    elemento: 'Fogo',
    chakra: '3º Plexo Solar',
    dia_sagrado: 'Quarta-feira',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    significado_espiritual: [
      'Justiça e equilíbrio',
      'Transformação e poder',
      'Lei cósmica e ordem',
      'Brilho pessoal e carisma',
      'Fogo sagrado da criação',
      'Autoridade espiritual',
    ],
    arquetipo: 'Rei Guerreira',
    qualidade: 'Determinação e justiça',
    ebos: ['Amalá para Xangô', 'Oferendas de fogo'],
    banhos: ['Ervas quentes (guiné, arruda)', 'Folhas de quebra-pedra'],
    defumacoes: ['Sândalo', 'Cravo-da-índia', 'Canela'],
    affirmacoes: [
      'Eu tenho o poder de transformar minha realidade',
      'A justiça divina opera em minha vida',
      'Meu fogo interior ilumina meu caminho',
    ],
  },
  Lua: {
    planeta: 'Lua',
    orixa: 'Iemanjá',
    elemento: 'Água',
    chakra: '6º Frontal',
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco', 'Transparente'],
    significado_espiritual: [
      'Emoção e sensibilidade',
      'Intuição e sabedoria interior',
      'Maternidade e nutrição',
      'Ciclos e mudanças',
      'Águas profundas do inconsciente',
      'Proteção sagrada feminina',
    ],
    arquetipo: 'Mãe Divina',
    qualidade: 'Nutrição e proteção',
    ebos: ['Canjica na beira-mar para Iemanjá', 'Alimentos brancos'],
    banhos: ['Colônia', 'Alcaparra', 'Folha de lágrima-de-Nossa-Senhora'],
    defumacoes: ['Lavanda', 'Lálá', 'Alcáçuz'],
    affirmacoes: [
      'Eu sou nutrida pela energia divina feminina',
      'Minhas emoções flutuam como as ondas do mar',
      'A sabedoria ancestral guia meus passos',
    ],
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    orixa: 'Oxumaré',
    elemento: 'Ar',
    chakra: '4º Cardíaco',
    dia_sagrado: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    significado_espiritual: [
      'Mente e intelecto',
      'Comunicação e expressão',
      'Flexibilidade e adaptação',
      'Ciclos de transformação',
      'Movimento e respiração',
      'Ligação entre céu e terra',
    ],
    arquetipo: 'Serpente Arco-íris',
    qualidade: 'Adaptação e sabedoria',
    ebos: ['Arroz doce para Oxumaré', 'Oferendas de arco-íris'],
    banhos: ['Dinheiro-em-penca', 'Folha da fortuna'],
    defumacoes: ['Alfarroba', 'Benjoim', 'Mastruz'],
    affirmacoes: [
      'Eu me adapto fluidamente a todas as situações',
      'A sabedoria serpenteia em minha mente',
      'Meu arco-íris ilumina meus caminhos',
    ],
  },
  Vênus: {
    planeta: 'Vênus',
    orixa: 'Oxum',
    elemento: 'Terra',
    chakra: '2º Sacral',
    dia_sagrado: 'Sexta-feira',
    cores: ['Rosa', 'Azul Claro', 'Verde', 'Dourado'],
    significado_espiritual: [
      'Amor e beleza',
      'Harmonia e prazer',
      'Fertilidade e abundância',
      'Conexão com a natureza',
      'Valorização do sagrado feminino',
      'Prazer da existência',
    ],
    arquetipo: 'Amante Divina',
    qualidade: 'Beleza e harmonia',
    ebos: ['Mel e flores para Oxum', 'Água de florais'],
    banhos: ['Rosa', 'Jasmim', 'Flor de laranjeira'],
    defumacoes: ['Baunilha', 'Rosa', 'Ylang-ylang'],
    affirmacoes: [
      'Eu sou amada e merecedora de todo amor',
      'A beleza divina flui através de mim',
      'Eu atraio abundância e harmonia',
    ],
  },
  Marte: {
    planeta: 'Marte',
    orixa: 'Ogum',
    elemento: 'Fogo',
    chakra: '1º Básico',
    dia_sagrado: 'Terça-feira',
    cores: ['Vermelho', 'Laranja', 'Amarelo Queimado'],
    significado_espiritual: [
      'Força e coragem',
      'Ação e determinação',
      'Proteção e conquista',
      'Energia de transformação',
      'Luta e superação',
      'Poderio guerreiro espiritual',
    ],
    arquetipo: 'Guerreiro Protector',
    qualidade: 'Força e proteção',
    ebos: ['Comidas picantes para Ogum', 'Oferendas de ferro'],
    banhos: ['Pimenta', 'Gengibre', 'Alecrim'],
    defumacoes: ['Pimenta', 'Gengibre seco', 'Cravo'],
    affirmacoes: [
      'Eu tenho força para superar todos os obstáculos',
      'Meu guerreiro interior me protege de todo mal',
      'A determinação é minha natureza',
    ],
  },
  Júpiter: {
    planeta: 'Júpiter',
    orixa: 'Oxalá',
    elemento: 'Éter',
    chakra: '7º Coronário',
    dia_sagrado: 'Sexta-feira',
    cores: ['Branco', 'Dourado', 'Violeta'],
    significado_espiritual: [
      'Expansão e abundância',
      'Sabedoria e filosofia',
      'Fé e otimismo',
      'Transcendência espiritual',
      'Generosidade e justiça',
      'Conexão com o divino',
    ],
    arquetipo: 'Criador Pacífico',
    qualidade: 'Sabedoria e paz',
    ebos: ['Leite e alimentos brancos para Oxalá', 'Oferendas de paz'],
    banhos: ['Alfazema', 'Flor de bacharel', 'Rosa branca'],
    defumacoes: ['Benjoim puro', 'Sálvia branca', 'Mirra'],
    affirmacoes: [
      'Eu sou um vessel de sabedoria divina',
      'A paz de Oxalá habita em meu coração',
      'A abundância espiritual me preenche',
    ],
  },
  Saturno: {
    planeta: 'Saturno',
    orixa: 'Omolu',
    elemento: 'Terra',
    chakra: '1º Básico',
    dia_sagrado: 'Sábado',
    cores: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    significado_espiritual: [
      'Estrutura e fundamentação',
      'Ancestralidade e tradição',
      'Transformação e renovação',
      'Saúde física e transmutação',
      'O lodo primordial da criação',
      'Disciplina e limites sagrados',
    ],
    arquetipo: 'Mestre da Transformação',
    qualidade: 'Renovação e disciplina',
    ebos: ['Pipoca (Deburu) para Omolu', 'Ebó de caminho'],
    banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho'],
    defumacoes: ['Pau-brasil', 'Nim', 'Carvão vegetal'],
    affirmacoes: [
      'Eu transmuto todo sofrimento em sabedoria',
      'Meus ancestrais me guiam e protegem',
      'A disciplina me libertará',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ORIXA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Returns the planet-orixá mapping for a given planet name.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetOrixa(planeta: string): PlanetOrixaMapping | null {
  const normalized = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase() as Planeta;
  return PLANET_ORIXA_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the orixá-planet mapping (reverse lookup).
 * @param orixa - Orixá name (e.g., 'Xangô', 'Iemanjá', 'Oxumaré', 'Oxum', 'Ogum', 'Oxalá', 'Omolu')
 * @returns The planet name or null if not found
 */
export function getOrixaPlanet(orixa: string): Planeta | null {
  const normalized = orixa.charAt(0).toUpperCase() + orixa.slice(1).toLowerCase() as Orixa;
  
  for (const [planeta, mapping] of Object.entries(PLANET_ORIXA_MAPPINGS)) {
    if (mapping.orixa === normalized) {
      return planeta as Planeta;
    }
  }
  return null;
}

/**
 * Returns all planet-orixá mappings.
 * @returns Array of all correlation mappings
 */
export function getAllPlanetOrixas(): PlanetOrixaMapping[] {
  return Object.values(PLANET_ORIXA_MAPPINGS);
}
