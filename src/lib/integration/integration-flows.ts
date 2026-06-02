// Integration flows

export interface IntegrationFlow {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export function getFlows(): IntegrationFlow[] {
  return [
    {
      id: 'transformation-flow',
      name: 'Transformation Flow',
      description: 'Flow for transformation operations',
      category: 'transformation',
      enabled: true,
    },
    {
      id: 'evolution-flow',
      name: 'Evolution Flow',
      description: 'Flow for evolution operations',
      category: 'evolution',
      enabled: true,
    },
    {
      id: 'wisdom-flow',
      name: 'Wisdom Flow',
      description: 'Flow for wisdom operations',
      category: 'wisdom',
      enabled: true,
    },
    {
      id: 'integration-flow',
      name: 'Integration Flow',
      description: 'Flow for integration operations',
      category: 'integration',
      enabled: true,
    },
    {
      id: 'daily-flow',
      name: 'Daily Flow',
      description: 'Flow for daily operations',
      category: 'daily',
      enabled: true,
    },
    {
      id: 'tracking-flow',
      name: 'Tracking Flow',
      description: 'Flow for tracking operations',
      category: 'tracking',
      enabled: true,
    },
  ];
}