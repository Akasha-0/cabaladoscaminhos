// Energy Patterns - Sacred correspondences for Cabala dos Caminhos

export interface EnergyPattern {
  id: string;
  name: string;
  category: 'day' | 'week' | 'month' | 'lunar' | 'elemental';
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
  correspondences: {
    chakras?: string[];
    orixas?: string[];
    planetas?: string[];
    sephiroth?: string[];
    elementos?: string[];
    cores?: string[];
  };
  recommendations: {
    action: string;
    evitar?: string[];
  };
}

const patterns: EnergyPattern[] = [
  // Daily patterns based on day of week
  {
    id: 'monday',
    name: 'Segunda-feira',
    category: 'day',
    intensity: 4,
    description: 'Dia de aterramento, limpeza espiritual, transmutação e respeito às almas.',
    correspondences: {
      chakras: ['1-Básico', '6-Frontal'],
      orixas: ['Omolu', 'Obaluaê', 'Exu'],
      planetas: ['Lua', 'Saturno'],
      sephiroth: ['Malkuth', 'Yesod'],
      elementos: ['Terra', 'Fogo'],
      cores: ['Vermelho', 'Branco', 'Preto'],
    },
    recommendations: {
      action: 'Limpezas pesadas, corte de laços kármicos, ebós de caminho',
      evitar: ['Carne de porco', 'cachaça em excesso', 'andar na rua ao meio-dia ou meia-noite'],
    },
  },
  {
    id: 'tuesday',
    name: 'Terça-feira',
    category: 'day',
    intensity: 5,
    description: 'Dia de força, movimento, coragem, corte de demandas e quebra de energias.',
    correspondences: {
      chakras: ['2-Sacro'],
      orixas: ['Iansã', 'Oyá', 'Ogum'],
      planetas: ['Marte', 'Plutão'],
      sephiroth: ['Geburah'],
      elementos: ['Fogo', 'Terra'],
      cores: ['Laranja', 'Vermelho'],
    },
    recommendations: {
      action: 'Rituais de banimento, quebra de demandas, ativação do movimento',
      evitar: ['Abóbora', 'caranguejo', 'inveja', 'mentiras'],
    },
  },
  {
    id: 'wednesday',
    name: 'Quarta-feira',
    category: 'day',
    intensity: 3,
    description: 'Dia da justiça divina, estudos, mente concreta, verdade e razão.',
    correspondences: {
      chakras: ['3-Plexo Solar'],
      orixas: ['Xangô', 'Iansã'],
      planetas: ['Mercúrio'],
      sephiroth: ['Hod'],
      elementos: ['Fogo', 'Ar'],
      cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    },
    recommendations: {
      action: 'Estudos, estratégia de negócios, justiça, clareza mental',
      evitar: ['Carne de galo', 'mentiras', 'injustiça'],
    },
  },
  {
    id: 'thursday',
    name: 'Quinta-feira',
    category: 'day',
    intensity: 4,
    description: 'Dia da fartura, busca por conhecimento, expansão e cura.',
    correspondences: {
      chakras: ['4-Cardíaco'],
      orixas: ['Oxóssi'],
      planetas: ['Júpiter'],
      sephiroth: ['Chesed'],
      elementos: ['Ar', 'Água'],
      cores: ['Verde', 'Azul-turquesa'],
    },
    recommendations: {
      action: 'Rituais de fartura, expansão de projetos, busca por conhecimento nas matas',
      evitar: ['Carne de caça', 'mel em excesso', 'teimosia'],
    },
  },
  {
    id: 'friday',
    name: 'Sexta-feira',
    category: 'day',
    intensity: 5,
    description: 'Dia da paz, pureza, silêncio, gratidão e conexão direta com o Divino.',
    correspondences: {
      chakras: ['7-Coronário'],
      orixas: ['Oxalá'],
      planetas: ['Vênus'],
      sephiroth: ['Kether'],
      elementos: ['Ar', 'Luz'],
      cores: ['Branco', 'Marfim', 'Violeta'],
    },
    recommendations: {
      action: 'Conexão espiritual, Bori, pacificação total, gratidão',
      evitar: ['Bebidas alcoólicas', 'azeite de dendê', 'sal', 'roupas escuras'],
    },
  },
  {
    id: 'saturday',
    name: 'Sábado',
    category: 'day',
    intensity: 4,
    description: 'Dia das Grandes Mães, amor incondicional, intuição e fertilidade.',
    correspondences: {
      chakras: ['4-Cardíaco', '6-Frontal'],
      orixas: ['Oxum', 'Iemanjá'],
      planetas: ['Saturno', 'Urano'],
      sephiroth: ['Binah', 'Tiphereth'],
      elementos: ['Água'],
      cores: ['Rosa', 'Azul Escuro', 'Branco'],
    },
    recommendations: {
      action: 'Feitiçaria natural, magnetismo pessoal, banhos de Oxum/Iemanjá',
      evitar: ['Lama', 'poeira', 'caranguejo', 'passeios na praia em dias de Ossá'],
    },
  },
  {
    id: 'sunday',
    name: 'Domingo',
    category: 'day',
    intensity: 4,
    description: 'Dia de recarregar energia vital, foco no poder pessoal e propósito.',
    correspondences: {
      chakras: ['3-Plexo Solar'],
      orixas: ['Xangô'],
      planetas: ['Sol'],
      sephiroth: ['Tiphereth'],
      elementos: ['Fogo'],
      cores: ['Amarelo', 'Dourado'],
    },
    recommendations: {
      action: 'Recarregar vitalidade, irradiação do poder pessoal, alinhamento com o propósito',
      evitar: ['Inveja', 'teimosia extrema', 'abóbora'],
    },
  },

  // Lunar phase patterns
  {
    id: 'new-moon',
    name: 'Lua Nova',
    category: 'lunar',
    intensity: 3,
    description: 'Introspecção, silêncio, planejamento invisível.',
    correspondences: {
      chakras: ['1-Básico', '6-Frontal'],
      orixas: ['Exu', 'Omolu', 'Ogum'],
      planetas: ['Lua', 'Saturno'],
      sephiroth: ['Malkuth', 'Yesod'],
      elementos: ['Terra'],
      cores: ['Preto', 'Branco'],
    },
    recommendations: {
      action: 'Início de projetos secretos, firmezas de proteção profunda, assentamento de Exu',
      evitar: ['Exposição', 'decisões impulsivas', 'conflitos'],
    },
  },
  {
    id: 'waxing-moon',
    name: 'Lua Crescente',
    category: 'lunar',
    intensity: 4,
    description: 'Foco, ação disciplinada, força de vontade.',
    correspondences: {
      chakras: ['2-Sacro', '3-Plexo Solar'],
      orixas: ['Oxóssi', 'Ogum', 'Xangô'],
      planetas: ['Marte', 'Júpiter'],
      sephiroth: ['Geburah', 'Chesed'],
      elementos: ['Fogo', 'Terra'],
      cores: ['Verde', 'Amarelo'],
    },
    recommendations: {
      action: 'Rituais de abertura de caminhos, banhos de prosperidade, atração',
      evitar: ['Procrastinação', 'energia estagnada'],
    },
  },
  {
    id: 'full-moon',
    name: 'Lua Cheia',
    category: 'lunar',
    intensity: 5,
    description: 'Expansão áurica máxima, magnetismo, êxtase espiritual.',
    correspondences: {
      chakras: ['4-Cardíaco', '6-Frontal', '7-Coronário'],
      orixas: ['Oxalá', 'Oxum', 'Iemanjá'],
      planetas: ['Sol', 'Lua', 'Vênus'],
      sephiroth: ['Tiphereth', 'Kether'],
      elementos: ['Água', 'Luz'],
      cores: ['Branco', 'Azul', 'Rosa'],
    },
    recommendations: {
      action: 'Alta magia de atração, consagração, rituais de amor e cura de Ori',
      evitar: ['Conflitos', 'energia pesada', 'ebós de descarrego'],
    },
  },
  {
    id: 'waning-moon',
    name: 'Lua Minguante',
    category: 'lunar',
    intensity: 3,
    description: 'Desapego, austeridade, banimento consciente.',
    correspondences: {
      chakras: ['1-Básico', '5-Laríngeo'],
      orixas: ['Omolu', 'Nanã', 'Iansã'],
      planetas: ['Saturno', 'Marte'],
      sephiroth: ['Binah', 'Geburah'],
      elementos: ['Terra', 'Fogo'],
      cores: ['Preto', 'Roxo', 'Laranja'],
    },
    recommendations: {
      action: 'Quebra de energias paradas, ebós de descarrego pesado, cura de vícios',
      evitar: ['Novos projetos', 'contratos', 'exposições públicas'],
    },
  },

  // Elemental patterns
  {
    id: 'fire-element',
    name: 'Elemento Fogo',
    category: 'elemental',
    intensity: 4,
    description: 'Transformação, força de vontade, coragem, fogo purificador.',
    correspondences: {
      chakras: ['3-Plexo Solar', '2-Sacro'],
      orixas: ['Xangô', 'Iansã', 'Ogum'],
      planetas: ['Marte', 'Sol'],
      sephiroth: ['Geburah', 'Tiphereth'],
      elementos: ['Fogo'],
      cores: ['Vermelho', 'Laranja', 'Amarelo'],
    },
    recommendations: {
      action: 'Rituais de transformação, quebra de bloqueios, ativação de coragem',
      evitar: ['Inveja', 'agressividade descontrolada', 'impulsividade'],
    },
  },
  {
    id: 'water-element',
    name: 'Elemento Água',
    category: 'elemental',
    intensity: 4,
    description: 'Emoção, intuição, fluidez, amor incondicional.',
    correspondences: {
      chakras: ['4-Cardíaco', '6-Frontal'],
      orixas: ['Iemanjá', 'Oxum'],
      planetas: ['Lua', 'Vênus'],
      sephiroth: ['Binah', 'Chesed'],
      elementos: ['Água'],
      cores: ['Azul', 'Branco', 'Rosa'],
    },
    recommendations: {
      action: 'Banhos sagrados, magia de amor, limpeza emocional, meditação nas águas',
      evitar: ['Confusão mental', 'emoções represadas', 'isolamento excessivo'],
    },
  },
  {
    id: 'earth-element',
    name: 'Elemento Terra',
    category: 'elemental',
    intensity: 3,
    description: 'Aterramento, estrutura, ancestralidade, firmeza material.',
    correspondences: {
      chakras: ['1-Básico'],
      orixas: ['Omolu', 'Nanã', 'Oxalá'],
      planetas: ['Saturno'],
      sephiroth: ['Malkuth'],
      elementos: ['Terra'],
      cores: ['Marrom', 'Preto', 'Branco'],
    },
    recommendations: {
      action: 'Aterramento, firmeza material, conexão com ancestrais, ebós de caminho',
      evitar: ['Inquietação', 'medo de escassez', 'instabilidade'],
    },
  },
  {
    id: 'air-element',
    name: 'Elemento Ar',
    category: 'elemental',
    intensity: 3,
    description: 'Mente, comunicação, inteligência, expansão mental.',
    correspondences: {
      chakras: ['5-Laríngeo', '6-Frontal'],
      orixas: ['Oxumaré', 'Exu'],
      planetas: ['Mercúrio'],
      sephiroth: ['Hod', 'Chesed'],
      elementos: ['Ar'],
      cores: ['Amarelo', 'Azul-celeste'],
    },
    recommendations: {
      action: 'Estudos, comunicação, negócios, clareza mental, defumações',
      evitar: ['Confusão', 'fofoca', 'mentiras', 'agitação excessiva'],
    },
  },
  {
    id: 'ether-element',
    name: 'Elemento Éter',
    category: 'elemental',
    intensity: 5,
    description: 'Conexão espiritual, elevação, transcendência, sabedoria divina.',
    correspondences: {
      chakras: ['6-Frontal', '7-Coronário'],
      orixas: ['Oxalá'],
      planetas: ['Sol'],
      sephiroth: ['Kether', 'Tiphereth'],
      elementos: ['Éter'],
      cores: ['Branco', 'Violeta', 'Dourado'],
    },
    recommendations: {
      action: 'Meditação profunda, oração, conexão com o Divino, elevação da consciência',
      evitar: ['Materialismo excessivo', 'vaidade', 'orgulho'],
    },
  },

  // Weekly cycle pattern
  {
    id: 'weekly-cycle',
    name: 'Ciclo Semanal Completo',
    category: 'week',
    intensity: 4,
    description: 'Percurso completo de transformação através dos sete dias.',
    correspondences: {
      chakras: ['1-Básico', '2-Sacro', '3-Plexo Solar', '4-Cardíaco', '5-Laríngeo', '6-Frontal', '7-Coronário'],
      orixas: ['Exu', 'Ogum', 'Iansã', 'Xangô', 'Oxóssi', 'Oxalá', 'Oxum', 'Iemanjá', 'Omolu'],
      planetas: ['Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno', 'Sol'],
      sephiroth: ['Malkuth', 'Yesod', 'Hod', 'Geburah', 'Chesed', 'Binah', 'Tiphereth', 'Kether'],
      elementos: ['Terra', 'Fogo', 'Água', 'Ar', 'Éter'],
      cores: ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul', 'Anil', 'Violeta'],
    },
    recommendations: {
      action: 'Seguir o percurso semanal de alinhamento: Segunda(Limpeza) → Terça(Movimento) → Quarta(Justiça) → Quinta(Expansão) → Sexta(Elevação) → Sábado(Magnetismo) → Domingo(Vitalidade)',
    },
  },

  // Monthly cycle pattern
  {
    id: 'monthly-cycle',
    name: 'Ciclo Mensal Lunar',
    category: 'month',
    intensity: 5,
    description: 'Percurso mensal de transformação através das fases da lua.',
    correspondences: {
      chakras: ['1-Básico', '3-Plexo Solar', '4-Cardíaco', '6-Frontal', '7-Coronário'],
      planetas: ['Lua', 'Sol'],
      sephiroth: ['Malkuth', 'Tiphereth', 'Yesod', 'Kether'],
      elementos: ['Terra', 'Fogo', 'Água', 'Éter'],
    },
    recommendations: {
      action: 'Lua Nova(Introspecção) → Crescente(Ação) → Cheia(Magia) → Minguante(Liberação). Seguir o fluxo lunar para maximizar a eficiência ritual.',
    },
  },
];

export function getPatterns(): EnergyPattern[] {
  return patterns;
}

export function getPatternById(id: string): EnergyPattern | undefined {
  return patterns.find((p) => p.id === id);
}
export function getPatternsByCategory(category: EnergyPattern['category']): EnergyPattern[] {
  return patterns.filter((p) => p.category === category);
}
export function getDayPattern(): EnergyPattern | undefined {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return getPatternById(today);
}
export function getLunarPattern(phase: 'new' | 'waxing' | 'full' | 'waning'): EnergyPattern | undefined {
  const phaseMap = {
    new: 'new-moon',
    waxing: 'waxing-moon',
    full: 'full-moon',
    waning: 'waning-moon',
  };
  return getPatternById(phaseMap[phase]);
}
export function getElementPattern(element: 'fire' | 'water' | 'earth' | 'air' | 'ether'): EnergyPattern | undefined {
  const elementMap = {
    fire: 'fire-element',
    water: 'water-element',
    earth: 'earth-element',
    air: 'air-element',
    ether: 'ether-element',
  };
  return getPatternById(elementMap[element]);
}
