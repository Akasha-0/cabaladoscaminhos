/**
 * Moon-Orixá Correlation Module
 * Maps the 8 lunar phases to Afro-Brazilian spiritual practices
 * Based on IDEIA.md lunar alchemy and Orixá correspondences
 */

export interface MoonOrixa {
  fase: string;
  orixa_principal: string;
  orixa_secundario: string;
  energia: 'receptiva' | 'ativa' | 'transmutadora' | 'dissolutiva';
  praticas: string[];
  ebó: string;
}

/**
 * The 8 lunar phases mapped to Orixás, energy types, and spiritual practices
 * Based on the Alquimia Lunar table from IDEIA.md
 */
export const MOON_ORIXA_MAP: Record<string, MoonOrixa> = {
  'lua-nova': {
    fase: 'Lua Nova',
    orixa_principal: 'Exu',
    orixa_secundario: 'Omolu',
    energia: 'receptiva',
    praticas: [
      'Início de projetos secretos',
      'Firmezas de proteção profunda',
      'Assentamento de Exu',
      'Planejamento silencioso',
      'Conexão com ancestrais',
    ],
    ebó: 'Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos.',
  },
  'lua-crescente': {
    fase: 'Lua Crescente',
    orixa_principal: 'Oxóssi',
    orixa_secundario: 'Ogum',
    energia: 'ativa',
    praticas: [
      'Rituais de abertura de caminhos comerciais',
      'Banhos de prosperidade e atração',
      'Foco em estudos e direcionamento',
      'Ação disciplinada',
      'Busca por conhecimento nas matas',
    ],
    ebó: 'Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins.',
  },
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    orixa_principal: 'Ogum',
    orixa_secundario: 'Xangô',
    energia: 'ativa',
    praticas: [
      'Quebra de demandas',
      'Ativação do movimento',
      'Coragem e força de vontade',
      'Estratégias de negócios',
      'Justiça divina',
    ],
    ebó: 'Ebó de Defesa: Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro.',
  },
  'lua-cheia': {
    fase: 'Lua Cheia',
    orixa_principal: 'Oxalá',
    orixa_secundario: 'Oxum',
    energia: 'ativa',
    praticas: [
      'Alta magia de atração',
      'Consagração de patuás e boris',
      'Rituais de amor e cura de Ori',
      'Conexão espiritual direta',
      'Gratidão e harmonização',
    ],
    ebó: 'Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces.',
  },
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    orixa_principal: 'Iansã',
    orixa_secundario: 'Omolu',
    energia: 'transmutadora',
    praticas: [
      'Quebra de energias paradas',
      'Ebós de descarrego pesado',
      'Cura de vícios e doenças',
      'Transformação rápida',
      'Limpeza astral',
    ],
    ebó: 'Ebó de Limpeza Astral: Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento.',
  },
  'lua-minguante': {
    fase: 'Lua Minguante',
    orixa_principal: 'Omolu',
    orixa_secundario: 'Nanã',
    energia: 'dissolutiva',
    praticas: [
      'Descarrego pesado',
      'Encerramento de ciclos',
      'Transmutação de doenças',
      'Cura física',
      'Austeridade e desapego',
    ],
    ebó: 'Ebó de Transmutação: Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas.',
  },
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    orixa_principal: 'Nanã',
    orixa_secundario: 'Iansã',
    energia: 'dissolutiva',
    praticas: [
      'Rezas mansas',
      'Banhos de ervas calmas',
      'Purificação gradual',
      'Saudade e recolhimento',
      'Preparação para o novo ciclo',
    ],
    ebó: 'Ebó de Evolução: Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases.',
  },
  'lua-velha': {
    fase: 'Lua Velha ( Balsâmica )',
    orixa_principal: 'Omolu',
    orixa_secundario: 'Exu',
    energia: 'dissolutiva',
    praticas: [
      'Limpeza kármica profunda',
      'Desapego total',
      'Contemplação e silêncio',
      'Preparação para renascimento',
      'Respeito aos antepassados',
    ],
    ebó: 'Ebó de Alívio/Saúde: Tudo pede rezas mansas, frutas brancas, banhos de leite de cabra ou ervas calmas.',
  },
};

/**
 * Get the Moon-Orixá correlation for a given lunar phase
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonOrixa mapping or null if phase not found
 */
export function getMoonOrixa(fase: string): MoonOrixa | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_ORIXA_MAP[normalizedFase] ?? null;
}

/**
 * Get all available lunar phases
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): string[] {
  return Object.keys(MOON_ORIXA_MAP);
}

/**
 * Get the Orixá for a phase by energy type
 * Useful for filtering rituals by energy requirement
 */
export function getOrixaByEnergy(
  energia: MoonOrixa['energia']
): MoonOrixa[] {
  return Object.values(MOON_ORIXA_MAP).filter(
    (mapping) => mapping.energia === energia
  );
}
