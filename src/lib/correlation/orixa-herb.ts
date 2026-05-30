/**
 * Orixá-Herbs Spiritual Correlation (Fitoenergética)
 * 
 * Correlação sistemática entre as forças ancestrais dos Orixás
 * e as ervas sacras da Umbanda/Candomblé para harmonização energética.
 * 
 * @source Baseado em IDEIA.md - Tradições afro-brasileiras (Candomblé/Umbanda)
 * @references orixa-chakra.ts, element-orixa.ts, numerology-orixa.ts
 */

export type OrixaName =
  | 'Oxalá'
  | 'Iemanjá'
  | 'Oxum'
  | 'Ogum'
  | 'Xangô'
  | 'Iansã'
  | 'Oxóssi'
  | 'Omolu'
  | 'Nanã'
  | 'Ibeji'
  | 'Oxumar'
  | 'Egun'
  | 'Obá'
  | 'Logun Edé';

export type HerbCategory =
  | 'purificacao'    // Limpeza energética
  | 'harmonizacao'   // Equilíbrio
  | 'expansao'       // Crescimento espiritual
  | 'protecao'       // Defesa energética
  | 'cura'           // healing properties
  | 'ancestral'      // Conexão com ancestrais
  | 'sagrada';       // Uso ritualístico

export type ApplicationMethod =
  | 'banho'          // Banho de imersão
  | 'defumacao'      // Queima de ervas secas
  | 'infusao'        // Chá/escência
  | 'ebó'            // Oferenda específica
  | 'amaciante'      // Maceração em água
  | 'bebida'         // Consumo direto
  | 'acendimento'    // Para velas/aromas;

export interface HerbProperties {
  nome: string;
  nome_cientifico?: string;
  categoria: HerbCategory;
  aplicacao: ApplicationMethod[];
  tempo_preparo: string;
  significado_ritual: string;
}

export interface OrixaHerbMapping {
  orixa: OrixaName;
  orixa_descricao: string;
  regencia: string;
  energia_primaria: string;
  erivas: HerbProperties[];
  erivas_principais: string[];  // Top 5 ervas principais
  erivas_contraindicadas: string[];
  praticas_fitoenergeticas: string[];
  combinacoes_rituais: string[];
}

/**
 * Mapeamento completo Orixá ↔ Ervas (Fitoenergética)
 * Baseado nas tradições de Candomblé Ketu, Ijexá e Umbanda
 */
export const ORIXÁ_HERB_MAPPINGS: OrixaHerbMapping[] = [
  {
    orixa: 'Oxalá',
    orixa_descricao: 'O pai dos Orixás, criador supremo, energia de paz e purificação',
    regencia: 'Luz branca, oração mansa, águas paradas',
    energia_primaria: 'Purificação e paz',
    erivas_principais: ['Alface', 'Cravo branco', 'Flor de laranjeira', 'Guiné', 'Romã'],
    erivas_contraindicadas: ['Pimenta', 'Arruda', 'Guiné forte'],
    erivas: [
      {
        nome: 'Alface',
        nome_cientifico: 'Lactuca sativa',
        categoria: 'purificacao',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Paz interior, calma, suavização das energias pesadas'
      },
      {
        nome: 'Cravo branco',
        nome_cientifico: 'Syzygium aromaticum',
        categoria: 'purificacao',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Purificação do ambiente, proteção espiritual, oração ouvida'
      },
      {
        nome: 'Flor de laranjeira',
        nome_cientifico: 'Citrus aurantium',
        categoria: 'ancestral',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '5 minutos',
        significado_ritual: 'Conexão com ancestrais, florescimento espiritual, suavidade'
      },
      {
        nome: 'Guiné',
        nome_cientifico: 'Petiveria alliacea',
        categoria: 'purificacao',
        aplicacao: ['banho', 'defumacao'],
        tempo_preparo: '30 minutos',
        significado_ritual: 'Descarrego, limpeza de energias negativas, proteção'
      },
      {
        nome: 'Romã',
        categoria: 'ancestral',
        aplicacao: ['infusao', 'ebó'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Fertilidade, conexão com linhagem ancestral, prosperidade'
      }
    ],
    praticas_fitoenergeticas: [
      'Banho de alface e cravo branco ao amanhecer',
      'Defumação com flor de laranjeira antes de orações',
      'Infusão de romã para concentração espiritual',
      'Água de guiné para limpeza de objetos ritualísticos'
    ],
    combinacoes_rituais: [
      'Oxalá + Iemanjá: Alface + romã = paz e prosperidade',
      'Oxalá + Oxum: Cravo branco + manjericão = harmonia no lar',
      'Oxalá + Nanã: Guiné + folha de mandioca = purificação profunda'
    ]
  },
  {
    orixa: 'Iemanjá',
    orixa_descricao: 'Rainha do Mar, mãe dos Orixás, energia de fertilidade e maternidade',
    regencia: 'Água salgada, mar, lua cheia, ondas',
    energia_primaria: 'Maternidade e proteção',
    erivas_principais: ['Manjericão', 'Boldo', 'Cidrão', 'Camarão seco', 'Sal marinho'],
    erivas_contraindicadas: ['Pimenta caliente', 'Guiné muy fuerte', 'Arruda em excesso'],
    erivas: [
      {
        nome: 'Manjericão',
        nome_cientifico: 'Ocimum basilicum',
        categoria: 'harmonizacao',
        aplicacao: ['banho', 'infusao', 'defumacao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Harmonia familiar, proteção do lar, fartura'
      },
      {
        nome: 'Boldo',
        nome_cientifico: 'Peumus boldus',
        categoria: 'harmonizacao',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Purificação interna, proteção do fígado espiritual, cura'
      },
      {
        nome: 'Cidrão',
        nome_cientifico: 'Lippia citriodora',
        categoria: 'harmonizacao',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '8 minutos',
        significado_ritual: 'Calma, serenidade, proteção contra pesadelos'
      },
      {
        nome: 'Sal marinho',
        categoria: 'purificacao',
        aplicacao: ['banho', 'defumacao'],
        tempo_preparo: '5 minutos',
        significado_ritual: 'Purificação, proteção contra olho gordo, limpeza espiritual'
      }
    ],
    praticas_fitoenergeticas: [
      'Banho de mar com manjericão na lua cheia',
      'Infusão de boldo e cidrão para harmonização',
      'Defumação com sal marinho e manjericão',
      'Água de mandeira para limpeza do campo áurico'
    ],
    combinacoes_rituais: [
      'Iemanjá + Oxum: Manjericão + rosa branca = amor e fartura',
      'Iemanjá + Ogum: Sal marinho + arruda = proteção total',
      'Iemanjá + Nanã: Boldo + folha de assigno = cura maternal'
    ]
  },
  {
    orixa: 'Oxum',
    orixa_descricao: 'Rainha das águas doces, deusa do amor e da fertilidade',
    regencia: 'Água doce, ouro, espelhos, perfumes',
    energia_primaria: 'Amor e prosperidade',
    erivas_principais: ['Manjericão roxo', 'Rosa branca', 'Malva', 'Cravo', 'Hortelã'],
    erivas_contraindicadas: ['Guiné muy fuerte', 'Pimenta', 'Arruda em excesso'],
    erivas: [
      {
        nome: 'Manjericão roxo',
        nome_cientifico: 'Ocimum basilicum var. purpurascens',
        categoria: 'harmonizacao',
        aplicacao: ['banho', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Amor próprio, proteção do coração, fartura'
      },
      {
        nome: 'Rosa branca',
        nome_cientifico: 'Rosa alba',
        categoria: 'harmonizacao',
        aplicacao: ['infusao', 'banho', 'ebó'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Pureza, amor, proteção, devoção'
      },
      {
        nome: 'Malva',
        nome_cientifico: 'Malva sylvestris',
        categoria: 'cura',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '12 minutos',
        significado_ritual: 'Cura emocional, suavidade, proteção do útero espiritual'
      },
      {
        nome: 'Cravo',
        nome_cientifico: 'Syzygium aromaticum',
        categoria: 'harmonizacao',
        aplicacao: ['infusao', 'defumacao', 'amaciante'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Amor, proteção, fartura, alegria'
      },
      {
        nome: 'Hortelã',
        nome_cientifico: 'Mentha spicata',
        categoria: 'expansao',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '8 minutos',
        significado_ritual: 'Prosperidade, novos começos, refreshment espiritual'
      }
    ],
    praticas_fitoenergeticas: [
      'Banho de rosa branca e manjericão para amor próprio',
      'Infusão de cravo e hortelã para prosperidade',
      'Água de malva para cura emocional',
      'Defumação com pétalas de rosa branca'
    ],
    combinacoes_rituais: [
      'Oxum + Iemanjá: Rosa branca + manjericão = harmonia no amor',
      'Oxum + Oxóssi: Cravo + alecrim = prosperidade na caça espiritual',
      'Oxum + Logun Edé: Malva + coco = fertilidade e fartura'
    ]
  },
  {
    orixa: 'Ogum',
    orixa_descricao: 'O guerreiro, senhor das batalhas e das ferramentas',
    regencia: 'Ferro, espadas, ferramentas, caminhos',
    energia_primaria: 'Proteção e conquista',
    erivas_principais: ['Arruda', 'Guiné', 'Pimenta', 'Alecrim', 'Aroeira'],
    erivas_contraindicadas: ['Manjericão dulce', 'Flor doce', 'Cravo muito dulce'],
    erivas: [
      {
        nome: 'Arruda',
        nome_cientifico: 'Ruta graveolens',
        categoria: 'protecao',
        aplicacao: ['defumacao', 'banho', 'amaciante'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Proteção contra mau-olhado, limpeza de energías negativas'
      },
      {
        nome: 'Guiné',
        nome_cientifico: 'Petiveria alliacea',
        categoria: 'protecao',
        aplicacao: ['defumacao', 'banho'],
        tempo_preparo: '30 minutos',
        significado_ritual: 'Descarrego, proteção, abertura de caminhos'
      },
      {
        nome: 'Pimenta',
        nome_cientifico: 'Capsicum sp.',
        categoria: 'expansao',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Coragem, força, superação de obstáculos'
      },
      {
        nome: 'Alecrim',
        nome_cientifico: 'Rosmarinus officinalis',
        categoria: 'expansao',
        aplicacao: ['defumacao', 'banho', 'infusao'],
        tempo_preparo: '12 minutos',
        significado_ritual: 'Força, memória, clareza mental, proteção'
      },
      {
        nome: 'Aroeira',
        nome_cientifico: 'Schinus terebinthifolia',
        categoria: 'protecao',
        aplicacao: ['defumacao', 'banho'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Proteção do espaço, limpeza, renovação'
      }
    ],
    praticas_fitoenergeticas: [
      'Defumação com arruda e guiné para proteção total',
      'Banho de alecrim e pimenta para força e coragem',
      'Amaciante de aroeira para limpeza de caminhos',
      'Infusão de alecrim para clareza mental antes de decisões importantes'
    ],
    combinacoes_rituais: [
      'Ogum + Oxalá: Arruda + cravo branco = proteção e paz',
      'Ogum + Iansã: Pimenta + boldo = força guerreira',
      'Ogum + Oxóssi: Guiné + alecrim = sucesso na caça'
    ]
  },
  {
    orixa: 'Xangô',
    orixa_descricao: 'Senhor do fogo e dos raios, deus da justiça e da chuva',
    regencia: 'Fogo, raios, pedras, trovão',
    energia_primaria: 'Justiça e transformação',
    erivas_principais: ['Cravo-da-índia', 'Canela', 'Gengibre', 'Pau-brasil', 'Cacimba'],
    erivas_contraindicadas: ['Arruda muito fuerte', 'Guiné em excesso', 'Mentruz'],
    erivas: [
      {
        nome: 'Cravo-da-índia',
        nome_cientifico: 'Syzygium aromaticum',
        categoria: 'expansao',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Proteção contra raios, força, poder pessoal'
      },
      {
        nome: 'Canela',
        nome_cientifico: 'Cinnamomum verum',
        categoria: 'expansao',
        aplicacao: ['infusao', 'defumacao', 'bebida'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Poder, transformação, aquecimento espiritual'
      },
      {
        nome: 'Gengibre',
        nome_cientifico: 'Zingiber officinale',
        categoria: 'expansao',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '12 minutos',
        significado_ritual: 'Coragem, vitalidade, superação de medos'
      },
      {
        nome: 'Pau-brasil',
        categoria: 'sagrada',
        aplicacao: ['defumacao', 'ebó'],
        tempo_preparo: '25 minutos',
        significado_ritual: 'Proteção, justiça, força de lei, ancestralidade'
      }
    ],
    praticas_fitoenergeticas: [
      'Defumação com cravo-da-índia e canela para proteção contra raios',
      'Infusão de gengibre com canela para coragem',
      'Ebó de pau-brasil para justiça e reparação',
      'Banho de cinza de pau-brasil para transformação'
    ],
    combinacoes_rituais: [
      'Xangô + Ogum: Cravo-da-índia + arruda = proteção guerrera',
      'Xangô + Oxalá: Canela + alface = justiça com paz',
      'Xangô + Iansã: Gengibre + pimenta = transformação poderosa'
    ]
  },
  {
    orixa: 'Iansã',
    orixa_descricao: 'Senhora dos raios e das tempestades, guerreira do vento',
    regencia: 'Vento, raios, tempestades, fogo',
    energia_primaria: 'Transformação e proteção',
    erivas_principais: ['Pimenta', 'Boldo', 'Eucalipto', 'Gengibre', 'Arruda'],
    erivas_contraindicadas: ['Manjericão dulce', 'Rosa muy dulce', 'Camomila'],
    erivas: [
      {
        nome: 'Pimenta',
        nome_cientifico: 'Capsicum sp.',
        categoria: 'expansao',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Coragem, força, proteção contra inimigos'
      },
      {
        nome: 'Boldo',
        nome_cientifico: 'Peumus boldus',
        categoria: 'cura',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Proteção do fígado espiritual, limpeza, cura'
      },
      {
        nome: 'Eucalipto',
        nome_cientifico: 'Eucalyptus globulus',
        categoria: 'purificacao',
        aplicacao: ['defumacao', 'infusao', 'banho'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Purificação, proteção, clareza mental, limpeza'
      },
      {
        nome: 'Gengibre',
        nome_cientifico: 'Zingiber officinale',
        categoria: 'expansao',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '12 minutos',
        significado_ritual: 'Coragem, vitalidade, proteção, transformação'
      }
    ],
    praticas_fitoenergeticas: [
      'Defumação com pimenta e eucalipto para proteção guerrera',
      'Infusão de boldo e gengibre para força interior',
      'Banho de eucalipto para limpeza completa',
      'Amaciante de pimenta para proteção contra olho gordo'
    ],
    combinacoes_rituais: [
      'Iansã + Ogum: Pimenta + arruda = proteção guerrera total',
      'Iansã + Xangô: Eucalipto + cravo = transformação poderosa',
      'Iansã + Oxum: Gengibre + rosa branca = feminilidade guerreira'
    ]
  },
  {
    orixa: 'Oxóssi',
    orixa_descricao: 'O caçador, senhor das matas e da fartura',
    regencia: 'Matas, florestas, arrows, caça',
    energia_primaria: 'Abundância e sabedoria',
    erivas_principais: ['Alecrim', 'Guiné', 'Arruda', 'Cabaceira', 'Imburana'],
    erivas_contraindicadas: ['Flores muy dulces', 'Manjericão roxo', 'Rosa em excesso'],
    erivas: [
      {
        nome: 'Alecrim',
        nome_cientifico: 'Rosmarinus officinalis',
        categoria: 'expansao',
        aplicacao: ['defumacao', 'banho', 'infusao'],
        tempo_preparo: '12 minutos',
        significado_ritual: 'Memória, sabedoria, proteção, sucesso na caça'
      },
      {
        nome: 'Guiné',
        nome_cientifico: 'Petiveria alliacea',
        categoria: 'protecao',
        aplicacao: ['defumacao', 'banho'],
        tempo_preparo: '30 minutos',
        significado_ritual: 'Proteção nas matas, abertura de caminhos, limpeza'
      },
      {
        nome: 'Cabaceira',
        nome_cientifico: 'Lagenaria siceraria',
        categoria: 'sagrada',
        aplicacao: ['defumacao', 'ebó'],
        tempo_preparo: '40 minutos',
        significado_ritual: 'Fertilidade, prosperidade, rituais de caça, proteção'
      },
      {
        nome: 'Imburana',
        categoria: 'sagrada',
        aplicacao: ['defumacao'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Proteção, prosperidade, negócios, fartura'
      }
    ],
    praticas_fitoenergeticas: [
      'Defumação com alecrim e imburana para fartura',
      'Banho de guiné e cabaceira para proteção na jornada',
      'Infusão de alecrim para clareza e sabedoria',
      'Amaciante de imburana para prosperidade nos negócios'
    ],
    combinacoes_rituais: [
      'Oxóssi + Oxum: Alecrim + rosa = fartura e amor',
      'Oxóssi + Ogum: Guiné + arruda = proteção na caça',
      'Oxóssi + Iemanjá: Cabaceira + manjericão = fertilidade e prosperidade'
    ]
  },
  {
    orixa: 'Omolu',
    orixa_descricao: 'Senhor das doenças e da cura, guardião dos cemeteries',
    regencia: 'Terra, cemeteries, doenças, cura',
    energia_primaria: 'Cura e transformação',
    erivas_principais: ['Guiné', 'Pau-brasil', 'Assaipeixe', 'Cana fistula', 'Mandioca amarga'],
    erivas_contraindicadas: ['Flores conmemória', 'Perfumes fortes', 'Canela'],
    erivas: [
      {
        nome: 'Guiné',
        nome_cientifico: 'Petiveria alliacea',
        categoria: 'cura',
        aplicacao: ['banho', 'defumacao'],
        tempo_preparo: '30 minutos',
        significado_ritual: 'Cura de doenças, proteção contra epidemias, descarrego'
      },
      {
        nome: 'Pau-brasil',
        categoria: 'sagrada',
        aplicacao: ['defumacao', 'ebó'],
        tempo_preparo: '25 minutos',
        significado_ritual: 'Cura, proteção, força de lei, ancestralidade'
      },
      {
        nome: 'Assaipeixe',
        nome_cientifico: 'Penianthus政法',
        categoria: 'cura',
        aplicacao: ['banho', 'infusao'],
        tempo_preparo: '25 minutos',
        significado_ritual: 'Cura de problemas de pele, proteção contra queimaduras'
      },
      {
        nome: 'Cana fistula',
        nome_cientifico: 'Cassia fistula',
        categoria: 'cura',
        aplicacao: ['infusao', 'ebó'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Purificação, cura, regularização do fluxo energético'
      }
    ],
    praticas_fitoenergeticas: [
      'Banho de guiné para cura de doenças',
      'Defumação com pau-brasil para proteção de Omolu',
      'Infusão de assaipeixe para cura de pele',
      'Ebó de cana fistula para purificação completa'
    ],
    combinacoes_rituais: [
      'Omolu + Nanã: Guiné + assigno = cura profunda',
      'Omolu + Oxalá: Pau-brasil + alface = cura e paz',
      'Omolu + Xangô: Assaipeixe + cravo = cura e proteção'
    ]
  },
  {
    orixa: 'Nanã',
    orixa_descricao: 'Senhora das águas paradas e da sabedoria ancestral',
    regencia: 'Águas paradas, lama, sabedoria',
    energia_primaria: 'Sabedoria e decantação',
    erivas_principais: ['Assignô', 'Folha de mandioca', 'Lírio', 'Cólon', 'Folha de goiveiro'],
    erivas_contraindicadas: ['Pimenta', 'Gengibre', 'Arruda fuerte'],
    erivas: [
      {
        nome: 'Assignô',
        nome_cientifico: 'Lantan camara',
        categoria: 'ancestral',
        aplicacao: ['banho', 'infusao'],
        tempo_preparo: '20 minutos',
        significado_ritual: 'Decantação, sabedoria ancestral, humildade, proteção'
      },
      {
        nome: 'Folha de mandioca',
        categoria: 'ancestral',
        aplicacao: ['banho', 'ebó'],
        tempo_preparo: '25 minutos',
        significado_ritual: 'Ancestralidade, humildade, purificação lenta'
      },
      {
        nome: 'Lírio',
        nome_cientifico: 'Lilium sp.',
        categoria: 'ancestral',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '15 minutos',
        significado_ritual: 'Pureza, sabedoria, paz, contemplação'
      },
      {
        nome: 'Cólon',
        categoria: 'ancestral',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '10 minutos',
        significado_ritual: 'Sabedoria, maturidade espiritual, proteção dos idosos'
      }
    ],
    praticas_fitoenergeticas: [
      'Banho de assignô para sabedoria e humildade',
      'Infusão de lírio para paz interior',
      'Ebó de folha de mandioca para ancestralidade',
      'Amaciante de assignô para proteção lenta e profunda'
    ],
    combinacoes_rituais: [
      'Nanã + Omolu: Assignô + guiné = cura e sabedoria',
      'Nanã + Oxalá: Lírio + cravo branco = paz e contemplação',
      'Nanã + Iemanjá: Folha de mandioca + sal marinho = sabedoria maternal'
    ]
  }
];

/**
 * Função para obter mapeamento de ervas por Orixá
 */
export function getOrixaHerbMapping(orixa: string): OrixaHerbMapping | null {
  const normalized = orixa.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  return ORIXÁ_HERB_MAPPINGS.find(m => 
    m.orixa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized ||
    normalized.includes(m.orixa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  ) || null;
}

/**
 * Função para obter ervas principais de um Orixá
 */
export function getOrixaMainHerbs(orixa: string): string[] {
  const mapping = getOrixaHerbMapping(orixa);
  return mapping?.erivas_principais || [];
}

/**
 * Função para obter ervas contraindicadas
 */
export function getOrixaContraHerbs(orixa: string): string[] {
  const mapping = getOrixaHerbMapping(orixa);
  return mapping?.erivas_contraindicadas || [];
}

/**
 * Função para obter práticas fitoenergéticas
 */
export function getOrixaFitoPractices(orixa: string): string[] {
  const mapping = getOrixaHerbMapping(orixa);
  return mapping?.praticas_fitoenergeticas || [];
}

/**
 * Função para buscar Orixá por erva
 */
export function getHerbOrixas(herbName: string): OrixaName[] {
  const normalized = herbName.toLowerCase();
  const results: OrixaName[] = [];
  
  ORIXÁ_HERB_MAPPINGS.forEach(mapping => {
    const found = mapping.erivas.some(h => 
      h.nome.toLowerCase().includes(normalized) ||
      normalized.includes(h.nome.toLowerCase())
    );
    if (found || mapping.erivas_principais.some(h => h.toLowerCase().includes(normalized))) {
      results.push(mapping.orixa);
    }
  });
  
  return results;
}

/**
 * Função para obter combinações rituais
 */
export function getRitualCombinations(orixa1: string, orixa2: string): string[] {
  const mapping1 = getOrixaHerbMapping(orixa1);
  if (!mapping1) return [];
  
  return mapping1.combinacoes_rituais.filter(c => c.includes(orixa2));
}

/**
 * Função para obter todas as ervas de todas as categorias
 */
export function getAllHerbs(): { orixa: OrixaName; erivas: HerbProperties[] }[] {
  return ORIXÁ_HERB_MAPPINGS.map(m => ({
    orixa: m.orixa,
    erivas: m.erivas
  }));
}

/**
 * Função para buscar ervas por categoria
 */
export function getHerbsByCategory(categoria: HerbCategory): { orixa: OrixaName; erivas: HerbProperties[] }[] {
  return ORIXÁ_HERB_MAPPINGS
    .filter(m => m.erivas.some(e => e.categoria === categoria))
    .map(m => ({
      orixa: m.orixa,
      erivas: m.erivas.filter(e => e.categoria === categoria)
    }));
}

/**
 * Função para validar se uma erva é segura para um Orixá
 */
export function isHerbSafeForOrixa(herb: string, orixa: string): { safe: boolean; reason?: string } {
  const mapping = getOrixaHerbMapping(orixa);
  if (!mapping) return { safe: false, reason: 'Orixá não encontrado' };
  
  if (mapping.erivas_contraindicadas.some(h => h.toLowerCase().includes(herb.toLowerCase()))) {
    return { safe: false, reason: `Erva contraindicada para ${mapping.orixa}` };
  }
  
  return { safe: true };
}