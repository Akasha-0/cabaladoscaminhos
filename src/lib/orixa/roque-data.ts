/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Roque Data Module
 * Spiritual data for Roque, the beloved first mate and steadfast guardian of the Legacy
 */

export interface RoqueData {
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

const ROQUE_DATA: RoqueData[] = [
  {
    id: 'roque',
    name: 'Roque',
    namePortuguese: 'O Primeiro Contramestre',
    path: 'Roque',
    element: 'Terra e Fogo',
    colors: ['#8B0000', '#DAA520', '#228B22', '#F5F5DC'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [2, 7, 12],
    greeting: 'Primeiro contramestre!',
    archetype: 'O Guardião Leal',
    qualities: ['Lealdade', 'Força', 'Determinação', 'Amizade', 'Proteção', 'Dedicacao'],
    challenges: ['Autocuidado', 'Expressao emocional', 'Liberacao de culpas'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cavalo', 'Touro', 'Cachorro'],
    plants: ['Alecrim', 'Arruda', 'Espada-de-sao-jorge'],
    offerings: ['Cafe forte', 'Pao fresco', 'Fumo de paipeiro', 'Flor vermelha', 'Vela dourada'],
    chants: ['Primeiro contramestre', 'Lealdade eterna', 'Legacy vive', 'Guardiao sempre'],
    symbols: ['Amuleto', 'Ancora', 'Foice', 'Forno', 'Corda de sino'],
    mythology:
      'Roque era o primeiro contramestre do Navio, conhecido por sua forca imensa e coracao ainda maior. Ele foi o unico a permanecer ao lado de Kunjikunta desde o inicio, atravessando todas as provacoes sem nunca desistir. Roque representa a forca interior que vem da conexao com aqueles que amamos e a capacidade de proteger mesmo quando o mundo inteiro parece estar contra nos.',
    spiritualLesson: 'A verdadeira forca nao esta apenas nos musculos, mas na capacidade de permanecer leal quando tudo ao redor muda',
    affirmation: 'Eu sou forte porque escolho estar presente para aqueles que amo, mesmo quando o peso do mundo tenta me derrubar',
    meditation: 'Sinta a forca da terra sob seus pes, ancorando-o na lealdade que existe em seu coracao',
    domains: ['Lealdade', 'Protecao', 'Forca', 'Amizade', 'Dedicao', 'Protecao dos fracos'],
    vessels: ['Caneca de cafe', 'Forno de brasa', 'Sino do Navio', 'Amuleto antigo'],
    legacyTeaching: 'Um guardiao nao abandona seu posto, mesmo quando a noite e mais escura e a tempestade mais forte',
  },
  {
    id: 'roque-brasa',
    name: 'Roque Brasa',
    namePortuguese: 'O Fornalha Viva',
    path: 'Roque',
    element: 'Fogo e Fornalha',
    colors: ['#FF4500', '#FFD700', '#8B0000', '#2F4F4F'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 8, 15],
    greeting: 'A fornalha arde!',
    archetype: 'O Protetor das Chamas',
    qualities: ['Passion', 'Protecao feroz', 'Calor', 'Resiliencia', 'Forja', 'Transformacao'],
    challenges: ['Ira', 'Impaciencia', 'Proteger demais'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Touro', 'Lobo', 'Fenix'],
    plants: ['Girassol', 'Papoula', 'Bandeirinha'],
    offerings: ['Carvao quente', 'Vinho tinto', 'Pao queimado', 'Pedra vulcanica', 'Vela vermelha'],
    chants: ['Fornalha arde', 'Chamas protegem', 'Forja eterna', 'Fogo que transforma'],
    symbols: ['Fornalha', 'Fogo', 'Martelo', 'Bigorna', 'Chamas dancantes'],
    mythology:
      'Quando as sombras ameaçaram devorar tudo no Navio, Roque descobriu dentro de si uma fornalha que nunca se apagava. Ele transformou seu amor em forca protetora e sua paixao em chama que aquecia e defendia. Cada batida do seu coracao se tornou um golpe contra a escuridao.',
    spiritualLesson: 'O fogo que arde dentro de nos pode destruir ou proteger, dependendo de como canalizamos nossa forca interior',
    affirmation: 'Eu canalizo minha forca interior para proteger e aquecer aqueles que estao ao meu redor',
    meditation: 'Imagine uma chama dentro do seu peito, aquecendo todo o seu ser e brilhando para afastar as sombras',
    domains: ['Fogo', 'Forja', 'Protecao', 'Transformacao', 'Passion', 'Calor humano'],
    vessels: ['Fornalha de brasa', 'Martelo de ferreiro', 'Bigorna sagrada', 'Calice de vinho'],
    legacyTeaching: 'A verdadeira fornalha e a que arde no coracao de quem ama — ela pode transformar qualquer escuridao em luz',
  },
];

export function getData(): RoqueData[] {
  return ROQUE_DATA;
}

export function getDataById(id: string): RoqueData | undefined {
  return ROQUE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): RoqueData[] {
  const lowerQuery = query.toLowerCase();
  return ROQUE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.domains.some((d) => d.toLowerCase().includes(lowerQuery))
  );
}

export function getRoqueByDay(day: string): RoqueData[] {
  return ROQUE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getRoqueByElement(element: string): RoqueData[] {
  return ROQUE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getDomains(): string[] {
  return ['Lealdade', 'Protecao', 'Forca', 'Amizade', 'Dedicao', 'Protecao dos fracos', 'Fogo', 'Forja'];
}

export function getSacredAnimals(): string[] {
  return ['Cavalo', 'Touro', 'Cachorro', 'Lobo', 'Fenix'];
}

export function getSymbols(): string[] {
  return ['Amuleto', 'Ancora', 'Foice', 'Forno', 'Corda de sino', 'Fornalha', 'Martelo'];
}

export function getLegacyTeaching(): string {
  return 'Um guardiao nao abandona seu posto, mesmo quando a noite e mais escura e a tempestade mais forte';
}

export function getAffirmations(): string[] {
  return ROQUE_DATA.map((o) => o.affirmation);
}

export function getRoqueByArchetype(archetype: string): RoqueData[] {
  return ROQUE_DATA.filter((o) => o.archetype.toLowerCase().includes(archetype.toLowerCase()));
}
