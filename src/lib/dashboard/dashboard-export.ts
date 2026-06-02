/**
 * Dashboard Export Module
 * Supports exporting dashboard data in multiple formats
 */

export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardExportData {
  generatedAt: Date;
  format: ExportFormat;
  metadata: {
    source: string;
    version: string;
  };
  content: unknown;
}

/**
 * Export dashboard data in the specified format
 */
export async function exportDashboard(
  data: unknown,
  options: ExportOptions
): Promise<DashboardExportData> {
  const { format, includeMetadata = true, dateRange } = options;

  const content = transformData(data, format);

  return {
    generatedAt: new Date(),
    format,
    metadata: includeMetadata
      ? {
          source: 'dashboard',
          version: '1.0.0',
          ...(dateRange && {
            dateRange: {
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString(),
            },
          }),
        }
      : { source: 'dashboard', version: '1.0.0' },
    content,
  };
}

function transformData(data: unknown, format: ExportFormat): unknown {
  switch (format) {
    case 'json':
      return data;
    case 'csv':
      return convertToCSV(data);
    case 'xlsx':
      return convertToXLSXFormat(data);
    case 'pdf':
      return convertToPDFFormat(data);
    default:
      return data;
  }
}

function convertToCSV(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0] as object);
    const rows = data.map((row) =>
      headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
  return JSON.stringify(data);
}

function convertToXLSXFormat(data: unknown): unknown {
  return { type: 'xlsx', data };
}

function convertToPDFFormat(data: unknown): unknown {
  return { type: 'pdf', data };
}