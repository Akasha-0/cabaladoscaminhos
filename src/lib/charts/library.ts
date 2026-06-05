// Chart library - skipped linting and formatting
import type { Aspecto, Casa } from '@akasha/core-astrology';

/**
 * Chart types
 */
export type ChartType =
  | 'natal'
  | 'transito'
  | 'progressao'
  | 'sinostry'
  | 'composito'
  | 'hora-igual';

export type ChartStyle = 'radix' | 'quadrate' | 'equal' | 'whole-sign';

/**
 * Chart interface
 */
export interface Chart {
  id: string;
  tipo: ChartType;
  nome: string;
  estilo: ChartStyle;
  data: string;
  hora?: string;
  latitude?: number;
  longitude?: number;
  fusoHorario?: string;
  planetas?: string[];
  casas?: Casa[];
  aspectos?: Aspecto[];
  personalizado?: boolean;
}

/**
 * Get all available charts
 */
function getCharts(): {
  charts: Chart[];
  total: number;
  getChartById(id: string): Chart | undefined;
} {
  const charts: Chart[] = [
    {
      id: 'natal',
      tipo: 'natal',
      nome: 'Mapa Natal',
      estilo: 'radix',
      data: '',
      personalizado: false,
    },
    {
      id: 'transito',
      tipo: 'transito',
      nome: 'Trânsito',
      estilo: 'quadrate',
      data: '',
      personalizado: false,
    },
    {
      id: 'progressao',
      tipo: 'progressao',
      nome: 'Progressão Secundária',
      estilo: 'equal',
      data: '',
      personalizado: false,
    },
    {
      id: 'sinostry',
      tipo: 'sinostry',
      nome: 'Sinastria',
      estilo: 'radix',
      data: '',
      personalizado: false,
    },
    {
      id: 'composito',
      tipo: 'composito',
      nome: 'Mapa Compósito',
      estilo: 'whole-sign',
      data: '',
      personalizado: false,
    },
    {
      id: 'hora-igual',
      tipo: 'hora-igual',
      nome: 'Hora Igual',
      estilo: 'equal',
      data: '',
      personalizado: false,
    },
  ];

  return {
    getChartById: (id: string) => charts.find((c) => c.id === id),
    charts,
    total: charts.length,
  };
}

/**
 * Get chart by ID
 */
export function getChartById(id: string): Chart | undefined {
  return getCharts().charts.find((c: Chart) => c.id === id);
}

/**
 * Get charts by type
 */
function getChartsByType(tipo: ChartType): Chart[] {
  return getCharts().charts.filter((c: Chart) => c.tipo === tipo);
}
