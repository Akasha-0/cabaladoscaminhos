// ============================================================================
// charts-client — re-export dos charts para uso no diretório app/
// ============================================================================
// Os charts originais ficam em /lib/admin/charts.tsx. Como pages do Next.js
// (App Router) sob `(admin)` devem importar de forma estável, este módulo
// apenas re-exporta para reduzir acoplamento.
// ============================================================================

export { LineChart, BarChart, Heatmap } from '@/lib/admin/charts';
export type {
  SeriesPoint,
  Series,
  MultiSeriesPoint,
  LineChartProps,
  BarChartProps,
  HeatmapProps,
} from '@/lib/admin/charts';
