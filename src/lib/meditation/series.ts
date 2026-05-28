export interface MeditationSeries {
  id: string;
  name: string;
  duration: number;
  description: string;
  benefits: string[];
}

const series: MeditationSeries[] = [
  {
    id: '7-dias',
    name: 'Sete Dias',
    duration: 7,
    description: 'Iniciação à prática meditativa. Sete dias para criar o hábito e experimentar os primeiros benefícios.',
    benefits: [
      'Redução do estresse inicial',
      'Melhoria na qualidade do sono',
      'Aumento da consciência corporal',
      'Estabelecimento de rotina diária',
    ],
  },
  {
    id: '21-dias',
    name: 'Vinte e Um Dias',
    duration: 21,
    description: 'Fase de consolidação. Três semanas para transformar a prática em parte natural do cotidiano.',
    benefits: [
      'Fortalecimento da disciplina pessoal',
      'Maior clareza mental e foco',
      'Redução significativa da ansiedade',
      'Desenvolvimento da presença mindful',
    ],
  },
  {
    id: '40-dias',
    name: 'Quarenta Dias',
    duration: 40,
    description: 'Transformação profunda. O ciclo completo para plantar a meditação como raiz permanente na vida.',
    benefits: [
      'Renovação celular e energética',
      'Profunda conexão interior',
      'Liberdade dos padrões automáticos',
      'Estabelecimento de nova identidade',
    ],
  },
];

export function getSeries(): MeditationSeries[] {
  return series;
}

export function getSeriesById(id: string): MeditationSeries | undefined {
  return series.find((s) => s.id === id);
}
