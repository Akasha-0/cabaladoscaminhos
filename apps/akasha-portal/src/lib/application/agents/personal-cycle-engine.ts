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

  // I Ching — hexagrama do dia (Layer 5, §P7-ext)
  ichingHex?: {
    number: number;
    name: string;
    upperTrigram: number;   // 1-8 (TrigramId King Wen)
    lowerTrigram: number;   // 1-8 (TrigramId King Wen)
    judgment: string;
    image: string;
  };

  // Meta
  synthesis: string;
  overallEnergy: number;     // 0-100
}

// ============================================================
// CORE CALCULATIONS
// ============================================================

import { reduce, sumDigits, ageInYears } from './personal-cycle-numerology';
import { PERSONAL_DAY_DATA } from './personal-cycle-day-data';
import { computeDailyHexagram } from '@/lib/domain/iching';

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

  // dayData moved to personal-cycle-day-data.ts → PERSONAL_DAY_DATA

  const data = PERSONAL_DAY_DATA[personalDay] || PERSONAL_DAY_DATA[1];

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
    const t = PINNACLE_THEMES[num] ?? PINNACLE_THEMES[1];
    return {
      number: num,
      startAge: start,
      endAge: end,
      period,
      keyQuestion: keyQ,
      theme: t.theme,
      opportunities: t.opportunities,
      challenges: t.challenges,
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

  return [
    { level: 1, name: 'Primeiro Desafio', number: allNumbers[0], ...CHALLENGE_DESCRIPTIONS[allNumbers[0]] },
    { level: 2, name: 'Segundo Desafio', number: allNumbers[1], ...CHALLENGE_DESCRIPTIONS[allNumbers[1]] },
    { level: 3, name: 'Terceiro Desafio', number: allNumbers[2], ...CHALLENGE_DESCRIPTIONS[allNumbers[2]] },
    { level: 4, name: 'Quarto Desafio', number: allNumbers[3], ...CHALLENGE_DESCRIPTIONS[allNumbers[3]] },
  ];
}

import {
  PINNACLE_THEMES,
  CHALLENGE_DESCRIPTIONS,
  KARMIC_LESSON_DESCRIPTIONS,
  MATURITY_THEMES,
} from '@/lib/grimoire/mapeamentos/personal-cycle';

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

  const missing: KarmicLesson[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!present.has(n)) {
      missing.push({
        missing: n,
        ...KARMIC_LESSON_DESCRIPTIONS[n],
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

  const t = MATURITY_THEMES[number] ?? MATURITY_THEMES[1];
  return {
    number,
    year,
    theme: t.theme,
    description: t.description,
    gifts: t.gifts,
    challenges: t.challenges,
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
