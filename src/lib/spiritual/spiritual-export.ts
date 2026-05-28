// Spiritual export
// Multiple formats

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf' | 'txt';
  label: string;
}

export const SUPPORTED_FORMATS: ExportFormat[] = [
  { type: 'json', label: 'JSON' },
  { type: 'csv', label: 'CSV' },
  { type: 'pdf', label: 'PDF' },
  { type: 'txt', label: 'Texto' },
];

export interface ExportOptions {
  format: ExportFormat['type'];
  includeMetadata?: boolean;
  dateRange?: { from: Date; to: Date };
}

export async function exportData(
  data: unknown,
  options: ExportOptions
): Promise<{ content: string; filename: string; mimeType: string }> {
  const { format, includeMetadata = true } = options;
  const timestamp = new Date().toISOString().split('T')[0];

  switch (format) {
    case 'json':
      return {
        content: JSON.stringify(includeMetadata ? { data, exportedAt: timestamp } : data, null, 2),
        filename: `spiritual-export-${timestamp}.json`,
        mimeType: 'application/json',
      };
    case 'csv':
      return {
        content: serializeToCsv(data),
        filename: `spiritual-export-${timestamp}.csv`,
        mimeType: 'text/csv',
      };
    case 'pdf':
      return {
        content: JSON.stringify(data),
        filename: `spiritual-export-${timestamp}.pdf`,
        mimeType: 'application/pdf',
      };
    case 'txt':
      return {
        content: serializeToText(data),
        filename: `spiritual-export-${timestamp}.txt`,
        mimeType: 'text/plain',
      };
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function serializeToCsv(data: unknown): string {
  if (!data) return '';
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const keys = Object.keys(data[0] as object);
    const header = keys.join(',');
    const rows = data.map((item) =>
      keys.map((k) => {
        const val = (item as Record<string, unknown>)[k];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }
  return Object.entries(data as object)
    .map(([k, v]) => `${k},${typeof v === 'string' && v.includes(',') ? `"${v}"` : v}`)
    .join('\n');
}

function serializeToText(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}
