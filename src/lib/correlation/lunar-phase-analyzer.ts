export interface LunarPhase {
  name: 'Lua Nova' | 'Lua Crescente' | 'Lua Cheia' | 'Lua Minguante';
  state: {
    psychic: string;
    description: string;
  };
  window: {
    start: string;
    end: string;
    description: string;
  };
  ritual: {
    type: string;
    orixas: string[];
    mesaReal: string[];
    description: string;
  };
}

export const LUNAR_PHASES: Record<string, LunarPhase> = {
  "Lua Nova": {
    name: "Lua Nova",
    state: {
      psychic: "Introspecção, silêncio, planejamento invisível",
      description: "Momento de recuo interno, ideal para reflexão e planejamento de projetos secretos.",
    },
    window: {
      start: "00:00",
      end: "03:00",
      description: "Hora Astrológica - energia de renovação e início.",
    },
    ritual: {
      type: "Início de projetos secretos, firmezas de proteção profunda, assentamento de Exu",
      orixas: ["Exu", "Omolu", "Ogum"],
      mesaReal: ["Casa 1 (O Cavaleiro)", "Casa 26 (O Livro)"],
      description: "O potencial que está oculto pode ser manifesto.",
    },
  },
  "Lua Crescente": {
    name: "Lua Crescente",
    state: {
      psychic: "Foco, ação disciplinada, força de vontade",
      description: "Energia ascendente, ideal para iniciar ventures e fortalecer intenções.",
    },
    window: {
      start: "06:00",
      end: "12:00",
      description: "Amanhecer ao Zênite - período de crescimento.",
    },
    ritual: {
      type: "Rituais de abertura de caminhos comerciais, banhos de prosperidade e atração",
      orixas: ["Oxóssi", "Ogum", "Xangô"],
      mesaReal: ["Casa 13 (A Criança)", "Casa 34 (Os Peixes)"],
      description: "O crescimento do fluxo financeiro e de oportunidades.",
    },
  },
  "Lua Cheia": {
    name: "Lua Cheia",
    state: {
      psychic: "Expansão áurica máxima, magnetismo, êxtase",
      description: "Pico de energia lunar, ideal para magia de alta potência.",
    },
    window: {
      start: "18:00",
      end: "00:00",
      description: "Ascensão da Lua - momento de máxima receptividade.",
    },
    ritual: {
      type: "Alta magia de atração, consagração de patuás, boris, rituais de amor e cura de Ori",
      orixas: ["Oxalá", "Oxum", "Iemanjá"],
      mesaReal: ["Casa 16 (A Estrela)", "Casa 31 (O Sol)"],
      description: "O ápice do sucesso e brilho pessoal.",
    },
  },
  "Lua Minguante": {
    name: "Lua Minguante",
    state: {
      psychic: "Desapego, austeridade, banimento consciente",
      description: "Energia de descarte e limpeza, ideal para banimentos.",
    },
    window: {
      start: "12:00",
      end: "18:00",
      description: "Ocaso Solar - período de liberação.",
    },
    ritual: {
      type: "Quebra de energias paradas, ebós de descarrego pesado, cura de vícios e doenças",
      orixas: ["Omolu", "Nanã", "Iansã"],
      mesaReal: ["Casa 8 (O Caixão)", "Casa 10 (A Foice)"],
      description: "O encerramento definitivo de ciclos.",
    },
  },
};

export function getLunarPhase(date: Date): LunarPhase {
  // Simple calculation based on moon cycle
  // This is a simplified version - a real implementation would use astronomical data
  const dayOfMonth = date.getDate();

  if (dayOfMonth <= 3) return LUNAR_PHASES["Lua Nova"];
  if (dayOfMonth <= 7) return LUNAR_PHASES["Lua Crescente"];
  if (dayOfMonth <= 10) return LUNAR_PHASES["Lua Cheia"];
  if (dayOfMonth <= 13) return LUNAR_PHASES["Lua Minguante"];
  if (dayOfMonth <= 17) return LUNAR_PHASES["Lua Nova"];
  if (dayOfMonth <= 21) return LUNAR_PHASES["Lua Crescente"];
  if (dayOfMonth <= 24) return LUNAR_PHASES["Lua Cheia"];
  if (dayOfMonth <= 28) return LUNAR_PHASES["Lua Minguante"];
  return LUNAR_PHASES["Lua Nova"];
}

export function getPhaseForRitual(intent: 'protection' | 'abundance' | 'love' | 'cleansing' | 'manifestation'): LunarPhase {
  switch (intent) {
    case 'protection':
    case 'cleansing':
      return LUNAR_PHASES["Lua Minguante"];
    case 'abundance':
    case 'manifestation':
      return LUNAR_PHASES["Lua Crescente"];
    case 'love':
      return LUNAR_PHASES["Lua Cheia"];
    default:
      return LUNAR_PHASES["Lua Cheia"];
  }
}

export function getRitualGuidance(phase: LunarPhase, intent: string): {
  timing: string;
  orixas: string[];
  herbs: string[];
  colors: string[];
  affirmation: string;
} {
  return {
    timing: `${phase.window.start} às ${phase.window.end}`,
    orixas: phase.ritual.orixas,
    herbs: getHerbsByPhase(phase.name),
    colors: getColorsByPhase(phase.name),
    affirmation: getAffirmationByPhase(phase.name, intent),
  };
}

function getHerbsByPhase(phaseName: string): string[] {
  const herbs: Record<string, string[]> = {
    "Lua Nova": ["Guiné", "Pinhão Roxo", "Arruda"],
    "Lua Crescente": ["Alecrim", "Canela", "Louro"],
    "Lua Cheia": ["Rosa Branca", "Colônia", "Calêndula"],
    "Lua Minguante": ["Boldo", "Saião", "Alfazema"],
  };
  return herbs[phaseName] || [];
}

function getColorsByPhase(phaseName: string): string[] {
  const colors: Record<string, string[]> = {
    "Lua Nova": ["Preto", "Branco", "Vermelho"],
    "Lua Crescente": ["Verde", "Amarelo", "Dourado"],
    "Lua Cheia": ["Branco", "Azul", "Rosa"],
    "Lua Minguante": ["Roxo", "Lilás", "Violeta"],
  };
  return colors[phaseName] || [];
}

function getAffirmationByPhase(phaseName: string, intent: string): string {
  const affirmations: Record<string, string> = {
    "Lua Nova": `Eu abro espaço para o novo. Minha intenção de ${intent} está sendo plantada nas fundações do universo.`,
    "Lua Crescente": `Minha energia cresce como a lua. Cada dia traz mais ${intent} para minha vida.`,
    "Lua Cheia": `Minha luz brilha intensamente. O universo conspira para manifestar ${intent} em minha realidade.`,
    "Lua Minguante": `Eu libero o que não serve. A lua带走 meu medo de ${intent} e me restaura.`,
  };
  return affirmations[phaseName] || affirmations["Lua Cheia"];
}

export function getOptimalRitualTime(phase: LunarPhase): {
  start: string;
  end: string;
  reason: string;
} {
  return {
    start: phase.window.start,
    end: phase.window.end,
    reason: phase.window.description,
  };
}