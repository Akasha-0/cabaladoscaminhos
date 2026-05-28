export interface AffirmationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const categories: AffirmationCategory[] = [
  {
    id: 'amor-propio',
    name: 'Amor Propio',
    description: 'Fortalecer la autoestima y el aprecio por uno mismo',
    icon: 'heart',
    color: '#e91e63',
  },
  {
    id: 'coraje',
    name: 'Coraje',
    description: 'Superar el miedo y actuar con valentía',
    icon: 'shield',
    color: '#f44336',
  },
  {
    id: 'calma',
    name: 'Calma',
    description: 'Encontrar paz interior y serenidad',
    icon: 'feather',
    color: '#9c27b0',
  },
  {
    id: 'gratitud',
    name: 'Gratitud',
    description: 'Agradecer la vida y sus bendiciones',
    icon: 'sun',
    color: '#ff9800',
  },
  {
    id: 'proposito',
    name: 'Propósito',
    description: 'Descubrir y vivir con intención',
    icon: 'compass',
    color: '#4caf50',
  },
  {
    id: 'abundancia',
    name: 'Abundancia',
    description: 'Abrirse a la prosperidad y la riqueza',
    icon: 'sparkles',
    color: '#00bcd4',
  },
];

export function getCategories(): AffirmationCategory[] {
  return [...categories];
}