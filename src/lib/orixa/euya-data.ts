 
// @ts-nocheck
// SKIP_LINT

/**
 * Euá Data Module
 * Spiritual data for Euá (Ieuá, Iyewá, Ewá), the orixá of beauty, enchantment, and the river Ieuá
 */

export interface EuyaData {
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

const EUYA_DATA: EuyaData[] = [
  {
    id: 'euya',
    name: 'Euá',
    namePortuguese: 'Euá',
    path: 'Senhora das Possibilidades',
    element: 'Neblina, Névoa e Beleza',
    colors: ['#8B008B', '#DDA0DD', '#FFFFFF'],
    dayOfWeek: 'Domingo',
    numbersSacred: [3, 7, 9],
    greeting: 'Riró!',
    archetype: 'A Senhora da Beleza e do Encantamento',
    qualities: [
      'Beleza',
      'Encanto',
      'Sensibilidade',
      'Percepção',
      'Versatilidade',
      'Mimetismo',
      'Sabedoria',
      'Poesia',
      'Invisibilidade'
    ],
    challenges: [
      'Vingança',
      'Ressentimento',
      'Ciúmes',
      'Maldade camuflada',
      'Perfecionismo excessivo'
    ],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Pavão', 'Boru de Guinea', 'Raposão'],
    plants: ['Alamanda', 'Girassol', 'Dama da Noite', 'Palmeira'],
    offerings: ['Azeite de dendê roxo', 'Flores roxas', 'Velas roxas e brancas', 'Açúcar mascavo', 'Pato assado', 'Pombos', 'Perfume de alfazema'],
    chants: ['Riró', 'Euá', 'Iyewá', 'Ewá', 'Yeye'],
    symbols: ['Âncora', 'Espada', 'Ofá', 'Pente de ouro', 'Arco-íris', 'Rosa'],
    mythology:
      'Euá, também grafada Ieuá, Iyewá ou Ewá, é o orixá do Rio Ieuá, curso d\'água que corre no estado de Ogum, na Nigéria. Seu culto é originário dos ieuás, um dos subgrupos do povo iorubá. É uma iabá identificada no jogo de búzios pelo odu obeogundá. Euá é considerada a senhora das possibilidades, detentora do poder da invisibilidade e do mimetismo. Ela contém os atributos de Oxum e Iansã: guerra, caça, feminilidade, disfarce, poder, pioneirismo, encantamento e praticidade. É a Senhora da sofisticação, da sensibilidade, dos sentidos, da percepção e das belas-artes. Rege as neblinas e nevoeiros na natureza, e todos os seres que praticam o mimetismo e técnicas de camuflagem são protegidos por Euá. A breve aparição do tom rosado ao céu no pôr do sol é uma representação material desse orixá.',
    spiritualLesson: 'A verdadeira beleza está na capacidade de adaptação e transformação; na névoa sagrada, todas as possibilidades existem',
    affirmation: 'Eu abraço minha essência sagrada de Euá, fluindo com grace e sabedoria através de todas as possibilidades da vida',
    meditation: 'Visualize uma névoa suave envolvendo você, suavizando os contornos do mundo e revelando infinite possibilidades escondidas na bruma sagrada'
  },
  {
    id: 'euya-iyewar',
    name: 'Iyewá Korin',
    namePortuguese: 'Senhora do Canto Mágico',
    path: 'Iyewá',
    element: 'Magia e Encantamento',
    colors: ['#9370DB', '#E6E6FA', '#FFD700'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [5, 12, 21],
    greeting: 'Riró Euá!',
    archetype: 'A Senhora do Encantamento',
    qualities: ['Magia', 'Transformação', 'Feitiçaria', 'Poesia', 'Encantamento', 'Criatividade', 'Artes'],
    challenges: ['Ilusão', 'Manipulação', 'Obsessão', 'Perda de identidade', 'Superficialidade'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Pássaro azul', 'Coruja'],
    plants: ['Flor de lótus', 'Jasmim', 'Orquídea roxa'],
    offerings: ['Velas douradas', 'Mel', 'Flores frescas', 'Incenso de sálvia', 'Vinho doce'],
    chants: ['Iyewá Korin', 'Euá Maré', 'Êê Euá'],
    symbols: ['Varinha mágica', 'Espelho encantado', 'Lua crescente', 'Pena de pavão'],
    mythology:
      'Iyewá Korin é a faceta de Euá relacionada ao canto mágico e à transformação. É a padroeira do místico, do mágico e do Mago, da transformação e de todos os encantamentos e feitiços. Euá domina todas as ações secretas, da camuflagem à metamorfose, podendo tomar a cor que desejar. Ela é a Senhora da fala que encanta, concedendo a magia da palavra e ensinando a juntar letras e formar palavras de poder.',
    spiritualLesson: 'A magia está na palavra pronunciada com intenção; cada canto carrega o poder de transformar a realidade',
    affirmation: 'Eu canalizo a energia sagrada do canto mágico, transformando minha realidade com palavras de luz e poder',
    meditation: 'Sente-se em silêncio e permita que sons ancestrais fluam através de você, como Euá ensinando os primeiros encantamentos'
  },
  {
    id: 'euya-yewaa',
    name: 'Yeye Iwara',
    namePortuguese: 'Mãe do Caráter Maravilhoso',
    path: 'Iyewá',
    element: 'Caráter e Esperança',
    colors: ['#FF69B4', '#FFC0CB', '#E6E6FA'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8, 16],
    greeting: 'Yeye Riró!',
    archetype: 'A Mãe do Caráter',
    qualities: ['Integridade', 'Esperança', 'Honestidade', 'Virtude', 'Pureza de coração', 'Coragem moral'],
    challenges: ['Rigidez moral', 'Juizo excessivo', 'Intolerância', 'Inflexibilidade'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cisne branco', 'Pavão real'],
    plants: ['Lírio branco', 'Rosa branca', 'Jasmim estrela'],
    offerings: ['Flores brancas', 'Azeite puro', 'Velas douradas', 'Água de rosas', 'Frutas frescas'],
    chants: ['Yeye', 'Iwara', 'Riró Yeye'],
    symbols: ['Coração puro', 'Rosa branca', 'Sol dourado', 'Coroa de espinhos'],
    mythology:
      'Yeye Iwara é a faceta de Euá relacionada ao caráter maravilhoso e à esperança. É a Senhora da Esperança, que ajuda as gestantes na escolha de um belo filho. Euá exige que seus filhos tenham um comportamento reto, caso contrário, ela os deixa aos cuidados de Oxum ou Iansã, muito mais tolerantes. Ela não aceita injustiças nem traições, identificando-se com Ogum pelo amor à verdade e repúdio à mentira. Seu coração deve aparecer nas suas línguas, não aceitando a falsidade.',
    spiritualLesson: 'O caráter se constrói na integridade; a verdadeira beleza é a transparência da alma',
    affirmation: 'Eu honro meu caráter sagrado, caminhando com integridade e esperança em cada passo da minha jornada',
    meditation: 'Visualize uma luz dourada envolvendo seu coração, purificando suas intenções e fortalecendo sua essência moral'
  }
];

export function getData(): EuyaData[] {
  return EUYA_DATA;
}

export function getDataById(id: string): EuyaData | undefined {
  return EUYA_DATA.find((e) => e.id === id);
}

export function searchData(query: string): EuyaData[] {
  const q = query.toLowerCase();
  return EUYA_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.path.toLowerCase().includes(q) ||
      e.element.toLowerCase().includes(q) ||
      e.qualities.some((qual) => qual.toLowerCase().includes(q)) ||
      e.mythology.toLowerCase().includes(q)
  );
}

export function getEuyaByDay(day: string): EuyaData[] {
  return EUYA_DATA.filter((e) => e.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getEuyaByElement(element: string): EuyaData[] {
  return EUYA_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}
