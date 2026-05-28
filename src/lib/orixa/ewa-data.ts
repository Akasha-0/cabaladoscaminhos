 
// @ts-nocheck
// SKIP_LINT

/**
 * Ewa Data Module
 * Spiritual data for Ewa, the orixá of beauty, charm, and abundance
 */

export interface EwaData {
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

const EWA_DATA: EwaData[] = [
  {
    id: 'ewa',
    name: 'Ewa',
    namePortuguese: 'Senhora da Beleza e Abundância',
    path: 'Ogbe',
    element: 'Beleza',
    colors: ['#FFD700', '#FF69B4', '#FFA500'],
    dayOfWeek: 'Domingo',
    numbersSacred: [3, 7, 12],
    greeting: 'Ewa Oba!',
    archetype: 'A Senhora da Beleza e do Encantamento',
    qualities: [
      'Beleza',
      'Charme',
      'Abundância',
      'Feminilidade',
      'Sensualidade',
      'Elegância',
      'Atração',
      'Prosperidade',
      'Espiritualidade'
    ],
    challenges: [
      'Vaidade',
      'Superficialidade',
      'Inveja',
      'Ciúmes',
      'Materialismo excessivo'
    ],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Borboleta', 'Colibri'],
    plants: ['Rosa', 'Girassol', 'Alamanda', 'Hibisco'],
    offerings: ['Perfumes', 'Flores', 'Azeite de dendê', 'Bijuterias', 'Velas douradas', 'Frutas tropicais', 'Mel'],
    chants: ['Ewa', 'Ewa Oba', 'Odó'],
    symbols: ['Espelho', 'Pente', 'Flores', 'Perfume', 'Pavão'],
    mythology:
      'Ewa é a orixá da beleza, do charme e da abundância. Conhecida por transformar seres através de sua magia, ela ilumina os caminhos de seus filhos com grace e prosperidade. Ewa é a dona do espelho que revela a verdadeira essência, do pente que penteia os cabelos da lua, e das flores que embelezam o mundo. Ela é a source de todo encanto e a guardiã dos segredos da feminilidade sagrada. Ewa ensina que a verdadeira beleza vem de dentro e que a abundância é um direito divino de todos os seus filhos.',
    spiritualLesson: 'A verdadeira beleza vem do brilho interno que ilumina o mundo',
    affirmation: 'Eu resplandeço com o charme de Ewa, atraindo abundância e beleza em minha vida',
    meditation: 'Visualize luz dourada e rosa envolvendo você, atraindo belezas e bênçãos enquanto respira profundamente'
  },
  {
    id: 'ewa-oba',
    name: 'Ewa Oba',
    namePortuguese: 'Rainha da Beleza Suprema',
    path: 'Ogbe',
    element: 'Luxo e Majestade',
    colors: ['#FFD700', '#FF4500', '#FFFFFF'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [5, 9, 21],
    greeting: 'Oba Ewa!',
    archetype: 'A Rainha do Encantamento',
    qualities: ['Majestade', 'Sofisticação', 'Poder', 'Carisma', 'Realeza', 'Confiança', 'Sabedoria prática'],
    challenges: ['Arrogância', 'Dominação', 'Perfeccionismo', 'Exigência excessiva'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Leoa', 'Pavão real', 'Fênix'],
    plants: ['Lirio dourado', 'Crócus', 'Magnólia'],
    offerings: ['Velas douradas', 'Perfume de nardo', 'Ouro', ' joias', 'Flores brancas', 'Azeite puro'],
    chants: ['Oba', 'Ewa Oba', 'Alalá'],
    symbols: ['Coroa', 'Trono', 'Cetro', 'Espelho de ouro'],
    mythology:
      'Ewa Oba é a faceta suprema de Ewa, a Rainha que governa os reinos da beleza e do encanto. Ela é a proprietária de todos os perfumes e a senhora dos espelhos que refletem a verdade. Ewa Oba é invoked quando se busca transformação radical da aparência e da energia pessoal. Seu poder pode abrir portas fechadas e conquistar corações resistant.',
    spiritualLesson: 'A verdadeira realeza está em servir com beleza e graça',
    affirmation: 'Eu invoco o poder de Ewa Oba, transformando minha energia em luz dourada de abundância e charme',
    meditation: 'Sente-se como uma rainha, visualizando uma coroa de luz dourada iluminando seu ser enquanto pronuncia palavras de poder'
  }
];

export function getData(): EwaData[] {
  return EWA_DATA;
}

export function getDataById(id: string): EwaData | undefined {
  return EWA_DATA.find((e) => e.id === id);
}

export function searchData(query: string): EwaData[] {
  const lowerQuery = query.toLowerCase();
  return EWA_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      e.element.toLowerCase().includes(lowerQuery) ||
      e.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getEwaByDay(day: string): EwaData[] {
  return EWA_DATA.filter((e) => e.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getEwaByElement(element: string): EwaData[] {
  return EWA_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}