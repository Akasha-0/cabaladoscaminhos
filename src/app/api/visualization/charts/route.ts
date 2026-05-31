import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ChartTypeSchema = z.enum(['line', 'bar', 'pie', 'doughnut', 'radar', 'scatter', 'area', 'candlestick']);
const ChartQuerySchema = z.object({
  type: ChartTypeSchema.optional(),
  data: z.string().optional(),
  labels: z.string().optional(),
  title: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
}
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}
interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  options?: Record<string, unknown>;
}
const chartTypes = ['line', 'bar', 'pie', 'doughnut', 'radar', 'scatter', 'area', 'candlestick'] as const;
type ChartType = z.infer<typeof ChartTypeSchema>;
function generateChartData(
  type: ChartType,
  dataPoints: ChartDataPoint[]
): ChartConfig {
  const labels = dataPoints.map(d => d.label);
  const values = dataPoints.map(d => d.value);

  const baseColors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#eab308', '#84cc16', '#22c55e', '#10b981',
  ];

  const datasetConfig: Record<ChartType, Partial<ChartDataset>> = {
    line: { borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
    bar: { backgroundColor: baseColors.slice(0, values.length) },
    pie: { backgroundColor: baseColors },
    doughnut: { backgroundColor: baseColors },
    radar: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366f1' },
    scatter: { backgroundColor: '#6366f1' },
    area: { borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.3)' },
    candlestick: { backgroundColor: '#22c55e' },
  };

  return {
    type: type === 'area' ? 'line' : type === 'candlestick' ? 'bar' : type,
    title: `Chart (${type})`,
    labels,
    datasets: [{
      label: 'Dataset',
      data: values,
      ...datasetConfig[type],
    }],
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
    },
  };
}

function calculateStatistics(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return { mean, min, max, median, stdDev };
}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ChartQuerySchema.safeParse({
      type: searchParams.get('type'),
      data: searchParams.get('data'),
      labels: searchParams.get('labels'),
      title: searchParams.get('title'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type = 'bar', data, labels: labelsParam, title: customTitle, limit } = parseResult.data;
    if (!chartTypes.includes(type)) {
      return NextResponse.json({
        error: 'Tipo de gráfico inválido',
        validTypes: chartTypes,
      }, { status: 400 });
    let dataPoints: ChartDataPoint[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          dataPoints = parsed;
        } else if (typeof parsed === 'object') {
          dataPoints = Object.entries(parsed).map(([label, value]) => ({
            label,
            value: Number(value),
          }));
        }
      } catch {
        return NextResponse.json({
          error: 'Formato de dados inválido',
        }, { status: 400 });
      }
    } else if (labelsParam) {
      const labels = labelsParam.split(',').map(l => l.trim());
      const values = labels.map(() => Math.floor(Math.random() * 100) + 1);
      dataPoints = labels.map((label, i) => ({ label, value: values[i] }));
    }

    if (dataPoints.length === 0) {
      const defaultLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      dataPoints = defaultLabels.map(label => ({
        label,
        value: Math.floor(Math.random() * 100) + 1,
      }));
    }

    const chartConfig = generateChartData(type, dataPoints);
    if (customTitle) {
      chartConfig.title = customTitle;
    }

    const values = dataPoints.map(d => d.value);
    const statistics = calculateStatistics(values);

    return NextResponse.json({
      chart: chartConfig,
      statistics,
      metadata: {
        type,
        dataPoints: dataPoints.length,
        generated: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Erro gerando visualização:', error);
    return NextResponse.json({
      error: 'Erro ao gerar visualização',
    }, { status: 500 });
  }
}