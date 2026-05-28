export interface FormaGeometrica {
  id: string;
  nome: string;
  nomeIngles: string;
  descricao: string;
  simbolismo: string;
  cor: string;
  sefirots: string[];
  chakras: number[];
  frequencias: string[];
  beneficios: string[];
  praticas: string[];
}

export const FORMAS_SAGRADAS: FormaGeometrica[] = [
  {
    id: 'flower-of-life',
    nome: 'Flor da Vida',
    nomeIngles: 'Flower of Life',
    descricao: 'Padrão geométrico composto por círculos sobrepostos igualmente espaçados, formando uma flor-like pattern de 19 pétalas.',
    simbolismo: 'Criação, interconexão de toda vida, energia divina em movimento. Representa a estrutura fundamental do universo.',
    cor: '#FFD700',
    sefirots: ['Kether', 'Chokmah', 'Binah'],
    chakras: [7],
    frequencias: ['396 Hz', '528 Hz'],
    beneficios: [
      'Harmonização energética',
      'Aumento da vibração espiritual',
      'Proteção contra energias negativas',
      'Promoção da cura',
    ],
    praticas: [
      'Meditar observando a Flor da Vida por 5-10 minutos',
      'Colocar em ambientes para purificação energética',
      'Usar como ferramenta de desenho para visualização criativa',
    ],
  },
  {
    id: 'seed-of-life',
    nome: 'Semente da Vida',
    nomeIngles: 'Seed of Life',
    descricao: 'Primeiros 6 círculos da Flor da Vida, representando os 6 dias da criação na tradição Kabbalística.',
    simbolismo: 'Potencial latente, início de novos ciclos, semente de toda manifestação.',
    cor: '#90EE90',
    sefirots: ['Chesed'],
    chakras: [4],
    frequencias: ['417 Hz', '528 Hz'],
    beneficios: [
      'Estimulação da criatividade',
      'Renovação e regeneração',
      'Abertura para novos começos',
    ],
    praticas: [
      'Visualizar durante meditação matinal',
      'Usar como ferramenta para definir intenções',
    ],
  },
  {
    id: 'tree-of-life-sacred',
    nome: 'Árvore da Vida Sagrada',
    nomeIngles: 'Sacred Tree of Life',
    descricao: 'Representação bidimensional dos 10 Sefirots conectados por 22 Caminhos.',
    simbolismo: 'Mapa do universo, caminho de descida da luz divina, estrutura da consciência.',
    cor: '#7C3AED',
    sefirots: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    frequencias: ['432 Hz', '528 Hz', '639 Hz'],
    beneficios: [
      'Conexão com a consciência cósmica',
      'Compreensão dos caminhos espirituais',
      'Equilíbrio entre polaridades',
      'Desenvolvimento da alma',
    ],
    praticas: [
      'Estudar e meditar sobre cada Sefirot',
      'Visualizar a árvore durante práticas de introspecção',
      'Trabalhar com cada caminho individualmente',
    ],
  },
  {
    id: 'merkaba',
    nome: 'Merkaba',
    nomeIngles: 'Merkaba',
    descricao: 'Duas estrelas tetraédricas (pirâmides) interconectadas, uma apontando para cima e outra para baixo.',
    simbolismo: 'Veículo de luz, campo de energia multidimensional, ascensão espiritual.',
    cor: '#00CED1',
    sefirots: ['Kether', 'Tiphereth'],
    chakras: [6, 7],
    frequencias: ['528 Hz', '639 Hz', '741 Hz'],
    beneficios: [
      'Expansão da consciência',
      'Proteção dimensional',
      'Ativação da glândula pineal',
      'Viagem astral facilitada',
    ],
    praticas: [
      'Meditação com visualization dos dois tetraedros girando',
      'Ativação através de respirações específicas',
      'Usar durante práticas deenergia healing',
    ],
  },
  {
    id: 'metatrons-cube',
    nome: 'Cubo de Metatron',
    nomeIngles: "Metatron's Cube",
    descricao: 'Estrutura geométrica derivada da Flor da Vida, contendo todos os 5 sólidos platônicos.',
    simbolismo: 'Fluxo de energia divina, containing toda a criação,门户 para dimensões superiores.',
    cor: '#4169E1',
    sefirots: ['Chokmah', 'Binah', 'Geburah', 'Hod'],
    chakras: [5, 6, 7],
    frequencias: ['528 Hz', '639 Hz', '741 Hz', '852 Hz'],
    beneficios: [
      'Dissolução de bloqueios energéticos',
      'Canalização de energia curativa',
      'Proteção contra negatividades',
      'Expansão da percepção dimensional',
    ],
    praticas: [
      'Visualizar o cubo emanando luz durante meditação',
      'Usar para banimento e proteção de espaços',
      'Meditar sobre os sólidos platônicos individually',
    ],
  },
  {
    id: 'hexagram',
    nome: 'Hexagrama',
    nomeIngles: 'Hexagram',
    descricao: 'Estrela de 6 pontas formada por dois triângulos entrelaçados, um apontando para cima e outro para baixo.',
    simbolismo: 'Equilíbrio entre masculino/feminino, união de opostos, 微調整 universal.',
    cor: '#FFD700',
    sefirots: ['Tiphereth', 'Yesod'],
    chakras: [4],
    frequencias: ['528 Hz'],
    beneficios: [
      'Harmonização de energias opostas',
      'Atração de equilíbrio e paz',
      'Proteção universal',
    ],
    praticas: [
      'Usar como símbolo de proteção',
      'Meditar sobre o equilíbrio interno',
    ],
  },
  {
    id: 'pentagram',
    nome: 'Pentagrama',
    nomeIngles: 'Pentagram',
    descricao: 'Estrela de 5 pontas com um círculo ao redor, cada ponta representando um elemento.',
    simbolismo: 'Microcosmo humano, five elements in harmony,Magia e proteção.',
    cor: '#FF4500',
    sefirots: ['Malkuth'],
    chakras: [1, 2, 3, 4, 5],
    frequencias: ['285 Hz', '528 Hz'],
    beneficios: [
      'Conexão com os cinco elementos',
      'Proteção e banimento',
      'Manifestação de intentions',
    ],
    praticas: [
      'Usar em rituais de proteção',
      'Meditar sobre os cinco elementos',
    ],
  },
  {
    id: 'vesica-piscis',
    nome: 'Vesica Piscis',
    nomeIngles: 'Vesica Piscis',
    descricao: 'Forma criada pela interseção de dois círculos com o mesmo raio, whose centers são separados pela radius distance.',
    simbolismo: 'Portal, abertura para dimensões superiores, luz divina, intersection of realms.',
    cor: '#C0C0C0',
    sefirots: ['Chokmah'],
    chakras: [6],
    frequencias: ['639 Hz'],
    beneficios: [
      'Abertura de portais dimensionais',
      'Iluminação espiritual',
      'Expansão da consciência',
    ],
    praticas: [
      'Usar como ponto focal em meditação',
      'Visualizar entrando no espaço central',
    ],
  },
  {
    id: 'solids-platonic',
    nome: 'Sólidos Platônicos',
    nomeIngles: 'Platonic Solids',
    descricao: 'Os 5 poliedros regulares: tetraedro, cubo, octaedro, dodecaedro e icosaedro.',
    simbolismo: 'Building blocks of creation, five elements, pure geometric forms.',
    cor: '#9370DB',
    sefirots: ['Kether', 'Binah', 'Chesed'],
    chakras: [3, 4, 5],
    frequencias: ['432 Hz', '528 Hz', '639 Hz', '741 Hz', '852 Hz'],
    beneficios: [
      'Conexão com os elementos primordiais',
      'Estruturação do pensamento',
      'Purificação energética',
    ],
    praticas: [
      'Meditar sobre cada sólido individualmente',
      'Usar em grid de cristalização',
    ],
  },
];

export function getFormaPorSefirot(sefirot: string): FormaGeometrica[] {
  return FORMAS_SAGRADAS.filter(f => f.sefirots.includes(sefirot));
}

export function getFormaPorChakra(chakra: number): FormaGeometrica[] {
  return FORMAS_SAGRADAS.filter(f => f.chakras.includes(chakra));
}

export function getFrequenciaRecommendations(forma: FormaGeometrica): string {
  return forma.frequencias.join(' + ');
}