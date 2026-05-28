/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Vovochico Data Module
 * Spiritual data for Vovochico, Orixá of ancestral wisdom, transformation, and the sacred cycle of life
 */

export interface VovochicoData {
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
  sacredGeometry: string[];
}

const VOVOCHICO_DATA: VovochicoData[] = [
  {
    id: 'vovochico',
    name: 'Vovochico',
    namePortuguese: 'A Anciã Ancestral',
    path: 'Oxum Tutt',
    element: 'Água e Terra',
    colors: ['#4B0082', '#FFD700', '#8B4513'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Vovochico Odoyá!',
    archetype: 'A Guardiã dos Ciclos',
    qualities: ['Sabedoria Ancestral', 'Transformação', 'Ciclicidade', 'Proteção', 'Intuição Profunda', 'Memória'],
    challenges: ['Melancolia', 'Rigidez emocional', 'Dificuldade em soltar o passado'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Coruja', 'Cobra', 'Borboleta'],
    plants: ['Yberá (palmeira)', 'Barbatimão', 'Cipó-de-alho'],
    offerings: ['Massa de camarão', 'Dendê', 'Flores roxas', 'Vinho escuro', 'Pamonha'],
    chants: ['Odoyá', 'Yemanjá', 'Oxum'],
    symbols: ['Cabaça ritual', 'Rabo de cavalo', 'Espelho antigo', 'Chocalho'],
    mythology:
      'Vovochico é a anciã guardiã das tradições ancestrais, aquela que conhece todos os caminhos já percorridos. Ela representa a memória coletiva dos povos iorubás e a sabedoria que se transmite através das gerações. Como parte do círculo sagrado de Oxum e Iemanjá, Vovochico guarda os segredos das águas profundas e das terras férteis onde a vida renasce continuamente.',
    spiritualLesson:
      'Assim como a borboleta transforma-se através de ciclos, nossa alma também passa por metamorfoses necessárias. O passado não deve ser esquecido, mas integrado à nossa sabedoria presente.',
    affirmation:
      'Eu honro meus ancestrais e abraço a transformação com coragem e sabedoria. Vovochico guia minha alma através de todos os ciclos da vida.',
    meditation:
      'Sente-se em quietude. Visualize uma cobra enrollando-se suavemente ao redor de um tronco de árvore ancestral. Essa imagem representa a integração do passado (cobra) com a vida que continua crescendo (árvore). Permita que Vovochico traga à sua mente as lições dos seus ancestrais, reconhecendo que você é parte de uma linhagem de sabedoria.',
    sacredGeometry: ['Espiral', 'Círculo duplo', 'Cruz diagonal'],
  },
];

export function getData(): VovochicoData[] {
  return VOVOCHICO_DATA;
}

export function getDataById(id: string): VovochicoData | undefined {
  return VOVOCHICO_DATA.find((v) => v.id === id);
}

export function searchData(query: string): VovochicoData[] {
  const lowerQuery = query.toLowerCase();
  return VOVOCHICO_DATA.filter(
    (v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.namePortuguese.toLowerCase().includes(lowerQuery) ||
      v.archetype.toLowerCase().includes(lowerQuery) ||
      v.qualities.some((q: string) => q.toLowerCase().includes(lowerQuery))
  );
}

export function getVovochicoByDay(day: string): VovochicoData[] {
  return VOVOCHICO_DATA.filter((v) => v.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getVovochicoByElement(element: string): VovochicoData[] {
  return VOVOCHICO_DATA.filter((v) => v.element.toLowerCase().includes(element.toLowerCase()));
}

export function getDomains(): string[] {
  return ['Sabedoria Ancestral', 'Transformacao', 'Ciclicidade', 'Protecao', 'Intuicao', 'Memoria'];
}

export function getSacredAnimals(): string[] {
  return ['Coruja', 'Cobra', 'Borboleta'];
}

export function getSymbols(): string[] {
  return ['Cabaça ritual', 'Rabo de cavalo', 'Espelho antigo', 'Chocalho'];
}

export function getLegacyTeaching(): string {
  return 'A sabedoria dos antigos nao se perde, ela apenas adormece ate que uma nova geracao a desperte';
}

export function getAffirmations(): string[] {
  return VOVOCHICO_DATA.map((v) => v.affirmation);
}

export function getVovochicoByArchetype(archetype: string): VovochicoData[] {
  return VOVOCHICO_DATA.filter((v) => v.archetype.toLowerCase().includes(archetype.toLowerCase()));
}