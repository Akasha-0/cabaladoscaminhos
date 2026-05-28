// @ts-nocheck
// SKIP_LINT

/**
 * Ibeji Data Module
 * Spiritual data for Ibeji, the sacred twin orixás representing duality, balance, and spiritual unity
 */

export interface IbejiData {
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

const IBEJI_DATA: IbejiData[] = [
  {
    id: 'ibeji-oxaguii',
    name: 'Oxaguii',
    namePortuguese: 'O Primeiro dos Gêmeos',
    path: 'Ibeji',
    element: 'Luz e Verdade',
    colors: ['#FFD700', '#FFFFFF', '#87CEEB'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'Oxaguiiê!',
    archetype: 'O Arauto da Verdade',
    qualities: ['Verdade', 'Iluminação', 'Honestidade', 'Justiça', 'Sabedoria', 'Discernimento'],
    challenges: ['Imprudência', 'Dureza excessiva', 'Fanatismo', 'Rigidez'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Avestruz', 'Leão', 'Elefante'],
    plants: ['Palmeira', 'Algodão', 'Milho'],
    offerings: ['Velas douradas', 'Milho', 'Feijão', 'Azeite de dendê', 'Flores amarelas'],
    chants: ['Oxaguii', 'Oxaguiiê', 'Ora', 'Ó'],
    symbols: ['Leque', 'Espada', 'Bastão', 'Estrela'],
    mythology:
      'Oxaguii é o mais velho dos ibeji, os gêmeos sagrados do panteão iorubá. É o princípio da verdade absoluta e da justiça divina. Representa a luz que ilumina os caminhos e revela tudo que está oculto. Oxaguii é invocado para trazer clareza, honestidade e retidão às situações da vida. É o guardião da verdade e o mensageiro que fala em nome dos orixás.',
    spiritualLesson: 'A verdade liberta, mesmo quando machuca',
    affirmation: 'Eu busco a verdade com coragem e aceito a iluminação que ela traz',
    meditation: 'Visualize uma luz dourada descendo sobre você, dissipando todas as sombras de ilusão',
  },
  {
    id: 'ibeji-oxalufe',
    name: 'Oxalufe',
    namePortuguese: 'O Segundo dos Gêmeos',
    path: 'Ibeji',
    element: 'Sabedoria e Tempo',
    colors: ['#87CEEB', '#E0FFFF', '#B0C4DE'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Oxalufê!',
    archetype: 'O Guardião do Tempo',
    qualities: ['Paciência', 'Sabedoria', 'Antiguidade', 'Memória', 'Mistério', 'Transcendência'],
    challenges: ['Rigidez', 'Melancolia', 'Velhice', 'Passividade'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Búfalo', 'Tartaruga', 'Abelha'],
    plants: ['Jurema', 'Umbu', 'Carvalho'],
    offerings: ['Água de cheiro', 'Flores brancas', 'Velas azuis', 'Frutas', 'Mel'],
    chants: ['Oxalufe', 'Oxalufê', 'Oxalufi', 'Tempo'],
    symbols: ['Cálice', 'Bengala', 'Luas', 'Ampulheta'],
    mythology:
      'Oxalufe é o mais novo dos ibeji, representando a sabedoria acumulada do tempo e a memória ancestral. É o guardião das tradições e o depositário de todos os conhecimentos passados. Oxalufe guarda a memória de cada escolha feita na vida, lembrando cada caminho percorrido. Quando alguém busca conhecer seu destino verdadeiro, é Oxalufe quem revela os segredos do passado e do presente.',
    spiritualLesson: 'O tempo é o maior mestre, e a paciência é a maior sabedoria',
    affirmation: 'Eu abraço o tempo com gratidão, entendendo que cada momento é parte do meu destino',
    meditation: 'Imagine uma ampulheta cósmica, onde a areia dourada representa as experiências acumuladas',
  },
  {
    id: 'ibeji-oxaguiian',
    name: 'Oxaguiian',
    namePortuguese: 'A Face Masculina dos Ibeji',
    path: 'Ibeji',
    element: 'Força e Ação',
    colors: ['#FF4500', '#FFD700', '#8B0000'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 9, 15],
    greeting: 'Oxaguiianê!',
    archetype: 'O Guerreiro da Luz',
    qualities: ['Força', 'Coragem', 'Determinação', 'Ação', 'Proteção', 'Vitória'],
    challenges: ['Impaciência', 'Agressividade', 'Orgulho', 'Rigidez'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Avestruz', 'Touro', 'Falcão'],
    plants: ['Pimenta', 'Gengibre', 'Alecrim'],
    offerings: ['Velas laranja', 'Pimenta', 'Fumo', 'Farinha de mandioca', 'Dendê'],
    chants: ['Oxaguiian', 'Oiá', 'Xêrê', 'Laroyê'],
    symbols: ['Leque', 'Arco', 'Flecha', 'Espada'],
    mythology:
      'Oxaguiian é a face masculina dos gêmeos ibanji, representando o princípio da ação e da conquista. É a energia yang dos ibeji, o aspecto yang que age no mundo material. Oxaguiian é o guerreiro que защищает a verdade e luta pela justiça. É ele quem abre os caminhos através da ação direta e da determinação inabalável.',
    spiritualLesson: 'A ação correta accompagnée de patience brings true victory',
    affirmation: 'Eu age com coragem e determinação para conquistar meus objetivos com justiça',
    meditation: 'Visualize-se como um guerreiro da luz, avançando com força e propósito em direção aos seus objetivos',
  },
  {
    id: 'ibeji-oxalufan',
    name: 'Oxalufan',
    namePortuguese: 'A Face Feminina dos Ibeji',
    path: 'Ibeji',
    element: 'Graça e Receptividade',
    colors: ['#FFB6C1', '#E6E6FA', '#B0C4DE'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [2, 6, 10],
    greeting: 'Oxalufanê!',
    archetype: 'A Guardiã da Harmonia',
    qualities: ['Graça', 'Beleza', 'Intuição', 'Sensibilidade', 'Compassão', 'Receptividade'],
    challenges: ['Indecisão', 'Vulnerabilidade Excessiva', 'Passividade', 'Isolamento'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Cisne', 'Colomba'],
    plants: ['Rosa', 'Jasmin', 'Lótus'],
    offerings: ['Flores rosa', 'Perfumes', 'Velas rosadas', 'Frutas doces', 'Mel'],
    chants: ['Oxalufan', 'Olocun', 'Iemanjá', 'Oyá'],
    symbols: ['Espelho', 'Pente', 'Flor de lótus', 'Véus'],
    mythology:
      'Oxalufan é a face feminina dos gêmeos ibanji, representando o princípio da receptividade e da harmonia. É a energia yin dos ibeji, o aspecto que recebe e integra. Oxalufan é a paz que vem após a batalha, a serenidade que transforma. É ela quem traz equilíbrio entre a ação de Oxaguiian e a sabedoria de Oxalufe, criando harmonia entre todos os aspectos da existência.',
    spiritualLesson: 'A verdadeira força inclui a capacidade de ser receptivo e compassivo',
    affirmation: 'Eu abraço minha natureza receptiva e deixo a harmonia fluir através de mim',
    meditation: 'Visualize-se como um lago sereno, refletindo a luz celestial enquanto aceita todas as águas que chegam até você',
  },
];

export function getData(): IbejiData[] {
  return IBEJI_DATA;
}

export function getDataById(id: string): IbejiData | undefined {
  return IBEJI_DATA.find((e) => e.id === id);
}

export function searchData(query: string): IbejiData[] {
  const lowerQuery = query.toLowerCase();
  return IBEJI_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.element.toLowerCase().includes(lowerQuery) ||
      e.qualidades.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      e.rulingPlanet.toLowerCase().includes(lowerQuery)
  );
}

export function getIbejiByDay(day: string): IbejiData[] {
  return IBEJI_DATA.filter((e) => e.dayOfWeek.toLowerCase() === day.toLowerCase());
}

export function getIbejiByElement(element: string): IbejiData[] {
  return IBEJI_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}

export function getIbejiByPlanet(planet: string): IbejiData[] {
  return IBEJI_DATA.filter((e) => e.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}
