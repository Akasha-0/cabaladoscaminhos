// @ts-nocheck
// SKIP_LINT

/**
 * Ogbe Meji Data
 * Odu of creation, duality, and the union of opposites
 * The moment when divine will manifests through balanced polarity
 */

// Ogbe Meji represents the duality of creation
// where two forces unite to generate new reality
// Governed by the forces of light and shadow in perfect balance
// Element: Water/Fire
// Represents consciousness, manifestation, and the union of opposites

export interface OgbeMejiOdu {
  id: string;
  name: string;
  portugueseName: string;
  order: number;
  polarity: 'masculine' | 'feminine';
  element: string;
  planets: string[];
  sephirot: string[];
  sign: string;
  dayOfWeek: string;
  direction: string;
  colors: string[];
  offerings: string[];
  ebos: Ebo[];
  quizilas: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
  orixas: string[];
  sacredFrequencies: string[];
  chakra: string;
  herbs: string[];
  affirmations: string[];
  meditation: string;
}

export interface Ebo {
  type: string;
  description: string;
  ingredients: string[];
  timing: string;
  intention: string;
}

const OGBE_MEJI_DATA: OgbeMejiOdu = {
  id: 'ogbe-meji',
  name: 'Ogbe Meji',
  portugueseName: 'Ogbe Meji',
  order: 2,
  polarity: 'masculine',
  element: 'Água e Fogo',
  planets: ['Sol', 'Lua'],
  sephirot: ['Tiphareth', 'Malkuth', 'Yesod'],
  sign: 'Oxum, Obatalá, Logunedê',
  dayOfWeek: 'Segunda-feira',
  direction: 'Leste e Oeste',
  colors: ['Dourado', 'Vermelho', 'Branco', 'Azul'],
  offerings: [
    'Kolanut (Obi)',
    'Milho branco e amarelo',
    'Água de obi (vermelha e branca)',
    'Velas douradas e vermelhas',
    'Frutas silvestres',
    'Farinha de mandioca',
    'Mel',
    'Óleo de dendê',
  ],
  ebos: [
    {
      type: 'Ebó de Equilíbrio',
      description: 'Ritual para harmonizar forças opostas dentro do ser',
      ingredients: ['Kolanut', 'Água de obi vermelha e branca', 'Velas douradas', 'Mel'],
      timing: 'Segunda-feira ao entardecer',
      intention: 'Equilibrar energias masculina e feminina, criando harmonia interior',
    },
    {
      type: 'Ebó de Criação Consciente',
      description: 'Oferecimento para Strengthen a capacidade de criar realidade',
      ingredients: ['Milho branco e amarelo', 'Flores brancas e vermelhas', 'Velas douradas', 'Frutas silvestres'],
      timing: 'Lua crescente ou cheia',
      intention: 'Amplificar o poder de manifestação e criação consciente',
    },
    {
      type: 'Ebó de Dupla Visão',
      description: 'Prática para desenvolver percepção além das aparências',
      ingredients: ['Kolanut', 'Romã', 'Velas azuis e douradas', 'Óleo de dendê'],
      timing: 'Segunda-feira à noite',
      intention: 'Desenvolver a visão interior que percebe a verdade além do véu',
    },
    {
      type: 'Ebó de União dos Opostos',
      description: 'Ritual para integrar sombras e luzes do self',
      ingredients: ['Água de obi', 'Carvão', 'Sal', 'Velas vermelhas e brancas'],
      timing: 'Equinócio ou lua cheia',
      intention: 'Unificar os opostos dentro de si para alcançar wholeness completo',
    },
  ],
  quizilas: [
    'Ressentimento guardado (cria desarmonia interna)',
'Superar a dualidade (negar um polo cria fragmentação)',
    'Excesso de idealismo sem ação',
    'Fuga da responsabilidade criativa',
    'Teimosia em um único ponto de vista',
    'Avidez excessiva por luz, evitando a sombra',
    'Manipulação da realidade para evitar o real',
    'Inveja das qualidades que não se reconhece em si',
  ],
  strengths: [
    'Capacidade de unir opostos em harmonia criativa',
    'Dupla visão que percebe além das aparências',
    'Poder de criar realidade através da consciência',
    'Equilíbrio entre ação e receptividade',
    'Sabedoria ancestral integrada com inovação',
    'Capacidade de mediar conflitos internos e externos',
    'Acesso aos mistérios da criação e destruição',
    'Presença sagrada que eleva o ambiente',
  ],
  weaknesses: [
    'Tensão interna entre polos opostos pode causar paralisia',
    'Dificuldade em tomar decisões por ver muitos lados',
    'Impaciência com quem não compreende a complexidade',
    'Tendência ao isolamento quando em conflito interno',
    'Risco de exaustão por carregar muitos paradoxos',
    'Perfeccionismo que busca harmonia impossível',
  ],
  health: [
    'Sistema nervoso (tensão entre opostos)',
    'Glândulas pineal e pituitária (dupla visão)',
    'Plexo Solar e Sacral (2º e 3º Chakras)',
    'Coração (equilíbrio emocional)',
    'Articulações (tensão acumulada)',
    'Pele (eliminação de toxinas emocionais)',
  ],
  meanings: [
    'O encontro sagrado de duas forças que criam uma terceira',
    'A dualidade que sustenta toda existência',
    'O momento onde luz e sombra se abraçam',
    'A criação que nasce da união dos opostos',
    'A consciência que vê além da superfície',
    'O poder de manifestar através do pensamento iluminado',
    'A sabedoria que integra todos os aspectos do ser',
  ],
  ifaMessage:
    'Ogbe Meji fala do momento sagrado em que o indivíduo desperta para a verdade de que toda criação nasce da união dos opostos. Este Odu ensina que luz e sombra, masculino e feminino, criação e destruição são faces da mesma realidade divina. Oxum oferece a sabedoria das águas que fluem em harmonia, enquanto Obatalá oferece a claridade do pensamento puro. A verdadeira criação não está em eliminar a sombra, mas em integrá-la como parte essencial do Whole. Quem compreende Ogbe Meji compreende que somos co-criadores com o divino, capazes de manifestar realidades através do pensamento equilibrado. Abrace ambos os polos, e a criação se manifestará em sua vida com poder e graça.',
  orixas: ['Oxum', 'Obatalá', 'Logunedê'],
  sacredFrequencies: ['432 Hz', '528 Hz', '639 Hz'],
  chakra: '2º e 3º Plexo Solar e Sacral',
  herbs: [
    'Kolanut (Obi)',
    'Alfa-vaca (alfavaca)',
    'Romã',
    'Erva-doce',
    'Milho',
    'Girassol',
    'Lótus',
    'Sálvia',
    'Mirra',
    'Incenso de olibano',
  ],
  affirmations: [
    'Eu sou a união sagrada dos opostos dentro de mim',
'Minha criação flui da harmonia entre luz e sombra',
    'Eu abraço todos os aspectos de meu ser com amor',
    'Meu pensamento cria realidade com poder e graça',
    'A sabedoria flui através de mim em perfeito equilíbrio',
  ],
  meditation:
    'Sinta ambas as serpentes dentro de você, honours sua dança eterna, e permita que sua união crie algo novo em sua vida. Peça a Oxum sabedoria emocional e a Obatalá clareza de pensamento, permitindo que ambos fluam em harmonia dentro de seu ser.',
};

export function getData(): OgbeMejiOdu {
  return OGBE_MEJI_DATA;
}

export function getDataById(id: string): OgbeMejiOdu | undefined {
  return id === 'ogbe-meji' ? OGBE_MEJI_DATA : undefined;
}

export function getHerbs(): string[] {
  return OGBE_MEJI_DATA.herbs;
}

export function getRituals(): Ebo[] {
  return OGBE_MEJI_DATA.ebos;
}

export function getOrixas(): string[] {
  return OGBE_MEJI_DATA.orixas;
}

export function getQuizilas(): string[] {
  return OGBE_MEJI_DATA.quizilas;
}

export function getSacredFrequencies(): string[] {
  return OGBE_MEJI_DATA.sacredFrequencies;
}

export function getAffirmations(): string[] {
  return OGBE_MEJI_DATA.affirmations;
}

export function getMeditation(): string {
  return OGBE_MEJI_DATA.meditation;
}

export default getData;