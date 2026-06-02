// Chart interpretations - Natal chart, aspects, and element analysis

export interface ChartInterpretation {
  planet?: string;
  sign?: string;
  house?: number;
  aspect?: string;
  element?: string;
  title: string;
  summary: string;
  description: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  guidance: string[];
}

export interface PlanetInterpretation {
  planet: string;
  positions: Record<string, PlanetPositionInterpretation>;
}

export interface PlanetPositionInterpretation {
  title: string;
  description: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  spiritualLesson: string;
}

export interface AspectInterpretation {
  aspect: string;
  name: string;
  description: string;
  meaning: string;
  positive: string[];
  challenging: string[];
  integration: string;
}

export interface ElementInterpretation {
  element: string;
  title: string;
  description: string;
  traits: string[];
  balance: {
    balanced: string[];
    deficient: string[];
    excessive: string[];
  };
  recommendations: string[];
}

export interface SignInterpretation {
  sign: string;
  title: string;
  element: string;
  modality: string;
  ruler: string;
  description: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  growthAreas: string[];
}

export interface HouseInterpretation {
  house: number;
  title: string;
  sphere: string;
  description: string;
  keywords: string[];
  lifeThemes: string[];
}

// Planet meanings by sign
const PLANET_IN_SIGN: Record<string, Record<string, PlanetPositionInterpretation>> = {
  sol: {
    aries: {
      title: "Sol em Áries",
      description: "Líder nato com energia pioneira e coragem innata. Expressa-se com vigor, iniciativa e paixão.",
      keywords: ["pioneiro", "corajoso", "espontâneo", "independente", "ambicioso"],
      strengths: ["Iniciativa natural", "Coragem para enfrentar desafios", "Energia renovável", "Liderança autêntica"],
      challenges: ["Impaciência", "Egocentrismo", "Competitividade excessiva", "Impulsividade"],
      spiritualLesson: "Canalizar a energia de Aries com sabedoria, usando a coragem para servir o bem maior."
    },
    touro: {
      title: "Sol em Touro",
      description: "Estável e persistente com forte conexão com a natureza e valores materiais.",
      keywords: ["estável", "persistente", "prático", "devotado", "sensual"],
      strengths: ["Determinação inabalável", "Paciência infinita", "Sensibilidade artística", "Lealdade profunda"],
      challenges: ["Teimosia", "Possessividade", "Resistência a mudanças", "Materialismo"],
      spiritualLesson: "Aprender que a verdadeira segurança vem do interior, não de possessões externas."
    },
    gemeos: {
      title: "Sol em Gêmeos",
      description: "Comunicador versátil com mente ágil e curiosidade insaciável pelo mundo.",
      keywords: ["versátil", "curioso", "comunicativo", "adaptável", "intelectual"],
      strengths: ["Versatilidade mental", "Habilidades de comunicação", "Curiosidade vibrante", "Adaptabilidade social"],
      challenges: ["Inconsistência", "Superficialidade", "Nervosismo", "Dificuldade de compromisso"],
      spiritualLesson: "Integrar a dualidade interior e encontrar uma voz autêntica além da multiplicidade."
    },
    cancer: {
      title: "Sol em Câncer",
      description: "Guardião emocional com intuição profunda e forte conexão com lar e família.",
      keywords: ["nurturing", "intuitivo", "emotivo", "protetor", "doméstico"],
      strengths: ["Intuição poderosa", "Empatia profunda", "Lealdade familiar", "Memória excepcional"],
      challenges: ["Vulnerabilidade emocional", "Mau humor", "Manipulação", "Fixação no passado"],
      spiritualLesson: "Transcender as emoções pessoais para acessar a sabedoria do coração coletivo."
    },
    leao: {
      title: "Sol em Leão",
      description: "Criativo e generoso com necessidade de expressão criativa e reconhecimento.",
      keywords: ["criativo", "generoso", "dramático", "confiante", "carismático"],
      strengths: ["Criatividade magnética", "Generosidade magnânima", "Confiança inspiradora", "Liderança carismática"],
      challenges: ["Ego膨胀", "Necessidade de aprovação", "Dramatização", "Orgulho"],
      spiritualLesson: "Descobrir que o verdadeiro brilho vem da luz interior, não da validação externa."
    },
    virgem: {
      title: "Sol em Virgem",
      description: "Prático e analítico com atenção meticulosa aos detalhes e desejo de servir.",
      keywords: ["analítico", "prático", "organizado", "servicial", "discriminado"],
      strengths: ["Análise precisa", "Pragmatismo útil", "Organização", "Serviço dedicação"],
      challenges: ["Perfeccionismo", "Crítica excesiva", "Ansiedade", "Obsessão por detalhes"],
      spiritualLesson: "Aceitar a imperfeição como parte do plano divino eperder a necessidade de controlar."
    },
    libra: {
      title: "Sol em Libra",
      description: "Diplomático e harmonioso com forte senso de justiça e necessidade de parceria.",
      keywords: ["diplomático", "harmonioso", "artístico", "social", "justo"],
      strengths: ["Sentido de justiça aguçado", "Habilidades diplomáticas", "Sensibilidade estética", "Equilíbrio natural"],
      challenges: ["Indecisão", "Superficialidade", "Conflito de prioridades", "Evitação de confrontos"],
      spiritualLesson: "Tomar decisões difíceis mantendo a harmonia interior, mesmo quando sozinho."
    },
    escorpio: {
      title: "Sol em Escorpião",
      description: "Transformador intenso com profundidade emocional e poder de regeneração.",
      keywords: ["intenso", "transformador", "penetrante", "regenerador", "místico"],
      strengths: ["Capacidade de transformação", "Intuição emocional", "Foco inabalável", "Coragem para enfrentar sombras"],
      challenges: ["Ciúme", "Manipulação", "Obsessão", "Resistência a ceder"],
      spiritualLesson: "Entregar-se ao fluxo da vida, confiando que a morte do ego traz ressurreição."
    },
    sagitario: {
      title: "Sol em Sagitário",
      description: "Explorador filosófico com visão otimista e busca constante por significado.",
      keywords: ["aventureiro", "filosófico", "otimista", "inspirador", "livre"],
      strengths: ["Visão ampla", "Otimismo contagious", "Sabedoria intuitiva", "Amor pela liberdade"],
      challenges: ["Excesso de confiança", "Impaciência", "Superficialidade filosófica", "Irresponsabilidade"],
      spiritualLesson: "Integrar a sabedoria interior com a jornada exterior, evitando apenas buscar respostas distantes."
    },
    capricornio: {
      title: "Sol em Capricórnio",
      description: "Ambiçioso e disciplinado com foco em realizações concretas e estrutura.",
      keywords: ["disciplinado", "ambicioso", "responsável", "pragmático", "paciente"],
      strengths: ["Disciplina inabalável", "Visão de longo prazo", "Responsabilidade", "Pragmatismo eficaz"],
      challenges: ["Pessimismo", "Rigor excessivo", "Falta de spontaneidade", "Materialismo"],
      spiritualLesson: "Reconhecer que o sucesso verdadeiro inclui a alma, não apenas a carreira."
    },
    aquario: {
      title: "Sol em Aquário",
      description: "Visionário humanitário com originalidade única e compromisso com a coletividade.",
      keywords: ["visionário", "original", "humanitário", "independente", "progressista"],
      strengths: ["Pensamento original", "Visão de futuro", "Compromisso social", "Abertura mental"],
      challenges: ["Detachment emocional", "Rebeldia destructiva", "Inconsistência", "Egocentrismo disfarçado"],
      spiritualLesson: "Combinar a conexão com a humanidade com o amor pelos que estão próximos."
    },
    peixes: {
      title: "Sol em Peixes",
      description: "Místico sonhador com compaixão profunda e conexão espiritual universal.",
      keywords: ["místico", "compassivo", "artístico", "intuitivo", "sacrificial"],
      strengths: ["Compaixão universal", "Intuição espiritual", "Criatividade elevada", "Conexão com o invisível"],
      challenges: ["Fuga da realidade", "Confusão", "Codependência", "Dissipação de energia"],
      spiritualLesson: "Ancorar a espiritualidade na realidade terrena enquanto se mantém a visão do divino."
    }
  }
};

// Aspect interpretations
const ASPECT_INTERPRETATIONS: Record<string, AspectInterpretation> = {
  conjunção: {
    aspect: "conjunção",
    name: "Conjunção (0°)",
    description: "Fusão de energias onde dois planetas trabalham juntos como uma única força.",
    meaning: "Intensifica e unifica as energias planetárias, criando foco e clareza de propósito.",
    positive: ["Fortalecimento mútuo", "Clareza de propósito", "Foco intensificado", "Potencial para gênio"],
    challenging: ["Exagero das qualidades", "Tensão interna", "Fixação em uma área"],
    integration: "Use a energia conjunta com consciência para manifestar seu potencial máximo."
  },
  oposição: {
    aspect: "oposição",
    name: "Oposição (180°)",
    description: "Tensão entre forças opostas que busca equilíbrio e integração.",
    meaning: "Cria consciência das polaridades através do confronto com o outro, promovendo crescimento.",
    positive: ["Consciência de polaridades", "Capacidade de ver ambos os lados", "Projeção interpessoal", "Crescimento através de confronto"],
    challenging: ["Tensão binária", "Projeção", "Indecisão", "Relações tensas"],
    integration: "Busque o ponto médio entre as polaridades, honrando ambas as necessidades."
  },
  quadratura: {
    aspect: "quadratura",
    name: "Quadratura (90°)",
    description: "Tensão dinâmica que impulsa mudança e evolução através do conflito.",
    meaning: "Cria desafio que demanda ação corretiva, gerando evolução através do trabalho.",
    positive: ["Motor de evolução", "Energia dinâmica", "Consciência de problemas", "Motivação para mudança"],
    challenging: ["Estresse crônico", "Frustração", "Conflito interno", "Sindrome de quadratura"],
    integration: "Canalize a tensão em ação construtiva, transformando desafio em evolução."
  },
  trino: {
    aspect: "trino",
    name: "Trino (120°)",
    description: "Fluxo harmonioso de energias que coopera naturalmente.",
    meaning: "Facilita a expressão easeosa das qualidades planetárias, trazendo sorte e facilidade.",
    positive: ["Fluidez natural", "Talento inato", "Sorte em área", "Harmonia sem esforço"],
    challenging: ["Complacência", "Falta de estímulo", "Excesso de facilidade", "Superficialidade"],
    integration: "Agradeça a facilidade mas busque desafios para evoluir além do conforto."
  },
  sextil: {
    aspect: "sextil",
    name: "Sextil (60°)",
    description: "Oportunidade harmônica que convida ao crescimento através da cooperação.",
    meaning: "Cria possibilidades de desenvolvimento que requerem escolha consciente para serem realizadas.",
    positive: ["Oportunidades", "Cooperação", "Potencial para crescimento", "Facilidades não usadas"],
    challenging: ["Passividade", "Não aproveitamento", "Falta de iniciativa", "Oportunidades desperdiçadas"],
    integration: "Aproveite as oportunidades com iniciativa, transformando potencial em realidade."
  }
};

// Element interpretations
const ELEMENT_INTERPRETATIONS: Record<string, ElementInterpretation> = {
  fogo: {
    element: "fogo",
    title: "Elemento Fogo",
    description: "Energia de transformação, passion e ação espontânea. Representa inspiração, criatividade e a centelha divina.",
    traits: ["Inspiração", "Entusiasmo", "Coragem", "Criatividade", "Liderança", "Idealismo"],
    balance: {
      balanced: ["Equilíbrio entre ação e reflexão", "Coragem sem rashbez", "Criatividade focada", "Liderança inspiradora"],
      deficient: ["Falta de iniciativa", "Apatia", "Medo de agir", "Pouca passion"],
      excessive: ["Impulsividade", "Explosões emocionales", "Arrogância", "Irritabilidade"]
    },
    recommendations: ["Pratique atividades físicas regulares", "Expresse sua criatividade diariamente", "Busque momentos de silêncio para refletir"]
  },
  terra: {
    element: "terra",
    title: "Elemento Terra",
    description: "Energia de solidez, praticidade e conexão com o mundo material. Representa estabilidade, segurança e manifestação.",
    traits: ["Pragmatismo", "Estabilidade", "Confiabilidade", "Paciência", "Sensatez", "Realismo"],
    balance: {
      balanced: ["Praticidade com visão", "Estabilidade sem rigidez", "Trabalho produtivo", "Realismo com esperança"],
      deficient: ["Incapacidade de concretizar", "Instabilidade", "Impaciência", "Desconexão com o corpo"],
      excessive: ["Materialismo", "Rigidez", "Teimosia", "Resistência a mudanças"]
    },
    recommendations: ["Pratique atividades grounding daily", "Trabalhe com as mãos", "Valorize o suficiente em vez do excessivo"]
  },
  ar: {
    element: "ar",
    title: "Elemento Ar",
    description: "Energia de comunicação, intellect e conexão social. Representa ideias, relacionamentos e intercambio.",
    traits: ["Intelecto", "Comunicação", "Socialização", "Curiosidade", "Objectividade", "Versatilidade"],
    balance: {
      balanced: ["Intelecto com coração", "Comunicação significativa", "Socialização autêntica", "Curiosidade focada"],
      deficient: ["Isolamento", "Dificuldade de comunicação", "Rigidez mental", "Falta de conexão"],
      excessive: ["Superficialidade", "Excesso de análisis", "Disconnection emocional", "Fuga de realidades"]
    },
    recommendations: ["Pratique meditação para quietar a mente", "Cultive relacionamentos profundos", "Trabalhe com ideias concretas"]
  },
  agua: {
    element: "agua",
    title: "Elemento Água",
    description: "Energia de emoção, intuição e conexão espiritual. Representa o inconsciente, sentimentos e compaixão.",
    traits: ["Intuição", "Compaixão", "Empatia", "Criatividade", "Sensibilidade", "Espiritualidade"],
    balance: {
      balanced: ["Empatia com limites", "Intuição com análise", "Sensibilidade com força", "Conexão sem fusão"],
      deficient: ["Embotamento emocional", "Falta de intuição", "Dificuldade de conexão", "Rigidez coração"],
      excessive: ["Codependência", "Fuga emocional", "Sensibilidade excesiva", "Perda de límites"]
    },
    recommendations: ["Pratique o autocuidado emocional", "Estabeleça límites saudáveis", "Honre sua intuição diariamente"]
  }
};

// Sign interpretations
const SIGN_INTERPRETATIONS: Record<string, SignInterpretation> = {
  aries: {
    sign: "aries",
    title: "Áries",
    element: "fogo",
    modality: "cardinal",
    ruler: "Marte",
    description: "O primeiro signo do zodíaco representa o inicio, a ação e a coragem pioneira.",
    keywords: ["iniciativa", "coragem", "liderança", "pioneirismo", "energia"],
    strengths: ["Iniciativa", "Coragem", "Honestidade", "Entusiasmo", "Liderança natural"],
    challenges: ["Impaciência", "Egocentrismo", "Competitividade", "Impulsividade"],
    growthAreas: ["Paciência", "Escuta ativa", "Consideração pelos outros", "Estratégia"]
  },
  touro: {
    sign: "touro",
    title: "Touro",
    element: "terra",
    modality: "fixo",
    ruler: "Vênus",
    description: "Signo de estabilidade e prazer sensorial, representando a força da terra e a beleza.",
    keywords: ["estabilidade", "prazer", "persistência", "beleza", "segurança"],
    strengths: ["Confiabilidade", "Paciência", "Devoção", "Sensibilidade artística", "Pragmatismo"],
    challenges: ["Teimosia", "Possessividade", "Resistência a mudanças", "Luxúria"],
    growthAreas: ["Flexibilidade", "Abertura a novas experiências", "Liberação de apegos"]
  },
  gemeos: {
    sign: "gemeos",
    title: "Gêmeos",
    element: "ar",
    modality: "mutável",
    ruler: "Mercúrio",
    description: "Signo da comunicação e versatility, representando a dualidade e a curiosidade.",
    keywords: ["comunicação", "versatilidade", "curiosidade", "adaptabilidade", "intelecto"],
    strengths: ["Comunicador nato", "Versatilidade", "Curiosidade", "Humor", "Aprendizado rápido"],
    challenges: ["Inconsistência", "Superficialidade", "Nervosismo", "Superficialidade emocional"],
    growthAreas: ["Profundidade", "Foco", "Compromisso", "Consciência emocional"]
  },
  cancer: {
    sign: "cancer",
    title: "Câncer",
    element: "água",
    modality: "cardinal",
    ruler: "Lua",
    description: "Signo da emoção e do cuidado, representando a sabedoria do coração e a proteção.",
    keywords: ["emoção", "cuidado", "intuição", "lar", "memória"],
    strengths: ["Empatia profunda", "Lealdade", "Intuição poderosa", "Criatividade emocional", "Proteção"],
    challenges: ["Vulnerabilidade", "Mudanças de humor", "Manipulação", "Fixação no passado"],
    growthAreas: ["Autoafé", "Objektividade emocional", "Liberação de mágoas", "Fortalecimento interior"]
  },
  leao: {
    sign: "leao",
    title: "Leão",
    element: "fogo",
    modality: "fixo",
    ruler: "Sol",
    description: "Signo do brilho e da criatividade, representando o sol e a expressão pessoal.",
    keywords: ["criatividade", "orgulho", "generosidade", "liderança", "dramatismo"],
    strengths: ["Criatividade", "Generosidade", "Confiança", "Liderança carismática", "Calor humano"],
    challenges: ["Orgulho", "Necessidade de aprovação", "Dramatização", "Ego"],
    growthAreas: ["Humildade", "Escuta", "Generosidade sem expectativa", "Valorização intrínseca"]
  },
  virgem: {
    sign: "virgem",
    title: "Virgem",
    element: "terra",
    modality: "mutável",
    ruler: "Mercúrio",
    description: "Signo do serviço e da análise, representando a discriminação e a utilidade.",
    keywords: ["serviço", "análise", "organização", "saúde", "pragmatismo"],
    strengths: ["Análise precisa", "Organização", "Serviço dedicado", "Pragmatismo", "Perfeccionismo útil"],
    challenges: ["Perfeccionismo", "Crítica", "Ansiedade", "Obsessão por detalhes"],
    growthAreas: ["Aceitação da imperfeição", "Autocompaixão", "Visão do quadro geral", "Relaxamento"]
  },
  libra: {
    sign: "libra",
    title: "Libra",
    element: "ar",
    modality: "cardinal",
    ruler: "Vênus",
    description: "Signo das relações e da harmonia, representando o equilíbrio e a justiça.",
    keywords: ["harmonia", "relacionamento", "justiça", "diplomacia", "beleza"],
    strengths: ["Diplomacia", "Sentido de justiça", "Charm", "Parceria", "Sensibilidade estética"],
    challenges: ["Indecisão", "Superficialidade", "Conflito interno", "Aversão a confrontos"],
    growthAreas: ["Decisão", "Assertividade", "Confronto construtivo", "Independência"]
  },
  escorpiao: {
    sign: "escorpiao",
    title: "Escorpião",
    element: "água",
    modality: "fixo",
    ruler: "Plutão",
    description: "Signo da transformação e do mistério, representando a regeneração e o poder.",
    keywords: ["transformação", "intensidade", "mistério", "regeneração", "poder"],
    strengths: ["Capacidade de transformação", "Foco", "Intuição emocional", "Coragem para sombras", "Regeneração"],
    challenges: ["Ciúme", "Manipulação", "Obsessão", "Vingança"],
    growthAreas: ["Entrega", "Confiança", "Perdão", "Liberação de controle"]
  },
  sagitario: {
    sign: "sagitario",
    title: "Sagitário",
    element: "fogo",
    modality: "mutável",
    ruler: "Júpiter",
    description: "Signo da expansão e da sabedoria, representando a busca por significado e a liberdade.",
    keywords: ["expansão", "sabedoria", "liberdade", "otimismo", "filosofia"],
    strengths: ["Visão ampla", "Otimismo", "Filosofia", "Aventureirismo", "Inspiração"],
    challenges: ["Excesso de confiança", "Impaciência", "Superficialidade filosófica", "Irresponsabilidade"],
    growthAreas: ["Humildade", "Profundidade", "Responsabilidade", "Presente"]
  },
  capricornio: {
    sign: "capricornio",
    title: "Capricórnio",
    element: "terra",
    modality: "cardinal",
    ruler: "Saturno",
    description: "Signo da ambição e da disciplina, representando a estrutura e a realização.",
    keywords: ["ambição", "disciplina", "estrutura", "responsabilidade", "realização"],
    strengths: ["Disciplina", "Responsabilidade", "Visão de longo prazo", "Pragmatismo", "Resiliência"],
    challenges: ["Pessimismo", "Rigidez", "Materialismo", "Falta de spontaneidade"],
    growthAreas: ["Autocompaixão", "Flexibilidade", "Jogo", "Valorização do processo"]
  },
  aquario: {
    sign: "aquario",
    title: "Aquário",
    element: "ar",
    modality: "fixo",
    ruler: "Urano",
    description: "Signo da originalidade e do humanitarismo, representando a inovação e a fraternidade.",
    keywords: ["originalidade", "humanitarismo", "inovação", "independência", "futuro"],
    strengths: ["Originalidade", "Visão de futuro", "Humanitarismo", "Independência", "Progressismo"],
    challenges: ["Detachment", "Rebeldia", "Inconsistência emocional", "Egocentrismo"],
    growthAreas: ["Conexão emocional", "Humildade", "Integração social", "Compaixão pessoal"]
  },
  peixes: {
    sign: "peixes",
    title: "Peixes",
    element: "água",
    modality: "mutável",
    ruler: "Netuno",
    description: "Signo da espiritualidade e da compaixão, representando a conexão universal e os sonhos.",
    keywords: ["espiritualidade", "compaixão", "sonhos", "intuição", "misticismo"],
    strengths: ["Compaixão universal", "Intuição espiritual", "Criatividade elevada", "Conexão com o invisível", "Empatia"],
    challenges: ["Fuga da realidade", "Confusão", "Codependência", "Dissipação"],
    growthAreas: ["Ancoragem", "Limites", "Discriminação", "Presença terrena"]
  }
};

// House interpretations
const HOUSE_INTERPRETATIONS: Record<number, HouseInterpretation> = {
  1: {
    house: 1,
    title: "Primeira Casa",
    sphere: "Identidade e Personalidade",
    description: "A casa do Ascendente representa a máscara social, a aparência exterior e o modo como o mundo percebe você.",
    keywords: ["personalidade", "aparência", "início", "identidade", "expressão"],
    lifeThemes: ["Autoconhecimento", "Desenvolvimento pessoal", "Primeiras impressões", "Identity expressão"]
  },
  2: {
    house: 2,
    title: "Segunda Casa",
    sphere: "Recursos e Valores",
    description: "Relaciona-se com posses materiais, valores pessoais e a maneira como você ganha e gerencia recursos.",
    keywords: ["valores", "possessões", "recursos", "autoestima", "dinheiro"],
    lifeThemes: ["Segurança financeira", "Autoestima material", "Valores pessoais", "Gestão de recursos"]
  },
  3: {
    house: 3,
    title: "Terceira Casa",
    sphere: "Comunicação e Aprendizado",
    description: "Rege a comunicação, os irmão, a educação formal e o pensamento diário.",
    keywords: ["comunicação", "irmãos", "educação", "vizinhança", "intelecto"],
    lifeThemes: ["Relações com irmão", "Aprendizado formal", "Comunicação diária", "Curiosidade intelectual"]
  },
  4: {
    house: 4,
    title: "Quarta Casa",
    sphere: "Lar e Famívia",
    description: "A casa do Fundo do Céu representa a base familiar, o lar, os ancestrais e o fim da vida.",
    keywords: ["lar", "família", "ancestrais", "raízes", "segurança emocional"],
    lifeThemes: ["Relação familiar", "Herança", "Moradia", "Raízes emocionais"]
  },
  5: {
    house: 5,
    title: "Quinta Casa",
    sphere: "Criatividade e Prazer",
    description: "Relaciona-se com expressão criativa, romance, filhos e o prazer de viver.",
    keywords: ["criatividade", "romance", "filhos", "lazer", "autoexpressão"],
    lifeThemes: ["Expressão criativa", "Vida amorosa", "Criação artística", "Jogo e prazer"]
  },
  6: {
    house: 6,
    title: "Sexta Casa",
    sphere: "Trabalho e Saúde",
    description: "Rege o trabalho diário, a saúde física, os serviços e os animais de estimação.",
    keywords: ["trabalho", "saúde", "serviço", "rotina", "animais"],
    lifeThemes: ["Carreira diária", "Saúde física", "Serviço aos outros", "Rotina e hábito"]
  },
  7: {
    house: 7,
    title: "Sétima Casa",
    sphere: "Parcerias e Casamento",
    description: "A casa do Descendente representa os relacionamentos íntimos, casamento e inimigos abertos.",
    keywords: ["parceria", "casamento", "relacionamentos", "contratos", "inimigos"],
    lifeThemes: ["Casamento e parcerias", "Relacionamentos legais", "Autoconhecimento através do outro", "Negócios"]
  },
  8: {
    house: 8,
    title: "Oitava Casa",
    sphere: "Transformação e Compartilhamento",
    description: "Relaciona-se com regeneração, sexualidade, morte, heranças e os recursos compartilhados.",
    keywords: ["transformação", "herança", "sexualidade", "compartilhamento", "morte"],
    lifeThemes: ["Transformação pessoal", "Sexualidade profunda", "Heranças", "Recursos do parceiro"]
  },
  9: {
    house: 9,
    title: "Nona Casa",
    sphere: "Expansão e Sabedoria",
    description: "Rege viagens distantes, educação superior, filosofia, religião e espiritualidade.",
    keywords: ["viagens", "filosofia", "espiritualidade", "educação superior", "sabedoria"],
    lifeThemes: ["Viagens longas", "Estudos superiores", "Crenças religiosas", "Expansão de consciência"]
  },
  10: {
    house: 10,
    title: "Décima Casa",
    sphere: "Carreira e Propósito",
    description: "A casa do Meio do Céu representa a carreira, a reputação pública e o propósito de vida.",
    keywords: ["carreira", "reputação", "poder", "propósito", "status"],
    lifeThemes: ["Vocação", "Status público", "Realização profissional", "Responsabilidade pública"]
  },
  11: {
    house: 11,
    title: "Décima Primeira Casa",
    sphere: "Comunidade e Ideais",
    description: "Relaciona-se com grupos, amizades, ideais, esperanças e sonhos coletivos.",
    keywords: ["amizades", "grupos", "ideais", "esperanças", "tecnologia"],
    lifeThemes: ["Amizades profundas", "Participação em grupos", "Ideais humanitários", "Sonhos coletivos"]
  },
  12: {
    house: 12,
    title: "Décima Segunda Casa",
    sphere: "Closure e Sacrifício",
    description: "A casa do Fundo do Céu representa o inconsciente, prisões, inimigos ocultos e o sacrifício.",
    keywords: ["inconsciente", "prisão", "sacrifício", "escapismo", "culpa"],
    lifeThemes: ["Autoconhecimento profundo", "Isolamento espiritual", "Culpa oculta", "Liberação de prisões internas"]
  }
};

/**
 * Get all chart interpretations
 */
export function getInterpretations(): {
  planets: typeof PLANET_IN_SIGN;
  aspects: typeof ASPECT_INTERPRETATIONS;
  elements: typeof ELEMENT_INTERPRETATIONS;
  signs: typeof SIGN_INTERPRETATIONS;
  houses: typeof HOUSE_INTERPRETATIONS;
} {
  return {
    planets: PLANET_IN_SIGN,
    aspects: ASPECT_INTERPRETATIONS,
    elements: ELEMENT_INTERPRETATIONS,
    signs: SIGN_INTERPRETATIONS,
    houses: HOUSE_INTERPRETATIONS
  };
}

/**
 * Get interpretation for a specific planet in a specific sign
 */
function getPlanetSignInterpretation(
  planet: string,
  sign: string
): PlanetPositionInterpretation | undefined {
  return PLANET_IN_SIGN[planet]?.[sign];
}

/**
 * Get interpretation for a specific aspect type
 */
export function getAspectInterpretation(aspect: string): AspectInterpretation | undefined {
  return ASPECT_INTERPRETATIONS[aspect.toLowerCase()];
}

/**
 * Get interpretation for a specific element
 */
function getElementInterpretation(element: string): ElementInterpretation | undefined {
  return ELEMENT_INTERPRETATIONS[element.toLowerCase()];
}

/**
 * Get interpretation for a specific zodiac sign
 */
function getSignInterpretation(sign: string): SignInterpretation | undefined {
  return SIGN_INTERPRETATIONS[sign.toLowerCase()];
}

/**
 * Get interpretation for a specific house
 */
export function getHouseInterpretation(house: number): HouseInterpretation | undefined {
  return HOUSE_INTERPRETATIONS[house];
}

/**
 * Generate a comprehensive natal chart interpretation based on planet positions
 */
function generateNatalInterpretation(chartData: {
  planetPositions?: Array<{ planet: string; sign: string; house: number }>;
  dominantElement?: string;
  dominantSign?: string;
  aspects?: Array<{ type: string; planet1: string; planet2: string }>;
}): ChartInterpretation[] {
  const interpretations: ChartInterpretation[] = [];

  if (chartData.planetPositions) {
    for (const pos of chartData.planetPositions) {
      const planetSign = getPlanetSignInterpretation(pos.planet, pos.sign);
      const signInfo = getSignInterpretation(pos.sign);
      const houseInfo = getHouseInterpretation(pos.house);

      if (planetSign && signInfo && houseInfo) {
        interpretations.push({
          planet: pos.planet,
          sign: pos.sign,
          house: pos.house,
          title: `${planetSign.title} na ${houseInfo.title}`,
          summary: planetSign.description,
          description: `${planetSign.description} ${houseInfo.description}`,
          keywords: [...planetSign.keywords, ...signInfo.keywords],
          strengths: planetSign.strengths,
          challenges: planetSign.challenges,
          guidance: planetSign.spiritualLesson ? [planetSign.spiritualLesson] : []
        });
      }
    }
  }

  if (chartData.dominantElement) {
    const elemInfo = getElementInterpretation(chartData.dominantElement);
    if (elemInfo) {
      interpretations.push({
        element: chartData.dominantElement,
        title: elemInfo.title,
        summary: elemInfo.description,
        description: elemInfo.description,
        keywords: elemInfo.traits,
        strengths: elemInfo.balance.balanced,
        challenges: elemInfo.balance.excessive,
        guidance: elemInfo.recommendations
      });
    }
  }

  if (chartData.aspects) {
    for (const asp of chartData.aspects) {
      const aspInfo = getAspectInterpretation(asp.type);
      if (aspInfo) {
        interpretations.push({
          aspect: asp.type,
          title: `${aspInfo.name}: ${asp.planet1} - ${asp.planet2}`,
          summary: aspInfo.description,
          description: aspInfo.integration,
          keywords: [asp.type],
          strengths: aspInfo.positive,
          challenges: aspInfo.challenging,
          guidance: [aspInfo.meaning]
        });
      }
    }
  }

  return interpretations;
}
