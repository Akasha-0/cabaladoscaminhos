/**
 * Planet-Herbs Spiritual Correlation
 * 
 * Correlação entre os 7 planetas clássicos (incluindo Sol e Lua)
 * e as ervas sacras para harmonização planetária.
 * 
 * @source Baseado em IDEIA.md - Tradições astrológicas e fitoterápicas
 * @references planet-frequency.ts, planet-day.ts, orixa-planet.ts
 */

export type PlanetName =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vênus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno';

export type PlanetEnergy =
  | 'yang'    // Expansivo, ativo, quente
  | 'yin'     // Receptivo, passivo, frio
  | 'neutro'; // Equilibrado

export type HerbApplication =
  | 'defumacao'
  | 'infusao'
  | 'banho'
  | 'oleo'
  | 'incenso'
  | 'bebida';

export interface PlanetHerbProperties {
  nome: string;
  aplicacao: HerbApplication[];
  tempo_preparo: string;
  significado_planetario: string;
  combinacao_planetaria: string[];
}

export interface PlanetHerbMapping {
  planeta: PlanetName;
  planeta_descricao: string;
  signo_regente: string;
  elemento: string;
  energia: PlanetEnergy;
  dia_semana: string;
  horario_favoravel: string;
  ervas_principais: string[];
  ervas_contraindicadas: string[];
  propriedades: PlanetHerbProperties[];
  praticas_planetarias: string[];
  combinaciones_rituais: string[];
}

/**
 * Mapeamento completo Planeta ↔ Ervas (Harmonização Planetária)
 * Baseado na tradição astrológica ocidental e fitoterapia
 */
export const PLANET_HERB_MAPPINGS: PlanetHerbMapping[] = [
  {
    planeta: 'Sol',
    planeta_descricao: 'Centro do sistema, fonte de luz e vida, representa o eu interior, vitalidade e poder criativo',
    signo_regente: 'Leão',
    elemento: 'Fogo',
    energia: 'yang',
    dia_semana: 'Domingo',
    horario_favoravel: '6h-12h (Nascente ao Meio-dia)',
    ervas_principais: ['Helicriso', 'Calêndula', 'Mirra', 'Açafrão', 'Gengibre'],
    ervas_contraindicadas: ['Arruda', 'Artemísia amarga', 'Absinto'],
    propriedades: [
      {
        nome: 'Helicriso',
        aplicacao: ['defumacao', 'oleo', 'incenso'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Sun herb - fortalecimento do eu, coragem, vitalidade, claridade mental',
        combinacao_planetaria: ['Sol + Leão', 'Sol + Domingo', 'Sol + Meio-dia']
      },
      {
        nome: 'Calêndula',
        aplicacao: ['infusao', 'banho', 'oleo'],
        tempo_preparo: '10 minutos',
        significado_planetario: 'Sun flower - proteção solar, saúde, brilho espiritual, prosperidade',
        combinacao_planetaria: ['Sol + Calêndula', 'Sol + Leão', 'Sol + Fogo']
      },
      {
        nome: 'Mirra',
        aplicacao: ['defumacao', 'incenso'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Sacred resin - transformação, cura divina, proteção contra negatividades',
        combinacao_planetaria: ['Sol + Mirra', 'Sol + Domingo', 'Sol + Cristo']
      },
      {
        nome: 'Açafrão',
        aplicacao: ['infusao', 'bebida', 'oleo'],
        tempo_preparo: '8 minutos',
        significado_planetario: 'Golden spice - poder real, prosperidade, transformação alquímica',
        combinacao_planetaria: ['Sol + Açafrão', 'Sol + Leão', 'Sol + Prosperidade']
      },
      {
        nome: 'Gengibre',
        aplicacao: ['infusao', 'bebida', 'defumacao'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Root of fire - coragem, força, proteção, aquecimento espiritual',
        combinacao_planetaria: ['Sol + Gengibre', 'Sol + Fogo', 'Sol + Xangô']
      }
    ],
    praticas_planetarias: [
      'Defumação com helicriso ao amanhecer para vitalidade',
      'Banho de calêndula ao meio-dia para proteção solar',
      'Incenso de mirra durante meditação solar',
      'Chá de açafrão para prosperidade e transformação'
    ],
    combinaciones_rituais: [
      'Sol + Aurum: Açafrão + ouro = prosperidade e sucesso',
      'Sol + Fogo: Gengibre + canela = coragem e força',
      'Sol + Luz: Calêndula + helicriso = vitalidade e brilho'
    ]
  },
  {
    planeta: 'Lua',
    planeta_descricao: 'Satélite terrestre, governa as emoções, o inconsciente, os ciclos e a fertilidade',
    signo_regente: 'Câncer',
    elemento: 'Água',
    energia: 'yin',
    dia_semana: 'Segunda-feira',
    horario_favoravel: '18h-24h (Noite, lua crescente)',
    ervas_principais: ['Lunarwort', 'Camomila', 'Jasmim', 'Rosa branca', 'Valeriana'],
    ervas_contraindicadas: ['Pimenta', 'Gengibre fuerte', 'Artemísia'],
    propriedades: [
      {
        nome: 'Lunarwort',
        aplicacao: ['infusao', 'banho', 'oleo'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Moon herb - harmonização emocional, sono tranquilo, intuicao',
        combinacao_planetaria: ['Lua + Câncer', 'Lua + Segunda-feira', 'Lua + Noite']
      },
      {
        nome: 'Camomila',
        aplicacao: ['infusao', 'banho', 'oleo'],
        tempo_preparo: '10 minutos',
        significado_planetario: 'Moon flower - calma, suavização, proteção lunar, sonhar melhor',
        combinacao_planetaria: ['Lua + Camomila', 'Lua + Câncer', 'Lua + Água']
      },
      {
        nome: 'Jasmim',
        aplicacao: ['defumacao', 'incenso', 'oleo'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Moon jasmine - romantismo, sonhos proféticos, proteção noturna',
        combinacao_planetaria: ['Lua + Jasmim', 'Lua + Segunda-feira', 'Lua + Noite']
      },
      {
        nome: 'Rosa branca',
        aplicacao: ['infusao', 'banho', 'oleo'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Moon rose - amor puro, proteção, sonhos, fertilidade',
        combinacao_planetaria: ['Lua + Rosa branca', 'Lua + Câncer', 'Lua + Iemanjá']
      },
      {
        nome: 'Valeriana',
        aplicacao: ['infusao', 'banho'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Moon root - sono profundo, calma, proteção contra pesadelos',
        combinacao_planetaria: ['Lua + Valeriana', 'Lua + Noite', 'Lua + Câncer']
      }
    ],
    praticas_planetarias: [
      'Infusão de camomila na lua cheia para harmonização emocional',
      'Banho de rosa branca na lua crescente para amor próprio',
      'Defumação com jasmim para sonhos proféticos',
      'Chá de valeriana para sono tranquilo e proteção noturna'
    ],
    combinaciones_rituais: [
      'Lua + Água: Camomila + jasmim = paz emocional',
      'Lua + Noite: Rosa branca + valeriana = proteção noturna',
      'Lua + Iemanjá: Rosa branca + manjericão = maternidade espiritual'
    ]
  },
  {
    planeta: 'Mercúrio',
    planeta_descricao: 'Mensageiro dos deuses, governa comunicação, inteligência, comércio e viagens',
    signo_regente: 'Gêmeos/Virgem',
    elemento: 'Ar',
    energia: 'neutro',
    dia_semana: 'Quarta-feira',
    horario_favoravel: '6h-9h (Manhã cedo) ou 15h-18h (Tarde)',
    ervas_principais: ['Alecrim', 'Funcho', 'Laranja', 'Louro', 'Menta'],
    ervas_contraindicadas: ['Maconha', 'Absinto fuerte', 'Belladonna'],
    propriedades: [
      {
        nome: 'Alecrim',
        aplicacao: ['defumacao', 'infusao', 'oleo'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Memory herb - clareza mental, memória, comunicação, aprendizado',
        combinacao_planetaria: ['Mercúrio + Gêmeos', 'Mercúrio + Quarta-feira', 'Mercúrio + Ar']
      },
      {
        nome: 'Funcho',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '10 minutos',
        significado_planetario: 'Communication seed - eloquência, persuasão, proteção verbal',
        combinacao_planetaria: ['Mercúrio + Funcho', 'Mercúrio + Virgem', 'Mercúrio + Comunicação']
      },
      {
        nome: 'Laranja',
        aplicacao: ['defumacao', 'incenso', 'oleo'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Citrus light - alegria, comunicação clara, negócios, otimismo',
        combinacao_planetaria: ['Mercúrio + Laranja', 'Mercúrio + Gêmeos', 'Mercúrio + Comércio']
      },
      {
        nome: 'Louro',
        aplicacao: ['defumacao', 'infusao', 'oleo'],
        tempo_preparo: '18 minutos',
        significado_planetario: 'Victory leaf - vitória, sucesso, proteção contra falatórios',
        combinacao_planetaria: ['Mercúrio + Louro', 'Mercúrio + Quarta-feira', 'Mercúrio + Vitória']
      },
      {
        nome: 'Menta',
        aplicacao: ['infusao', 'bebida', 'oleo'],
        tempo_preparo: '8 minutos',
        significado_planetario: 'Fresh mind - agilidade mental, concentração, criatividade',
        combinacao_planetaria: ['Mercúrio + Menta', 'Mercúrio + Virgem', 'Mercúrio + Mente']
      }
    ],
    praticas_planetarias: [
      'Infusão de alecrim para clareza mental antes de estudos',
      'Defumação com louro para sucesso em negócios',
      'Chá de menta para concentração e criatividade',
      'Incenso de laranja para alegria e otimismo'
    ],
    combinaciones_rituais: [
      'Mercúrio + Comunicação: Alecrim + funcho = eloquência',
      'Mercúrio + Comércio: Laranja + louro = sucesso nos negócios',
      'Mercúrio + Mente: Menta + alecrim = clareza mental'
    ]
  },
  {
    planeta: 'Vênus',
    planeta_descricao: 'Deusa do amor e da beleza, governa relacionamentos, arte, harmonia e prazer',
    signo_regente: 'Touro/Libra',
    elemento: 'Terra',
    energia: 'yin',
    dia_semana: 'Sexta-feira',
    horario_favoravel: 'Manhã (6h-12h) ou ENTARDECER (17h-19h)',
    ervas_principais: ['Rosa', 'Violeta', 'Damiana', 'Lavanda', 'Sândalo'],
    ervas_contraindicadas: ['Artemísia amarga', 'Absinto', 'Arruda muy forte'],
    propriedades: [
      {
        nome: 'Rosa',
        aplicacao: ['infusao', 'banho', 'oleo', 'incenso'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Love flower - amor, romantismo, beleza, harmonização de relacionamentos',
        combinacao_planetaria: ['Vênus + Touro', 'Vênus + Sexta-feira', 'Vênus + Terra']
      },
      {
        nome: 'Violeta',
        aplicacao: ['infusao', 'oleo', 'incenso'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Spiritual love - devoção, charme, proteção contra inveja',
        combinacao_planetaria: ['Vênus + Violeta', 'Vênus + Libra', 'Vênus + Beleza']
      },
      {
        nome: 'Damiana',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '18 minutos',
        significado_planetario: 'Passion herb - paixão, afrodisíaco natural, energia criativa',
        combinacao_planetaria: ['Vênus + Damiana', 'Vênus + Touro', 'Vênus + Paixão']
      },
      {
        nome: 'Lavanda',
        aplicacao: ['infusao', 'banho', 'oleo', 'defumacao'],
        tempo_preparo: '10 minutos',
        significado_planetario: 'Peaceful herb - harmonia, paz, amor próprio, sensualidade',
        combinacao_planetaria: ['Vênus + Lavanda', 'Vênus + Libra', 'Vênus + Paz']
      },
      {
        nome: 'Sândalo',
        aplicacao: ['defumacao', 'incenso', 'oleo'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Sacred love - devoção, proteção, amor divino, eroticismo sutil',
        combinacao_planetaria: ['Vênus + Sândalo', 'Vênus + Sexta-feira', 'Vênus + Amor divino']
      }
    ],
    praticas_planetarias: [
      'Banho de rosa e lavanda na sexta-feira para amor próprio',
      'Infusão de damiana para aumentar paixão e vitalidade',
      'Defumação com sândalo para amor divino e proteção',
      'Incenso de violeta para charme e proteção contra inveja'
    ],
    combinaciones_rituais: [
      'Vênus + Amor: Rosa + lavanda = harmonia emocional',
      'Vênus + Beleza: Violeta + rosa = charme e amor próprio',
      'Vênus + Paixão: Damiana + sândalo = sensualidade e devoção'
    ]
  },
  {
    planeta: 'Marte',
    planeta_descricao: 'Deus da guerra, governa ação, coragem, energia física e competição',
    signo_regente: 'Áries/Escorpião',
    elemento: 'Fogo',
    energia: 'yang',
    dia_semana: 'Terça-feira',
    horario_favoravel: '6h-9h (Nascente) ou 18h-21h (Noite ativa)',
    ervas_principais: ['Pimenta', 'Gengibre', 'Alho', 'Cebolinha', 'Wasabi'],
    ervas_contraindicadas: ['Camomila', 'Valeriana', 'Melissa'],
    propriedades: [
      {
        nome: 'Pimenta',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Warrior spice - coragem, força, proteção contra inimigos, agressividade transformada',
        combinacao_planetaria: ['Marte + Áries', 'Marte + Terça-feira', 'Marte + Fogo']
      },
      {
        nome: 'Gengibre',
        aplicacao: ['infusao', 'bebida', 'defumacao'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Fire root - vitalidade, coragem, proteção, transformação de medo em ação',
        combinacao_planetaria: ['Marte + Gengibre', 'Marte + Áries', 'Marte + Xangô']
      },
      {
        nome: 'Alho',
        aplicacao: ['defumacao', 'infusao'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Protection bulb - proteção contra negatividades, purificação, força física',
        combinacao_planetaria: ['Marte + Alho', 'Marte + Escórpião', 'Marte + Proteção']
      },
      {
        nome: 'Cebolinha',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '10 minutos',
        significado_planetario: 'Vitality herb - energia, disposição, proteção, vitalidade aumentada',
        combinacao_planetaria: ['Marte + Cebolinha', 'Marte + Terça-feira', 'Marte + Energia']
      },
      {
        nome: 'Wasabi',
        aplicacao: ['infusao', 'defumacao'],
        tempo_preparo: '8 minutos',
        significado_planetario: 'Brave root - coragem instantânea, superação de obstáculos, ação rápida',
        combinacao_planetaria: ['Marte + Wasabi', 'Marte + Áries', 'Marte + Coragem']
      }
    ],
    praticas_planetarias: [
      'Defumação com pimenta na terça-feira para coragem',
      'Chá de gengibre para vitalidade e proteção',
      'Infusão de alho para purificação e força física',
      'Amaciante de wasabi para ação rápida e decisiva'
    ],
    combinaciones_rituais: [
      'Marte + Coragem: Pimenta + gengibre = força guerrera',
      'Marte + Proteção: Alho + cebolinha = proteção total',
      'Marte + Xangô: Gengibre + cravo = transformação poderosa'
    ]
  },
  {
    planeta: 'Júpiter',
    planeta_descricao: 'Maior planeta, governa expansão, abundância, sabedoria e espiritualidade',
    signo_regente: 'Sagitário/Peixes',
    elemento: 'Fogo/Água (dual)',
    energia: 'yang',
    dia_semana: 'Quinta-feira',
    horario_favoravel: '9h-12h (Manhã expandido) ou 12h-15h (Meio-dia)',
    ervas_principais: ['Damasco', 'Avelã', 'Sálvia', 'Absinto suave', 'Ginkgo'],
    ervas_contraindicadas: ['Pimenta muy picante', 'Alho muy fuerte'],
    propriedades: [
      {
        nome: 'Damasco',
        aplicacao: ['infusao', 'bebida', 'oleo'],
        tempo_preparo: '15 minutos',
        significado_planetario: 'Abundance fruit - prosperidade, sorte, expansão de consciência',
        combinacao_planetaria: ['Júpiter + Sagitário', 'Júpiter + Quinta-feira', 'Júpiter + Abundância']
      },
      {
        nome: 'Avelã',
        aplicacao: ['infusao', 'bebida'],
        tempo_preparo: '12 minutos',
        significado_planetario: 'Wisdom nut - conhecimento, proteção contra negatividade, sabedoria',
        combinacao_planetaria: ['Júpiter + Avelã', 'Júpiter + Peixes', 'Júpiter + Sabedoria']
      },
      {
        nome: 'Sálvia',
        aplicacao: ['defumacao', 'infusao', 'oleo'],
        tempo_preparo: '18 minutos',
        significado_planetario: 'Sage wisdom - expansão espiritual, limpeza, proteção, intuição',
        combinacao_planetaria: ['Júpiter + Sálvia', 'Júpiter + Sagitário', 'Júpiter + Espiritualidade']
      },
      {
        nome: 'Absinto suave',
        aplicacao: ['infusao', 'defumacao'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Visionary herb - visão, sonhos, proteção, transformação suave',
        combinacao_planetaria: ['Júpiter + Absinto', 'Júpiter + Peixes', 'Júpiter + Visão']
      },
      {
        nome: 'Ginkgo',
        aplicacao: ['infusao', 'bebida', 'oleo'],
        tempo_preparo: '25 minutos',
        significado_planetario: 'Memory tree - memória, concentração, longevidade, sabedoria antiga',
        combinacao_planetaria: ['Júpiter + Ginkgo', 'Júpiter + Quinta-feira', 'Júpiter + Sabedoria']
      }
    ],
    praticas_planetarias: [
      'Infusão de sálvia para expansão espiritual na quinta-feira',
      'Chá de ginkgo para memória e sabedoria',
      'Defumação com avelã para proteção e conhecimento',
      'Amaciante de damasco para abundância e prosperidade'
    ],
    combinaciones_rituais: [
      'Júpiter + Abundância: Damasco + avelã = prosperidade',
      'Júpiter + Sabedoria: Sálvia + ginkgo = conhecimento profundo',
      'Júpiter + Espiritualidade: Sálvia + absinto = expansão sutil'
    ]
  },
  {
    planeta: 'Saturno',
    planeta_descricao: 'Senhor do tempo e do karma, governa disciplina, restrição, maturidade e limites',
    signo_regente: 'Capricórnio/Aquário',
    elemento: 'Terra/Ar (dual)',
    energia: 'yin',
    dia_semana: 'Sábado',
    horario_favoravel: 'Manhã cedo (6h-9h) ou ENTARDECER (17h-19h)',
    ervas_principais: ['Cicuta', 'Benção', 'Hera', 'Musgo', 'Tejo'],
    ervas_contraindicadas: ['Rosa muy dulce', 'Jasmim fuerte', 'Damiana'],
    propriedades: [
      {
        nome: 'Cicuta',
        aplicacao: ['defumacao', 'oleo'],
        tempo_preparo: '30 minutos',
        significado_planetario: 'Karmic herb - proteção kármica, limites, transformação de padrões',
        combinacao_planetaria: ['Saturno + Capricórnio', 'Saturno + Sábado', 'Saturno + Limites']
      },
      {
        nome: 'Benção',
        aplicacao: ['defumacao', 'incenso'],
        tempo_preparo: '25 minutos',
        significado_planetario: 'Blessed herb - proteção, harmonia, disciplina, paz',
        combinacao_planetaria: ['Saturno + Benção', 'Saturno + Capricórnio', 'Saturno + Disciplina']
      },
      {
        nome: 'Hera',
        aplicacao: ['infusao', 'banho', 'oleo'],
        tempo_preparo: '20 minutos',
        significado_planetario: 'Boundary plant - definição de limites, proteção, lealdade',
        combinacao_planetaria: ['Saturno + Hera', 'Saturno + Aquário', 'Saturno + Limites']
      },
      {
        nome: 'Musgo',
        aplicacao: ['defumacao', 'incenso'],
        tempo_preparo: '18 minutos',
        significado_planetario: 'Ancient herb - longevidade, resistência, proteção ancestral',
        combinacao_planetaria: ['Saturno + Musgo', 'Saturno + Sábado', 'Saturno + Ancestralidade']
      },
      {
        nome: 'Tejo',
        aplicacao: ['defumacao', 'oleo'],
        tempo_preparo: '35 minutos',
        significado_planetario: 'Death-rebirth tree - transformação profunda, renovação, proteção',
        combinacao_planetaria: ['Saturno + Tejo', 'Saturno + Capricórnio', 'Saturno + Transição']
      }
    ],
    praticas_planetarias: [
      'Defumação com benção no sábado para disciplina',
      'Banho de hera para definição de limites',
      'Incenso de musgo para proteção ancestral',
      'Amaciante de tejo para transformação kármica'
    ],
    combinaciones_rituais: [
      'Saturno + Limites: Hera + cicuta = proteção e definição',
      'Saturno + Disciplina: Benção + musgo = harmonia e resistência',
      'Saturno + Transição: Tejo + musgo = renovação profunda'
    ]
  }
];

/**
 * Função para obter mapeamento de ervas por planeta
 */
export function getPlanetHerbMapping(planeta: string): PlanetHerbMapping | null {
  const normalized = planeta.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  return PLANET_HERB_MAPPINGS.find(m => 
    m.planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized ||
    normalized.includes(m.planeta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  ) || null;
}

/**
 * Função para obter ervas principais de um planeta
 */
export function getPlanetMainHerbs(planeta: string): string[] {
  const mapping = getPlanetHerbMapping(planeta);
  return mapping?.ervas_principais || [];
}

/**
 * Função para obter ervas contraindicadas
 */
export function getPlanetContraHerbs(planeta: string): string[] {
  const mapping = getPlanetHerbMapping(planeta);
  return mapping?.ervas_contraindicadas || [];
}

/**
 * Função para obter práticas planetárias
 */
export function getPlanetPractices(planeta: string): string[] {
  const mapping = getPlanetHerbMapping(planeta);
  return mapping?.praticas_planetarias || [];
}

/**
 * Função para buscar planeta por erva
 */
export function getHerbPlanets(herbName: string): PlanetName[] {
  const normalized = herbName.toLowerCase();
  const results: PlanetName[] = [];
  
  PLANET_HERB_MAPPINGS.forEach(mapping => {
    const found = mapping.propriedades.some(h => 
      h.nome.toLowerCase().includes(normalized) ||
      normalized.includes(h.nome.toLowerCase())
    );
    if (found || mapping.ervas_principais.some(h => h.toLowerCase().includes(normalized))) {
      results.push(mapping.planeta);
    }
  });
  
  return results;
}

/**
 * Função para obter combinações rituais
 */
export function getPlanetRitualCombinations(planeta1: string, planeta2: string): string[] {
  const mapping1 = getPlanetHerbMapping(planeta1);
  if (!mapping1) return [];
  
  return mapping1.combinaciones_rituais.filter(c => c.includes(planeta2));
}

/**
 * Função para obter todas as ervas de todos os planetas
 */
export function getAllPlanetHerbs(): { planeta: PlanetName; propriedades: PlanetHerbProperties[] }[] {
  return PLANET_HERB_MAPPINGS.map(m => ({
    planeta: m.planeta,
    propriedades: m.propriedades
  }));
}

/**
 * Função para buscar ervas por aplicação
 */
export function getHerbsByApplication(app: HerbApplication): { planeta: PlanetName; ervas: PlanetHerbProperties[] }[] {
  return PLANET_HERB_MAPPINGS
    .filter(m => m.propriedades.some(e => e.aplicacao.includes(app)))
    .map(m => ({
      planeta: m.planeta,
      ervas: m.propriedades.filter(e => e.aplicacao.includes(app))
    }));
}

/**
 * Função para validar se uma erva é segura para um planeta
 */
export function isHerbSafeForPlanet(herb: string, planeta: string): { safe: boolean; reason?: string } {
  const mapping = getPlanetHerbMapping(planeta);
  if (!mapping) return { safe: false, reason: 'Planeta não encontrado' };
  
  if (mapping.ervas_contraindicadas.some(h => h.toLowerCase().includes(herb.toLowerCase()))) {
    return { safe: false, reason: `Erva contraindicada para ${mapping.planeta}` };
  }
  
  return { safe: true };
}

/**
 * Função para obter planeta favorito para uma erva
 */
export function getHerbFavoritePlanet(herb: string): PlanetName | null {
  const normalized = herb.toLowerCase();
  
  for (const mapping of PLANET_HERB_MAPPINGS) {
    if (mapping.ervas_principais.some(h => h.toLowerCase().includes(normalized))) {
      return mapping.planeta;
    }
    if (mapping.propriedades.some(h => h.nome.toLowerCase().includes(normalized))) {
      return mapping.planeta;
    }
  }
  
  return null;
}