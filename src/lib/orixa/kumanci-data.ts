 
// @ts-nocheck
// SKIP_LINT

/**
 * Kumanci Data Module
 * Spiritual data for Kumanci, the spirit of wisdom and ancient knowledge
 */

export interface KumanciData {
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

const KUMANCI_DATA: KumanciData[] = [
  {
    id: 'kumanci',
    name: 'Kumanci',
    namePortuguese: 'Senhor do Conhecimento Ancestral',
    path: 'Ogbe',
    element: 'Água e Ar',
    colors: ['#1E90FF', '#4169E1', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'Kumanci Laroyê!',
    archetype: 'O Guardião da Sabedoria Sagrada',
    qualities: [
      'Conhecimento',
      'Sabedoria',
      'Memória ancestral',
      'Intuição',
      'Clareza mental',
      'Discernimento',
      'Linhagem',
      'Tradição oral',
      'Custódia dos segredos'
    ],
    challenges: [
      'Arrogância intelectual',
      'Rigidez mental',
      'Segredo por orgulho',
      'Isolamento',
      'Medo de compartilhar conhecimento'
    ],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Coruja', 'Papagaio', 'Cágado'],
    plants: ['Cebolão', 'Manjericão', 'Alecrim silvestre', 'Erva-doce'],
    offerings: ['Aguardente', 'Mel', 'Amendoim torrado', 'Velas douradas e azuis', 'Livros', 'Plumas'],
    chants: ['Kumanci', 'Laroyê', 'Oba'],
    symbols: ['Cabaça', 'Livro', 'Plumas', 'Cascadeira', 'Marávili'],
    mythology:
      'Kumanci é o guardião supremo do conhecimento ancestral, o depositário de toda sabedoria sagrada que foi passando de geração em geração desde os tempos mais antigos. Ele habita no espaço entre a memória e o esquecimento, custodizando os segredos que vinculam os vivos aos mortos e aos que ainda hão de nascer. Kumanci é consultado nas encruzilhadas intelectuais, quando a mente precisa de clareza para discernir o verdadeiro do ilusório. Ele é o professor dos mestres, a sabedoria que dormita esperando o momento certo de despertar em cada pessoa.',
    spiritualLesson: 'O conhecimento verdadeiro não é acumulado, mas compartilhado para que a tradição não se perca',
    affirmation: 'Eu abro minha mente para a sabedoria ancestral de Kumanci, permitindo que a clareza e o discernimento guiem meus passos',
    meditation: 'Visualize-se às margens de um rio antigo onde Kumanci segura uma cabaça luminosa, despejando água sagrada sobre sua cabeça enquanto toda a sabedoria ancestral flui através de você'
  },
  {
    id: 'kumanci-oba',
    name: 'Kumanci Oba',
    namePortuguese: 'Senhor das Águas Claras',
    path: 'Ogbe',
    element: 'Água',
    colors: ['#87CEEB', '#00CED1', '#F0F8FF'],
    dayOfWeek: 'Domingo',
    numbersSacred: [4, 16, 28],
    greeting: 'Oba laroyê!',
    archetype: 'O Senhor das Águas Purificadoras',
    qualities: ['Pureza', 'Clareza', 'Purificação', 'Ancestralidade aquática', 'Fluidez', 'Renovação espiritual', 'Lágrimas sagradas'],
    challenges: ['Dissolução excessiva', 'Indefinição', 'Superficialidade', 'Medo de profundidade', 'Autocomiseração'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Peixes', 'Cavalo-marinho', 'Boto'],
    plants: ['Lótus', 'Vitória-régia', 'Alface-do-mato', 'Capiá'],
    offerings: ['Água de coco', 'Leite', 'Flores brancas', 'Velas prateadas e brancas', 'Conchas do mar', 'Sal marinho'],
    chants: ['Oba', 'Laroyê Oba', 'Ewa'],
    symbols: ['Calabça com água', 'Conchas', 'Lótus', 'Onda', 'Espelho d\'água'],
    mythology:
      'Kumanci Oba é a face aquática de Kumanci, o senhor das águas purificadoras que lava as manchas do passado e devolve a clareza aos olhos turvos pela dor. Ele habita nos rios caudalosos, nas nascentes sagradas e no mar profundo onde a memória do mundo é guardada. Oba purifica através das lágrimas sagradas que cada ser move ao confrontar suas próprias águas interiores. Ele ensina que a verdadeira limpeza não vem de fora, mas do reconhecimento das próprias mágoas enterradas.',
    spiritualLesson: 'A purificação verdadeira começa quando temos coragem de olhar para nossas próprias águas interiores',
    affirmation: 'Eu permito que as águas de Kumanci Oba purifiquem minha alma, lavando todas as mágoas e devolvendo clareza ao meu coração',
    meditation: 'Sinta-se imerso em um rio de água cristalina onde Kumanci Oba estende suas mãos, permitindo que a correnteza lave de você todo peso que não lhe pertence enquanto você flutua em paz'
  }
];

export function getData(): KumanciData[] {
  return KUMANCI_DATA;
}

export function getDataById(id: string): KumanciData | undefined {
  return KUMANCI_DATA.find((k) => k.id === id);
}

export function searchData(query: string): KumanciData[] {
  const lowerQuery = query.toLowerCase();
  return KUMANCI_DATA.filter(
    (k) =>
      k.name.toLowerCase().includes(lowerQuery) ||
      k.namePortuguese.toLowerCase().includes(lowerQuery) ||
      k.element.toLowerCase().includes(lowerQuery) ||
      k.qualidades.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      k.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getKumanciByDay(day: string): KumanciData[] {
  return KUMANCI_DATA.filter((k) => k.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getKumanciByElement(element: string): KumanciData[] {
  return KUMANCI_DATA.filter((k) => k.element.toLowerCase().includes(element.toLowerCase()));
}
