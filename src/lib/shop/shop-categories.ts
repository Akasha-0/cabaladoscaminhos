export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  productCount?: number;
}

const categories: Category[] = [
  {
    id: "cristais",
    name: "Cristais",
    description: "Pedras energéticas e cristais para cura e proteção",
    icon: "gem",
    productCount: 24,
  },
  {
    id: "velas",
    name: "Velas",
    description: "Velas ritualísticas e aromáticas para meditação",
    icon: "flame",
    productCount: 18,
  },
  {
    id: "incensos",
    name: "Incensos",
    description: "Incensos naturais e esotéricos para purificação",
    icon: "wind",
    productCount: 32,
  },
  {
    id: "ornamentos",
    name: "Ornamentos",
    description: "Itens decorativos sagrados para altares",
    icon: "sparkles",
    productCount: 15,
  },
  {
    id: "amuletos",
    name: "Amuletos",
    description: "Proteger e manifestar intenções",
    icon: "shield",
    productCount: 12,
  },
  {
    id: "essencias",
    name: "Essências",
    description: "Óleos e essências para aromaterapia",
    icon: "droplet",
    productCount: 20,
  },
];

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
