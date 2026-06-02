// fallow-ignore-file unused-file
/**
 * Export formats and data export utilities
 * Supports multiple output formats: JSON, CSV, TXT, XML
 */

export type ExportFormatType = 'json' | 'csv' | 'txt' | 'xml';

export interface ExportFormat {
  type: ExportFormatType;
  label: string;
  mimeType: string;
  extension: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { type: 'json', label: 'JSON', mimeType: 'application/json', extension: '.json' },
  { type: 'csv', label: 'CSV', mimeType: 'text/csv', extension: '.csv' },
  { type: 'txt', label: 'Texto', mimeType: 'text/plain', extension: '.txt' },
  { type: 'xml', label: 'XML', mimeType: 'application/xml', extension: '.xml' },
];

export interface ExportOptions {
  format: ExportFormatType;
  includeMetadata?: boolean;
  prettyPrint?: boolean;
  filename?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  format: ExportFormatType;
}

/**
 * Format data for export in the specified format
 */
export function exportData(
  data: unknown,
  options: ExportOptions
): ExportResult {
  const { format, includeMetadata = true, prettyPrint = true, filename } = options;
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = filename ?? `export-${timestamp}`;

  switch (format) {
    case 'json':
      return exportAsJson(data, { baseFilename, includeMetadata, prettyPrint });
    case 'csv':
      return exportAsCsv(data, { baseFilename, includeMetadata });
    case 'txt':
      return exportAsTxt(data, { baseFilename, includeMetadata });
    case 'xml':
      return exportAsXml(data, { baseFilename, includeMetadata, prettyPrint });
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

interface FormatOptions {
  baseFilename: string;
  includeMetadata?: boolean;
  prettyPrint?: boolean;
}

function exportAsJson(data: unknown, opts: FormatOptions): ExportResult {
  const indent = opts.prettyPrint ? 2 : 0;
  const content = opts.includeMetadata
    ? JSON.stringify({ data, exportedAt: new Date().toISOString() }, null, indent)
    : JSON.stringify(data, null, indent);
  return {
    content,
    filename: `${opts.baseFilename}.json`,
    mimeType: 'application/json',
    format: 'json',
  };
}

function exportAsCsv(data: unknown, opts: FormatOptions): ExportResult {
  const content = serializeToCsv(data, opts.includeMetadata);
  return {
    content,
    filename: `${opts.baseFilename}.csv`,
    mimeType: 'text/csv',
    format: 'csv',
  };
}

function exportAsTxt(data: unknown, opts: FormatOptions): ExportResult {
  const content = serializeToText(data, opts.includeMetadata);
  return {
    content,
    filename: `${opts.baseFilename}.txt`,
    mimeType: 'text/plain',
    format: 'txt',
  };
}

function exportAsXml(data: unknown, opts: FormatOptions): ExportResult {
  const indent = opts.prettyPrint ? 2 : 0;
  const content = serializeToXml(data, opts.includeMetadata, indent);
  return {
    content,
    filename: `${opts.baseFilename}.xml`,
    mimeType: 'application/xml',
    format: 'xml',
  };
}

// fallow-ignore-next-line complexity
function serializeToCsv(data: unknown, includeMetadata?: boolean): string {
  if (!data && data !== 0) return '';
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    
    const obj = data[0] as Record<string, unknown>;
    const keys = Object.keys(obj);
    const header = keys.join(',');
    
    const rows = data.map((item) => {
      return keys.map((k) => {
        const val = (item as Record<string, unknown>)[k];
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  }
  
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (includeMetadata) {
      return entries
        .map(([k, v]) => `${k},${formatValueForCsv(v)}`)
        .join('\n');
    }
    return entries.map(([k, v]) => `${k},${formatValueForCsv(v)}`).join('\n');
  }
  
  return formatValueForCsv(data);
}

function formatValueForCsv(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function serializeToText(data: unknown, includeMetadata?: boolean): string {
  if (!data && data !== 0) return '';
  
  if (typeof data === 'object') {
    const lines: string[] = [];
    
    if (includeMetadata) {
      lines.push(`Exported: ${new Date().toISOString()}`);
      lines.push('---');
      lines.push('');
    }
    
    if (Array.isArray(data)) {
      data.forEach((item, i) => {
        lines.push(`[${i + 1}] ${formatObjectLine(item)}`);
      });
    } else {
      Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
        lines.push(`${k}: ${formatObjectLine(v)}`);
      });
    }
    
    return lines.join('\n');
  }
  
  return String(data);
}

function formatObjectLine(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function serializeToXml(data: unknown, includeMetadata?: boolean, indent = 2): string {
  const pad = (level: number) => ' '.repeat(level * indent);
// fallow-ignore-next-line complexity
  
  function toXml(value: unknown, tagName: string, level: number): string {
    if (value === null || value === undefined) {
      return `${pad(level)}<${tagName}/>`;
    }
    
    if (typeof value === 'boolean' || typeof value === 'number') {
      return `${pad(level)}<${tagName}>${value}</${tagName}>`;
    }
    
    if (typeof value === 'string') {
      const escaped = value
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"');
      return `${pad(level)}<${tagName}>${escaped}</${tagName}>`;
    }
    
    if (Array.isArray(value)) {
      const itemTag = 'item';
      const items = value.map((item) => {
        return toXml(item, itemTag, level + 1);
      }).join('\n');
      return `${pad(level)}<${tagName}>\n${items}\n${pad(level)}</${tagName}>`;
    }
    
    if (typeof value === 'object') {
      const children = Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => {
          const safeTag = k.replace(/[^a-zA-Z0-9_-]/g, '_');
          return toXml(v, safeTag, level + 1);
        })
        .join('\n');
      return `${pad(level)}<${tagName}>\n${children}\n${pad(level)}</${tagName}>`;
    }
    
    return `${pad(level)}<${tagName}/>`;
  }
  
  const rootContent = toXml(data, 'root', 0);
  
  const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
  
  if (includeMetadata) {
    const metadata = `${pad(0)}<metadata>\n${pad(1)}<exportedAt>${new Date().toISOString()}</exportedAt>\n${pad(0)}</metadata>`;
    return `${xmlDeclaration}\n<export>\n${metadata}\n${rootContent}\n</export>`;
  }
  
  return `${xmlDeclaration}\n${rootContent}`;
}

/**
 * Get format by type
 */
export function getFormat(type: ExportFormatType): ExportFormat | undefined {
  return EXPORT_FORMATS.find(f => f.type === type);
}

/**
 * Validate if format is supported
 */
export function isFormatSupported(type: string): type is ExportFormatType {
  return EXPORT_FORMATS.some(f => f.type === type);
}
