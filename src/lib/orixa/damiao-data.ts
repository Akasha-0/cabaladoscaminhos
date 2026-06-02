// @ts-nocheck
// SKIP_LINT

/**
 * Damião Data Module
 * Spiritual data for Damião, the faithful companion and keeper of legacies
 */

export interface DamiaoData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  domains: string[];
  vessels: string[];
  legacyTeaching: string;
}

const DAMIAO_DATA: DamiaoData[] = [
  {
    id: 'damiao',
    name: 'Damião',
    namePortuguese: 'O Companheiro Fiel',
    path: 'Damião',
    element: 'Terra e Fogo',
    colors: ['#8B4513', '#CD853F', '#D2691E', '#A0522D'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Ao seu lado, sempre!',
    archetype: 'O Guardião dos Compromissos',
    qualities: ['Lealdade', 'Persistência', 'Honestidade', 'Dedicação', 'Paciência', 'Coragem'],
    challenges: ['Autocobrança excessiva', 'Dificuldade em pedir ajuda', 'Perfeccionismo'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cão', 'Cavalo', 'Tartaruga'],
    plants: ['Alecrim', 'Arruda', 'Guiné'],
    offerings: ['Pão fresco', 'Café preto', 'Fumo trançado', 'Vela vermelha', 'Moeda de prata'],
    chants: ['Companheiro fiel', 'Guardião do caminho', 'Sem abandonar nunca'],
    symbols: ['Cápsula de tempo', 'Chave antiga', 'Livro de promessas', 'Fio de linha'],
    mythology:
      'Damião surge como aquele que nunca abandona, o amigo que permanece quando todos partem. Ele representa a força silenciosa da lealdade inabalável e a coragem de manter promessas mesmo quando o mundo inteiro esqueceu.',
    spiritualLesson: 'A verdadeira força está em permanecer, em ser consistente quando ninguém está observando, e em manter a palavra dada sem esperar reconhecimento',
    affirmation: 'Eu sou fiel aos meus compromissos, mantendo minha palavra mesmo nas horas mais difíceis com sinceridade e coragem',
    meditation: 'Sinta a solidez da terra sob seus pés, mantendo-se firme enquanto o tempo passa ao seu redor',
    domains: ['Lealdade', 'Persistência', 'Honestidade', 'Companheirismo', 'Guardianship', 'Promessas'],
    vessels: ['Caixa de madeira', 'Cálice de café', 'Pé de蜡烛', 'Fio vermelho'],
    legacyTeaching: 'A fidelidade não é apenas estar presente nos momentos bons, mas permanecer quando tudo ao redor desmorona',
  },
  {
    id: 'damiao-brasao',
    name: 'Damião do Brasão',
    namePortuguese: 'O Protetor do Nome',
    path: 'Damião',
    element: 'Honra e Aço',
    colors: ['#4A0E0E', '#800000', '#D4AF37', '#2F4F4F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Em nome da honra!',
    archetype: 'O Defensor das Promessas',
    qualities: ['Honra', 'Defesa', 'Nobreza', 'Respeito', 'Disciplina', 'Integridade'],
    challenges: ['Rigidez moral', 'Dificuldade em perdoar', 'Sofrimento silencioso'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cão de guarda', 'Leão', 'Águia'],
    plants: ['Espada', 'Loureiro', 'Carvalho'],
    ofertas: ['Vinho tinto', 'Carne assada', 'Medalha antiga', 'Sino pequeño', 'Lâmina de Bronze'],
    chants: ['Defesa eterna', 'Nome preservado', 'Juramento mantido', 'Guarda do brasão'],
    symbols: ['Escudo', 'Espada', 'Brasão familiar', 'Coroa de louros'],
    mythology:
      'Quando a honra da família estava em jogo, Damião ergueu-se como muralha. Seu nome tornou-se sinônimo de integridade inabalável, aquele que prefere perder tudo a macular seu compromisso.',
    spiritualLesson: 'A verdadeira honra não está na conquista do sucesso, mas na manutenção da integridade quando ninguém está vendo',
    affirmation: 'Eu defendo minha honra e a daqueles que amo com integridade inabalável e coragem silenciosa',
    meditation: 'Visualize um escudo brilhante que protege não apenas você, mas todos aqueles que confiam em sua palavra',
    domains: ['Honra', 'Defesa', 'Nobreza', 'Integridade', 'Lealdade', 'Proteção'],
    vessels: ['Cálice de vinho', 'Espada ornamental', 'Livro de juramentos', 'Medalha de família'],
    legacyTeaching: 'Um nome carrega peso através das gerações — escolho honrar cada promessa feita em meu nome',
  },
];

export function getData(): DamiaoData[] {
  return DAMIAO_DATA;
}

function getDataById(id: string): DamiaoData | undefined {
  return DAMIAO_DATA.find((d) => d.id === id);
}

function searchData(query: string): DamiaoData[] {
  const q = query.toLowerCase();
  return DAMIAO_DATA.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.path.toLowerCase().includes(q) ||
      d.qualities.some((q1) => q1.toLowerCase().includes(q))
  );
}

function getDamiaoByDay(day: string): DamiaoData[] {
  return DAMIAO_DATA.filter((d) => d.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getDamiaoByElement(element: string): DamiaoData[] {
  return DAMIAO_DATA.filter((d) => d.element.toLowerCase().includes(element.toLowerCase()));
}

function getDomains(): string[] {
  return ['Lealdade', 'Persistência', 'Honestidade', 'Companheirismo', 'Guardianship', 'Promessas', 'Honra', 'Defesa'];
}

function getSacredAnimals(): string[] {
  return ['Cão', 'Cavalo', 'Tartaruga', 'Cão de guarda', 'Leão', 'Águia'];
}

function getSymbols(): string[] {
  return ['Cápsula de tempo', 'Chave antiga', 'Livro de promessas', 'Fio de linha', 'Escudo', 'Espada', 'Brasão familiar'];
}

function getLegacyTeaching(): string {
  const teachings = DAMIAO_DATA.map((d) => d.legacyTeaching);
  return teachings[Math.floor(Math.random() * teachings.length)];
}

function getAffirmations(): string[] {
  return DAMIAO_DATA.map((d) => d.affirmation);
}

function getDamiaoByArchetype(archetype: string): DamiaoData[] {
  return DAMIAO_DATA.filter((d) => d.archetype.toLowerCase().includes(archetype.toLowerCase()));
}