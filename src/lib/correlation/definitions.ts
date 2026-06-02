/**
 * Definições do Sistema de Correlações Espirituais
 * Cabala dos Caminhos - Engine de Correlações
 * 
 * Contém todas as definições estáticas para os sistemas:
 * - Numerologia Cabalística
 * - Elementos (4 elementos clásscos)
 * - Odus (Ifá)
 * - Signos do Zodíaco
 * - Chakras
 */

// ============================================
// TIPOS PRINCIPAIS
// ============================================

export type ElementType = 'Agua' | 'Fogo' | 'Terra' | 'Ar';
export type SignType = 'Aries' | 'Touro' | 'Gemeos' | 'Cancer' | 'Leao' | 'Virgem' | 'Libra' | 'Escorpiao' | 'Sagitario' | 'Capricornio' | 'Aquario' | 'Peixes';
export type ChakraLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ============================================
// NÚMEROS CABALÍSTICOS
// ============================================

export interface CabalisticNumberInfo {
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
  compatibleElements: ElementType[];
  spiritualLesson: string;
  affirmation: string;
}

/**
 * Números Cabalísticos com suas interpretações
 * Os números mestres (11, 22, 33) têm significado espiritual elevado
 */
const CABALISTIC_NUMBERS: Record<number, CabalisticNumberInfo> = {
  1: {
    name: "Iniciador",
    description: "O número 1 representa o princípio masculino, liderança e independência. Você é um pioneiro, alguém que inicia novos ciclos com força e determinação.",
    strengths: ["Autonomia", "Liderança natural", "Iniciativa", "Coragem", "Individuação"],
    challenges: ["Impaciência", "Egoísmo potencial", "Isolamento"],
    compatibleElements: ["Fogo", "Ar"],
    spiritualLesson: "Aprender a liderar sem dominar, criar sem se isolar.",
    affirmation: "Eu inicio meus projetos com confiança e sabedoria."
  },
  2: {
    name: "Harmonizador",
    description: "O número 2 representa a dualidade, parceria e cooperação. Você traz equilíbrio e diplomacia para qualquer situação.",
    strengths: ["Empatia", "Equilíbrio", "Diplomacia", "Intuição", "Cooperação"],
    challenges: ["Indecisão", "Dependência emocional", "Submissão"],
    compatibleElements: ["Agua", "Terra"],
    spiritualLesson: "Encontrar harmonia sem perder sua individualidade.",
    affirmation: "Eu equilibro meu mundo com graça e sabedoria."
  },
  3: {
    name: "Criativo",
    description: "O número 3 representa expressão criativa, comunicação e alegria. Você irradia otimismo e capacidade artística.",
    strengths: ["Imaginação", "Otimismo", "Expressão criativa", "Comunicação", "Sociabilidade"],
    challenges: ["Superficialidade", "Excesso de otimismo", "Dispersão"],
    compatibleElements: ["Fogo", "Ar"],
    spiritualLesson: "Expressar sua luz de forma autêntica e profunda.",
    affirmation: "Eu expresso minha criatividade com alegria e autenticidade."
  },
  4: {
    name: "Construtor",
    description: "O número 4 representa estabilidade, praticidade e trabalho. Você constrói fundações sólidas para o futuro.",
    strengths: ["Organização", "Persistência", "Praticidade", "Disciplina", "Confiabilidade"],
    challenges: ["Rigidez", "Teimosia", "Medo de mudanças"],
    compatibleElements: ["Terra", "Fogo"],
    spiritualLesson: "Construir com flexibilidade, não com rigidez.",
    affirmation: "Eu construo minha vida sobre fundações sólidas e adaptáveis."
  },
  5: {
    name: "Libertador",
    description: "O número 5 representa liberdade, aventura e mudanças. Você é um espírito livre que busca experiências transformadoras.",
    strengths: ["Versatilidade", "Curiosidade", "Adaptabilidade", "Liberdade", "Proatividade"],
    challenges: ["Impaciência", "Inconsistência", "Agitação"],
    compatibleElements: ["Ar", "Agua"],
    spiritualLesson: "Encontrar liberdade interior além das mudanças externas.",
    affirmation: "Eu abraço as mudanças com sabedoria e abertura."
  },
  6: {
    name: "Nurturador",
    description: "O número 6 representa responsabilidade, cuidado e harmonia familiar. Você tem um coração compassivo e protetor.",
    strengths: ["Compaixão", "Harmonia", "Responsabilidade", "Cuidado", "Beleza"],
    challenges: ["Perfeccionismo", "Martírio", "Interferência"],
    compatibleElements: ["Agua", "Terra"],
    spiritualLesson: "Cuidar de outros sem perder-se no cuidado.",
    affirmation: "Eu cuido com amor, mas honrando meus próprios limites."
  },
  7: {
    name: "Buscador",
    description: "O número 7 representa sabedoria, introspecção e conhecimento espiritual. Você é um buscador da verdade interior.",
    strengths: ["Análise", "Intuição", "Sabedoria interior", "Espiritualidade", "Meditação"],
    challenges: ["Isolamento", "Melancolia", "Dificuldade de conexão"],
    compatibleElements: ["Agua", "Ar"],
    spiritualLesson: "Buscar a sabedoria que já habita em você.",
    affirmation: "Eu encontro sabedoria e paz na quietude interior."
  },
  8: {
    name: "Realizador",
    description: "O número 8 representa poder, autoridade e realização material e espiritual. Você tem capacidade de manifestar seus sonhos.",
    strengths: ["Ambição", "Confiança", "Discernimento", "Abundância", "Persistência"],
    challenges: ["Materialismo", "Controle excessivo", "Workaholismo"],
    compatibleElements: ["Fogo", "Terra"],
    spiritualLesson: "Manifestar abundancia com detachment e sabedoria.",
    affirmation: "Eu manifesto abundância em todas as áreas da minha vida."
  },
  9: {
    name: "Humanitário",
    description: "O número 9 representa compaixão universal, idealismo e завершение ciclos. Você é um servidor da humanidade.",
    strengths: ["Generosidade", "Sabedoria", "Compaixão universal", "Tolerância", "Idealismo"],
    challenges: ["Culpa", "Impaciência com os outros", "Sensibilidade excessiva"],
    compatibleElements: ["Fogo", "Agua"],
    spiritualLesson: "Aceitar que nem tudo está no seu controle.",
    affirmation: "Eu aceito e acolho todos os seres com compaixão."
  },
  11: {
    name: "Mestre Iluminado",
    description: "O número 11 é um Número Mestre que representa intuição espiritual elevada e iluminação. Você possui dons psíquicos e clarividência.",
    strengths: ["Visão espiritual", "Inspiração", "Intuição elevada", "Idealismo", "Sensibilidade"],
    challenges: ["Dificuldade de aterramento", "Nervosismo", "Expectativas elevadas"],
    compatibleElements: ["Agua", "Ar"],
    spiritualLesson: "Atertarr suas visões sem perder a luz interior.",
    affirmation: "Eu realizo meus sonhos elevados com os pés no chão."
  },
  22: {
    name: "Mestre Construtor",
    description: "O número 22 é um Número Mestre que combina visão de longo prazo com capacidade de execução. Você pode manifestar grandes projetos.",
    strengths: ["Visão de longo prazo", "Execução prática", "Ambição elevada", "Mestria", "Criatividade"],
    challenges: ["Excesso de responsabilidade", "Perfeccionismo extremo", "Síndrome do impostor"],
    compatibleElements: ["Terra", "Fogo"],
    spiritualLesson: "Usar seu poder com humildade e propósito.",
    affirmation: "Eu construo minha visão com humildade e sabedoria."
  },
  33: {
    name: "Mestre Servidor",
    description: "O número 33 é um Número Mestre que representa serviço espiritual altruísta. Você veio para ajudar a humanidade.",
    strengths: ["Compaixão infinita", "Healing", "Devoção espiritual", "Mestria ascendente", "Unconditional love"],
    challenges: ["Auto-sacrifício", "Dificuldade em receber", "Burnout"],
    compatibleElements: ["Agua", "Fogo"],
    spiritualLesson: "Servir sem se perder, ajudar sem se esgotar.",
    affirmation: "Eu sirvo com amor, honrando minha própria necessidade de cuidado."
  }
};

// ============================================
// ELEMENTOS
// ============================================

export interface ElementInfo {
  name: string;
  symbol: string;
  characteristics: string[];
  chakra: string[];
  compatibleSign: SignType[];
  excessBehavior: string;
  deficiencyBehavior: string;
  healingPractice: string;
}

/**
 * Os quatro elementos clássicos com suas características
 */
const ELEMENTS: Record<ElementType, ElementInfo> = {
  'Agua': {
    name: "Água",
    symbol: "💧",
    characteristics: ["Intuição", "Emocio", "Profundidade", "Transformação", "Sensibilidade"],
    chakra: ["2º Sacro", "6º Terceiro Olho"],
    compatibleSign: ["Cancer", "Escorpiao", "Peixes"],
    excessBehavior: "Excesso de sensibilidade emocional, dificuldade em estabelecer limites, sobrecarga espiritual.",
    deficiencyBehavior: "Falta de flexibilidade, rigidez emocional, dificuldade em fluir com a vida.",
    healingPractice: "Práticas de boundário, meditação aquática, trabalho com emoções."
  },
  'Fogo': {
    name: "Fogo",
    symbol: "🔥",
    characteristics: ["Energia", "Paixão", "Transformação", "Coragem", "Determinação"],
    chakra: ["3º Plexo Solar"],
    compatibleSign: ["Aries", "Leao", "Sagitario"],
    excessBehavior: "Impulsividade, agressividade, combustão rápida, burnout, inflamação.",
    deficiencyBehavior: "Falta de motivação, apatia, medo de agir, baixa autoestima.",
    healingPractice: "Práticas de channeling de energia, martial arts, trabalho com o fogo interior."
  },
  'Terra': {
    name: "Terra",
    symbol: "🌍",
    characteristics: ["Estabilidade", "Praticidade", "Segurança", "Crescimento", "Abundância"],
    chakra: ["1º Raiz", "4º Coração"],
    compatibleSign: ["Touro", "Virgem", "Capricornio"],
    excessBehavior: "Obstinação, materialismo excessivo, possessividade, rigidez mental.",
    deficiencyBehavior: "Insegurança, dificuldade de aterramento, instabilidade, medo.",
    healingPractice: "Conexão com natureza, jardinagem, yoga terreo, práticas de aterramento."
  },
  'Ar': {
    name: "Ar",
    symbol: "💨",
    characteristics: ["Comunicação", "Liberdade", "Ideias", "Socialização", "Intellect"],
    chakra: ["5º Laríngeo", "6º Terceiro Olho"],
    compatibleSign: ["Gemeos", "Libra", "Aquario"],
    excessBehavior: "Agitação mental, superficialidade, indecisão, dispersão.",
    deficiencyBehavior: "Rigidez de pensamento, isolamento, dificuldade de comunicação.",
    healingPractice: "Exercícios respiratórios, prática de meditação, trabalho com a mente."
  }
};

// ============================================
// ODUS (IFÁ)
// ============================================

export interface OduInfo {
  number: number;
  meaning: string;
  preceitos: string[];
  recommendations: string[];
  compatibleNumerology: number[];
  incompatibleNumerology: number[];
  element: ElementType;
  orixas: string[];
  quizilas: string[];
}

/**
 * Os 16 Odus do Merindilogun com suas características
 * Baseado no sistema tradicional de Ifá
 */
const ODUS: Record<string, OduInfo> = {
  'Alafia': {
    number: 1,
    meaning: "Paz, saúde e novos começos. Indica que tudo está bem e que novos ciclos começam.",
    preceitos: ["Evitar conflitos desnecessários", "Manter ambiente harmonioso", "Cultivar gratidão"],
    recommendations: ["Rituais de limpeza", "Orações pacíficas", "Ações de gratidão"],
    compatibleNumerology: [1, 3, 9],
    incompatibleNumerology: [4, 5],
    element: "Agua",
    orixas: ["Orunmila", "Oxala"],
    quizilas: ["Orgulho", "Arrogância", "Dúvida"]
  },
  'Ogbe': {
    number: 2,
    meaning: "Vitória garantida, prosperidade e sucesso. Indica que os caminhos estão abertos.",
    preceitos: ["Evitar orgulho excessivo", "Ser grato pelas vitórias", "Compartilhar prosperidade"],
    recommendations: ["Iniciar novos projetos", "Buscar parcerias", "Agir com confiança"],
    compatibleNumerology: [1, 2, 8],
    incompatibleNumerology: [6, 7],
    element: "Ar",
    orixas: ["Ogum", "Oxum"],
    quizilas: ["Inveja", "Acobertar erros"]
  },
  'Oyeku': {
    number: 3,
    meaning: "Silêncio e reflexão. Momento de introspecção e análise profunda.",
    preceitos: ["Evitar pressa nas decisões", "Reservar tempo para reflexão", "Cultivar silêncio interior"],
    recommendations: ["Meditação", "Contemplação", "Leitura espiritual"],
    compatibleNumerology: [4, 5, 9],
    incompatibleNumerology: [1, 3],
    element: "Terra",
    orixas: ["Omolu", "Nanã"],
    quizilas: ["Tagarelice", "Decisões precipitadas"]
  },
  'Iwori': {
    number: 4,
    meaning: "Dificuldade e paciência. O caminho tem obstáculos que测试am sua perseverança.",
    preceitos: ["Evitar impaciência", "Aceitar o tempo do universo", "Persistir com sabedoria"],
    recommendations: ["Práticas de paciência", "Flexibilidade", "Persistência suave"],
    compatibleNumerology: [2, 6, 8],
    incompatibleNumerology: [1, 9],
    element: "Agua",
    orixas: ["Obaluaye", "Oxumaré"],
    quizilas: ["Impaciência", "Desistência"]
  },
  'Odi': {
    number: 5,
    meaning: "Violência e conflito. Período de tensão que requer sabedoria e diplomacy.",
    preceitos: ["Evitar confrontos", "Buscar reconciliação", "Praticar não-violência"],
    recommendations: ["Rituais de paz", "Pedir perdão", "Perdão"],
    compatibleNumerology: [3, 7, 9],
    incompatibleNumerology: [4, 8],
    element: "Fogo",
    orixas: ["Ogum", "Xangô"],
    quizilas: ["Violência", "Brigas", "Conflitos desnecessários"]
  },
  'Irosun': {
    number: 6,
    meaning: "Visão espiritual e proteção. Momento de abertura para guidance espiritual.",
    preceitos: ["Evitar consumo excessivo", "Manter祭祀 limpo", "Respeitar orientações"],
    recommendations: ["Proteção espiritual", "Práticas de visão", "Atenção aos sinais"],
    compatibleNumerology: [2, 6, 8],
    incompatibleNumerology: [5],
    element: "Agua",
    orixas: ["Iemanjá", "Oxóssi"],
    quizilas: ["Descuido espiritual", "Visitas a lugares escuros"]
  },
  'Owonrin': {
    number: 7,
    meaning: "Mudança rápida e inesperado. Transformações súbitas no caminho.",
    preceitos: ["Estar preparado para surpresas", "Adaptar-se rapidamente", "Manter flexibilidade"],
    recommendations: ["Flexibilidade", "Abertura à mudança", "Confiança no processo"],
    compatibleNumerology: [1, 3, 5],
    incompatibleNumerology: [2, 4],
    element: "Ar",
    orixas: ["Iansã", "Exu"],
    quizilas: ["Rigidez", "Teimosia"]
  },
  'Obara': {
    number: 8,
    meaning: "Justiça e equidade. Momento de julgar com sabedoria e equilíbrio.",
    preceitos: ["Evitar injustiça", "Ser honesto", "Buscar equilíbrio"],
    recommendations: ["Buscar equilíbrio", "Práticas de justiça", "Honestidade"],
    compatibleNumerology: [4, 6, 8],
    incompatibleNumerology: [1, 3],
    element: "Terra",
    orixas: ["Xangô", "Obá"],
    quizilas: ["Injustiça", "Mentira"]
  },
  'Okanran': {
    number: 9,
    meaning: "Prisão e libertação. Indicador de aprisionamento que pede libertação.",
    preceitos: ["Evitar maus hábitos", "Buscar libertação", "Romper correntes"],
    recommendations: ["Despertar consciência", "Libertação de padrões", "Renovação"],
    compatibleNumerology: [3, 6, 9],
    incompatibleNumerology: [4, 8],
    element: "Terra",
    orixas: ["Obaluaye", "Omolu"],
    quizilas: [" Maus hábitos", "Vício", "Prisões internas"]
  },
  'Ogunda': {
    number: 10,
    meaning: "Combate e vitória. Momento de lutar pelo que é certo com honra.",
    preceitos: ["Evitar violência desnecessária", "Lutar com honra", "Defender a verdade"],
    recommendations: ["Coragem nas batalhas", "Defesa de causas justas", "Força com honra"],
    compatibleNumerology: [1, 3, 8],
    incompatibleNumerology: [6, 7],
    element: "Fogo",
    orixas: ["Ogum", "Oxóssi"],
    quizilas: ["Covardia", "Fuga de confrontos necessários"]
  },
  'Osa': {
    number: 11,
    meaning: "Precipitação e paciência. Alerta para não agir impulsivamente.",
    preceitos: ["Evitar decisões precipitadas", "Pensar antes de agir", "Cultivar paciência"],
    recommendations: ["Análise cuidadosa", "Pausa antes de agir", "Reflexão"],
    compatibleNumerology: [2, 5, 7],
    incompatibleNumerology: [1, 8],
    element: "Agua",
    orixas: ["Iemanjá", "Oxum"],
    quizilas: ["Pressa", "Decisões impulsivas"]
  },
  'Ika': {
    number: 12,
    meaning: "Magia e mistério. Período de poderes ocultos e transformação profunda.",
    preceitos: ["Evitar feitiçaria negativa", "Usar poderes com responsabilidade", "Respeitar o oculto"],
    recommendations: ["Práticas espirituais avançadas", "Trabalho com energia", "Mistério"],
    compatibleNumerology: [7, 9, 11],
    incompatibleNumerology: [4, 5],
    element: "Agua",
    orixas: ["Oxumaré", "Ossaim"],
    quizilas: ["Falsidade", "Bruxaria negativa"]
  },
  'Otura': {
    number: 13,
    meaning: "Conhecimento e sabedoria. Portal para aprendizado espiritual profundo.",
    preceitos: ["Evitar orgulho pelo saber", "Compartilhar conhecimento", "Buscar sabedoria"],
    recommendations: ["Estudo espiritual", "Compartilhamento", "Busca por verdade"],
    compatibleNumerology: [1, 3, 9],
    incompatibleNumerology: [6, 8],
    element: "Fogo",
    orixas: ["Orunmila", "Oxala"],
    quizilas: ["Acumulação de conhecimento sem compartilhar"]
  },
  'OgbeMeji': {
    number: 14,
    meaning: "Dupla vitória - vitória amplificada. Grande sucesso em múltiplas áreas.",
    preceitos: ["Gratidão pela vitória", "Compartilhar prosperidade", "Humildade"],
    recommendations: ["Generosidade", "Gratidão", "Celebração consciente"],
    compatibleNumerology: [1, 2, 8],
    incompatibleNumerology: [4, 7],
    element: "Ar",
    orixas: ["Ogum", "Oxum", "Ibeji"],
    quizilas: ["Ingratidão", "Avareza"]
  },
  'OyekuMeji': {
    number: 15,
    meaning: "Dupla reflexão - introspecção profunda. Momento de silêncio e análise.",
    preceitos: ["Silêncio construtivo", "Introspecção profunda", "Análise interior"],
    recommendations: ["Journaling espiritual", "Meditação profunda", "Retiro"],
    compatibleNumerology: [4, 7, 9],
    incompatibleNumerology: [1, 3],
    element: "Terra",
    orixas: ["Omolu", "Nanã"],
    quizilas: ["Tagarelice", "Superficialidade"]
  },
  'IkaMeji': {
    number: 16,
    meaning: "Dupla magia - poder oculto amplificado. Intensificação de mistérios.",
    preceitos: ["Uso responsável do poder", "Discrição", "Proteção espiritual"],
    recommendations: ["Práticas ocultas", "Trabalho energético avançado", "Segredos"],
    compatibleNumerology: [7, 9, 11],
    incompatibleNumerology: [4, 5],
    element: "Agua",
    orixas: ["Oxumaré", "Ossaim"],
    quizilas: ["Abuso de poder", "Feitiçaria"]
  }
};

// ============================================
// SIGNOS DO ZODÍACO
// ============================================

export interface ZodiacSignInfo {
  element: ElementType;
  ruler: string;
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  keywords: string[];
  compatibleSigns: SignType[];
  challengingSigns: SignType[];
  chakra: ChakraLevel;
}

/**
 * Os 12 signos do zodíaco com suas características
 */
const ZODIAC_SIGNS: Record<SignType, ZodiacSignInfo> = {
  'Aries': {
    element: 'Fogo',
    ruler: 'Marte',
    modality: 'Cardinal',
    keywords: ['Iniciativa', 'Coragem', 'Impulsividade', 'Pioneirismo'],
    compatibleSigns: ['Leao', 'Sagitario', 'Gemeos'],
    challengingSigns: ['Cancer', 'Capricornio', 'Libra'],
    chakra: 3
  },
  'Touro': {
    element: 'Terra',
    ruler: 'Vênus',
    modality: 'Fixed',
    keywords: ['Estabilidade', 'Prazer', 'Persistência', 'Materialismo'],
    compatibleSigns: ['Virgem', 'Capricornio', 'Cancer'],
    challengingSigns: ['Escorpiao', 'Libra', 'Aquario'],
    chakra: 1
  },
  'Gemeos': {
    element: 'Ar',
    ruler: 'Mercúrio',
    modality: 'Mutable',
    keywords: ['Comunicação', 'Curiosidade', 'Versatilidade', 'Inconstância'],
    compatibleSigns: ['Libra', 'Aquario', 'Aries'],
    challengingSigns: ['Virgem', 'Peixes'],
    chakra: 5
  },
  'Cancer': {
    element: 'Agua',
    ruler: 'Lua',
    modality: 'Cardinal',
    keywords: ['Empatia', 'Intuição', 'Sensibilidade', 'Protectividade'],
    compatibleSigns: ['Escorpiao', 'Peixes', 'Touro'],
    challengingSigns: ['Aries', 'Libra', 'Capricornio'],
    chakra: 2
  },
  'Leao': {
    element: 'Fogo',
    ruler: 'Sol',
    modality: 'Fixed',
    keywords: ['Criatividade', 'Liderança', 'Generosidade', 'Ego'],
    compatibleSigns: ['Aries', 'Sagitario', 'Gemeos'],
    challengingSigns: ['Touro', 'Aquario'],
    chakra: 4
  },
  'Virgem': {
    element: 'Terra',
    ruler: 'Mercúrio',
    modality: 'Mutable',
    keywords: ['Análise', 'Perfeccionismo', 'Serviço', 'Crítica'],
    compatibleSigns: ['Touro', 'Capricornio', 'Cancer'],
    challengingSigns: ['Gemeos', 'Sagitario', 'Peixes'],
    chakra: 3
  },
  'Libra': {
    element: 'Ar',
    ruler: 'Vênus',
    modality: 'Cardinal',
    keywords: ['Harmonia', 'Diplomacia', 'Beleza', 'Indecisão'],
    compatibleSigns: ['Gemeos', 'Aquario', 'Leao'],
    challengingSigns: ['Cancer', 'Capricornio', 'Aries'],
    chakra: 5
  },
  'Escorpiao': {
    element: 'Agua',
    ruler: 'Plutão',
    modality: 'Fixed',
    keywords: ['Transformação', 'Intensidade', 'Segredo', 'Paixão'],
    compatibleSigns: ['Cancer', 'Peixes', 'Virgem'],
    challengingSigns: ['Touro', 'Leao', 'Aquario'],
    chakra: 2
  },
  'Sagitario': {
    element: 'Fogo',
    ruler: 'Júpiter',
    modality: 'Mutable',
    keywords: ['Expansão', 'Otimismo', 'Aventura', 'Imprudência'],
    compatibleSigns: ['Aries', 'Leao', 'Aquario'],
    challengingSigns: ['Virgem', 'Peixes'],
    chakra: 6
  },
  'Capricornio': {
    element: 'Terra',
    ruler: 'Saturno',
    modality: 'Cardinal',
    keywords: ['Ambição', 'Disciplina', 'Responsabilidade', 'Rotineiro'],
    compatibleSigns: ['Touro', 'Virgem', 'Escorpiao'],
    challengingSigns: ['Aries', 'Cancer', 'Libra'],
    chakra: 1
  },
  'Aquario': {
    element: 'Ar',
    ruler: 'Saturno',
    modality: 'Fixed',
    keywords: ['Inovação', 'Humanitarismo', 'Originalidade', 'Distância'],
    compatibleSigns: ['Gemeos', 'Libra', 'Sagitario'],
    challengingSigns: ['Touro', 'Leao', 'Escorpiao'],
    chakra: 6
  },
  'Peixes': {
    element: 'Agua',
    ruler: 'Júpiter',
    modality: 'Mutable',
    keywords: ['Intuição', 'Compaixão', 'Escapismo', 'Confusão'],
    compatibleSigns: ['Cancer', 'Escorpiao', 'Virgem'],
    challengingSigns: ['Gemeos', 'Sagitario'],
    chakra: 7
  }
};

// ============================================
// CHAKRAS
// ============================================

export interface ChakraInfo {
  name: string;
  sanskrit: string;
  element: string;
  color: string;
  colorHex: string;
  location: string;
  affirmation: string;
  mantra: string;
}

/**
 * Os 7 chakras principais com suas características
 */
const CHAKRAS: Record<ChakraLevel, ChakraInfo> = {
  1: {
    name: "Raiz",
    sanskrit: "Muladhara",
    element: "Terra",
    color: "Vermelho",
    colorHex: "#E53935",
    location: "Base da coluna, perínio",
    affirmation: "Eu sou",
    mantra: "LAM"
  },
  2: {
    name: "Sacro",
    sanskrit: "Svadhisthana",
    element: "Água",
    color: "Laranja",
    colorHex: "#FB8C00",
    location: "Baixo ventre, abaixo do umbigo",
    affirmation: "Eu sinto",
    mantra: "VAM"
  },
  3: {
    name: "Plexo Solar",
    sanskrit: "Manipura",
    element: "Fogo",
    color: "Amarelo",
    colorHex: "#FDD835",
    location: "Epigástrio, acima do umbigo",
    affirmation: "Eu posso",
    mantra: "RAM"
  },
  4: {
    name: "Coração",
    sanskrit: "Anahata",
    element: "Ar",
    color: "Verde",
    colorHex: "#43A047",
    location: "Centro do peito, coração físico",
    affirmation: "Eu amo",
    mantra: "YAM"
  },
  5: {
    name: "Laríngeo",
    sanskrit: "Vishuddha",
    element: "Éter",
    color: "Azul",
    colorHex: "#1E88E5",
    location: "Garganta, glândula tireoide",
    affirmation: "Eu comunico",
    mantra: "HAM"
  },
  6: {
    name: "Terceiro Olho",
    sanskrit: "Ajna",
    element: "Luz",
    color: "Índigo",
    colorHex: "#5E35B1",
    location: "Centro da testa, entre as sobrancelhas",
    affirmation: "Eu vejo",
    mantra: "OM"
  },
  7: {
    name: "Coronário",
    sanskrit: "Sahasrara",
    element: "Cosmos",
    color: "Violeta/Branco",
    colorHex: "#8E24AA",
    location: "Topo da cabeça, fontanela",
    affirmation: "Eu compreendo",
    mantra: "OM SILENCE"
  }
};

// ============================================
// FUNÇÕES DE CONSULTA
// ============================================

/**
 * Retorna informação do número cabalístico
 */
function getCabalisticInfo(number: number): CabalisticNumberInfo | undefined {
  return CABALISTIC_NUMBERS[number];
}

/**
 * Retorna informação do elemento
 */
function getElementInfo(element: ElementType): ElementInfo | undefined {
  return ELEMENTS[element];
}

/**
 * Retorna informação do Odu
 */
function getOduInfo(oduName: string): OduInfo | undefined {
  return ODUS[oduName];
}

/**
 * Retorna informação do signo
 */
function getZodiacInfo(sign: SignType): ZodiacSignInfo | undefined {
  return ZODIAC_SIGNS[sign];
}

/**
 * Retorna informação do chakra
 */
function getChakraInfo(level: ChakraLevel): ChakraInfo | undefined {
  return CHAKRAS[level];
}

/**
 * Retorna todos os elementos como array
 */
function getAllElements(): ElementType[] {
  return ['Agua', 'Fogo', 'Terra', 'Ar'];
}

/**
 * Retorna todos os signos como array
 */
function getAllZodiacSigns(): SignType[] {
  return ['Aries', 'Touro', 'Gemeos', 'Cancer', 'Leao', 'Virgem', 'Libra', 'Escorpiao', 'Sagitario', 'Capricornio', 'Aquario', 'Peixes'];
}

/**
 * Retorna todos os nomes dos Odus
 */
function getAllOduNames(): string[] {
  return Object.keys(ODUS);
}

/**
 * Verifica se um número é um número mestre
 */
function isMasterNumber(num: number): boolean {
  return [11, 22, 33].includes(num);
}
