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
    planets?: string[];
    sephiroth?: string[];
    elements?: string[];
    colors?: string[];
  };
  recommendations: {
    action: string;
    avoid?: string[];
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
      planets: ['Lua', 'Saturno'],
      sephiroth: ['Malkuth', 'Yesod'],
      elements: ['Terra', 'Fogo'],
      colors: ['Vermelho', 'Branco', 'Preto'],
    },
    recommendations: {
      action: 'Limpezas pesadas, corte de laços kármicos, ebós de caminho',
      avoid: ['Carne de porco', 'cachaça em excesso', 'andar na rua ao meio-dia ou meia-noite'],
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
      planets: ['Marte', 'Plutão'],
      sephiroth: ['Geburah'],
      elements: ['Fogo', 'Terra'],
      colors: ['Laranja', 'Vermelho'],
    },
    recommendations: {
      action: 'Rituais de banimento, quebra de demandas, ativação do movimento',
      avoid: ['Abóbora', 'caranguejo', 'inveja', 'mentiras'],
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
      planets: ['Mercúrio'],
      sephiroth: ['Hod'],
      elements: ['Fogo', 'Ar'],
      colors: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    },
    recommendations: {
      action: 'Estudos, estratégia de negócios, justiça, clareza mental',
      avoid: ['Carne de galo', 'mentiras', 'injustiça'],
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
      planets: ['Júpiter'],
      sephiroth: ['Chesed'],
      elements: ['Ar', 'Água'],
      colors: ['Verde', 'Azul-turquesa'],
    },
    recommendations: {
      action: 'Rituais de fartura, expansão de projetos, busca por conhecimento nas matas',
      avoid: ['Carne de caça', 'mel em excesso', 'teimosia'],
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
      planets: ['Vênus'],
      sephiroth: ['Kether'],
      elements: ['Ar', 'Luz'],
      colors: ['Branco', 'Marfim', 'Violeta'],
    },
    recommendations: {
      action: 'Conexão espiritual, Bori, pacificação total, gratidão',
      avoid: ['Bebidas alcoólicas', 'azeite de dendê', 'sal', 'roupas escuras'],
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
      planets: ['Saturno', 'Urano'],
      sephiroth: ['Binah', 'Tiphereth'],
      elements: ['Água'],
      colors: ['Rosa', 'Azul Escuro', 'Branco'],
    },
    recommendations: {
      action: 'Feitiçaria natural, magnetismo pessoal, banhos de Oxum/Iemanjá',
      avoid: ['Lama', 'poeira', 'caranguejo', 'passeios na praia em dias de Ossá'],
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
      planets: ['Sol'],
      sephiroth: ['Tiphereth'],
      elements: ['Fogo'],
      colors: ['Amarelo', 'Dourado'],
    },
    recommendations: {
      action: 'Recarregar vitalidade, irradiação do poder pessoal, alinhamento com o propósito',
      avoid: ['Inveja', 'teimosia extrema', 'abóbora'],
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
      planets: ['Lua', 'Saturno'],
      sephiroth: ['Malkuth', 'Yesod'],
      elements: ['Terra'],
      colors: ['Preto', 'Branco'],
    },
    recommendations: {
      action: 'Início de projetos secretos, firmezas de proteção profunda, assentamento de Exu',
      avoid: ['Exposição', 'decisões impulsivas', 'conflitos'],
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
      planets: ['Marte', 'Júpiter'],
      sephiroth: ['Geburah', 'Chesed'],
      elements: ['Fogo', 'Terra'],
      colors: ['Verde', 'Amarelo'],
    },
    recommendations: {
      action: 'Rituais de abertura de caminhos, banhos de prosperidade, atração',
      avoid: ['Procrastinação', 'energia estagnada'],
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
      planets: ['Sol', 'Lua', 'Vênus'],
      sephiroth: ['Tiphereth', 'Kether'],
      elements: ['Água', 'Luz'],
      colors: ['Branco', 'Azul', 'Rosa'],
    },
    recommendations: {
      action: 'Alta magia de atração, consagração, rituais de amor e cura de Ori',
      avoid: ['Conflitos', 'energia pesada', 'ebós de descarrego'],
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
      planets: ['Saturno', 'Marte'],
      sephiroth: ['Binah', 'Geburah'],
      elements: ['Terra', 'Fogo'],
      colors: ['Preto', 'Roxo', 'Laranja'],
    },
    recommendations: {
      action: 'Quebra de energias paradas, ebós de descarrego pesado, cura de vícios',
      avoid: ['Novos projetos', 'contratos', 'exposições públicas'],
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
      planets: ['Marte', 'Sol'],
      sephiroth: ['Geburah', 'Tiphereth'],
      elements: ['Fogo'],
      colors: ['Vermelho', 'Laranja', 'Amarelo'],
    },
    recommendations: {
      action: 'Rituais de transformação, quebra de bloqueios, ativação de coragem',
      avoid: ['Inveja', 'agressividade descontrolada', 'impulsividade'],
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
      planets: ['Lua', 'Vênus'],
      sephiroth: ['Binah', 'Chesed'],
      elements: ['Água'],
      colors: ['Azul', 'Branco', 'Rosa'],
    },
    recommendations: {
      action: 'Banhos sagrados, magia de amor, limpeza emocional, meditação nas águas',
      avoid: ['Confusão mental', 'emoções represadas', 'isolamento excessivo'],
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
      planets: ['Saturno'],
      sephiroth: ['Malkuth'],
      elements: ['Terra'],
      colors: ['Marrom', 'Preto', 'Branco'],
    },
    recommendations: {
      action: 'Aterramento, firmeza material, conexão com ancestrais, ebós de caminho',
      avoid: ['Inquietação', 'medo de escassez', 'instabilidade'],
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
      planets: ['Mercúrio'],
      sephiroth: ['Hod', 'Chesed'],
      elements: ['Ar'],
      colors: ['Amarelo', 'Azul-celeste'],
    },
    recommendations: {
      action: 'Estudos, comunicação, negócios, clareza mental, defumações',
      avoid: ['Confusão', 'fofoca', 'mentiras', 'agitação excessiva'],
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
      planets: ['Sol'],
      sephiroth: ['Kether', 'Tiphereth'],
      elements: ['Éter'],
      colors: ['Branco', 'Violeta', 'Dourado'],
    },
    recommendations: {
      action: 'Meditação profunda, oração, conexão com o Divino, elevação da consciência',
      avoid: ['Materialismo excessivo', 'vaidade', 'orgulho'],
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
      planets: ['Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno', 'Sol'],
      sephiroth: ['Malkuth', 'Yesod', 'Hod', 'Geburah', 'Chesed', 'Binah', 'Tiphereth', 'Kether'],
      elements: ['Terra', 'Fogo', 'Água', 'Ar', 'Éter'],
      colors: ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul', 'Anil', 'Violeta'],
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
      planets: ['Lua', 'Sol'],
      sephiroth: ['Malkuth', 'Tiphereth', 'Yesod', 'Kether'],
      elements: ['Terra', 'Fogo', 'Água', 'Éter'],
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