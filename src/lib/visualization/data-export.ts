/**
 * Data Export Utilities
 *
 * Provides data export functionality across multiple formats.
 */

export type ExportFormat = 'json' | 'csv' | 'xml' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  pretty?: boolean;
  includeMetadata?: boolean;
}

/**
 * Export data in the specified format
 */
export function exportData(
  data: unknown,
  options: ExportOptions
): string {
  const { format, pretty = true, includeMetadata = true } = options;

  const metadata = includeMetadata
    ? { exportedAt: new Date().toISOString(), format, version: '1.0' }
    : null;

  switch (format) {
    case 'json':
      return exportJson(data, metadata, pretty);
    case 'csv':
      return exportCsv(data, metadata);
    case 'xml':
      return exportXml(data, metadata, pretty);
    case 'txt':
      return exportTxt(data, metadata);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportJson(data: unknown, metadata: Record<string, unknown> | null, pretty: boolean): string {
  const output = metadata ? { metadata, data } : data;
  return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output);
}

function exportCsv(data: unknown, metadata: Record<string, unknown> | null): string {
  const rows: string[] = [];

  if (metadata) {
    rows.push(`# Exported: ${metadata.exportedAt}`);
    rows.push(`# Format: ${metadata.format}`);
  }

  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0] as Record<string, unknown>);
    rows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return String(val);
      });
      rows.push(values.join(','));
    }
  }

  return rows.join('\n');
}

function exportXml(data: unknown, metadata: Record<string, unknown> | null, pretty: boolean): string {
  const indent = pretty ? '  ' : '';
  const nl = pretty ? '\n' : '';

  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];

  if (metadata) {
    parts.push(`<metadata>`);
    parts.push(`${indent}<exportedAt>${metadata.exportedAt}</exportedAt>`);
    parts.push(`${indent}<format>${metadata.format}</format>`);
    parts.push(`</metadata>`);
  }

  parts.push(`<data>${nl}${indent}${toXmlElement(data, indent)}${nl}</data>`);

  return parts.join(nl);
}

function toXmlElement(value: unknown, indent: string): string {
  if (value === null) return `<null/>`;
  if (value === undefined) return `<undefined/>`;

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return `<array/>`;
      const items = value
        .map((item) => `${indent}${indent}<item>${toXmlElement(item, indent)}</item>`)
        .join('\n');
      return `<array>\n${items}\n${indent}${indent}</array>`;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `<object/>`;
    const props = entries
      .map(([k, v]) => `${indent}${indent}<${k}>${toXmlElement(v, indent)}</${k}>`)
      .join('\n');
    return `<object>\n${props}\n${indent}${indent}</object>`;
  }

  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function exportTxt(data: unknown, metadata: Record<string, unknown> | null): string {
  const lines: string[] = [];

  if (metadata) {
    lines.push(`Exported: ${metadata.exportedAt}`);
    lines.push(`Format: ${metadata.format}`);
    lines.push('');
  }

  lines.push(flattenToText(data));

  return lines.join('\n');
}

function flattenToText(value: unknown, prefix = ''): string {
  if (value === null || value === undefined) return prefix || '(empty)';
  if (typeof value !== 'object') return prefix ? `${prefix}: ${value}` : String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return prefix || '(empty array)';
    return value.map((item, i) => flattenToText(item, `${prefix}[${i}]`)).join('\n');
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return prefix || '(empty object)';

  return entries.map(([k, v]) => flattenToText(v, prefix ? `${prefix}.${k}` : k)).join('\n');
}