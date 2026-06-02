/**
 * Analytics export — export analytics data in multiple formats.
 */

/** Supported export formats */
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'xml' | 'txt';

/** Export options */
export interface ExportOptions {
  format?: ExportFormat;
  includeMetadata?: boolean;
  prettyPrint?: boolean;
}

/** Exported data wrapper */
export interface ExportedData {
  data: unknown;
  format: ExportFormat;
  filename: string;
  mimeType: string;
  generatedAt: number;
}

const FORMAT_MIME: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  pdf: 'application/pdf',
  xml: 'application/xml',
  txt: 'text/plain',
};

/**
 * Export analytics data in the specified format.
 *
 * @param data  - The analytics data to export
 * @param format - Output format (default: json)
 * @param opts  - Additional export options
 */
export function exportData(
  data: unknown,
  format: ExportFormat = 'json',
  opts: ExportOptions = {}
): ExportedData {
  const { includeMetadata = true, prettyPrint = true } = opts;
  const timestamp = Date.now();
  const safeName = sanitizeFilename(`analytics-${timestamp}`);

  switch (format) {
    case 'json':
      return exportJson(data, safeName, includeMetadata);
    case 'csv':
      return exportCsv(data, safeName, includeMetadata);
    case 'pdf':
      return exportPdf(data, safeName, timestamp);
    case 'xml':
      return exportXml(data, safeName, includeMetadata);
    case 'txt':
      return exportTxt(data, safeName);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '-');
}

function exportJson(
  data: unknown,
  filename: string,
  includeMetadata: boolean
): ExportedData {
  const payload = includeMetadata
    ? { metadata: { exportedAt: new Date().toISOString() }, data }
    : data;

  return {
    data: payload,
    format: 'json',
    filename: `${filename}.json`,
    mimeType: FORMAT_MIME.json,
    generatedAt: Date.now(),
  };
}

function exportCsv(data: unknown, filename: string, includeMetadata: boolean): ExportedData {
  const rows: string[][] = [];

  // Header row
  rows.push(['key', 'value']);

  // Flatten data into key-value rows
  flattenObject(data, '', rows);

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

  const payload = includeMetadata
    ? `metadata_exported_at,${new Date().toISOString()}\n${csv}`
    : csv;

  return {
    data: payload,
    format: 'csv',
    filename: `${filename}.csv`,
    mimeType: FORMAT_MIME.csv,
    generatedAt: Date.now(),
  };
}

function flattenObject(obj: unknown, prefix: string, rows: string[][]): void {
  if (obj === null || obj === undefined) {
    rows.push([prefix || '(root)', '']);
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenObject(item, `${prefix}[${i}]`, rows));
    return;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenObject(value, path, rows);
    }
    return;
  }

  rows.push([prefix, String(obj)]);
}

function exportPdf(data: unknown, filename: string, timestamp: number): ExportedData {
  // Placeholder — real PDF generation would require a library like pdfkit or puppeteer
  const content = `Analytics Export\nGenerated: ${new Date(timestamp).toISOString()}\n\n${JSON.stringify(data, null, 2)}`;

  return {
    data: content,
    format: 'pdf',
    filename: `${filename}.pdf`,
    mimeType: FORMAT_MIME.pdf,
    generatedAt: timestamp,
  };
}

function exportXml(data: unknown, filename: string, includeMetadata: boolean): ExportedData {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<analytics>';

  if (includeMetadata) {
    xml += `\n  <metadata exportedAt="${new Date().toISOString()}" />`;
  }

  xml += '\n  <data>';
  xml += objectToXml(data, 4);
  xml += '\n  </data>\n</analytics>';

  return {
    data: xml,
    format: 'xml',
    filename: `${filename}.xml`,
    mimeType: FORMAT_MIME.xml,
    generatedAt: Date.now(),
  };
}

function objectToXml(obj: unknown, indent: number): string {
  const pad = ' '.repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<null />`;

  if (typeof obj === 'boolean' || typeof obj === 'number') {
    return `${pad}<value>${obj}</value>`;
  }

  if (typeof obj === 'string') {
    return `${pad}<value>${escapeXml(obj)}</value>`;
  }

  if (Array.isArray(obj)) {
    let out = '';
    for (const item of obj) {
      out += `\n${pad}<item>${objectToXml(item, indent + 2).trim()}</item>`;
    }
    return out;
  }

  if (typeof obj === 'object') {
    let out = '';
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const tag = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      out += `\n${pad}<${tag}>${objectToXml(value, indent + 2).trim()}</${tag}>`;
    }
    return out;
  }

  return `${pad}<value>${String(obj)}</value>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function exportTxt(data: unknown, filename: string): ExportedData {
  const lines: string[] = [
    '=== Analytics Export ===',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  const rows: string[][] = [];
  flattenObject(data, '', rows);
  for (const [key, value] of rows) {
    lines.push(`${key}: ${value}`);
  }

  return {
    data: lines.join('\n'),
    format: 'txt',
    filename: `${filename}.txt`,
    mimeType: FORMAT_MIME.txt,
    generatedAt: Date.now(),
  };
}