// @ts-nocheck
// Numerology charts - visualization data generators

import { calculate } from './calculator';

/**
 * Chart types available in the numerology system
 */
export type ChartType = 
  | 'life-path'
  | 'expression'
  | 'soul-urge'
  | 'personality'
  | 'destiny'
  | 'personality-wheel'
  | 'compatibility'
  | 'cycles';

/**
 * Numerology chart data structure
 */
export interface ChartData {
  type: ChartType;
  title: string;
  subtitle?: string;
  numbers: ChartNumber[];
  summary: string;
  recommendations?: string[];
  date?: string;
  name?: string;
}

/**
 * Individual number in a chart
 */
export interface ChartNumber {
  value: number;
  label: string;
  position: number;
  isMaster?: boolean;
  color?: string;
}

/**
 * Personality wheel segment
 */
export interface WheelSegment {
  number: number;
  degree: number;
  label: string;
  color: string;
  strength: 'low' | 'medium' | 'high';
}

/**
 * Compatibility matrix cell
 */
export interface CompatibilityCell {
  yourNumber: number;
  partnerNumber: number;
  score: number;
  description: string;
}

/**
 * Cycle data point
 */
export interface CyclePoint {
  period: string;
  number: number;
  theme: string;
  focus: string;
}

/**
 * Generate a complete numerology chart
 */
export function generateChart(
  input: string | { name: string; date: string },
  options?: {
    type?: ChartType;
    includeSummary?: boolean;
    includeRecommendations?: boolean;
  }
): ChartData {
  const name = typeof input === 'string' ? input : input.name;
  const date = typeof input === 'string' ? '' : input.date;
  const result = calculate({ name, date });
  const chartType = options?.type || 'life-path';

  return buildChart(result, chartType, name, date, options);
}

function buildChart(
  result: ReturnType<typeof calculate>,
  type: ChartType,
  name: string,
  date: string,
  options?: {
    includeSummary?: boolean;
    includeRecommendations?: boolean;
  }
): ChartData {
  switch (type) {
    case 'life-path':
      return buildLifePathChart(result, name, date, options);
    case 'expression':
      return buildExpressionChart(result, name, options);
    case 'soul-urge':
      return buildSoulUrgeChart(result, name, options);
    case 'personality':
      return buildPersonalityChart(result, name, options);
    case 'destiny':
      return buildDestinyChart(result, name, date, options);
    case 'personality-wheel':
      return buildPersonalityWheelChart(result, name, options);
    case 'compatibility':
      return buildCompatibilityChart(result, name, options);
    case 'cycles':
      return buildCyclesChart(result, name, date, options);
    default:
      return buildLifePathChart(result, name, date, options);
  }
}

function buildLifePathChart(
  result: ReturnType<typeof calculate>,
  name: string,
  date: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  const vida = result.vida;
  const isMaster = [11, 22, 33].includes(vida);

  return {
    type: 'life-path',
    title: `Caminho de Vida - ${name}`,
    subtitle: `Nascimento: ${date}`,
    numbers: [
      { value: vida, label: 'Caminho de Vida', position: 1, isMaster },
      { value: result.vida, label: 'Expressão', position: 2 },
      { value: result.motivacao, label: 'Motivação', position: 3 },
      { value: result.impressao, label: 'Impressão', position: 4 },
    ],
    summary: getNumberDescription(vida),
    recommendations: options?.includeRecommendations ? getLifePathRecommendations(vida) : undefined,
    name,
    date,
  };
}

function buildExpressionChart(
  result: ReturnType<typeof calculate>,
  name: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  const expressao = result.expressao;
  const isMaster = [11, 22, 33].includes(expressao);

  return {
    type: 'expression',
    title: `Expressão - ${name}`,
    numbers: [
      { value: expressao, label: 'Expressão', position: 1, isMaster },
      { value: result.expressao, label: 'Destino', position: 2 },
      { value: result.pitagorica.numero, label: 'Pitagórica', position: 3, color: '#6366f1' },
      { value: result.caldeia.numero, label: 'Caldeia', position: 4, color: '#8b5cf6' },
    ],
    summary: getNumberDescription(expressao),
    recommendations: options?.includeRecommendations ? getExpressionRecommendations(expressao) : undefined,
    name,
  };
}

function buildSoulUrgeChart(
  result: ReturnType<typeof calculate>,
  name: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  const motivacao = result.motivacao;
  const isMaster = [11, 22, 33].includes(motivacao);

  return {
    type: 'soul-urge',
    title: `Impulso da Alma - ${name}`,
    numbers: [
      { value: motivacao, label: 'Impulso da Alma', position: 1, isMaster },
      { value: result.motivacao, label: 'Desejo Interior', position: 2 },
      { value: result.tantrica.numero, label: 'Tântrica', position: 3, color: '#ec4899' },
    ],
    summary: getNumberDescription(motivacao),
    recommendations: options?.includeRecommendations ? getSoulUrgeRecommendations(motivacao) : undefined,
    name,
  };
}

function buildPersonalityChart(
  result: ReturnType<typeof calculate>,
  name: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  const impressao = result.impressao;
  const isMaster = [11, 22, 33].includes(impressao);

  return {
    type: 'personality',
    title: `Personalidade - ${name}`,
    numbers: [
      { value: impressao, label: 'Personalidade', position: 1, isMaster },
      { value: result.impressao, label: 'Máscara Externa', position: 2 },
      { value: result.cabalistica.numero, label: 'Cabalística', position: 3, color: '#f59e0b' },
    ],
    summary: getNumberDescription(impressao),
    recommendations: options?.includeRecommendations ? getPersonalityRecommendations(impressao) : undefined,
    name,
  };
}

function buildDestinyChart(
  result: ReturnType<typeof calculate>,
  name: string,
  date: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  const destino = result.destino.numero;
  const isMaster = [11, 22, 33].includes(destino);

  return {
    type: 'destiny',
    title: `Destino - ${name}`,
    subtitle: `Data: ${date}`,
    numbers: [
      { value: destino, label: 'Destino', position: 1, isMaster },
      { value: result.destino.numero, label: 'Lição de Vida', position: 2 },
      { value: result.vida, label: 'Caminho', position: 3 },
    ],
    summary: getNumberDescription(destino),
    recommendations: options?.includeRecommendations ? getDestinyRecommendations(destino) : undefined,
    name,
    date,
  };
}

function buildPersonalityWheelChart(
  result: ReturnType<typeof calculate>,
  name: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  return {
    type: 'personality-wheel',
    title: `Roda da Personalidade - ${name}`,
    numbers: [
      { value: result.expressao, label: 'Centro', position: 1 },
      { value: result.motivacao, label: 'Oposto', position: 2 },
      { value: result.impressao, label: 'Apoio', position: 3 },
      { value: result.vida, label: 'Raiz', position: 4 },
      { value: result.pitagorica.numero, label: 'Pitagórica', position: 5, color: '#6366f1' },
      { value: result.caldeia.numero, label: 'Caldeia', position: 6, color: '#8b5cf6' },
    ],
    summary: 'Análise integrada da personalidade e suas tensões internas.',
    recommendations: options?.includeRecommendations ? getWheelRecommendations(result) : undefined,
    name,
  };
}

function buildCompatibilityChart(
  result: ReturnType<typeof calculate>,
  name: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  return {
    type: 'compatibility',
    title: `Análise de Compatibilidade - ${name}`,
    numbers: [
      { value: result.vida, label: 'Seu Caminho', position: 1 },
      { value: result.expressao, label: 'Sua Expressão', position: 2 },
    ],
    summary: 'Compatibilidade baseada nos números principais.',
    recommendations: options?.includeRecommendations ? getCompatibilityRecommendations(result) : undefined,
    name,
  };
}

function buildCyclesChart(
  result: ReturnType<typeof calculate>,
  name: string,
  date: string,
  options?: { includeSummary?: boolean; includeRecommendations?: boolean }
): ChartData {
  return {
    type: 'cycles',
    title: `Ciclos de Vida - ${name}`,
    subtitle: `Data: ${date}`,
    numbers: [
      { value: result.vida, label: 'Ciclo Principal', position: 1 },
      { value: result.expressao, label: 'Ciclo de Expressão', position: 2 },
      { value: result.motivacao, label: 'Ciclo de Motivação', position: 3 },
    ],
    summary: 'Análise dos ciclos temporais da sua jornada espiritual.',
    recommendations: options?.includeRecommendations ? getCyclesRecommendations(result) : undefined,
    name,
    date,
  };
}

/**
 * Get wheel segments for visualization
 */
export function getWheelSegments(chart: ChartData): WheelSegment[] {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  return chart.numbers.map((num, i) => ({
    number: num.value,
    degree: (360 / chart.numbers.length) * i,
    label: num.label,
    color: num.color || colors[i % colors.length],
    strength: num.isMaster ? 'high' : (num.position <= 2 ? 'medium' : 'low'),
  }));
}

/**
 * Get compatibility matrix
 */
export function getCompatibilityMatrix(yourNumber: number, partnerNumbers: number[]): CompatibilityCell[] {
  const matrix: CompatibilityCell[] = [];
  
  for (const partnerNum of partnerNumbers) {
    const score = calculateCompatibilityScore(yourNumber, partnerNum);
    matrix.push({
      yourNumber,
      partnerNumber: partnerNum,
      score,
      description: getCompatibilityDescription(yourNumber, partnerNum, score),
    });
  }
  
  return matrix;
}

function calculateCompatibilityScore(a: number, b: number): number {
  const diff = Math.abs(a - b);
  if (diff === 0) return 100;
  if (diff <= 2) return 85;
  if (diff <= 4) return 70;
  if (diff === 5 || diff === 7) return 90;
  if (diff === 9) return 60;
  if (diff <= 3) return 75;
  return 50;
}

function getCompatibilityDescription(a: number, b: number, score: number): string {
  if (score >= 90) return 'Harmonia excepcional - vocês se complementam perfeitamente.';
  if (score >= 75) return 'Boa sintonia - há espaço para crescimento conjunto.';
  if (score >= 60) return 'Compatibilidade moderada - requer compreensão mútua.';
  return 'Desafios potenciais - a conexão exige trabalho consciente.';
}

/**
 * Get cycle points for timeline visualization
 */
export function getCyclePoints(
  lifePath: number,
  years?: number[]
): CyclePoint[] {
  const cycles: CyclePoint[] = [];
  const themes = getCycleThemes(lifePath);
  const focus = getCycleFocus(lifePath);
  
  for (let i = 0; i < 9; i++) {
    const periodNum = ((lifePath + i) % 9) + 1;
    cycles.push({
      period: `Ciclo ${i + 1}`,
      number: periodNum,
      theme: themes[i % themes.length],
      focus: focus,
    });
  }
  
  return cycles;
}

function getCycleThemes(lifePath: number): string[] {
  const themesMap: Record<number, string[]> = {
    1: ['Iniciação', 'Inovação', 'Liderança', 'Independência', 'Pioneirismo', 'Originalidade', 'Ambição', 'Determinação', 'Autoafirmação'],
    2: ['Parceria', 'Cooperação', 'Diplomacia', 'Equilíbrio', 'Sensibilidade', 'Intuição', 'União', 'Harmonia', 'Paciência'],
    3: ['Criatividade', 'Expressão', 'Comunicação', 'Socialização', 'Otimismo', 'Inspiração', 'Arte', ' Alegria', 'Flexibilidade'],
    4: ['Estabilidade', 'Fundação', 'Trabalho', 'Disciplina', 'Ordem', 'Praticidade', 'Construção', 'Paciência', 'Persistência'],
    5: ['Mudança', 'Liberdade', 'Adaptação', 'Diversidade', 'Experiência', 'Versatilidade', 'Movimento', 'Exploração', 'Progreso'],
    6: ['Responsabilidade', 'Família', 'Serviço', 'Harmonia', 'Cuidado', 'Comunidade', 'Compromisso', 'Amor', 'Equilíbrio'],
    7: ['Interiorização', 'Análise', 'Sabedoria', 'Espiritualidade', 'Perfeccionismo', 'Isolamento', 'Conhecimento', 'Meditação', 'Profundidade'],
    8: ['Poder', 'Abundância', 'Autoridade', 'Gestão', 'Reconhecimento', 'Realização', 'Força', 'Sabedoria Material', 'Liderança'],
    9: ['Humanitarismo', 'Compassão', 'Sabedoria Universal', 'Término', 'Perdão', 'Idealismo', 'Influência', 'Desapego', 'Iluminação'],
  };
  return themesMap[lifePath] || themesMap[1];
}

function getCycleFocus(lifePath: number): string {
  const focusMap: Record<number, string> = {
    1: 'Assertividade e autoexpressão',
    2: 'Cooperação e relacionamentos',
    3: 'Criatividade e comunicação',
    4: 'Estrutura e trabalho duro',
    5: 'Liberdade e adaptação',
    6: 'Família e responsabilidade',
    7: 'Conhecimento e solidão',
    8: 'Poder e realizações materiais',
    9: 'Desapego e serviço à humanidade',
  };
  return focusMap[lifePath] || focusMap[1];
}

function getNumberDescription(num: number): string {
  const descriptions: Record<number, string> = {
    1: 'Líder nato, pioneiro, independente e criativo. Busque a originality e confie em sua capacidade de iniciar novos caminhos.',
    2: 'Diplomático, cooperativo e intuitivo. Sua força está nas parcerias e na capacidade de criar harmonia onde há conflito.',
    3: 'Criativo, expressivo e sociável. Você irradia alegria e tem o dom de inspirar outros através da comunicação e arte.',
    4: 'Prático,trabalhador e estável. Sua determinação constrói fundamentos sólidos e sua disciplina conquista resultados duradouros.',
    5: 'Adaptável, livre e inquieto. Sua energia traz mudanças e sua versatilidade permite explorar múltiplos caminhos.',
    6: 'Responsável, carinhoso e orientado para a família. Seu propósito está em servir e criar harmonia em seu entorno.',
    7: 'Analítico, espiritual e profundo. Sua busca por conhecimento interior conduz à sabedoria e à maestria.',
    8: 'Poderoso, abundante e orientado para o sucesso material. Você tem a capacidade de manifestar prosperidade e liderança.',
    9: 'Humanitário, compassivo e sábio. Sua missão é servir a humanidade e transcender o ego através do amor universal.',
    11: 'Mestre canalizador de luz e intuição. Sua sensibilidade espiritual é um presente para curar e inspirar outros.',
    22: 'Mestre construtor capaz de transformar visões em realidade. Seu potencial para criar impacto global é extraordinário.',
    33: 'Mestre professor espiritual. Sua missão é iluminar o caminho dos outros através do amor incondicional.',
  };
  return descriptions[num] || descriptions[1];
}

function getLifePathRecommendations(num: number): string[] {
  const recs: Record<number, string[]> = {
    1: ['Desenvolva sua independência', 'Lidere com exemplo', 'Evite a arrogância'],
    2: ['Cultive parcerias genuínas', 'Pratique a escuta ativa', 'Equilibre giving e receiving'],
    3: ['Expresse sua criatividade', 'Comunique com autenticidade', 'Evite a dispersão'],
    4: ['Estabeleça fundamentos sólidos', 'Trabalhe com perseverança', 'Evite o controle excessivo'],
    5: ['Abrace a mudança', 'Busque experiências diversas', 'Mantenha o foco'],
    6: ['Honre seus compromissos', 'Crie harmonia familiar', 'Evite o excesso de responsabilidade'],
    7: ['Reserve tempo para reflexão', 'Busque conhecimento profundo', 'Permita-se solitude'],
    8: ['Busque prosperidade com ética', 'Exerça liderança justa', 'Evite a obsessão por status'],
    9: ['Sirva à humanidade', 'Pratique o desapego', 'Cultive a compaixão'],
    11: ['Canalize sua intuição', 'Ilumine caminhos', 'Aceite sua sensibilidade'],
    22: ['Construa projetos grandiosos', 'Trabalhe em equipe', 'Mantenha o equilíbrio'],
    33: ['Ensinhe pelo exemplo', 'Amor unconditional', ' trascenda o ego'],
  };
  return recs[num] || recs[1];
}

function getExpressionRecommendations(num: number): string[] {
  return getLifePathRecommendations(num);
}

function getSoulUrgeRecommendations(num: number): string[] {
  return getLifePathRecommendations(num);
}

function getPersonalityRecommendations(num: number): string[] {
  return getLifePathRecommendations(num);
}

function getDestinyRecommendations(num: number): string[] {
  return getLifePathRecommendations(num);
}

function getWheelRecommendations(_result: unknown): string[] {
  return [
    'Analise as tensões entre opostos',
    'Integre as qualidades de apoio',
    'Use o centro como âncora',
  ];
}

function getCompatibilityRecommendations(_result: unknown): string[] {
  return [
    'Comunique suas necessidades claramente',
    'Honre as diferenças como complementares',
    'Trabalhem juntos nos pontos de atrito',
  ];
}

function getCyclesRecommendations(_result: unknown): string[] {
  return [
    'Observe os temas de cada ciclo',
    'Adapte-se às mudanças programadas',
    'Use cada fase para evolução',
  ];
}

/**
 * Export chart as data for visualization libraries
 */
export function exportChartData(chart: ChartData): {
  labels: string[];
  values: number[];
  colors: string[];
  metadata: Record<string, any>;
} {
  return {
    labels: chart.numbers.map(n => n.label),
    values: chart.numbers.map(n => n.value),
    colors: chart.numbers.map(n => n.color || '#6366f1'),
    metadata: {
      type: chart.type,
      title: chart.title,
      subtitle: chart.subtitle,
      summary: chart.summary,
    },
  };
}

export default generateChart;