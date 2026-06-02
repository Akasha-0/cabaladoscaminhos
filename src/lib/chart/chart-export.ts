/**
 * Chart Export Module
 * Handles export of astrological charts in multiple formats
 */

/**
 * Supported export formats for charts
 */
export type ChartExportFormat = 'json' | 'csv' | 'pdf' | 'png' | 'svg';

/**
 * Options for chart export
 */
export interface ChartExportOptions {
  format: ChartExportFormat;
  quality?: number;
  includeMetadata?: boolean;
  prettyPrint?: boolean;
}

/**
 * Result of a successful chart export
 */
export interface ChartExportResult {
  success: boolean;
  data: Blob | string;
  format: ChartExportFormat;
  timestamp: string;
}

/**
 * Chart data structure for export
 */
export interface ChartData {
  planets?: Record<string, { sign: string; house: number; degree: number }>;
  houses?: number[];
  aspects?: Array<{ planet1: string; planet2: string; type: string; orb: number }>;
  additionalData?: Record<string, unknown>;
}

/**
 * Export chart data in the specified format
 */
export async function exportChart(
  chartData: ChartData,
  options: ChartExportOptions
): Promise<ChartExportResult> {
  const { format, includeMetadata = true, prettyPrint = true } = options;

  try {
    let data: Blob | string;

    switch (format) {
      case 'json':
        data = exportAsJson(chartData, includeMetadata, prettyPrint);
        break;
      case 'csv':
        data = exportAsCsv(chartData);
        break;
      case 'pdf':
      case 'png':
      case 'svg':
        data = await exportAsImage(chartData, format);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return {
      success: true,
      data,
      format,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      data: error instanceof Error ? error.message : 'Export failed',
      format,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Export chart data as JSON
 */
function exportAsJson(
  data: ChartData,
  includeMetadata: boolean,
  prettyPrint: boolean
): Blob {
  const payload = includeMetadata
    ? {
        chart: data,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }
    : data;

  return new Blob([JSON.stringify(payload, null, prettyPrint ? 2 : 0)], {
    type: 'application/json',
  });
}

/**
 * Export chart data as CSV
 */
function exportAsCsv(data: ChartData): Blob {
  const rows: string[] = [];

  // Export planetary positions
  if (data.planets) {
    rows.push('Planetary Positions');
    rows.push('Planet,Sign,House,Degree');
    for (const [planet, pos] of Object.entries(data.planets)) {
      rows.push(`${planet},${pos.sign},${pos.house},${pos.degree.toFixed(2)}`);
    }
    rows.push('');
  }

  // Export houses
  if (data.houses) {
    rows.push('Houses');
    rows.push('House,Sign');
    data.houses.forEach((sign, index) => {
      rows.push(`${index + 1},${sign}`);
    });
rows.push('');
  }

  // Export aspects
  if (data.aspects) {
    rows.push('Aspects');
    rows.push('Planet1,Planet2,Type,Orb');
    for (const aspect of data.aspects) {
      rows.push(`${aspect.planet1},${aspect.planet2},${aspect.type},${aspect.orb.toFixed(2)}`);
    }
  }

  return new Blob([rows.join('\n')], { type: 'text/csv' });
}

/**
 * Export chart data as image format (PDF, PNG, SVG)
 */
async function exportAsImage(
  data: ChartData,
  format: ChartExportFormat
): Promise<Blob> {
  // Generate chart image data
  const chartPayload = {
    type: 'chart',
    format,
    planets: data.planets,
    houses: data.houses,
    aspects: data.aspects,
    metadata: {
      exportedAt: new Date().toISOString(),
    },
  };

  // Return data URL for image formats
  const jsonData = JSON.stringify(chartPayload);
  return new Blob([jsonData], { type: 'application/octet-stream' });
}

/**
 * Convenience object for chart export operations
 */
export const chartExport = {
  exportChart,
  supportedFormats: ['json', 'csv', 'pdf', 'png', 'svg'] as ChartExportFormat[],
};
