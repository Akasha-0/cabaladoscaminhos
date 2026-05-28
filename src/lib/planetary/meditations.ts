/**
 * Planetary Meditations
 * Guided meditations focused on planetary energies and archetypes
 */

export interface PlanetaryMeditation {
  id: string;
  title: string;
  planet: string;
  duration: number;
  audioUrl: string;
  description?: string;
  intention?: string;
}

const meditations: PlanetaryMeditation[] = [
  // Sol - Sun
  {
    id: "sol-vitalidade",
    title: "Chamas do Sol Interior",
    planet: "sol",
    duration: 600,
    audioUrl: "/audio/meditations/sol-vitalidade.mp3",
    description: " desperta a chama vital e a autoexpressão autêntica através da energia solar.",
    intention: "Vitalidade, propósito, confiança",
  },
  {
    id: "sol-reinvencao",
    title: "Renascimento Solar",
    planet: "sol",
    duration: 720,
    audioUrl: "/audio/meditations/sol-reinvencao.mp3",
    description: " Purifica e renova a essência através da luz dourada do sol.",
    intention: "Transformação, renovação, clareza",
  },
  {
    id: "sol-sabedoria",
    title: "Sabedoria do Sol",
    planet: "sol",
    duration: 480,
    audioUrl: "/audio/meditations/sol-sabedoria.mp3",
    description: " conecta com a sabedoria antiga e a inteligência solar.",
    intention: "Iluminação, sabedoria, discernimento",
  },

  // Lua - Moon
  {
    id: "lua-intuicao",
    title: "Lunar Intuição Profunda",
    planet: "lua",
    duration: 540,
    audioUrl: "/audio/meditations/lua-intuicao.mp3",
    description: " desperta a intuicão lunar e conecta com o inconsciente.",
    intention: "Intuição, sensibilidade, paz interior",
  },
  {
    id: "lua-sono",
    title: "Sono Lunar Reparador",
    planet: "lua",
    duration: 900,
    audioUrl: "/audio/meditations/lua-sono.mp3",
    description: " facilita o sono profundo através das energias da lua cheia.",
    intention: "Descanso, recuperação, sonhos",
  },
  {
    id: "lua-emocoes",
    title: "Ciclo Lunar Emocional",
    planet: "lua",
    duration: 660,
    audioUrl: "/audio/meditations/lua-emocoes.mp3",
    description: " harmoniza os ciclos emocionais com as fases da lua.",
    intention: "Equilíbrio emocional, acolhimento",
  },

  // Mercurio - Mercury
  {
    id: "mercurio-comunicacao",
    title: "Mensageiro de Mercúrio",
    planet: "mercurio",
    duration: 420,
    audioUrl: "/audio/meditations/mercurio-comunicacao.mp3",
    description: " aprimora a comunicação e a expressão verbal.",
    intention: "Comunicação, eloquência, aprendizado",
  },
  {
    id: "mercurio-mental",
    title: "Velocidade Mental",
    planet: "mercurio",
    duration: 360,
    audioUrl: "/audio/meditations/mercurio-mental.mp3",
    description: " acelera a mente e favorece a agilidade mental.",
    intention: "Foco, clareza mental, velocidade",
  },
  {
    id: "mercurio-curiosidade",
    title: "Explorador Cósmico",
    planet: "mercurio",
    duration: 480,
    audioUrl: "/audio/meditations/mercurio-curiosidade.mp3",
    description: " desperta a curiosidade e o desejo de aprendizado.",
    intention: "Curiosidade, sabedoria, adaptação",
  },

  // Venus
  {
    id: "venus-amor",
    title: "Essência de Vênus",
    planet: "venus",
    duration: 600,
    audioUrl: "/audio/meditations/venus-amor.mp3",
    description: " abre o coração ao amor universal e à beleza divina.",
    intention: "Amor, beleza, harmonia",
  },
  {
    id: "venus-abundancia",
    title: "Jardins de Vênus",
    planet: "venus",
    duration: 540,
    audioUrl: "/audio/meditations/venus-abundancia.mp3",
    description: " atrai abundância e prosperidade através da energia venusiana.",
    intention: "Abundância, gratidão, magnetismo",
  },
  {
    id: "venus-relacoes",
    title: "União Planetária",
    planet: "venus",
    duration: 720,
    audioUrl: "/audio/meditations/venus-relacoes.mp3",
    description: " fortalece os laços afetivos e a conexão com outros.",
    intention: "Relacionamentos, empatia, conexão",
  },

  // Marte - Mars
  {
    id: "marte-coragem",
    title: "Fogo de Marte",
    planet: "marte",
    duration: 480,
    audioUrl: "/audio/meditations/marte-coragem.mp3",
    description: " desperta a coragem e a determinação através da energia marciana.",
    intention: "Coragem, ação, determinação",
  },
  {
    id: "marte-protecao",
    title: "Guerreiro Protetor",
    planet: "marte",
    duration: 540,
    audioUrl: "/audio/meditations/marte-protecao.mp3",
    description: " fortalece a energia protetora e o poder pessoal.",
    intention: "Proteção, força, assertividade",
  },
  {
    id: "marte-paixao",
    title: "Chamas da Paixão",
    planet: "marte",
    duration: 420,
    audioUrl: "/audio/meditations/marte-paixao.mp3",
    description: " desperta a paixão e o desejo de ação.",
    intention: "Paixão, vitalidade, iniciativa",
  },

  // Jupiter
  {
    id: "jupiter-expansao",
    title: "Expansão Joviana",
    planet: "jupiter",
    duration: 600,
    audioUrl: "/audio/meditations/jupiter-expansao.mp3",
    description: " expande a consciência e abre portas para novas oportunidades.",
    intention: "Expansão, abundância, otimismo",
  },
  {
    id: "jupiter-sabedoria",
    title: "Filosofia Cósmica",
    planet: "jupiter",
    duration: 720,
    audioUrl: "/audio/meditations/jupiter-sabedoria.mp3",
    description: " conecta com a sabedoria filosófica e espiritual.",
    intention: "Sabedoria, visão, propósito",
  },
  {
    id: "jupiter-sorte",
    title: "Jornada da Fortuna",
    planet: "jupiter",
    duration: 480,
    audioUrl: "/audio/meditations/jupiter-sorte.mp3",
    description: " alinha com a energia da sorte e das bênçãos.",
    intention: "Sorte, prosperidade, fé",
  },

  // Saturno - Saturn
  {
    id: "saturno-disciplina",
    title: "Mestre Saturniano",
    planet: "saturno",
    duration: 600,
    audioUrl: "/audio/meditations/saturno-disciplina.mp3",
    description: " fortalece a disciplina e a perseverança.",
    intention: "Disciplina, paciência, maturidade",
  },
  {
    id: "saturno-karma",
    title: "Libertação Kármica",
    planet: "saturno",
    duration: 900,
    audioUrl: "/audio/meditations/saturno-karma.mp3",
    description: " trabalha a libertação de padrões kármicos.",
    intention: "Libertação, cura, renovação",
  },
  {
    id: "saturno-estrutura",
    title: "Fundação Sólida",
    planet: "saturno",
    duration: 540,
    audioUrl: "/audio/meditations/saturno-estrutura.mp3",
    description: " constrói bases sólidas para objetivos de longo prazo.",
    intention: "Estrutura, organização, compromisso",
  },

  // Urano - Uranus
  {
    id: "urano-inovacao",
    title: "Gênesis Urânio",
    planet: "urano",
    duration: 480,
    audioUrl: "/audio/meditations/urano-inovacao.mp3",
    description: " desperta a energia da inovação e da originals.",
    intention: "Inovação, originalidade, liberdade",
  },
  {
    id: "urano-despertar",
    title: "Despertar da Awakened",
    planet: "urano",
    duration: 660,
    audioUrl: "/audio/meditations/urano-despertar.mp3",
    description: " acelera o despertar espiritual e a iluminação.",
    intention: "Despertar, evolução, transcendência",
  },
  {
    id: "urano-libertacao",
    title: "Libertação Elétrica",
    planet: "urano",
    duration: 420,
    audioUrl: "/audio/meditations/urano-libertacao.mp3",
    description: " quebra correntes e liberta de padrões limiting.",
    intention: "Libertação, autonomia, mudança",
  },

  // Netuno - Neptune
  {
    id: "netuno-sonhos",
    title: "Oceano de Netuno",
    planet: "netuno",
    duration: 720,
    audioUrl: "/audio/meditations/netuno-sonhos.mp3",
    description: " navega pelos mares do inconsciente e dos sonhos.",
    intention: "Sonhos, imaginação, dissolução",
  },
  {
    id: "netuno-espiritual",
    title: "Unidade Cósmica",
    planet: "netuno",
    duration: 900,
    audioUrl: "/audio/meditations/netuno-espiritual.mp3",
    description: " conecta com a consciência universal e o divino.",
    intention: "Espiritualidade, compaixão, unity",
  },
  {
    id: "netuno-inspiracao",
    title: "Musa Celeste",
    planet: "netuno",
    duration: 540,
    audioUrl: "/audio/meditations/netuno-inspiracao.mp3",
    description: " desperta a inspiração criativa e artística.",
    intention: "Criatividade, inspiração, sensibilidade",
  },

  // Plutão - Pluto
  {
    id: "plutao-transformacao",
    title: "Fênix de Plutão",
    planet: "plutao",
    duration: 720,
    audioUrl: "/audio/meditations/plutao-transformacao.mp3",
    description: " facilita a transformação profunda e o renascimento.",
    intention: "Transformação, regeneração, poder",
  },
  {
    id: "plutao-profundeza",
    title: "Abismo Regenerador",
    planet: "plutao",
    duration: 840,
    audioUrl: "/audio/meditations/plutao-profundeza.mp3",
    description: " mergulha nas profundezas para cura e regeneração.",
    intention: "Healing, regeneração, escuridão criativa",
  },
  {
    id: "plutao-poder",
    title: "Poder Plutoniano",
    planet: "plutao",
    duration: 600,
    audioUrl: "/audio/meditations/plutao-poder.mp3",
    description: " acessa o poder de transformação e manipulação de recursos.",
    intention: "Poder pessoal, influência, controle",
  },
];

/**
 * Get all planetary meditations
 */
export function getMeditations(): PlanetaryMeditation[] {
  return meditations;
}

/**
 * Get meditations by planet
 */
export function getMeditationsByPlanet(planet: string): PlanetaryMeditation[] {
  return meditations.filter((m) => m.planet === planet);
}

/**
 * Get meditation by ID
 */
export function getMeditationById(id: string): PlanetaryMeditation | undefined {
  return meditations.find((m) => m.id === id);
}

/**
 * Get all available planets with meditations
 */
export function getPlanets(): string[] {
  return Array.from(new Set(meditations.map((m) => m.planet)));
}