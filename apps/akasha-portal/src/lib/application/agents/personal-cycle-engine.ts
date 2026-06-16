// ============================================================
// PERSONAL CYCLE ENGINE
// ============================================================
// Motor que calcula dinamicamente todos os ciclos pessoais:
// - Dia Pessoal (muda a cada dia)
// - Mês Pessoal (muda a cada mês)
// - Ano Pessoal (muda a cada ano)
// - Ciclo Universal (ano do mundo)
// - Pináculos (4 períodos da vida)
// - Desafios (1º, 2º, 3º, 4º)
// - Lições Cármicas (dígitos ausentes)
// - Número de Maturidade
//
// Tudo calculado a partir da data de nascimento + data atual
// SEM DADOS ESTÁTICOS - 100% DINÂMICO
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface PersonalDay {
  number: number;
  universalDay: number;
  combined: number;          // Soma do dia pessoal + dia universal
  masterNumber: boolean;
  energy: 'leadership' | 'diplomacy' | 'creativity' | 'foundation' | 'change' |
          'nurturing' | 'introspection' | 'power' | 'completion' | 'spiritual';
  keywords: string[];
  chakra: string;
  color: string;
  affirmation: string;
  action: string;
  avoid: string;
  favorable: string;
}

export interface PersonalMonth {
  number: number;
  combined: number;          // Mês pessoal + dia pessoal do 1º dia
  energy: string;
  theme: string;
  keywords: string[];
  focus: string;
  opportunities: string[];
  warnings: string[];
}

export interface PersonalYear {
  number: number;
  startDate: string;
  endDate: string;
  theme: string;
  duration: string;
  majorLessons: string[];
  opportunities: string[];
  warnings: string[];
  keyAction: string;
}

export interface UniversalYear {
  year: number;
  number: number;            // 1-9
  theme: string;
  globalEnergy: string;
}

export interface Pinnacle {
  number: number;
  startAge: number;
  endAge: number | null;     // null = até o fim
  period: string;            // "0-30 anos" etc
  theme: string;
  opportunities: string[];
  challenges: string[];
  keyQuestion: string;
}

export interface Challenge {
  level: 1 | 2 | 3 | 4;
  name: string;
  number: number;
  description: string;
  howToOvercome: string;
  lifeArea: string;
}

export interface KarmicLesson {
  missing: number;            // 1-9 (ou 0 para zero)
  description: string;
  howToLearn: string;
  lifeArea: string;
}

export interface MaturityNumber {
  number: number;            // Caminho de Vida + Expressão
  year: number;              // Idade em que ativa
  theme: string;
  description: string;
  gifts: string[];
  challenges: string[];
}

export interface PersonalCycleSnapshot {
  birthDate: string;
  currentDate: string;
  age: number;
  lifePath: number;

  // Ciclos pessoais
  personalDay: PersonalDay;
  personalMonth: PersonalMonth;
  personalYear: PersonalYear;
  universalYear: UniversalYear;

  // Estrutura da vida
  pinnacles: Pinnacle[];
  currentPinnacle: Pinnacle;
  challenges: Challenge[];
  karmicLessons: KarmicLesson[];
  maturity: MaturityNumber;

  // Meta
  synthesis: string;
  overallEnergy: number;     // 0-100
}

// ============================================================
// CORE CALCULATIONS
// ============================================================

import { reduce, sumDigits, ageInYears } from './personal-cycle-numerology';

// ============================================================
// DIA PESSOAL
// ============================================================

function calculatePersonalDay(
  birthDate: Date,
  currentDate: Date,
  lifePath: number
): PersonalDay {
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const universalDay = reduce(sumDigits(day) + sumDigits(month) + sumDigits(year));
  const personalDay = reduce(day + month + year + lifePath);
  const combined = reduce(personalDay + universalDay);

  const energies: Record<number, PersonalDay['energy']> = {
    1: 'leadership', 2: 'diplomacy', 3: 'creativity', 4: 'foundation',
    5: 'change', 6: 'nurturing', 7: 'introspection', 8: 'power',
    9: 'completion', 11: 'spiritual', 22: 'spiritual', 33: 'spiritual',
  };

  const dayData: Record<number, Omit<PersonalDay, 'number' | 'universalDay' | 'combined' | 'masterNumber'>> = {
    1: {
      energy: 'leadership',
      keywords: ['iniciativa', 'novoscomeços', 'liderança', 'independência'],
      chakra: '3º Plexo Solar',
      color: 'Vermelho/Laranja',
      affirmation: 'Eu abraço novos começos com coragem.',
      action: 'Inicie um projeto importante hoje.',
      avoid: 'Hesitação e dependência de outros',
      favorable: 'Ações decisivas, decisões pessoais',
    },
    2: {
      energy: 'diplomacy',
      keywords: ['cooperação', 'paciência', 'diplomacia', 'parceria'],
      chakra: '2º Sacro',
      color: 'Laranja suave',
      affirmation: 'Eu confio no poder da colaboração.',
      action: 'Cultive parcerias e ouça ativamente.',
      avoid: 'Forçar situações ou agir sozinho',
      favorable: 'Negociação, mediação, conexão',
    },
    3: {
      energy: 'creativity',
      keywords: ['criatividade', 'expressão', 'alegria', 'comunicação'],
      chakra: '5º Laríngeo',
      color: 'Amarelo',
      affirmation: 'Minha expressão única ilumina o mundo.',
      action: 'Crie, escreva, cante, dance — se expresse!',
      avoid: 'Rotina excessiva e rigidez',
      favorable: 'Arte, escrita, comunicação, brincadeira',
    },
    4: {
      energy: 'foundation',
      keywords: ['disciplina', 'estrutura', 'trabalho', 'estabilidade'],
      chakra: '1º Básico',
      color: 'Verde/Terra',
      affirmation: 'Eu construo bases sólidas para meu futuro.',
      action: 'Organize, planeje, trabalhe com foco.',
      avoid: 'Improviso e dispersão',
      favorable: 'Rotina produtiva, construção, saúde',
    },
    5: {
      energy: 'change',
      keywords: ['mudança', 'liberdade', 'aventura', 'transformação'],
      chakra: '2º Sacro + 3º Plexo',
      color: 'Azul claro',
      affirmation: 'Eu abraço a mudança como crescimento.',
      action: 'Rompa padrões, viaje, experimente o novo.',
      avoid: 'Estagnação e rotina rígida',
      favorable: 'Mudanças, viagens, inovação, sensualidade',
    },
    6: {
      energy: 'nurturing',
      keywords: ['amor', 'família', 'responsabilidade', 'harmonia'],
      chakra: '4º Cardíaco',
      color: 'Rosa/Rosa antigo',
      affirmation: 'Eu sou amor em ação.',
      action: 'Cuide de quem você ama e de você.',
      avoid: 'Negligência consigo mesmo',
      favorable: 'Família, romance, cura, beleza',
    },
    7: {
      energy: 'introspection',
      keywords: ['introspecção', 'sabedoria', 'espiritualidade', 'análise'],
      chakra: '6º Frontal + 7º Coronário',
      color: 'Violeta/Índigo',
      affirmation: 'Eu mergulho fundo para encontrar a verdade.',
      action: 'Medite, estude, faça terapia, reflita.',
      avoid: 'Multitarefa e superficialidade',
      favorable: 'Estudo, meditação, pesquisa, silêncio',
    },
    8: {
      energy: 'power',
      keywords: ['poder', 'abundância', 'autoridade', 'manifestação'],
      chakra: '3º Plexo Solar',
      color: 'Dourado/Marrom',
      affirmation: 'Eu mereço e atraio abundância.',
      action: 'Negocie valores, tome decisões financeiras.',
      avoid: 'Gastar por impulso ou medo',
      favorable: 'Negócios, investimentos, reconhecimento',
    },
    9: {
      energy: 'completion',
      keywords: ['completude', 'serviço', 'humanitarismo', 'encerramento'],
      chakra: '4º Cardíaco + 6º Frontal',
      color: 'Violeta profundo',
      affirmation: 'Eu completo ciclos com gratidão.',
      action: 'Termine projetos, perdoe, sirva ao próximo.',
      avoid: 'Iniciar coisas novas grandes',
      favorable: 'Encerramentos, perdão, compaixão, arte',
    },
    11: {
      energy: 'spiritual',
      keywords: ['intuição', 'inspiração', 'mestria', 'iluminação'],
      chakra: '6º Frontal + 7º Coronário',
      color: 'Branco/prateado',
      affirmation: 'Eu sou canal da luz divina.',
      action: 'Confie na intuição, canalize visões.',
      avoid: 'Ignorar pressentimentos',
      favorable: 'Meditação profunda, ensino, cura',
    },
    22: {
      energy: 'spiritual',
      keywords: ['manifestação prática', 'construtor mestre', 'legado'],
      chakra: '1º + 7º',
      color: 'Dourado',
      affirmation: 'Eu construo legados que transcendem.',
      action: 'Inicie grandes projetos práticos.',
      avoid: 'Visão sem ação',
      favorable: 'Construção, planejamento, impacto',
    },
    33: {
      energy: 'spiritual',
      keywords: ['mestre curador', 'serviço compassivo', 'amor incondicional'],
      chakra: '4º + 6º + 7º',
      color: 'Ouro rosa',
      affirmation: 'Eu sirvo com amor incondicional.',
      action: 'Curar, ensinar, servir com compaixão.',
      avoid: 'Esquecer de si mesmo no servir',
      favorable: 'Cura, ensino espiritual, arte curativa',
    },
  };

  const data = dayData[personalDay] || dayData[1];

  return {
    number: personalDay,
    universalDay,
    combined,
    masterNumber: [11, 22, 33].includes(personalDay),
    ...data,
  };
}

// ============================================================
// MÊS PESSOAL
// ============================================================

function calculatePersonalMonth(
  personalYear: number,
  currentDate: Date
): PersonalMonth {
  const month = currentDate.getMonth() + 1;
  const personalMonth = reduce(personalYear + month);

  const themes: Record<number, Omit<PersonalMonth, 'number' | 'combined'>> = {
    1: {
      energy: 'Início de novo ciclo',
      theme: 'Novos começos e plantio de sementes',
      keywords: ['iniciativa', 'coragem', 'lançamento'],
      focus: 'Tomar a primeira ação em projetos importantes',
      opportunities: ['Iniciar novos projetos', 'Tomar decisões importantes', 'Mostrar liderança'],
      warnings: ['Não tenha pressa excessiva', 'Evite iniciar brigas'],
    },
    2: {
      energy: 'Paciência e construção',
      theme: 'Cultivar o que foi plantado',
      keywords: ['cooperação', 'paciência', 'detalhes'],
      focus: 'Aprofundar relações e refinar planos',
      opportunities: ['Fortalecer parcerias', 'Resolver pendências', 'Trabalhar em equipe'],
      warnings: ['Não se isole', 'Evite indecisão crônica'],
    },
    3: {
      energy: 'Expansão criativa',
      theme: 'Expressão, alegria, criação',
      keywords: ['criatividade', 'comunicação', 'socialização'],
      focus: 'Expressar ideias e se conectar com pessoas',
      opportunities: ['Lançar projetos criativos', 'Networking', 'Comunicação'],
      warnings: ['Não disperse energia', 'Evite fofoca'],
    },
    4: {
      energy: 'Construção e estrutura',
      theme: 'Bases sólidas e trabalho dedicado',
      keywords: ['disciplina', 'trabalho', 'organização'],
      focus: 'Estabelecer rotinas e estruturas',
      opportunities: ['Planejamento', 'Saúde', 'Finanças estruturadas'],
      warnings: ['Não se sobrecarregue', 'Evite rigidez'],
    },
    5: {
      energy: 'Mudança e liberdade',
      theme: 'Romper, expandir, viajar',
      keywords: ['mudança', 'aventura', 'liberdade'],
      focus: 'Sair da zona de conforto',
      opportunities: ['Viagens', 'Mudanças', 'Novas conexões'],
      warnings: ['Não tome decisões impulsivas', 'Evite excessos'],
    },
    6: {
      energy: 'Amor e família',
      theme: 'Relacionamentos e responsabilidades',
      keywords: ['amor', 'família', 'harmonia'],
      focus: 'Cuidar de pessoas queridas e de si',
      opportunities: ['Compromissos amorosos', 'Reconciliação', 'Beleza e arte'],
      warnings: ['Não negligencie a si', 'Evite sacrifício excessivo'],
    },
    7: {
      energy: 'Introspecção e estudo',
      theme: 'Mergulho interior e sabedoria',
      keywords: ['introspecção', 'estudo', 'espiritualidade'],
      focus: 'Refletir, meditar, estudar a fundo',
      opportunities: ['Pesquisa', 'Terapia', 'Desenvolvimento espiritual'],
      warnings: ['Não se isole demais', 'Evite análises excessivas'],
    },
    8: {
      energy: 'Poder e abundância',
      theme: 'Conquistas materiais e reconhecimento',
      keywords: ['poder', 'abundância', 'autoridade'],
      focus: 'Avançar carreira e finanças',
      opportunities: ['Negócios', 'Investimentos', 'Reconhecimento profissional'],
      warnings: ['Não seja workaholic', 'Evite ganância'],
    },
    9: {
      energy: 'Completude e serviço',
      theme: 'Encerramento de ciclos',
      keywords: ['completude', 'serviço', 'humanitarismo'],
      focus: 'Finalizar, perdoar, servir',
      opportunities: ['Conclusão de projetos', 'Perdão', 'Voluntariado'],
      warnings: ['Não comece grandes coisas', 'Evite melancolia'],
    },
    11: {
      energy: 'Iluminação e intuição',
      theme: 'Mestria espiritual',
      keywords: ['intuição', 'inspiração', 'visões'],
      focus: 'Canalizar a intuição em ação',
      opportunities: ['Ensino', 'Cura', 'Criação inspirada'],
      warnings: ['Não ignore pressentimentos', 'Evite sobrecarga psíquica'],
    },
    22: {
      energy: 'Construção mestre',
      theme: 'Manifestar visões em realidade',
      keywords: ['legado', 'manifestação prática', 'mestria'],
      focus: 'Construir algo duradouro e significativo',
      opportunities: ['Projetos de grande escala', 'Liderança visionária'],
      warnings: ['Não negligencie o plano espiritual', 'Evite perfeccionismo'],
    },
  };

  const themeData = themes[personalMonth] || themes[1];

  return {
    number: personalMonth,
    combined: reduce(personalMonth + personalYear),
    ...themeData,
  };
}

// ============================================================
// ANO PESSOAL
// ============================================================

function calculatePersonalYear(
  birthDate: Date,
  currentDate: Date,
  lifePath: number
): PersonalYear {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const personalYear = reduce(day + month + year);

  const themes: Record<number, Omit<PersonalYear, 'number' | 'startDate' | 'endDate'>> = {
    1: {
      theme: 'Ano de novos começos e plantio',
      duration: '12 meses de iniciação',
      majorLessons: ['Iniciar sem medo', 'Confiar na sua visão', 'Assumir liderança'],
      opportunities: ['Começar projetos', 'Mudanças positivas', 'Reconhecimento'],
      warnings: ['Impaciência', 'Egocentrismo', 'Ações precipitadas'],
      keyAction: 'Plante as sementes do que quer colher nos próximos 9 anos.',
    },
    2: {
      theme: 'Ano de paciência e construção de bases',
      duration: '12 meses de cultivo',
      majorLessons: ['Paciência', 'Cooperação', 'Atenção aos detalhes'],
      opportunities: ['Parcerias', 'Diplomacia', 'Refinamento de projetos'],
      warnings: ['Indecisão', 'Dependência emocional', 'Estagnação'],
      keyAction: 'Fortaleça parcerias e cultive o que começou.',
    },
    3: {
      theme: 'Ano de expressão criativa e alegria',
      duration: '12 meses de expansão',
      majorLessons: ['Se expressar', 'Comunicar', 'Celebrar a vida'],
      opportunities: ['Lançamentos criativos', 'Socialização', 'Viagens leves'],
      warnings: ['Dispersão', 'Superficialidade', 'Fofoca'],
      keyAction: 'Mostre ao mundo quem você é, com alegria.',
    },
    4: {
      theme: 'Ano de trabalho e construção sólida',
      duration: '12 meses de fundação',
      majorLessons: ['Disciplina', 'Persistência', 'Estruturação'],
      opportunities: ['Carreira', 'Saúde', 'Construção de patrimônio'],
      warnings: ['Rigidez', 'Workaholic', 'Visão curta'],
      keyAction: 'Construa bases sólidas para o futuro.',
    },
    5: {
      theme: 'Ano de mudanças e liberdade',
      duration: '12 meses de transformação',
      majorLessons: ['Adaptar-se', 'Romper padrões', 'Viver intensamente'],
      opportunities: ['Mudanças geográficas', 'Novas conexões', 'Aprendizados'],
      warnings: ['Impulsividade', 'Excessos', 'Instabilidade'],
      keyAction: 'Rompa o que não serve mais e abrace o novo.',
    },
    6: {
      theme: 'Ano de amor, família e responsabilidade',
      duration: '12 meses de comunhão',
      majorLessons: ['Amor incondicional', 'Cuidado', 'Responsabilidade'],
      opportunities: ['Casamento', 'Filhos', 'Reconciliação familiar'],
      warnings: ['Sacrifício excessivo', 'Controle', 'Perfeccionismo'],
      keyAction: 'Honre os laços que importam e construa o lar interno.',
    },
    7: {
      theme: 'Ano de introspecção e sabedoria',
      duration: '12 meses de mergulho',
      majorLessons: ['Conhecer a si', 'Estudar', 'Confiar na intuição'],
      opportunities: ['Estudos', 'Terapia', 'Desenvolvimento espiritual'],
      warnings: ['Isolamento', 'Ansiedade', 'Paralisia por análise'],
      keyAction: 'Vá fundo, descubra verdades, refine sua visão.',
    },
    8: {
      theme: 'Ano de poder e abundância',
      duration: '12 meses de colheita material',
      majorLessons: ['Autoridade pessoal', 'Valor próprio', 'Manifestação'],
      opportunities: ['Negócios', 'Investimentos', 'Reconhecimento público'],
      warnings: ['Ganância', 'Workaholic', 'Desbalanceamento'],
      keyAction: 'Colha o que plantou, manifeste com ética.',
    },
    9: {
      theme: 'Ano de completude e encerramento',
      duration: '12 meses de finalização',
      majorLessons: ['Soltar', 'Perdoar', 'Servir'],
      opportunities: ['Conclusão de ciclos', 'Voluntariado', 'Arte curativa'],
      warnings: ['Melancolia', 'Resistência ao fim', 'Apego'],
      keyAction: 'Encerre com gratidão, prepare o terreno para o novo ciclo.',
    },
    11: {
      theme: 'Ano de iluminação e intuição',
      duration: '12 meses de despertar',
      majorLessons: ['Confiar na intuição', 'Inspirar outros', 'Canalizar visões'],
      opportunities: ['Ensino', 'Cura', 'Criação inspirada'],
      warnings: ['Sobrecarga', 'Ansiedade espiritual', 'Isolamento'],
      keyAction: 'Ilumine a si e aos outros, manifeste a visão.',
    },
    22: {
      theme: 'Ano de construção mestre',
      duration: '12 meses de legado',
      majorLessons: ['Disciplina espiritual', 'Visão prática', 'Impacto coletivo'],
      opportunities: ['Projetos transformadores', 'Liderança de grandes causas'],
      warnings: ['Sobrecarga', 'Perfeccionismo', 'Pressão interna'],
      keyAction: 'Construa o legado que sua alma veio manifestar.',
    },
  };

  const themeData = themes[personalYear] || themes[1];

  // Período do ano pessoal
  // Convenção: começa no aniversário e vai até o próximo
  // Mas muitos sistemas usam Jan-Dez. Usamos Jan-Dez para simplicidade.
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  return {
    number: personalYear,
    startDate,
    endDate,
    ...themeData,
  };
}

// ============================================================
// ANO UNIVERSAL
// ============================================================

function calculateUniversalYear(currentDate: Date): UniversalYear {
  const year = currentDate.getFullYear();
  const num = reduce(sumDigits(year));

  const themes: Record<number, Omit<UniversalYear, 'year' | 'number'>> = {
    1: { theme: 'Novo ciclo de 9 anos', globalEnergy: 'Iniciativa, novos começos coletivos' },
    2: { theme: 'Construção e diplomacia', globalEnergy: 'Paciência, parcerias, detalhes' },
    3: { theme: 'Expressão criativa global', globalEnergy: 'Alegria, arte, comunicação' },
    4: { theme: 'Estruturação do mundo', globalEnergy: 'Trabalho, disciplina, base' },
    5: { theme: 'Mudanças globais', globalEnergy: 'Transformação, tecnologia, liberdade' },
    6: { theme: 'Foco em família e lar', globalEnergy: 'Amor, responsabilidade, cura' },
    7: { theme: 'Introspecção coletiva', globalEnergy: 'Espiritualidade, sabedoria' },
    8: { theme: 'Poder e abundância mundial', globalEnergy: 'Economia, conquistas, manifestação' },
    9: { theme: 'Encerramento de era', globalEnergy: 'Transformações finais, compaixão' },
  };

  return {
    year,
    number: num,
    ...(themes[num] || themes[1]),
  };
}

// ============================================================
// PINÁCULOS
// ============================================================

function calculatePinnacles(
  birthDate: Date,
  lifePath: number,
  expression: number = lifePath
): Pinnacle[] {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();

  // 1º Pináculo: do nascimento até 36 - vida
  const p1End = 36 - lifePath;
  // 2º Pináculo: 9 anos
  const p2End = p1End + 9;
  // 3º Pináculo: 9 anos
  const p3End = p2End + 9;
  // 4º Pináculo: até o fim

  const p1Num = reduce(month + day);
  const p2Num = reduce(day + year);
  const p3Num = reduce(p1Num + p2Num);
  const p4Num = reduce(month + year);

  const makePinnacle = (num: number, start: number, end: number | null, period: string, keyQ: string): Pinnacle => {
    const themes: Record<number, Omit<Pinnacle, 'number' | 'startAge' | 'endAge' | 'period' | 'keyQuestion'>> = {
      1: { theme: 'Iniciativa, independência, construção da identidade', opportunities: ['Começar a vida adulta', 'Tomar decisões próprias', 'Liderar'], challenges: ['Egocentrismo', 'Pressão por resultados', 'Solidão'] },
      2: { theme: 'Cooperação, paciência, desenvolvimento de talentos', opportunities: ['Parcerias', 'Diplomacia', 'Aprofundamento'], challenges: ['Indecisão', 'Dependência', 'Autocrítica'] },
      3: { theme: 'Expressão criativa, alegria, expansão social', opportunities: ['Arte', 'Comunicação', 'Viagens'], challenges: ['Dispersão', 'Superficialidade', 'Fofoca'] },
      4: { theme: 'Trabalho duro, construção de base, segurança', opportunities: ['Carreira', 'Saúde', 'Família'], challenges: ['Rigidez', 'Trabalho excessivo', 'Limites rígidos'] },
      5: { theme: 'Mudança, liberdade, aventura, transformação', opportunities: ['Viagens', 'Mudanças', 'Aprendizados'], challenges: ['Impulsividade', 'Instabilidade', 'Excessos'] },
      6: { theme: 'Amor, responsabilidade, lar, comunidade', opportunities: ['Casamento', 'Filhos', 'Serviço'], challenges: ['Sacrifício', 'Controle', 'Perfeccionismo'] },
      7: { theme: 'Introspecção, estudo, espiritualidade, sabedoria', opportunities: ['Terapia', 'Estudo', 'Desenvolvimento espiritual'], challenges: ['Isolamento', 'Ansiedade', 'Paralisia'] },
      8: { theme: 'Poder, abundância, reconhecimento, autoridade', opportunities: ['Negócios', 'Investimentos', 'Carreira'], challenges: ['Workaholic', 'Materialismo', 'Pressão'] },
      9: { theme: 'Humanitarismo, encerramento, compaixão, arte', opportunities: ['Voluntariado', 'Arte curativa', 'Viagens'], challenges: ['Melancolia', 'Soltar', 'Apego'] },
    };

    const t = themes[num] || themes[1];
    return {
      number: num,
      startAge: start,
      endAge: end,
      period,
      keyQuestion: keyQ,
      ...t,
    };
  };

  return [
    makePinnacle(p1Num, 0, p1End, `0-${p1End} anos`, 'Quem eu sou?'),
    makePinnacle(p2Num, p1End, p2End, `${p1End}-${p2End} anos`, 'Como eu construo?'),
    makePinnacle(p3Num, p2End, p3End, `${p2End}-${p3End} anos`, 'Como eu expresso?'),
    makePinnacle(p4Num, p3End, null, `${p3End}+ anos`, 'Qual meu legado?'),
  ];
}

function getCurrentPinnacle(
  pinnacles: Pinnacle[],
  age: number
): Pinnacle {
  return pinnacles.find(p => age >= p.startAge && (p.endAge === null || age <= p.endAge)) || pinnacles[3];
}

// ============================================================
// DESAFIOS
// ============================================================

function calculateChallenges(
  birthDate: Date,
  lifePath: number
): Challenge[] {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // Reduzir cada componente a 1 dígito (ou número mestre)
  const monthR = reduce(month, false);
  const dayR = reduce(day, false);
  const yearR = reduce(birthDate.getFullYear(), false);
  const lifeR = reduce(lifePath, false);

  const firstChallenge = Math.abs(monthR - dayR);
  const secondChallenge = Math.abs(dayR - yearR);
  const thirdChallenge = Math.abs(firstChallenge - secondChallenge);
  const fourthChallenge = Math.abs(monthR - yearR);

  const allNumbers = [firstChallenge, secondChallenge, thirdChallenge, fourthChallenge];

  const descriptions: Record<number, Omit<Challenge, 'level' | 'number' | 'name'>> = {
    0: {
      description: 'Você tem um dom natural mas deve aprender a equilibrar',
      howToOvercome: 'Meditação, presença e atenção ao próximo',
      lifeArea: 'Equilíbrio interior',
    },
    1: {
      description: 'Tendência ao egocentrismo e à independência excessiva',
      howToOvercome: 'Pratique escuta ativa, colaboração e generosidade',
      lifeArea: 'Relacionamentos',
    },
    2: {
      description: 'Sensibilidade extrema e medo de conflito',
      howToOvercome: 'Desenvolva coragem para falar verdades, terapia',
      lifeArea: 'Comunicação',
    },
    3: {
      description: 'Dificuldade de focar e terminar o que começa',
      howToOvercome: 'Disciplina, organização e um projeto por vez',
      lifeArea: 'Trabalho e criatividade',
    },
    4: {
      description: 'Rigidez, teimosia e resistência à mudança',
      howToOvercome: 'Flexibilidade, viagens e abertura ao novo',
      lifeArea: 'Mudanças e adaptação',
    },
    5: {
      description: 'Impulsividade, excessos e instabilidade',
      howToOvercome: 'Disciplina, rotina, moderação',
      lifeArea: 'Estabilidade',
    },
    6: {
      description: 'Perfeccionismo, controle e sacrifício excessivo',
      howToOvercome: 'Aceitar imperfeição, soltar, confiar',
      lifeArea: 'Amor e serviço',
    },
    7: {
      description: 'Isolamento, análise em excesso e desconfiança',
      howToOvercome: 'Comunidade, partilha, confiar no mistério',
      lifeArea: 'Conexão e fé',
    },
    8: {
      description: 'Materialismo, workaholismo e poder descontrolado',
      howToOvercome: 'Espiritualidade, equilíbrio vida-trabalho',
      lifeArea: 'Carreira e abundância',
    },
  };

  return [
    { level: 1, name: 'Primeiro Desafio', number: allNumbers[0], ...descriptions[allNumbers[0]] },
    { level: 2, name: 'Segundo Desafio', number: allNumbers[1], ...descriptions[allNumbers[1]] },
    { level: 3, name: 'Terceiro Desafio', number: allNumbers[2], ...descriptions[allNumbers[2]] },
    { level: 4, name: 'Quarto Desafio', number: allNumbers[3], ...descriptions[allNumbers[3]] },
  ];
}

// ============================================================
// LIÇÕES CÁRMICAS
// ============================================================

function calculateKarmicLessons(
  birthDate: Date,
  fullName: string = ''
): KarmicLesson[] {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  const dateDigits = String(day + month + year).split('').map(d => parseInt(d, 10));

  // Soma das letras do nome (A=1, B=2, etc)
  const nameDigits: number[] = [];
  if (fullName) {
    for (const char of fullName.toUpperCase().replace(/[^A-Z]/g, '')) {
      const value = char.charCodeAt(0) - 64;
      if (value > 0 && value < 27) {
        nameDigits.push(...String(value).split('').map(d => parseInt(d, 10)));
      }
    }
  }

  const allDigits = [...dateDigits, ...nameDigits];
  const present = new Set(allDigits);

  const lessons: Record<number, Omit<KarmicLesson, 'missing'>> = {
    1: { description: 'Lição de independência, liderança e auto-confiança', howToLearn: 'Pratique tomar decisões sozinho, confie na sua voz', lifeArea: 'Autonomia' },
    2: { description: 'Lição de paciência, diplomacia e cooperação', howToLearn: 'Medite sobre timing, cultive parcerias, espere', lifeArea: 'Relacionamentos' },
    3: { description: 'Lição de expressão, criatividade e comunicação', howToLearn: 'Escreva, fale, cante, dance — se expresse!', lifeArea: 'Comunicação' },
    4: { description: 'Lição de disciplina, estrutura e trabalho árduo', howToLearn: 'Construa rotinas, persevere, honre o processo', lifeArea: 'Trabalho' },
    5: { description: 'Lição de liberdade, mudança e adaptação', howToLearn: 'Viaje, experimente, rompa zonas de conforto', lifeArea: 'Liberdade' },
    6: { description: 'Lição de amor, responsabilidade e serviço', howToLearn: 'Cuide de outros com equilíbrio, honre o lar', lifeArea: 'Amor e família' },
    7: { description: 'Lição de introspecção, fé e sabedoria', howToLearn: 'Estude filosofia, medite, mergulhe no silêncio', lifeArea: 'Espiritualidade' },
    8: { description: 'Lição de poder, abundância e manifestação', howToLearn: 'Desenvolva valor próprio, gerencie recursos', lifeArea: 'Abundância' },
    9: { description: 'Lição de compaixão, encerramento e serviço', howToLearn: 'Voluntarie, perdoe, solte o que não serve', lifeArea: 'Humanitarismo' },
  };

  const missing: KarmicLesson[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!present.has(n)) {
      missing.push({
        missing: n,
        ...lessons[n],
      });
    }
  }

  return missing;
}

// ============================================================
// NÚMERO DE MATURIDADE
// ============================================================

function calculateMaturityNumber(
  lifePath: number,
  expression: number,
  age: number
): MaturityNumber {
  const number = reduce(lifePath + expression, true);
  const year = age >= 35 ? 35 : 45; // Ativa depois dos 35

  const themes: Record<number, Omit<MaturityNumber, 'number' | 'year'>> = {
    1: { theme: 'Liderança madura', description: 'Sua maturidade traz autoridade e independência. Você se torna referência.', gifts: ['Visão', 'Coragem', 'Liderança'], challenges: ['Solidão', 'Arrogância', 'Pressão'] },
    2: { theme: 'Diplomacia madura', description: 'Sua maturidade traz paciência e parcerias profundas.', gifts: ['Empatia', 'Mediação', 'Cooperação'], challenges: ['Indecisão', 'Dependência', 'Autossabotagem'] },
    3: { theme: 'Expressão madura', description: 'Sua maturidade traz criatividade e comunicação elevada.', gifts: ['Arte', 'Carisma', 'Otimismo'], challenges: ['Dispersão', 'Fofoca', 'Superficialidade'] },
    4: { theme: 'Construção madura', description: 'Sua maturidade traz estabilidade e realizações concretas.', gifts: ['Disciplina', 'Persistência', 'Confiabilidade'], challenges: ['Rigidez', 'Workaholic', 'Medo'] },
    5: { theme: 'Liberdade madura', description: 'Sua maturidade traz sabedoria através da experiência.', gifts: ['Adaptabilidade', 'Versatilidade', 'Coragem'], challenges: ['Impulsividade', 'Inquietude', 'Excessos'] },
    6: { theme: 'Amor maduro', description: 'Sua maturidade traz responsabilidade e compaixão profunda.', gifts: ['Amor', 'Cura', 'Compaixão'], challenges: ['Sacrifício', 'Controle', 'Perfeccionismo'] },
    7: { theme: 'Sabedoria madura', description: 'Sua maturidade traz introspecção e conhecimento profundo.', gifts: ['Sabedoria', 'Intuição', 'Análise'], challenges: ['Isolamento', 'Ansiedade', 'Desconfiança'] },
    8: { theme: 'Poder maduro', description: 'Sua maturidade traz abundância e reconhecimento.', gifts: ['Poder', 'Manifestação', 'Autoridade'], challenges: ['Workaholic', 'Materialismo', 'Ganância'] },
    9: { theme: 'Compaixão madura', description: 'Sua maturidade traz humanitarismo e encerramento sábio.', gifts: ['Compaixão', 'Sabedoria', 'Generosidade'], challenges: ['Melancolia', 'Apego', 'Sacrifício'] },
    11: { theme: 'Iluminação madura', description: 'Sua maturidade traz inspiração e dom espiritual.', gifts: ['Intuição', 'Inspiração', 'Cura'], challenges: ['Sensibilidade', 'Ansiedade', 'Isolamento'] },
    22: { theme: 'Construtor mestre', description: 'Sua maturidade traz capacidade de construir legados.', gifts: ['Manifestação', 'Visão', 'Disciplina'], challenges: ['Pressão', 'Perfeccionismo', 'Sobrecarga'] },
    33: { theme: 'Mestre curador', description: 'Sua maturidade traz cura e serviço compassivo.', gifts: ['Cura', 'Amor', 'Compaixão'], challenges: ['Sacrifício', 'Codependência', 'Esgotamento'] },
  };

  return {
    number,
    year,
    ...(themes[number] || themes[1]),
  };
}

// ============================================================
// SNAPSHOT COMPLETO
// ============================================================

export function buildCycleSnapshot(
  birthDate: Date,
  lifePath: number,
  expression: number = lifePath,
  fullName: string = '',
  currentDate: Date = new Date()
): PersonalCycleSnapshot {
  const personalYear = calculatePersonalYear(birthDate, currentDate, lifePath);
  const personalMonth = calculatePersonalMonth(personalYear.number, currentDate);
  const personalDay = calculatePersonalDay(birthDate, currentDate, lifePath);
  const universalYear = calculateUniversalYear(currentDate);
  const pinnacles = calculatePinnacles(birthDate, lifePath, expression);
  const age = ageInYears(birthDate, currentDate);
  const currentPinnacle = getCurrentPinnacle(pinnacles, age);
  const challenges = calculateChallenges(birthDate, lifePath);
  const karmicLessons = calculateKarmicLessons(birthDate, fullName);
  const maturity = calculateMaturityNumber(lifePath, expression, age);

  // Overall energy: maior quando dia/mês/ano pessoais e universal convergem
  const energyMatches = [
    personalDay.number === personalMonth.number,
    personalMonth.number === personalYear.number,
    personalDay.number === personalYear.number,
    personalDay.energy === 'spiritual' || personalMonth.energy.includes('Inici') || personalYear.theme.includes('poder'),
  ].filter(Boolean).length;
  const overallEnergy = 50 + (energyMatches * 12);

  const synthesis = `📅 **HOJE — ${currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}**

🌟 **Sua energia hoje (Dia Pessoal ${personalDay.number}):** ${personalDay.energy}
${personalDay.keywords.slice(0, 3).map(k => `• ${k}`).join('\n')}

📆 **Mês Pessoal ${personalMonth.number}:** ${personalMonth.theme}

🎯 **Ano Pessoal ${personalYear.number}:** ${personalYear.theme}

🌍 **Ano Universal ${universalYear.number}:** ${universalYear.theme}

⛰️ **Pináculo Atual (${age} anos):** ${currentPinnacle.theme}

💎 **Ação-chave do dia:** ${personalDay.action}`;

  return {
    birthDate: birthDate.toISOString().split('T')[0],
    currentDate: currentDate.toISOString().split('T')[0],
    age,
    lifePath,
    personalDay,
    personalMonth,
    personalYear,
    universalYear,
    pinnacles,
    currentPinnacle,
    challenges,
    karmicLessons,
    maturity,
    synthesis,
    overallEnergy,
  };
}
