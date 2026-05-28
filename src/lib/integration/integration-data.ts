// Integration data

export interface IntegrationData {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export function getData(): IntegrationData[] {
  return [
    {
      id: 'trans-api',
      name: 'Transformation API',
      description: 'API for transformation operations',
      category: 'api',
      enabled: true,
    },
    {
      id: 'trans-data',
      name: 'Transformation Data',
      description: 'Data layer for transformations',
      category: 'data',
      enabled: true,
    },
    {
      id: 'evol-api',
      name: 'Evolution API',
      description: 'API for evolution operations',
      category: 'api',
      enabled: true,
    },
    {
      id: 'evol-data',
      name: 'Evolution Data',
      description: 'Data layer for evolutions',
      category: 'data',
      enabled: true,
    },
    {
      id: 'wisdom-api',
      name: 'Wisdom API',
      description: 'API for wisdom operations',
      category: 'api',
      enabled: true,
    },
    {
      id: 'wisdom-data',
      name: 'Wisdom Data',
      description: 'Data layer for wisdom',
      category: 'data',
      enabled: true,
    },
    {
      id: 'integ-api',
      name: 'Integration API',
      description: 'API for integration operations',
      category: 'api',
      enabled: true,
    },
    {
      id: 'integ-flows',
      name: 'Integration Flows',
      description: 'Flow definitions for integrations',
      category: 'flow',
      enabled: true,
    },
  ];
}
