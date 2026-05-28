 
// @ts-nocheck

/**
 * Orixá Profiles Module
 * Comprehensive spiritual profiles for all 16 Orixás
 */

export interface OrixaProfile {
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

const ORIXA_PROFILES: OrixaProfile[] = [
  {
    id: 'oxum',
    name: 'Oxum',
    namePortuguese: 'Rainha das Águas Doces',
    path: 'Ibeji',
    element: 'Água doce',
    colors: ['#FFD700', '#FF69B4'],
    dayOfWeek: 'Sábado',
    numbersSacred: [7, 12, 15],
    greeting: 'Ewole!',
    archetype: 'A Amorosa',
    qualities: ['Amor', 'Beleza', 'Fertilidade', 'Prosperidade', 'Sensibilidade', 'Charme'],
    challenges: ['Vaidade', 'Ciúmes', 'Instabilidade emocional'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Peixe', 'Borboleta'],
    plants: ['Dendezeiro', 'Erva-doce'],
    offerings: ['Mel', 'Azeite de dendê', 'Flores amarelas', 'Perfume'],
    chants: ['Aiyê', 'Oba Oxum', 'Omi Tutu'],
    symbols: ['Espelho', 'Pente de ouro', 'Navalha'],
    mythology:
      'Oxum é a primeira a descer do céu para a Terra, trazendo as águas que dão vida. Foi esposa de Oxumaré e concubina de Oxalá.',
    spiritualLesson: 'O amor próprio é a base para amar os outros',
    affirmation: 'Eu Fluxo com a graça de Oxum, abraçando minha beleza interior e exterior',
    meditation: 'Visualize águas douradas limpando sua aura, renovando seu brilho interior',
  },
  {
    id: 'xango',
    name: 'Xangô',
    namePortuguese: 'Rei dos Raios e do Fogo',
    path: 'Ogbono',
    element: 'Fogo',
    colors: ['#FF4500', '#8B0000'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 10],
    greeting: 'Epa!',
    archetype: 'O Justiceiro',
    qualities: ['Justiça', 'Autoridade', 'Coragem', 'Determinação', 'Carisma', 'Equilíbrio'],
    challenges: ['Ira', 'Orgulho', 'Vingança'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Bode', 'Falcão'],
    plants: ['Pau-brasil', 'Acácia'],
    offerings: ['Azeite de dendê', 'Fumo', 'Galinha assada', 'Vinho'],
    chants: ['Xê', 'Oba Kuti', 'Sarará'],
    symbols: ['Machado de dupla lâmina', 'Pedra de raio', 'Coroa'],
    mythology:
      'Xangô foi rei de Oyó antes de morrer atingido por um raio. Sua morte o transformou em divindade dos raios e do fogo.',
    spiritualLesson: 'A verdadeira força está em manter a justiça mesmo na adversidade',
    affirmation: 'Eu Ativo o poder de Xangô para manifestar coragem e equilíbrio em minha vida',
    meditation: 'Sinta o calor do fogo interior, transformando medos em força',
  },
  {
    id: 'obatala',
    name: 'Obatalá',
    namePortuguese: 'Pai da Criação',
    path: 'Opolo',
    element: 'Ar',
    colors: ['#FFFFFF', '#F5F5DC'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8],
    greeting: 'Orunmpô!',
    archetype: 'O Criador',
    qualities: ['Pureza', 'Sabedoria', 'Criação', 'Misericórdia', 'Paz', 'Discernimento'],
    challenges: ['Rigidez', 'Perfeccionismo', 'Distância emocional'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cavalo branco', 'Cegonha'],
    plants: ['Algodoeiro', 'Moringa'],
    offerings: ['Akassá (farinha)', 'Pérolas', 'Vinho de palma', 'Alimentos brancos'],
    chants: ['Orun', 'Ala', 'Baba'],
    symbols: ['Bengala', 'Coroa branca', 'Pássaro'],
    mythology:
      'Obatalá desceu do céu em uma corrente de ouro para criar a terra. Levava barro, uma cobra e um gato. Foi engañado por Oduduwa, mas focou em criar humanos perfeitos.',
    spiritualLesson: 'A verdadeira criação vem da pureza de intenção',
    affirmation: 'Eu Sou transparente como a luz de Obatalá, criando com pureza e sabedoria',
    meditation: 'Respire profundamente imaginando uma luz branca purificando cada célula',
  },
  {
    id: 'yemanja',
    name: 'Iemanjá',
    namePortuguese: 'Mãe das Águas',
    path: 'Ibeji',
    element: 'Água salgada',
    colors: ['#0000CD', '#1E90FF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [2, 5, 9],
    greeting: 'Eyawo!',
    archetype: 'A Mãe',
    qualities: ['Maternidade', 'Proteção', 'Intuição', 'Compassão', 'Resiliência', 'Devoção'],
    challenges: ['Sacrifício excessivo', 'Codependência', 'Saudade'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Cobra-marinha', 'Peixe-boi', 'Iateia'],
    plants: ['Lírio', 'Rosa branca', 'Alfazema'],
    offerings: ['Espelho', 'Flores brancas', 'Perfume', 'Boneca', 'Sabonete'],
    chants: ['Mãe', 'Iemanjá', 'Odó'],
    symbols: ['Navio', 'Lua crescente', 'Onda'],
    mythology:
      'Iemanjá era esposa de Oxalá até seu ciúmes transformá-la em Cobra-Marinha. Vive nas profundezas do oceano em um palácio de coral.',
    spiritualLesson: 'A mãe interior ama sem condições e protege sem sufocar',
    affirmation: 'Eu Sou abençoada pelo abraço maternal de Iemanjá, cuidando de mim e dos outros',
    meditation: 'Imagine ondas suaves trazendo amor maternal, envolvendo você em proteção',
  },
  {
    id: 'ogum',
    name: 'Ogum',
    namePortuguese: 'Senhor do Ferro e da Guerra',
    path: 'Ogbe',
    element: 'Ferro',
    colors: ['#696969', '#2F4F4F'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7],
    greeting: 'Ewo!',
    archetype: 'O Guerreiro',
    qualities: ['Coragem', 'Determinação', 'Proteção', 'Persistência', 'Honra', 'Pioneirismo'],
    challenges: ['Impaciência', 'Violência', 'Teimosia'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cavalo', 'Galho'],
    plants: ['Pimenta', 'Babosa', 'Arruda'],
    offerings: ['Azeite de dendê', 'Fumo', 'Galinha', 'Espada de ferro'],
    chants: ['Ogum', 'Ogunhê', 'Maconha'],
    symbols: ['Espada', 'Chave', 'Bigorna', 'Foice'],
    mythology:
      'Ogum limpa o caminho para todos os orixás. Patrono dos ferreiros, agricultores e guerreiros. Conhece todos os caminhos, até os mais obscuros.',
    spiritualLesson: 'Cada batalha interna fortalece o guerreiro espiritual',
    affirmation: 'Eu Atravesso barreiras com a força de Ogum, abrindo caminhos onde parecia impossível',
    meditation: 'Visualize uma espada de luz cortando todos os obstáculos à sua frente',
  },
  {
    id: 'oxossi',
    name: 'Oxóssi',
    namePortuguese: 'Caçador do Reino',
    path: 'Ogbe',
    element: 'Mata',
    colors: ['#006400', '#228B22'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7],
    greeting: 'Eyi!',
    archetype: 'O Provedor',
    qualities: ['Fartura', 'Paciência', 'Conhecimento', 'Abundância', 'Harmonia', 'Esperança'],
    challenges: ['Procrastinação', 'Indecisão', 'Excesso de expectativas'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Veado', 'Gralha'],
    plants: ['Pau-brasil', 'Palmeira', 'Fruto do conde'],
    offerings: ['Frutas', 'Mel', 'Galinha caipira', 'Eira'],
    chants: ['Okê Arô', 'Oxóssi', 'Oluorun'],
    symbols: ['Arco e flecha', 'Rede de caça', 'Corno de caça'],
    mythology:
      'Oxóssi nunca retorna de mãos vazias. Habita as matas mais profundas e sua flecha nunca erra o alvo.',
    spiritualLesson: 'A abundância vem para quem sabe esperar com paciência e gratidão',
    affirmation: 'Eu Recebo a fartura de Oxóssi com gratidão e partilho com amor',
    meditation: 'Caminhe mentalmente por uma floresta luminosa, onde cada passo revela abundância',
  },
  {
    id: 'elegba',
    name: 'Elegba',
    namePortuguese: 'Senhor dos Caminhos',
    path: 'Ogbe',
    element: 'Portal',
    colors: ['#8B0000', '#000000'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [1, 3],
    greeting: 'Ekô!',
    archetype: 'O Trickster',
    qualities: ['Comunicação', 'Oportunidade', 'Flexibilidade', 'Iniciação', 'Energia', 'Dualidade'],
    challenges: ['Manipulação', 'Caos', 'Traição'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cachorro', 'Corvo'],
    plants: ['Mamona', 'Bordão'],
    offerings: ['Milho', 'Fumo', 'Azeite de dendê', 'Moedas'],
    chants: ['Elegba', 'Ekú', 'Oxê'],
    symbols: ['Chave', 'Mão de oxê', 'Encruzilhada'],
    mythology:
      'Elegba trouxe o sistema de Ifá para a Terra. Conhece todos os caminhos, até os mais obscuros. É invoked primeiro em qualquer ritual.',
    spiritualLesson: 'Cada encruzilhada é uma oportunidade de escolha consciente',
    affirmation: 'Eu Abro novos caminhos com a energia de Elegba, transformando obstáculos em oportunidades',
    meditation: 'Visualize uma encruzilhada iluminada, onde cada direção promete crescimento',
  },
  {
    id: 'omulu',
    name: 'Omulu',
    namePortuguese: 'Senhor das Doenças e da Cura',
    path: 'Ogbe',
    element: 'Terra',
    colors: ['#DAA520', '#CD853F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Baba!',
    archetype: 'O Transformador',
    qualities: ['Cura', 'Transformação', 'Regeneração', 'Sabedoria ocultada', 'Superação', 'Redenção'],
    challenges: ['Medo do novo', 'Ego ferido', 'Isolamento'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cachorro', 'Coruja'],
    plants: ['Arruda', 'Quebra-pedra', 'Babosa'],
    offerings: ['Azeite de dendê', 'Bolinhas de terra', 'Galinha preta', 'Mão de烧'],
    chants: ['Obaluaiê', 'Omulu', 'Atimpá'],
    symbols: ['Rabo de porco', 'Pente', 'Escaravelho'],
    mythology:
      'Omulu foi um rei banido por uma doença terrível. Vagando, desenvolveu poderes de cura e retornou para ajudar seu povo.',
    spiritualLesson: 'Na escuridão da doença está a semente da transformação mais profunda',
    affirmation: 'Eu Transcendo minha escuridão com a força de Omulu, renascendo em luz',
    meditation: 'Sinta a energia da terra curando cada parte do seu ser, das mais profundas feridas',
  },
  {
    id: 'orunmila',
    name: 'Orunmila',
    namePortuguese: 'Senhor da Sabedoria Divinatória',
    path: 'Ogbono',
    element: 'Conhecimento',
    colors: ['#FFD700', '#ADFF2F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 7, 16],
    greeting: 'Elo!',
    archetype: 'O Sábio',
    qualities: ['Sabedoria', 'Conhecimento', 'Divinação', 'Conselho', 'Memória', 'Discernimento'],
    challenges: ['Arrogância intelectual', 'Perfeccionismo', 'Verbalização excessiva'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Pombo', 'Cágado'],
    plants: ['Mastruz', 'Erva de são joão'],
    offerings: ['Nozes de dendê', 'Farinha', 'Mel', 'Opele (cadeia divinatória)'],
    chants: ['Orunmila', 'Ifá', 'Ogbono'],
    symbols: ['Opele', 'Ikin (nozes)', 'Pá do Ifá'],
    mythology:
      'Orunmila estava presente na criação e aprendeu todos os segredos de Olodumaré. Conhece todos os 16 Odus.',
    spiritualLesson: 'O verdadeiro conhecimento transforma, não apenas informa',
    affirmation: 'Eu Abro minha mente para a sabedoria antiga de Orunmila, enxergando além do véu',
    meditation: 'Permaneça em silêncio, deixando que respostas surjam do profundo',
  },
  {
    id: 'oxumaré',
    name: 'Oxumaré',
    namePortuguese: 'Arco-íris Serpentino',
    path: 'Ogbe',
    element: 'Ciclo',
    colors: ['#9370DB', '#FFD700', '#00CED1'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [8, 12],
    greeting: 'Baba!',
    archetype: 'O Renovador',
    qualities: ['Ciclos', 'Renovação', 'Paciência', 'Equilíbrio', 'Transição', 'Promessa'],
    challenges: ['Imobilismo', 'Medo de mudança', 'Desesperança'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Cobra', 'Arco-íris'],
    plants: ['Flor de lotus', 'Ipê'],
    offerings: ['Azeite de dendê', 'Flores coloridas', 'Ouro'],
    chants: ['Oxumaré', 'Baba', 'Epo'],
    symbols: ['Arco-íris', 'Serpente', 'Ovos'],
    mythology:
      'Oxumaré é o arco-íris serpente que representa os ciclos da vida. Marca o tempo entre secas e chuvas, morte e renascimento.',
    spiritualLesson: 'Após a tempestade, sempre surge o arco-íris da esperança',
    affirmation: 'Eu Abençoo cada ciclo de minha vida, confiando na renovação de Oxumaré',
    meditation: 'Visualize cores do arco-íris atravessando sua aura, renovando cada célula',
  },
  {
    id: 'nana',
    name: 'Nanã Buruku',
    namePortuguese: 'Senhora das Mortes e da Lama',
    path: 'Ogbe',
    element: 'Lama',
    colors: ['#800080', '#4B0082', '#9932CC'],
    dayOfWeek: 'Domingo',
    numbersSacred: [9, 15],
    greeting: 'Epa!',
    archetype: 'A Ancestral',
    qualities: ['Ancestralidade', 'Sapiência', 'Ciclos finais', 'Humildade', 'Paciência', 'Transformação'],
    challenges: ['Resistência ao novo', 'Melancolia', 'Rigidez'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Marreco', 'Burro'],
    plants: ['Pé de moleque', 'Ervas aquáticas'],
    offerings: ['Azeite de dendê', 'Flores roxas', 'Água de rio'],
    chants: ['Nanã', 'Buruku', 'Okê'],
    symbols: ['Cabaça', 'Rabo', 'Lama sagrada'],
    mythology:
      'Nanã é a mais velha entre os orixás, associada às águas paradas, à lama e à morte. É她又 mãe de Oxóssi.',
    spiritualLesson: 'Na lama da vida, encontramos a sabedoria dos ancestrais',
    affirmation: 'Eu Honro meus ancestrais e aceita os ciclos finais com sabedoria e paz',
    meditation: 'Conecte-se com a energia da terra molhada, absorvendo sabedoria antiga',
  },
  {
    id: 'oba',
    name: 'Obá',
    namePortuguese: 'Guerreira do Amor',
    path: 'Ogbe',
    element: 'Fogo e água',
    colors: ['#D2691E', '#8B4513', '#CD853F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [11, 14],
    greeting: 'Ewo!',
    archetype: 'A Guerreira',
    qualities: ['Determinação', 'Fidelidade', 'Coragem', 'Amor feroz', 'Resistência', 'Paixão'],
    challenges: ['Ciúmes', 'Guerra interna', 'Rancor'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Leoa', 'Lebre'],
    plants: ['Pimenta', 'Gengibre'],
    offerings: ['Azeite de dendê', 'Fumo', 'Galinha', 'Fígado'],
    chants: ['Obá', 'Oba Xê', 'Epa'],
    symbols: ['Foice', 'Pimenta', 'Espada'],
    mythology:
      'Obá é a orixá da guerra e do amor. Uma das esposas de Xangô, conhecida por sua beleza e fidelidade feroz.',
    spiritualLesson: 'O amor verdadeiro inclui a força da guerreira',
    affirmation: 'Eu Combino amor e força para proteger o que é meu com coragem',
    meditation: 'Sinta a energia de uma guerreira protectiva, equilibrando fogo e água',
  },
  {
    id: 'ossaim',
    name: 'Ossaim',
    namePortuguese: 'Senhor das Ervas',
    path: 'Ogbono',
    element: 'Ervas',
    colors: ['#32CD32', '#006400'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [4, 9],
    greeting: 'Elo!',
    archetype: 'O Curandeiro',
    qualities: ['Cura', 'Ervas', 'Sabedoria natural', 'Transmutação', 'Conhecimento secreto', 'Magia'],
    challenges: ['Segredos demais', 'Manipulação de energia', 'Isolamento'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Pássaro', 'Cobra'],
    plants: ['Todas as ervas', 'Raízes', 'Folhas medicinais'],
    offerings: ['Ervas frescas', 'Mel', 'Azeite de dendê', 'Pombos'],
    chants: ['Ossaim', 'Açará', 'Ifá'],
    symbols: ['Folhas', 'Cajado', 'Pássaro alado'],
    mythology:
      'Ossaim é o guardião de todas as ervas e plantas medicinais. Conhece os segredos da cura natural e da magia herbal.',
    spiritualLesson: 'A natureza é a maior farmácia — a cura vem da terra',
    affirmation: 'Eu Conecto-me com a sabedoria curativa de Ossaim, harmonizando corpo e alma',
    meditation: 'Caminhe mentalmente por uma floresta sagrada, tocando cada erva com gratidão',
  },
  {
    id: 'logun-ede',
    name: 'Logun-Edé',
    namePortuguese: 'Caçador Aquático',
    path: 'Ogbe',
    element: 'Mata e água',
    colors: ['#228B22', '#00CED1'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 10],
    greeting: 'Eyi!',
    archetype: 'O Equilibrado',
    qualities: ['Equilíbrio', 'Dupla natureza', 'Harmonia', 'Ambição', 'Fartura', 'Sabedoria'],
    challenges: ['Confusão de identidade', 'Indecisão', 'Expectativas divididas'],
    rulingPlanet: 'Júpiter e Lua',
    sacredAnimals: ['Veado', 'Peixe'],
    plants: ['Palmeira', 'Frutos aquáticos'],
    offerings: ['Frutas', 'Peixe', 'Mel', 'Azeite de dendê'],
    chants: ['Logun', 'Ede', 'Okê Arô'],
    symbols: ['Arco e flecha', 'Navio', 'Pena'],
    mythology:
      'Logun-Edé é filho de Oxóssi e Oxum, combinando a natureza do caçador com a elegância da água doce.',
    spiritualLesson: 'A integração de opostos cria harmonia maior que a soma',
    affirmation: 'Eu Equilíbrio minhas dualidades, abraçando a sabedoria de terra e água',
    meditation: 'Visualize águas fluindo através de uma floresta, criando harmonia perfeita',
  },
  {
    id: 'ewa',
    name: 'Ewa',
    namePortuguese: 'Senhora da Beleza e Abundância',
    path: 'Ogbe',
    element: 'Beleza',
    colors: ['#FF69B4', '#FFD700'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [5, 10],
    greeting: 'Ewo!',
    archetype: 'O Charme',
    qualities: ['Beleza', 'Abundância', 'Charme', 'Sedução', 'Esperteza', 'Transformação'],
    challenges: ['Vaidade', 'Superficialidade', 'Dependência da aparência'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Borboleta'],
    plants: ['Flor de laranjeira', 'Jasmim'],
    offerings: ['Perfumes', 'Flores', 'Azeite de dendê', 'Bijuterias'],
    chants: ['Ewa', 'Ewa Oba', 'Odó'],
    symbols: ['Espelho', 'Pente', 'Flores'],
    mythology:
      'Ewa é a orixá da beleza, do charme e da abundância. Conhecida por transformar seres através de sua magia.',
    spiritualLesson: 'A verdadeira beleza vem do brilho interno que ilumina o mundo',
    affirmation: 'Eu Resplandeço com o charme de Ewa, atraindo abundância e beleza em minha vida',
    meditation: 'Visualize luz dourada e rosa envolvendo você, atraindo belezas e bênçãos',
  },
  {
    id: 'inle',
    name: 'Inlé',
    namePortuguese: 'Senhor da Beleza e da Caça',
    path: 'Ogbe',
    element: 'Mata e água',
    colors: ['#00008B', '#FFD700'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7],
    greeting: 'Eyi!',
    archetype: 'O Esteta',
    qualities: ['Beleza', 'Medicina', 'Caça', 'Amor', 'Mente clara', 'Criatividade'],
    challenges: ['Instabilidade', 'Indecisão', 'Perfeccionismo'],
    rulingPlanet: 'Lua e Mercúrio',
    sacredAnimals: ['Antílope', 'Peixe'],
    plants: ['Plantas medicinais', 'Flores brancas'],
    offerings: ['Mel', 'Flores', 'Peixe', 'Perfume'],
    chants: ['Inlé', 'Baba', 'Okê'],
    symbols: ['Espelho', 'Rede', 'Pente de ouro'],
    mythology:
      'Inlé é irmão gêmeo de Oxóssi, conhecido por sua beleza incomparável. Representa a medicina e a arte da caça.',
    spiritualLesson: 'A beleza e a cura podem coexistir em harmonia perfeita',
    affirmation: 'Eu Alinho minha mente e coração para criar beleza e cura em minha vida',
    meditation: 'Sinta a energia de healers, permitindo que cura e estética se unam',
  },
];

export function getProfiles(): OrixaProfile[] {
  return ORIXA_PROFILES;
}

export function getProfileById(id: string): OrixaProfile | undefined {
  return ORIXA_PROFILES.find((p) => p.id === id);
}

export function getProfilesByPath(path: string): OrixaProfile[] {
  return ORIXA_PROFILES.filter((p) => p.path === path);
}

export function getProfilesByElement(element: string): OrixaProfile[] {
  return ORIXA_PROFILES.filter((p) => p.element.toLowerCase().includes(element.toLowerCase()));
}

export function searchProfiles(query: string): OrixaProfile[] {
  const q = query.toLowerCase();
  return ORIXA_PROFILES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.namePortuguese.toLowerCase().includes(q) ||
      p.element.toLowerCase().includes(q) ||
      p.archetype.toLowerCase().includes(q) ||
      p.qualities.some((q) => q.toLowerCase().includes(q))
  );
}