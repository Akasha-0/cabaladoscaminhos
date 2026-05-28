// Visualization charts module

/**
 * Chart types available for spiritual data visualization
 */
export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polar'
  | 'scatter'
  | 'area';

/**
 * Spiritual data chart types
 */
export type SpiritualChartType =
  | 'chakra'
  | 'odud'
  | 'tarot'
  | 'numerology'
  | 'astrology'
  | 'journey'
  | 'progress';

/**
 * Chart data point structure
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chart dataset for visualization
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

/**
 * Complete chart configuration
 */
export interface ChartConfig {
  type: ChartType;
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: Record<string, unknown>;
    scales?: Record<string, unknown>;
  };
}

/**
 * Spiritual chart configuration with domain-specific data
 */
export interface SpiritualChartConfig extends ChartConfig {
  spiritualType: SpiritualChartType;
  period?: string;
  interpretation?: string;
}

/**
 * Chakra visualization data
 */
export interface ChakraChartData {
  chakra: string;
  value: number;
  color: string;
  position: number;
  balance: number;
}

/**
 * Odú (divination) chart data
 */
export interface OdudChartData {
  odud: string;
  name: string;
  frequency: number;
  element: string;
  orixa: string;
  meaning: string;
}

/**
 * Tarot spread visualization
 */
export interface TarotChartData {
  position: number;
  card: string;
  meaning: string;
  orientation: 'upright' | 'reversed';
  element?: string;
}

/**
 * Numerology chart data
 */
export interface NumerologyChartData {
  number: number;
  type: 'life-path' | 'expression' | 'soul-urge' | 'destiny';
  value: number;
  name: string;
  description: string;
}

/**
 * Progress tracking chart data
 */
export interface ProgressChartData {
  date: string;
  value: number;
  target?: number;
  milestone?: boolean;
}

/**
 * Get chart data based on type and parameters
 */
export function getChartData(
  type: ChartType,
  labels: string[],
  datasets: ChartDataset[],
  options?: ChartConfig['options']
): ChartConfig {
  return {
    type,
    title: generateDefaultTitle(type),
    labels,
    datasets,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      ...options,
    },
  };
}

/**
 * Generate default title based on chart type
 */
function generateDefaultTitle(type: ChartType): string {
  const titles: Record<ChartType, string> = {
    line: 'Line Chart',
    bar: 'Bar Chart',
    pie: 'Pie Chart',
    doughnut: 'Doughnut Chart',
    radar: 'Radar Chart',
    polar: 'Polar Chart',
    scatter: 'Scatter Chart',
    area: 'Area Chart',
  };
  return titles[type] || 'Chart';
}

/**
 * Create spiritual chart data for visualization
 */
export function createSpiritualChart(
  spiritualType: SpiritualChartType,
  data: ChartDataPoint[],
  options?: Partial<SpiritualChartConfig>
): SpiritualChartConfig {
  const type = determineChartType(spiritualType, data.length);
  const colors = getSpiritualColors(spiritualType);

  return {
    type,
    title: options?.title || generateSpiritualTitle(spiritualType),
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: options?.title || generateSpiritualTitle(spiritualType),
        data: data.map((d) => d.value),
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2,
        fill: type === 'area' || type === 'line',
        tension: 0.4,
      },
    ],
    spiritualType,
    period: options?.period,
    interpretation: options?.interpretation,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: type !== 'pie' && type !== 'doughnut' && type !== 'polar' ? {
        y: {
          beginAtZero: true,
        },
      } : undefined,
    },
  };
}

/**
 * Determine appropriate chart type for spiritual data
 */
function determineChartType(
  spiritualType: SpiritualChartType,
  dataLength: number
): ChartType {
  switch (spiritualType) {
    case 'chakra':
      return 'radar';
    case 'odud':
    case 'tarot':
      return 'bar';
    case 'numerology':
      return 'doughnut';
    case 'astrology':
      return 'pie';
    case 'journey':
    case 'progress':
      return dataLength > 7 ? 'line' : 'bar';
    default:
      return 'bar';
  }
}

/**
 * Get colors for spiritual chart types
 */
function getSpiritualColors(type: SpiritualChartType): {
  background: string | string[];
  border: string | string[];
} {
  const palettes: Record<SpiritualChartType, { background: string[]; border: string[] }> = {
    chakra: {
      background: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8000FF'],
      border: ['#CC0000', '#CC6600', '#CCCC00', '#00CC00', '#00CCCC', '#0000CC', '#6600CC'],
    },
    odud: {
      background: ['#8B4513', '#CD853F', '#DEB887', '#F4A460', '#D2691E', '#A0522D'],
      border: ['#5D3A1A', '#9B6914', '#B8965E', '#C48530', '#8B4726', '#6B3A20'],
    },
    tarot: {
      background: ['#1E3A5F', '#2E5077', '#3F688F', '#5081A7', '#619ABF', '#72B3D7'],
      border: ['#152C4A', '#234160', '#2F5A78', '#3D7390', '#4B8CA8', '#59A5C0'],
    },
    numerology: {
      background: ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#DC143C', '#B22222'],
      border: ['#CCAA00', '#CC8400', '#CC4F39', '#CC3700', '#B01030', '#8B1A1A'],
    },
    astrology: {
      background: ['#4169E1', '#9370DB', '#8A2BE2', '#9400D3', '#FF1493', '#FF69B4'],
      border: ['#3354B0', '#7659C0', '#7024A0', '#7700AA', '#CC1166', '#CC5590'],
    },
    journey: {
      background: ['#20B2AA', '#48D1CC', '#70DBDB', '#98E5E5', '#C0EFEF', '#E0FFFF'],
      border: ['#199090', '#3AA8A8', '#58B0B0', '#78C8C8', '#98E0E0', '#B8F0F0'],
    },
    progress: {
      background: ['#32CD32', '#3CB371', '#66CDAA', '#8FBC8F', '#C1E1C1', '#E0F0E0'],
      border: ['#28A428', '#30A060', '#52AA8A', '#729670', '#9CB090', '#A0C0A0'],
    },
  };

  const palette = palettes[type] || palettes.progress;
  return {
    background: palette.background,
    border: palette.border,
  };
}

/**
 * Generate title for spiritual chart
 */
function generateSpiritualTitle(type: SpiritualChartType): string {
  const titles: Record<SpiritualChartType, string> = {
    chakra: 'Chakra Balance',
    odud: 'Odú Divination',
    tarot: 'Tarot Spread',
    numerology: 'Numerology Numbers',
    astrology: 'Planetary Aspects',
    journey: 'Spiritual Journey',
    progress: 'Practice Progress',
  };
  return titles[type] || 'Spiritual Data';
}

/**
 * Create chakra chart data
 */
export function createChakraChart(data: ChakraChartData[]): SpiritualChartConfig {
  return createSpiritualChart(
    'chakra',
    data.map((d) => ({
      label: d.chakra,
      value: d.balance,
      color: d.color,
    })),
    { title: 'Chakra Balance Analysis' }
  );
}

/**
 * Create odú chart data
 */
export function createOdudChart(data: OdudChartData[]): SpiritualChartConfig {
  return createSpiritualChart(
    'odud',
    data.map((d) => ({
      label: d.name,
      value: d.frequency,
      category: d.element,
      metadata: { orixa: d.orixa, meaning: d.meaning },
    })),
    { title: 'Odú Distribution' }
  );
}

/**
 * Create tarot spread chart
 */
export function createTarotChart(data: TarotChartData[]): SpiritualChartConfig {
  return createSpiritualChart(
    'tarot',
    data.map((d) => ({
      label: `Position ${d.position}`,
      value: d.orientation === 'upright' ? 1 : 0.5,
      category: d.element,
      metadata: { card: d.card, meaning: d.meaning },
    })),
    { title: 'Tarot Spread Analysis' }
  );
}

/**
 * Create numerology chart
 */
export function createNumerologyChart(data: NumerologyChartData[]): SpiritualChartConfig {
  return createSpiritualChart(
    'numerology',
    data.map((d) => ({
      label: d.name,
      value: d.value,
      metadata: { description: d.description },
    })),
    { title: 'Numerology Chart' }
  );
}

/**
 * Create progress chart
 */
export function createProgressChart(data: ProgressChartData[]): SpiritualChartConfig {
  return createSpiritualChart(
    'progress',
    data.map((d) => ({
      label: d.date,
      value: d.value,
      metadata: { target: d.target, milestone: d.milestone },
    })),
    { title: 'Spiritual Progress' }
  );
}

/**
 * Export chart data for external visualization libraries
 */
export function exportChartData(config: ChartConfig | SpiritualChartConfig): {
  type: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }>;
  };
  metadata?: Record<string, unknown>;
} {
  return {
    type: config.type,
    data: {
      labels: config.labels,
      datasets: config.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
      })),
    },
    metadata: 'spiritualType' in config ? {
      spiritualType: config.spiritualType,
      period: config.period,
      interpretation: config.interpretation,
    } : undefined,
  };
}

export default { getChartData };