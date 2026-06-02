 
// @ts-nocheck
// SKIP_LINT

/**
 * Obaxoxe Data Module
 * Spiritual data for Obaxoxe, the orixá of earth, transformation, and spiritual evolution
 */

export interface ObaxoxeData {
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
}

const OBAXOXE_DATA: ObaxoxeData[] = [
  {
    id: 'obaxoxe',
    name: 'Obaxoxe',
    namePortuguese: 'Senhor da Terra Vermelha',
    path: 'Obaxoxe',
    element: 'Terra Vermelha e Fogo',
    colors: ['#8B0000', '#CD5C5C', '#A52A2A', '#B8860B'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Epa!',
    archetype: 'O Transformador da Alma',
    qualities: ['Transformação', 'Purificação', 'Renovação', 'Força interior', 'Determinação', 'Coragem'],
    challenges: ['Rigidez', 'Impaciência com o processo', 'Teimosia', 'Medo das mudanças'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cobra', 'Raposa', 'Touro'],
    plants: ['Pau-brasil', 'Babosa', 'Arruda', 'Guiné'],
    offerings: ['Azeite de dendê vermelho', 'Farinha de mandioca', 'Velas vermelhas', 'Goma queimada', 'Carne seca', 'Feijão vermelho'],
    chants: ['Obaxoxe', 'Epa', 'Ogunhê', 'Iê'],
    symbols: ['Terra vermelha', 'Machado', 'Fogo', 'Serpentina'],
    mythology:
      'Obaxoxe é o orixá da terra vermelha, do sangue e da transformação. É ele quem transforma a matéria bruta em algo sagrado, como a argila que se torna vaso nas mãos do oleiro. Governa os processos de purificação e renovação que todas as coisas atravessam. Dizem que Obaxoxe foi o primeiro a entender que sem a morte não há vida, e que toda queda carrega em si a semente da ascensão.',
    spiritualLesson: 'A verdadeira transformação exige coragem para confrontar o que precisa ser mudado dentro de nós',
    affirmation: 'Eu abraço a força transformadora de Obaxoxe, permitindo que o fogo interior purifique minha essência',
    meditation: 'Visualize a terra vermelha envolvendo você, suas partículas penetrando cada célula e transformando o que precisa ser renovado',
  },
  {
    id: 'obaxoxe-oxaguiã',
    name: 'Obaxoxe Oxaguiã',
    namePortuguese: 'Terra que Caminha',
    path: 'Obaxoxe',
    element: 'Terra e Movimento',
    colors: ['#D2691E', '#F4A460', '#DEB887', '#DAA520'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 14],
    greeting: 'Obá!',
    archetype: 'O Cavaleiro da Terra',
    qualities: ['Mobilidade', 'Adaptabilidade', 'Conexão terra-corpo', 'Vitalidade', 'Persistência', 'Honra'],
    challenges: ['Inquietação excessiva', 'Dificuldade de permanecer', 'Superficialidade nas raízes', 'Ansiedade'],
    rulingPlanet: 'Terra',
    sacredAnimals: ['Cavalo', 'Veado', 'Lebre'],
    plants: ['Capim-santo', 'Alecrim', 'Hortelã', 'Cravo'],
    offerings: ['Fumo de rolo', 'Café preto', 'Bebidas alcoólicas', 'Carne grelhada', 'Frutas douradas', 'Dinheiro'],
    chants: ['Oxaguiã', 'Obá', 'Epahei', 'Xê'],
    symbols: ['Cavalo', 'Espora', 'Chicote', 'Sela'],
    mythology:
      'Obaxoxe Oxaguiã é a faceta cavaleira de Obaxoxe, aquele que cavalga sobre a terra sem se prender a ela. É o orixá dos viajantes, dos mensageiros entre mundos, e daqueles que precisam de força para percorrer longos caminhos. Conta-se que Oxaguiã foi o primeiro a cavalgar sobre a terra vermelha, abrindo trilhas que antes não existiam, mostrando aos outros orixás que o caminho se faz ao caminhar.',
    spiritualLesson: 'Precisamos nos mover para crescer, mas nunca esquecer de onde viemos e para onde vamos',
    affirmation: 'Eu caminho com propósito sobre a terra sagrada, honrando minhas raízes enquanto sigo minha jornada',
    meditation: 'Imagine-se cavalgando sobre campos vermelhos, cada batida do casco deixando marcas que alimentam a terra',
  },
];

export function getData(): ObaxoxeData[] {
  return OBAXOXE_DATA;
}

function getDataById(id: string): ObaxoxeData | undefined {
  return OBAXOXE_DATA.find((o) => o.id === id);
}

function searchData(query: string): ObaxoxeData[] {
  const q = query.toLowerCase();
  return OBAXOXE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.element.toLowerCase().includes(q)
  );
}

function getObaxoxeByDay(day: string): ObaxoxeData[] {
  return OBAXOXE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getObaxoxeByElement(element: string): ObaxoxeData[] {
  return OBAXOXE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}