/**
 * Mystical Export Module
 * Handles export of mystical content in multiple formats
 */

/**
 * Supported export formats for mystical data
 */
export type MysticalExportFormat = 'json' | 'csv' | 'pdf' | 'txt' | 'md';

/**
 * Options for mystical export
 */
export interface MysticalExportOptions {
  format: MysticalExportFormat;
  includeMetadata?: boolean;
  prettyPrint?: boolean;
}

/**
 * Result of a mystical export operation
 */
export interface MysticalExportResult {
  content: string;
  filename: string;
  mimeType: string;
  format: MysticalExportFormat;
}

/**
 * Export mystical data in the specified format
 */
export async function exportMystical(
  data: unknown,
  options: MysticalExportOptions
): Promise<MysticalExportResult> {
  const { format, includeMetadata = true, prettyPrint = true } = options;
  const timestamp = new Date().toISOString().split('T')[0];

  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case 'json':
      content = serializeToJson(data, includeMetadata, prettyPrint);
      filename = `mystical-export-${timestamp}.json`;
      mimeType = 'application/json';
      break;
    case 'csv':
      content = serializeToCsv(data);
      filename = `mystical-export-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;
    case 'pdf':
      content = serializeToPdf(data);
      filename = `mystical-export-${timestamp}.pdf`;
      mimeType = 'application/pdf';
      break;
    case 'txt':
      content = exportText(data, { prettyPrint });
      filename = `mystical-export-${timestamp}.txt`;
      mimeType = 'text/plain';
      break;
    case 'md':
      content = exportText(data, { prettyPrint, markdown: true });
      filename = `mystical-export-${timestamp}.md`;
      mimeType = 'text/markdown';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  return { content, filename, mimeType, format };
}

/**
 * Export mystical data as text format
 */
export function exportText(
  data: unknown,
  options?: { prettyPrint?: boolean; markdown?: boolean }
): string {
  const { prettyPrint = true, markdown = false } = options ?? {};

  if (!data) return '';

  if (typeof data === 'string') return data;

  if (prettyPrint && typeof data === 'object') {
    if (markdown) {
      return formatAsMarkdown(data);
    }
    return JSON.stringify(data, null, 2);
  }

  if (Array.isArray(data)) {
    return data
      .map((item) => (typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)))
      .join(markdown ? '\n---\n' : '\n\n');
  }

  return JSON.stringify(data);
}

/**
 * Serialize data to JSON format
 */
function serializeToJson(
  data: unknown,
  includeMetadata: boolean,
  prettyPrint: boolean
): string {
  if (includeMetadata) {
    const payload = {
      data,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      type: 'mystical',
    };
    return prettyPrint ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
  }
  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Serialize data to CSV format
 */
function serializeToCsv(data: unknown): string {
  if (!data) return '';

  if (Array.isArray(data)) {
    if (data.length === 0) return '';

    const keys = Object.keys(data[0] as object);
    const header = keys.join(',');

    const rows = data.map((item) =>
      keys
        .map((k) => {
          const val = (item as Record<string, unknown>)[k];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val ?? '');
        })
        .join(',')
    );

    return [header, ...rows].join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([k, v]) => {
        const val = String(v ?? '');
        if (val.includes(',') || val.includes('"')) {
          return `${k},"${val.replace(/"/g, '""')}"`;
        }
        return `${k},${val}`;
      })
      .join('\n');
  }

  return String(data);
}

/**
 * Serialize data for PDF format
 */
function serializeToPdf(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, depth = 0): string {
  if (data === null || data === undefined) return '';

  if (Array.isArray(data)) {
    return data
      .map((item) => (typeof item === 'object' ? formatAsMarkdown(item, depth) : `- ${item}`))
      .join('\n');
  }

  if (typeof data === 'object') {
    const indent = '  '.repeat(depth);
    return Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${indent}## ${key}\n${formatAsMarkdown(value, depth + 1)}`;
        }
        return `${indent}- **${key}**: ${value}`;
      })
      .join('\n');
  }

  return String(data);
}

/**
 * Convenience object for mystical export operations
 */
export const mysticalExport = {
  export: exportMystical,
  exportText,
  formats: ['json', 'csv', 'pdf', 'txt', 'md'] as const,
};