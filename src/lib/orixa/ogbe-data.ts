// @ts-nocheck
// SKIP_LINT

/**
 * Ogbe Data Module
 * Spiritual data for Ogbe, the sacred Odu of Ifá representing creation, expansion, and divine beginning
 */

export interface OgbeData {
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

const OGBE_DATA: OgbeData[] = [
  {
    id: 'ogbe',
    name: 'Okaran',
    namePortuguese: 'Senhor da Criação e Expansão',
    path: 'Ogbe',
    element: 'Água e Ar',
    colors: ['#FFD700', '#FFFFFF', '#87CEEB'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Ogbe!',
    archetype: 'O Originador do Começo Sagrado',
    qualities: ['Criatividade', 'Expansão', 'Iniciativa', 'Fortuna', 'Conexão divina', 'Abundância'],
    challenges: ['Impaciência', 'Excesso de entusiasmo', 'Dispersão', 'Superficialidade'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cavalo', 'Coruja', 'Papagaio'],
    plants: ['Obí', 'Pau-brasil', 'Erva-doce', 'Alface silvestre'],
    offerings: ['Água de obí', 'Milho', 'Farinha de mandioca', 'Velas douradas', 'Frutas amarelas', 'Kolanut'],
    chants: ['Ogbe ni o', 'Ara Ogbe', 'Ki lo ri'],
    symbols: ['Círculo', 'Sol', 'Água corrente', 'Semente'],
    mythology:
      'Ogbe é o primeiro Odu de Ifá, representando o princípio da criação e expansão divine. Este Odu symboliza o momento sagrando quando o divino decide criar e expandir a consciência. Ogbe traz em si a energia do novo começo, da fortuna iminente, e da expansão em todas as direções. É considerado um dos Odus mais poderosos para proteção e bênçãos, pois representa a vontade divina manifestando-se no mundo. Este Odu ensina que toda existência começa com um pensamento divino que se expande para criar realidade.',
    spiritualLesson: 'A verdadeira criação começa dentro de nós; somos co-criadores da nossa realidade com o divino',
    affirmation: 'Eu abro espaço para a criação divina na minha vida, permitindo que bênçãos se expandam em todas as direções',
    meditation: 'Visualize uma semente de luz dourada no centro do seu ser, expandindo-se em todas as direções com harmonia',
  },
  {
    id: 'ogbe-meji',
    name: 'Ogbe Meji',
    namePortuguese: 'O Duplo Poder da Criação',
    path: 'Ogbe',
    element: 'Água e Fogo',
    colors: ['#FFD700', '#FF4500', '#FFFFFF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [8, 16, 24],
    greeting: 'Ogbe Meji!',
    archetype: 'O Senhor da Dualidade Criativa',
    qualities: ['Equilíbrio', 'Dupla visão', 'Sabedoria ancestral', 'Meditação profunda', 'Criação consciente', 'Transformação'],
    challenges: ['Conflito interno', 'Indecisão criativa', 'Excesso de energia', 'Tensão entre opostos'],
    rulingPlanet: 'Sol e Lua',
    sacredAnimals: ['Cavalo branco', 'Serpente dourada', 'Pavão'],
    plants: ['Ervas douradas', 'Flores brancas e vermelhas', 'Obí vermelho', 'Romã'],
    offerings: ['Água de obí vermelha e branca', 'Milho branco e amarelo', 'Velas douradas e vermelhas', 'Frutas silvestres', 'Kolanut'],
    chants: ['Ogbe Meji', 'Okanran Meji', 'Ori tutu'],
    symbols: ['Círculo duplo', 'Sol e Lua', 'Duas serpentes', 'Fogo e água'],
    mythology:
      'Ogbe Meji representa a criação em sua forma mais completa, onde duas forças opostas se encontram para gerar algo novo. Este aspecto de Ogbe incorpora o princípio da dualidade sagrada, onde luz e escuridão, masculino e feminino, criação e destruição são necessários para o equilíbrio do universo. Ogbe Meji é frequentemente associado ao conceito de Ori (cabeça) em seu estado mais elevado de consciência, onde o indivíduo pode criar realidade através do pensamento iluminado. Este Odu ensina que a verdadeira criação vem do reconhecimento e integração dos opostos.',
    spiritualLesson: 'A verdadeira criação surge da integração dos opostos; luz e sombra são necessárias para a completeness do ser',
    affirmation: 'Eu integro todas as partes de mim mesmo, permitindo que minha criação seja completa e equilibrada',
    meditation: 'Visualize duas forças se encontrando no centro do seu ser, criando uma nova forma de existência mais elevada',
  },
  {
    id: 'ogbe-oyeku',
    name: 'Ogbe Oyeku',
    namePortuguese: 'Criação e Destruição Sagrada',
    path: 'Ogbe',
    element: 'Água e Terra',
    colors: ['#FFD700', '#2F4F4F', '#FFFFFF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 7, 13],
    greeting: 'Ogbe Oyeku!',
    archetype: 'O Transformador Universal',
    qualities: ['Renovação', 'Desapego', 'Sabedoria prática', 'Flexibilidade', 'Renascimento', 'Prosperidade oculta'],
    challenges: ['Medo de perda', 'Ressentimento', 'Rigidez emocional', 'Aversão ao trabalho'],
    rulingPlanet: 'Sol e Mercúrio',
    sacredAnimals: ['Coruja', 'Cavalo escuro', 'Raposa'],
    plants: ['Ervas secas', 'Palmeira', 'Raízes medicinais', 'Obí escuro'],
    offerings: ['Água de obí escura', 'Milho preto', 'Velas pretas e douradas', 'Frutas secas', 'Terra sagrada'],
    chants: ['Ogbe Oyeku', 'Oyeku lo pa', 'Ori kosi'],
    symbols: ['Trovao', 'Raiz', 'Moeda invertida', 'Caminho escuro'],
    mythology:
      'Ogbe Oyeku representa a união sagrada entre a energia criativa de Ogbe e a energia transformadora de Oyeku. Este Odu ensina que toda criação é seguida por destruição, e toda destruição abre espaço para nova criação. Ogbe Oyeku é o mestre do desapego, mostrando que a verdadeira prosperidade vem da capacidade de deixar ir o que não serve mais. Este Odu carrega a sabedoria de que a perda não é um fim, mas uma transformação necessária para o crescimento espiritual.',
    spiritualLesson: 'O desapego é a chave para a verdadeira prosperidade; quando liberamos o velho, criamos espaço para o novo',
    affirmation: 'Eu libero com gratidão o que não serve mais, confiando que o divino proverá renovações constantes',
    meditation: 'Sinta a terra abaixo de você absorvendo o que não serve mais, transformando-o em nutrição para novos caminhos',
  },
  {
    id: 'ogbe-iwori',
    name: 'Ogbe Iwori',
    namePortuguese: 'Criação e Sabedoria Anciã',
    path: 'Ogbe',
    element: 'Terra e Água',
    colors: ['#FFD700', '#8B4513', '#F5F5DC'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 10, 14],
    greeting: 'Ogbe Iwori!',
    archetype: 'O Ancião Criador',
    qualities: ['Sabedoria anciã', 'Paciência', 'Honra ancestral', 'Compaixão profunda', 'Persistência', 'Proteção'],
    challenges: ['Teimosia', 'Conservadorismo excessivo', 'Dificuldade de mudança', ' melancolia'],
    rulingPlanet: 'Sol e Saturno',
    sacredAnimals: ['Bode', 'Tartaruga', 'Coruja anciã'],
    plants: ['Ervas antigas', 'Raízes de carvalho', 'Folhas de oliveira', 'Obí antigo'],
    offerings: ['Água de obí clara', 'Milho ancestral', 'Velas douradas e marrons', 'Frutas da estação', 'Kolanut velho'],
    chants: ['Ogbe Iwori', 'Iwori méji', 'Baba ti o wa'],
    symbols: ['Bastão ancião', 'Caveira', 'Livro sagrado', 'Terra'],
    mythology:
      'Ogbe Iwori representa a criação que emerge da sabedoria dos ancestrais. Este Odu conecta a energia expansiva de Ogbe com a profundidade experiencial de Iwori, criando um caminho onde a criação é guiada pela tradição e experiência. Ogbe Iwori é frequentemente consultado para questões de herança, tradição familiar, e conexão com os mortos. Este Odu ensina que verdadeira inovação deve ser enraizada na sabedoria daqueles que vieram antes de nós.',
    spiritualLesson: 'A verdadeira criação honra os ancestrais; somos elos em uma corrente de sabedoria que transcende gerações',
    affirmation: 'Eu honro meus ancestrais enquanto crio novo caminho, carregando sua sabedoria no meu coração',
    meditation: 'Conecte-se com seus ancestrais, sentindo a corrente de sabedoria que flui através de você',
  },
  {
    id: 'ogbe-ossai',
    name: 'Ogbe Ossai',
    namePortuguese: 'Criação e Movimento',
    path: 'Ogbe',
    element: 'Ar e Água',
    colors: ['#FFD700', '#4169E1', '#E0FFFF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 9, 13],
    greeting: 'Ogbe Ossai!',
    archetype: 'O Viajante Criativo',
    qualities: ['Flexibilidade', 'Adaptabilidade', 'Curiosidade', 'Exploração', 'Versatilidade', 'Progresso'],
    challenges: ['Instabilidade', 'Fuga de responsabilidades', 'Excesso de movimento', 'Dificuldade de ancoragem'],
    rulingPlanet: 'Sol e Urano',
    sacredAnimals: ['Cavalo veloz', 'Golfinho', 'Andorinha'],
    plants: ['Ervas selvagens', 'Plantas trepadeiras', 'Semente ao vento', 'Bambú'],
    offerings: ['Água de obí corrente', 'Milho para pássaros', 'Velas azuis e douradas', 'Frutas frescas', 'Sementes variadas'],
    chants: ['Ogbe Ossai', 'Ossai lo ko', 'Oko ti n lo'],
    symbols: ['Caminho aberto', 'Vento', 'Rodas', 'Asa'],
    mythology:
      'Ogbe Ossai representa a criação em movimento constante, onde nada permanece estático. Este Odu traz a energia do viajante, daquele que não pode ser limitado por fronteiras ou estruturas fixas. Ogbe Ossai ensina que a vida é uma jornada contínua de descoberta e que a verdadeira sabedoria está em saber quando permanecer e quando partir. Este Odu é frequentemente associado a viajes, mudanças de residência, e novas oportunidades.',
    spiritualLesson: 'A vida é uma jornada de constante criação; cada passo nos leva a novas possibilidades de ser',
    affirmation: 'Eu abraço o movimento divino em minha vida, permitindo que minha alma viaje para onde precisa ir',
    meditation: 'Sinta-se como uma semente carregada pelo vento, confiando no divino para plantar você no lugar certo',
  },
];

export function getData(): OgbeData[] {
  return OGBE_DATA;
}

export function getDataById(id: string): OgbeData | undefined {
  return OGBE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OgbeData[] {
  const q = query.toLowerCase();
  return OGBE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.archetype.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((quality) => quality.toLowerCase().includes(q)) ||
      o.mythology.toLowerCase().includes(q)
  );
}

export function getOgbeByElement(element: string): OgbeData[] {
  return OGBE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}