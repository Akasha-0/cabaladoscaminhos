export interface FormaGeometrica {
  id: string;
  nome: string;
  nomeIngles: string;
  descricao: string;
  significado: string;
  asociacoes: {
    sefirot?: string;
    chakra?: string;
    elemento?: string;
    planeta?: string;
  };
  proporcoes: string;
  svgPath: string;
  corPrimaria: string;
  corSecundaria: string;
}

export const FORMAS_SAGRADAS: FormaGeometrica[] = [
  {
    id: 'flor-da-vida',
    nome: 'Flor da Vida',
    nomeIngles: 'Flower of Life',
    descricao: 'Padrão geométrico古老的 que contém todos os aspectos da vida. Composto por 19 círculos igualmente espaçados.',
    significado: 'Simboliza a criação, a interconexão de toda vida e a expansão da consciência.',
    asociacoes: {
      sefirot: 'Kether',
      chakra: '7º Coronário',
      elemento: 'Éter',
    },
    proporcoes: 'Proporção Áurea (φ = 1.618)',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    corPrimaria: '#9333EA',
    corSecundaria: '#C084FC',
  },
  {
    id: 'merkaba',
    nome: 'Merkaba',
    nomeIngles: 'Merkabah',
    descricao: 'Estrela de tetraedros entrelaçados, representando a veículo de luz do ser humano superior.',
    significado: 'Portal de ascensão, proteção divina e equilíbrio entre dimensões.',
    asociacoes: {
      sefirot: 'Daat',
      chakra: '6º Frontal',
      elemento: 'Luz',
    },
    proporcoes: 'Estrela de 8 pontas (octagrama)',
    svgPath: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
    corPrimaria: '#4F46E5',
    corSecundaria: '#818CF8',
  },
  {
    id: 'sri-yantra',
    nome: 'Sri Yantra',
    nomeIngles: 'Sri Yantra',
    descricao: 'Diagrama sagrado hindu com 9 triângulos entrelaçados representando estados de consciência.',
    significado: 'Expansão da consciência, meditação profunda e conexão com o divino.',
    asociacoes: {
      sefirot: 'Tiphereth',
      chakra: '6º Frontal',
      planeta: 'Sol',
    },
    proporcoes: 'Triângulos equiláteros em proporção 1:√3',
    svgPath: 'M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z',
    corPrimaria: '#F59E0B',
    corSecundaria: '#FCD34D',
  },
  {
    id: 'hexagrama',
    nome: 'Hexagrama',
    nomeIngles: 'Hexagram',
    descricao: 'Duas estrelas triangulares sobrepostas - uma apontando para cima, outra para baixo.',
    significado: 'Equilíbrio entre masculino e feminino, matéria e espírito.',
    asociacoes: {
      sefirot: 'Tiphereth',
      elemento: 'Ar',
      planeta: 'Vênus',
    },
    proporcoes: 'Dois triângulos equiláteros',
    svgPath: 'M12 2L20 8V16L12 22L4 16V8L12 2Z M12 8L16 12V16L12 20L8 16V12L12 8Z',
    corPrimaria: '#10B981',
    corSecundaria: '#6EE7B7',
  },
  {
    id: 'metatron-cubo',
    nome: 'Metatron Cubo',
    nomeIngles: "Metatron's Cube",
    descricao: 'Cubo geométrico com 13 círculos conectados por linhas, contendo todas as formas platônicas.',
    significado: 'Fluxo de energia divina, proteção contra negativas e transformação.',
    asociacoes: {
      sefirot: 'Kether',
      chakra: '7º Coronário',
      elemento: 'Éter',
    },
    proporcoes: '13 círculos conectados',
    svgPath: 'M8 4L16 4M4 8L20 8M4 16L20 16M8 20L16 20M12 4L12 20M4 12L20 12M4 8L16 20M20 8L8 20',
    corPrimaria: '#DC2626',
    corSecundaria: '#F87171',
  },
  {
    id: 'pentagrama',
    nome: 'Pentagrama',
    nomeIngles: 'Pentagram',
    descricao: 'Estrela de 5 pontas, uma das formas geométricas mais antigas e poderosas.',
    significado: 'Proteção, ascensão espiritual e微联系 com elementos naturais.',
    asociacoes: {
      sefirot: 'Netzach',
      elemento: 'Terra',
      planeta: 'Vênus',
    },
    proporcoes: 'Proporção Áurea nas pontas',
    svgPath: 'M12 2L15 9L22 9L16.5 14L18.5 22L12 17L5.5 22L7.5 14L2 9L9 9Z',
    corPrimaria: '#8B5CF6',
    corSecundaria: '#C4B5FD',
  },
];

export const PROPORCOES_SAGRADAS = [
  { nome: 'Número de Ouro (φ)', valor: 1.618033988749895, simbolo: 'φ' },
  { nome: 'Pi (π)', valor: 3.141592653589793, simbolo: 'π' },
  { nome: 'Número de Prata', valor: 2.414213562373095, simbolo: 'δ' },
  { nome: 'Constante de Euler', valor: 2.718281828459045, simbolo: 'e' },
];

export function getFormaPorSefirot(sefirot: string): FormaGeometrica[] {
  return FORMAS_SAGRADAS.filter(f => f.asociacoes.sefirot === sefirot);
}

export function getFormaPorChakra(chakra: string): FormaGeometrica[] {
  return FORMAS_SAGRADAS.filter(f => f.asociacoes.chakra === chakra);
}