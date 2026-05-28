export interface SourceData {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
}

export function getData(): SourceData[] {
  return [
    {
      id: 'source-001',
      name: 'Primary Source',
      type: 'primary',
      description: 'Primary data source for the application',
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'source-002',
      name: 'Secondary Source',
      type: 'secondary',
      description: 'Secondary data source for backup',
      createdAt: new Date('2026-02-15'),
    },
    {
      id: 'source-003',
      name: 'Tertiary Source',
      type: 'tertiary',
      description: 'Tertiary data source for analytics',
      createdAt: new Date('2026-03-01'),
    },
  ];
}