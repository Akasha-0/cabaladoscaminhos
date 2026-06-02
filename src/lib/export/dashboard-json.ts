// fallow-ignore-file unused-file
/**
 * Dashboard JSON export utilities
 */

export interface DashboardExportData {
  profile: Record<string, unknown>;
  mapaNatal?: Record<string, unknown>;
  numerologia?: Record<string, unknown>;
  ciclos?: Record<string, unknown>;
  rituales?: Record<string, unknown>;
  odu?: Record<string, unknown>;
  exportDate: string;
  version: string;
}

export interface ExportOptions {
  includeProfile?: boolean;
  includeMapaNatal?: boolean;
  includeNumerologia?: boolean;
  includeCiclos?: boolean;
  includeRituales?: boolean;
  includeOdu?: boolean;
  filename?: string;
}

// fallow-ignore-next-line complexity
export function exportDashboardJSON(
  data: DashboardExportData,
  options: ExportOptions = {}
): void {
  const exportData: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  if (options.includeProfile !== false && data.profile) {
    exportData.profile = data.profile;
  }

  if (options.includeMapaNatal && data.mapaNatal) {
    exportData.mapaNatal = data.mapaNatal;
  }

  if (options.includeNumerologia && data.numerologia) {
    exportData.numerologia = data.numerologia;
  }

  if (options.includeCiclos && data.ciclos) {
    exportData.ciclos = data.ciclos;
  }

  if (options.includeRituales && data.rituales) {
    exportData.rituales = data.rituales;
  }

  if (options.includeOdu && data.odu) {
    exportData.odu = data.odu;
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename ?? `dashboard-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}