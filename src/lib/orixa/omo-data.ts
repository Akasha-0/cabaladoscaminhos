export interface OmoData {
  name: string;
  description: string;
  qualities: string[];
  element: string;
}

export function getData(): OmoData[] {
  return [
    {
      name: 'Omo Ayo',
      description: 'The one who brings prosperity and abundance',
      qualities: ['generosity', 'growth', 'fertility'],
      element: 'earth',
    },
    {
      name: 'Omo Eshu',
      description: 'The trickster who bridges worlds',
      qualities: ['transformation', 'adaptation', 'liminality'],
      element: 'air',
    },
    {
      name: 'Omo Yemoja',
      description: 'The keeper of secrets and emotions',
      qualities: ['intuition', 'nurturing', 'depth'],
      element: 'water',
    },
    {
      name: 'Omo Obatala',
      description: 'The wise one who shapes consciousness',
      qualities: ['wisdom', 'purity', 'creation'],
      element: 'light',
    },
    {
      name: 'Omo Sango',
      description: 'The force of transformation and power',
      qualities: ['strength', 'passion', 'justice'],
      element: 'fire',
    },
  ];
}