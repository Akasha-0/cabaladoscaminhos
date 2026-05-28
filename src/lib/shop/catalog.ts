export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

const categories: Category[] = [
  { id: "cristais", name: "Cristais", description: "Pedras energéticas e cristais" },
  { id: "velas", name: "Velas", description: "Velas ritualísticas e aromáticas" },
  { id: "incensos", name: "Incensos", description: "Incensos naturais e esotéricos" },
  { id: "ornamentos", name: "Ornamentos", description: "Itens decorativos sagrados" },
];

const products: Product[] = [
  // Cristais
  {
    id: "cr-001",
    name: "Cristal de Quartzo Transparente",
    description: "Amplifica energia e intenção. Medidas aproximadas: 5-8cm.",
    price: 89.90,
    category: "cristais",
    inStock: true,
  },
  {
    id: "cr-002",
    name: "Ametista Pequena",
    description: "Protção espiritual e serenidade. Medidas aproximadas: 3-5cm.",
    price: 129.90,
    category: "cristais",
    inStock: true,
  },
  {
    id: "cr-003",
    name: "Turmalina Negra",
    description: "Escudo protetor contra energias negativas.",
    price: 99.90,
    category: "cristais",
    inStock: true,
  },
  {
    id: "cr-004",
    name: "Citrino Natural",
    description: "Prosperidade, abundância e criatividade.",
    price: 119.90,
    category: "cristais",
    inStock: false,
  },
  {
    id: "cr-005",
    name: "Cornalina",
    description: "Energia vital, coragem e motivação.",
    price: 79.90,
    category: "cristais",
    inStock: true,
  },
  // Velas
  {
    id: "vl-001",
    name: "Vela de Cera de Abelha",
    description: "7 dias de queima. Alinhamento natural.",
    price: 45.90,
    category: "velas",
    inStock: true,
  },
  {
    id: "vl-002",
    name: "Vela Ritualística Preta",
    description: "Para propósitos de proteção e banimento.",
    price: 29.90,
    category: "velas",
    inStock: true,
  },
  {
    id: "vl-003",
    name: "Vela Aromática Lavanda",
    description: "Relaxamento e harmonia. Fragrância natural.",
    price: 35.90,
    category: "velas",
    inStock: true,
  },
  {
    id: "vl-004",
    name: "Kit 3 Velas Coloridas",
    description: "Vermelha, branca e azul. Para rituais diversos.",
    price: 59.90,
    category: "velas",
    inStock: true,
  },
  // Incensos
  {
    id: "in-001",
    name: "Incenso Nag Champa",
    description: "Clássico indiano. Cone com 12 unidades.",
    price: 39.90,
    category: "incensos",
    inStock: true,
  },
  {
    id: "in-002",
    name: "Incenso de Sálvia Blanca",
    description: "Purificação e limpeza energética. Varetas.",
    price: 49.90,
    category: "incensos",
    inStock: true,
  },
  {
    id: "in-003",
    name: "Incenso de Pau Santo",
    description: "Queima em brasas. Purificação poderosa.",
    price: 55.90,
    category: "incensos",
    inStock: false,
  },
  {
    id: "in-004",
    name: "Resina de Mirra",
    description: "50g. Alta qualidade para defumação.",
    price: 69.90,
    category: "incensos",
    inStock: true,
  },
  // Ornamentos
  {
    id: "or-001",
    name: "Pêndulo Egípcio",
    description: "Latão banhado a ouro. 20cm.",
    price: 79.90,
    category: "ornamentos",
    inStock: true,
  },
  {
    id: "or-002",
    name: "Pirex Sagrada Geometria",
    description: "Plate em vidro. Para Altar ou mesa ritual.",
    price: 89.90,
    category: "ornamentos",
    inStock: true,
  },
  {
    id: "or-003",
    name: "Mala Prayer Beads",
    description: "108 contas. Semente de rudraksha.",
    price: 149.90,
    category: "ornamentos",
    inStock: true,
  },
  {
    id: "or-004",
    name: "Pentagrama em Metal",
    description: "Disco decorativo para altar. 15cm.",
    price: 59.90,
    category: "ornamentos",
    inStock: true,
  },
];

export function getCatalog() {
  return {
    categories,
    products,
  };
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
