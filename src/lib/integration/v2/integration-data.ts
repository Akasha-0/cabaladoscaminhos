// fallow-ignore-file unused-file
// Integration data for v2 APIs

export interface IntegrationData {
  id: string;
  name: string;
  version: string;
  endpoints: string[];
  config: Record<string, unknown>;
}

export const INTEGRATIONS: IntegrationData[] = [
  {
    id: 'shadow',
    name: 'Shadow Work Integration',
    version: '2.0.0',
    endpoints: ['/api/v2/shadow/read', '/api/v2/shadow/write'],
    config: { enabled: true },
  },
  {
    id: 'embody',
    name: 'Embody Integration',
    version: '2.0.0',
    endpoints: ['/api/v2/embody/read', '/api/v2/embody/write'],
    config: { enabled: true },
  },
  {
    id: 'light',
    name: 'Light Integration',
    version: '2.0.0',
    endpoints: ['/api/v2/light/read', '/api/v2/light/write'],
    config: { enabled: true },
  },
];

export function getData(): IntegrationData[] {
  return INTEGRATIONS;
}
