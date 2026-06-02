// fallow-ignore-file unused-file
/**
 * Profile export — export user profiles in multiple formats.
 */

export type ExportFormat = 'json' | 'csv' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeAnalytics?: boolean;
}

export interface ProfileExportData {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    createdAt: number;
    updatedAt: number;
  };
  metadata?: {
    exportedAt: number;
    format: ExportFormat;
    version: string;
  };
  analytics?: {
    views: number;
    shares: number;
    completions: number;
    engagementRate: number;
  };
}

/**
 * Export a profile to the specified format.
 */
export function exportProfile(
  profile: ProfileExportData['profile'],
  options: ExportOptions
): string {
  const { format, includeMetadata = true } = options;

  const data: ProfileExportData = {
    profile,
    ...(includeMetadata && {
      metadata: {
        exportedAt: Date.now(),
        format,
        version: '1.0.0',
      },
    }),
  };

  switch (format) {
    case 'json':
      return exportAsJson(data);

    case 'csv':
      return exportAsCsv(data);

    case 'txt':
      return exportAsTxt(data);

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportAsJson(data: ProfileExportData): string {
  return JSON.stringify(data, null, 2);
}

function exportAsCsv(data: ProfileExportData): string {
  const lines: string[] = [
    'field,value',
    `id,"${escapeCsv(data.profile.id)}"`,
    `name,"${escapeCsv(data.profile.name)}"`,
    `email,"${escapeCsv(data.profile.email)}"`,
    `avatar,"${escapeCsv(data.profile.avatar ?? '')}"`,
    `bio,"${escapeCsv(data.profile.bio ?? '')}"`,
    `createdAt,${data.profile.createdAt}`,
    `updatedAt,${data.profile.updatedAt}`,
  ];

  if (data.metadata) {
    lines.push(`exportedAt,${data.metadata.exportedAt}`);
    lines.push(`version,"${data.metadata.version}"`);
  }

  return lines.join('\n');
}

function exportAsTxt(data: ProfileExportData): string {
  const parts: string[] = [
    '=== Profile Export ===',
    `ID: ${data.profile.id}`,
    `Name: ${data.profile.name}`,
    `Email: ${data.profile.email}`,
    data.profile.avatar ? `Avatar: ${data.profile.avatar}` : '',
    data.profile.bio ? `Bio: ${data.profile.bio}` : '',
    `Created: ${new Date(data.profile.createdAt).toISOString()}`,
    `Updated: ${new Date(data.profile.updatedAt).toISOString()}`,
  ].filter(Boolean);

  if (data.metadata) {
    parts.push('');
    parts.push('--- Metadata ---');
    parts.push(`Exported: ${new Date(data.metadata.exportedAt).toISOString()}`);
    parts.push(`Version: ${data.metadata.version}`);
  }

  return parts.join('\n');
}

function escapeCsv(value: string): string {
  return value.replace(/"/g, '""');
}