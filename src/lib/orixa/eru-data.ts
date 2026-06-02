// @ts-nocheck
// SKIP_LINT

/**
 * Eru Data Module
 * Spiritual data for Eru, the orixá of crossroads, destiny, and fate
 */

export interface EruData {
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

const ERU_DATA: EruData[] = [
  {
    id: 'eru',
    name: 'Eru',
    namePortuguese: 'Senhor dos Caminhos',
    path: 'Eru',
    element: 'Encruzilhada e Destino',
    colors: ['#000000', '#8B0000', '#FFD700'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Eruê!',
    archetype: 'O Guardião das Encruzilhadas',
    qualities: ['Destino', 'Escolhas', 'Conhecimento oculto', 'Medição', 'Transformação', 'Iniciação'],
    challenges: ['Manipulação', 'Engano', 'Procrastinação', 'Medo das escolhas'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cão', 'Corvo', 'Cavalo'],
    plants: ['Arruda', ' Alecrim', 'Pau-brasil'],
    offerings: ['Farinha de mandioca', 'Azeite de dendê', 'Velaspretas', 'Fumo', 'Café', 'Dinheiro'],
    chants: ['Eru', 'Eruê', 'Alá', 'Caminho'],
    symbols: ['Caminho', 'Encruzilhada', 'Chave', 'Livro'],
    mythology:
      'Eru é o orixá das encruzilhadas e dos destinos. Foi criado por Olodumaré para servir como mensageiro entre o mundo físico e espiritual. É ele quem abre e fecha os caminhos, decidindo quais rumos cada pessoa tomará. Eru é considerado o mais misterioso dos orixás, pois seu domínio é o do destino que ainda não foi escrito.',
    spiritualLesson: 'A cada encruzilhada, há uma oportunidade de transformação e escolha consciente',
    affirmation: 'Eu abraço as encruzilhadas da vida como portais de crescimento e transformação',
    meditation: 'Visualize-se em uma encruzilhada iluminada, onde cada caminho representa uma escolha de evolução',
  },
  {
    id: 'eru-elegba',
    name: 'Elegba',
    namePortuguese: 'O Interruptor de Caminhos',
    path: 'Eru',
    element: 'Bloqueio e Liberação',
    colors: ['#FF0000', '#000000', '#FFFFFF'],
    dayOfWeek: 'Domingo',
    numbersSacred: [3, 6, 9],
    greeting: 'Elegbaê!',
    archetype: 'O Senhor das Possibilidades',
    qualities: ['Comunicação', 'Expansão', 'Liberdade', 'Desbloqueio', 'Curiosidade', 'Espiritualidade'],
    challenges: ['Brincadeira demais', 'Engano', 'Manipulação', 'Rebelião'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cão', 'Coruja', 'Raposa'],
    plants: ['Arruda', 'Verbena', 'Sálvia'],
    ofertas: ['Velasvermelhas e pretas', 'Fumo', 'Dinheiro', 'Farinha de milho', 'Amendoim torrado'],
    chants: ['Elegba', 'Elegbaê', 'Kaô', 'Abbé'],
    symbols: ['Mochila', 'Cachimbo', 'Cão', 'Pedra'],
    mythology:
      'Elegba é a face de Eru que representa o princípio da abertura de caminhos. É ele quem está sempre presente nas encruzilhadas, pronto para bloquear ou liberar o acesso aos diversos destinos. Sem Elegba, nenhuma oração chegaria aos deuses, nenhum sacrifício seria aceito, nenhuma travessia seria possível.',
    spiritualLesson: 'O bloqueio de hoje é a preparação para a abertura de amanh?',
    affirmation: 'Eu abro os caminhos bloqueados e permito que novas possibilidades entrem em minha vida',
    meditation: 'Imagine uma porta antiga se abrindo, revelando um caminho iluminado além da escuridão',
  },
  {
    id: 'eru-oxaguii',
    name: 'Oxaguii',
    namePortuguese: 'A Verdade Revelada',
    path: 'Eru',
    element: 'Iluminação e Revelação',
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
      'Oxaguii é Eru em sua forma de revelação da verdade. È considerado o mais velho dos ibeji (gêmeos) e representa o princípio da verdade absoluta e da justiça divina. Quando Eru abre um caminho para a verdade, Oxaguii é quem iluminará o caminho com sua luz dourada.',
    spiritualLesson: 'A verdade liberta, mesmo quando machuca',
    affirmation: 'Eu Busco a verdade com coragem e aceito a iluminação que ela traz',
    meditation: 'Visualize uma luz dourada descendo sobre você, dissipando todas as sombras de ilusão',
  },
  {
    id: 'eru-oxalufe',
    name: 'Oxalufe',
    namePortuguese: 'O Ancião do Destino',
    path: 'Eru',
    element: 'Sabedoria e Tempo',
    colors: ['#87CEEB', '#E0FFFF', '#B0C4DE'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Oxalufê!',
    archetype: 'O Guardião do Tempo',
    qualities: ['Paciência', 'Sabedoria', 'Antigüidade', 'Memória', 'Mistério', 'Transcendência'],
    challenges: ['Rigidez', 'Melancolia', 'Velhice', 'Passividade'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Búfalo', 'Tartaruga', 'Abelha'],
    plants: ['Jurema', 'Umbu', 'Carvalho'],
    offerings: ['Água de cheiro', 'Flores brancas', 'Velas azuis', 'Frutas', 'Mel'],
    chants: ['Oxalufe', 'Oxalufê', 'Oxalufi', 'Tempo'],
    symbols: ['Cálice', 'Bengala', 'Luas', 'Ampulheta'],
    mythology:
      'Oxalufe é Eru em sua manifestação mais antiga e sábia. Representa o tempo cósmico e a memória ancestral. È Oxalufe quem registra cada escolha feita nas encruzilhadas da vida, guardando o destino de todos os seres. Quando alguém busca conhecer seu destino verdadeiro, é a Oxalufe que deve ser consultado.',
    spiritualLesson: 'O tempo é o maior mestre, e a paciência é a maior sabedoria',
    affirmation: 'Eu abraço o tempo com gratidão, entendendo que cada momento é parte do meu destino',
    meditation: 'Imagine uma ampulheta cósmica, onde a areia dourada representa as experiências acumuladas',
  },
  {
    id: 'eru-oxumar',
    name: 'Oxumar',
    namePortuguese: 'O Aranha do Destino',
    path: 'Eru',
    element: 'Tecer e Destino',
    colors: ['#9932CC', '#FFD700', '#00CED1'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [5, 10, 15],
    greeting: 'Oxumarê!',
    archetype: 'O Tecelão de Destinos',
    qualities: ['Tecer', 'Ciclos', 'Magia', 'Transformação', 'Criam', 'Integração'],
    challenges: ['Ilusão', 'Complejidade', 'Labirinto', 'Engano'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Aranha', 'Cobra', 'Sapo'],
    plants: ['Mandrágora', 'Lótus', 'Musgo'],
    ofertas: ['Seda', 'Velas roxas e douradas', 'Mel', 'Cera', 'Perolas'],
    chants: ['Oxumar', 'Oxumarê', 'Teia', 'Criar'],
    symbols: ['Teia', 'Fuso', 'Urso', 'Chave de ouro'],
    mythology:
      'Oxumar é Eru como tecelão do destino. È ele quem tece a teia que conecta todos os seres e eventos do universo. Cada fio representa uma escolha, um destino, uma conexão. Oxumar vê além do tempo linear, compreendendo como todos os fios se entrelaçam para criar o padrão maior do destino cósmico.',
    spiritualLesson: 'Cada fio que tecemos conecta-se a um padrão maior que transcende nossa compreensão imediata',
    affirmation: 'Eu teço meu destino com intenção e consciência, criando uma vida de propósito e beleza',
    meditation: 'Imagine uma teia luminosa de possibilidades ao seu redor, cada fio representando um caminho',
  },
];

export function getData(): EruData[] {
  return ERU_DATA;
}

function getDataById(id: string): EruData | undefined {
  return ERU_DATA.find((e) => e.id === id);
}

function searchData(query: string): EruData[] {
  const lowerQuery = query.toLowerCase();
  return ERU_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.element.toLowerCase().includes(lowerQuery) ||
      e.archetype.toLowerCase().includes(lowerQuery) ||
      e.qualidades.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      e.mythology.toLowerCase().includes(lowerQuery)
  );
}

function getEruByDay(day: string): EruData[] {
  return ERU_DATA.filter((e) => e.dayOfWeek.toLowerCase() === day.toLowerCase());
}

function getEruByElement(element: string): EruData[] {
  return ERU_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}

function getEruByPlanet(planet: string): EruData[] {
  return ERU_DATA.filter((e) => e.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}