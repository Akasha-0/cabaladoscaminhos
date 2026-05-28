export interface SacredShape {
  id: string;
  nome: string;
  nomeIngles: string;
  descricao: string;
  simbolismo: string;
  elementos: string[];
  sefirots: string[];
  chakras: number[];
  cor: string;
  svgPath: string;
}

export const SHAPES: SacredShape[] = [
  {
    id: 'seed-of-life',
    nome: 'Semente da Vida',
    nomeIngles: 'Seed of Life',
    descricao: 'Sete círculos sobrepostos igualmente espaçados, representando os sete dias da criação. É a base para a Flor da Vida.',
    simbolismo: 'Potencial puro, início divino, germinação espiritual.',
    elementos: ['Círculo central', '6 círculos circundantes'],
    sefirots: ['Kether'],
    chakras: [1, 7],
    cor: '#7B68EE',
    svgPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
  },
  {
    id: 'flower-of-life',
    nome: 'Flor da Vida',
    nomeIngles: 'Flower of Life',
    descricao: '19 círculos sobrepostos formando um padrão de flor com 6 pétalas. Padrão universal encontrado em culturas antigas ao redor do mundo.',
    simbolismo: 'Criação, interconexão, totalidade, energia divina em movimento.',
    elementos: ['19 círculos sobrepostos', '6 pétalas externas', 'Centro geométrico'],
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [4, 7],
    cor: '#FFD700',
    svgPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  {
    id: 'metatrons-cube',
    nome: 'Cubo de Metatron',
    nomeIngles: "Metatron's Cube",
    descricao: '13 círculos conectados por linhas retas, contendo todos os 5 sólidos platônicos. O cube representa os elementos básicos da criação.',
    simbolismo: 'Fluxo de energia divina, proteção, conexão entre reinos.',
    elementos: ['13 círculos', '78 linhas', '5 sólidos platônicos'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah'],
    chakras: [1, 3, 7],
    cor: '#4169E1',
    svgPath: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 4l6 3-6 3-6-3 6-3z',
  },
  {
    id: 'vesica-piscis',
    nome: 'Vesica Piscis',
    nomeIngles: 'Vesica Piscis',
    descricao: 'Forma criada pela interseção de dois círculos com o mesmo raio, cujo centro de um está na circunferência do outro.',
    simbolismo: 'União divina, luz e escuridão, interseção do físico e espiritual.',
    elementos: ['Dois círculos iguais', 'Interseção central', 'Lentícula'],
    sefirots: ['Binah', 'Chokmah'],
    chakras: [6, 7],
    cor: '#9370DB',
    svgPath: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  },
  {
    id: 'tree-of-life',
    nome: 'Árvore da Vida',
    nomeIngles: 'Tree of Life',
    descricao: '10 sefirots (esferas) conectados por 22 caminhos. Representa o mapa da realidade e a estrutura da consciência divina.',
    simbolismo: 'Crescimento espiritual, conexão entre céus e terra, sabedoria divina.',
    elementos: ['10 sefirots', '22 caminhos', '3 pilares'],
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    cor: '#32CD32',
    svgPath: 'M12 2v6m0 4v8m-6-6h4m4 0h4',
  },
  {
    id: 'sri-yantra',
    nome: 'Sri Yantra',
    nomeIngles: 'Sri Yantra',
    descricao: 'Diagrama sagrado hindu com 9 triângulos entrelaçados formando um padrão geométrico complexo de 43 triângulos menores.',
    simbolismo: 'Expansão cósmica, integração de energias masculino e feminino sagrado.',
    elementos: ['9 triângulos principais', '432 triângulos menores', '4 pétalas', 'Círculo exterior'],
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [5, 6, 7],
    cor: '#FF6347',
    svgPath: 'M12 2L2 22h20L12 2zm0 6l6 10H6l6-10z',
  },
  {
    id: 'torus',
    nome: 'Toro',
    nomeIngles: 'Torus',
    descricao: 'Forma geométrica em forma de donut, representando o fluxo contínuo de energia. O campo electromagnético do coração humano é um toro.',
    simbolismo: 'Fluxo eterno, energia vital circulante, auto-sustentação.',
    elementos: ['Centro oco', 'Superfície contínua', 'Movimento infinito'],
    sefirots: ['Tiferet', 'Netzach'],
    chakras: [4, 6],
    cor: '#00CED1',
    svgPath: 'M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20zm0 4a6 6 0 0 0 0 12 6 6 0 0 0 0-12z',
  },
  {
    id: 'merkaba',
    nome: 'Merkaba',
    nomeIngles: 'Merkaba',
    descricao: 'Duas tetraedros entrelaçados formando uma estrela de 8 pontas. Representa o veículo de luz da ascensão espiritual.',
    simbolismo: 'Proteção divina, ascensão, equilíbrio entre luz e escuridão.',
    elementos: ['2 tetraedros', 'Estrela de 8 pontas', 'Centro pyramidal'],
    sefirots: ['Kether', 'Chokmah'],
    chakras: [4, 5, 6, 7],
    cor: '#E6E6FA',
    svgPath: 'M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z',
  },
  {
    id: 'hexagon',
    nome: 'Hexágono',
    nomeIngles: 'Hexagon',
    descricao: 'Polígono de 6 lados representando o equilíbrio e a harmonia. Aparece na natureza em cristais e favos de mel.',
    simbolismo: 'Equilíbrio, harmonia, integração, comunicação divina.',
    elementos: ['6 lados iguais', '6 ângulos de 120°', 'Centro geométrico'],
    sefirots: ['Chesed', 'Gevurah', 'Tiferet'],
    chakras: [3, 4],
    cor: '#F4A460',
    svgPath: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z',
  },
  {
    id: 'pentagon',
    nome: 'Pentágono',
    nomeIngles: 'Pentagon',
    descricao: 'Polígono de 5 lados contendo o número de ouro. A proporção áurea está presente em toda a natureza e no corpo humano.',
    simbolismo: 'Proporção áurea, vida, saúde, vitalidade.',
    elementos: ['5 lados', 'Proporção áurea', '5 ângulos'],
    sefirots: ['Netzach', 'Hod'],
    chakras: [4, 6],
    cor: '#FF69B4',
    svgPath: 'M12 2l9.51 6.91L22 14.09l-4.51 8.91L12 19.91l-5.49 3.09L4 14.09l7.49-5.18L12 2z',
  },
  {
    id: 'golden-spiral',
    nome: 'Espiral Dourada',
    nomeIngles: 'Golden Spiral',
    descricao: 'Espiral baseada na proporção áurea (phi = 1.618). Encontra-se em conchas, galáxias, e na estrutura do corpo humano.',
    simbolismo: 'Crescimento natural, evolução, consciência expandida.',
    elementos: ['Espiral logarítmica', 'Proporção áurea', 'Expansão infinita'],
    sefirots: ['Chokmah', 'Netzach'],
    chakras: [2, 6, 7],
    cor: '#DAA520',
    svgPath: 'M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z',
  },
  {
    id: 'star-of-david',
    nome: 'Estrela de Davi',
    nomeIngles: 'Star of David',
    descricao: 'Dois triângulos entrelaçados formando uma estrela de 6 pontas. Representa a união do céu e da terra, masculino e feminino.',
    simbolismo: 'União, proteção, conexão entre céu e terra.',
    elementos: ['2 triângulos', '6 pontas', 'Hexágono central'],
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [6, 7],
    cor: '#4682B4',
    svgPath: 'M12 2L2 12l10 10 10-10L12 2zM12 8l4 4-4 4-4-4 4-4z',
  },
];

/**
 * Returns all sacred geometry shapes.
 */
export function getShapes(): SacredShape[] {
  return SHAPES;
}

/**
 * Returns a shape by its ID.
 */
export function getShapeById(id: string): SacredShape | undefined {
  return SHAPES.find((shape) => shape.id === id);
}

/**
 * Returns shapes associated with a specific sefirot.
 */
export function getShapesBySefirot(sefirot: string): SacredShape[] {
  return SHAPES.filter((shape) => shape.sefirots.includes(sefirot));
}

/**
 * Returns shapes associated with a specific chakra.
 */
export function getShapesByChakra(chakra: number): SacredShape[] {
  return SHAPES.filter((shape) => shape.chakras.includes(chakra));
}