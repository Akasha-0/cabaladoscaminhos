/**
 * Materials Catalog
 * Provides a catalog of ritual and spiritual materials with categories and prices.
 */

export interface Material {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit?: string;
  inStock: boolean;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
}

const categories: MaterialCategory[] = [
  { id: "ervas", name: "Ervas", description: "Ervas sagradas e medicinais para rituais" },
  { id: "sais", name: "Sais", description: "Sais ritualísticos e purificadores" },
  { id: "aguas", name: "Águas", description: "Águas benditas e energizadas" },
  { id: "oleos", name: "Óleos", description: "Óleos essenciais e de unção" },
  { id: "povos", name: "Pós", description: "Pós e especiarias rituais" },
];

const materials: Material[] = [
  // Ervas
  {
    id: "er-001",
    name: "Salvia Sagrada",
    description: "Usada para limpeza espiritual e purificação de ambientes.",
    price: 45.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  {
    id: "er-002",
    name: "Arruda",
    description: "Proteção contra energias negativas e mau-olhado.",
    price: 35.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  {
    id: "er-003",
    name: "Alecrim",
    description: "Fortalecimento da memória e clareza mental.",
    price: 29.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  {
    id: "er-004",
    name: "Manjericão",
    description: "Prosperidade, amor e harmonização espiritual.",
    price: 32.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  {
    id: "er-005",
    name: "Guiné",
    description: "Quebra de feitiçarias e proteção poderosa.",
    price: 39.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  {
    id: "er-006",
    name: "Espada de São Jorge",
    description: "Proteção do lar e afastamento de negatividades.",
    price: 42.90,
    category: "ervas",
    unit: "maço",
    inStock: true,
  },
  // Sais
  {
    id: "sa-001",
    name: "Sal Grosso",
    description: "Purificação básica e proteção contra energias negativas.",
    price: 19.90,
    category: "sais",
    unit: "kg",
    inStock: true,
  },
  {
    id: "sa-002",
    name: "Sal Marinho",
    description: "Purificação refinada para banhos e rituais.",
    price: 29.90,
    category: "sais",
    unit: "500g",
    inStock: true,
  },
  {
    id: "sa-003",
    name: "Sal Negro",
    description: "Proteção poderosa e banimento de energias densas.",
    price: 49.90,
    category: "sais",
    unit: "250g",
    inStock: true,
  },
  {
    id: "sa-004",
    name: "Sal de Lúcia",
    description: "Usado em demandas e trabalhos de amarração.",
    price: 55.90,
    category: "sais",
    unit: "250g",
    inStock: true,
  },
  // Águas
  {
    id: "ag-001",
    name: "Água Florida",
    description: "Harmonização, amor e atraimento de energias positivas.",
    price: 39.90,
    category: "aguas",
    unit: "100ml",
    inStock: true,
  },
  {
    id: "ag-002",
    name: "Água de São João",
    description: "Santas águas para proteção e limpeza espiritual.",
    price: 34.90,
    category: "aguas",
    unit: "100ml",
    inStock: true,
  },
  {
    id: "ag-003",
    name: "Perfumado de Umbanda",
    description: "Fluidificação e energização de ambientes.",
    price: 44.90,
    category: "aguas",
    unit: "100ml",
    inStock: true,
  },
  {
    id: "ag-004",
    name: "Escala d'Água",
    description: "Passes espirituais e limpeza de chakras.",
    price: 37.90,
    category: "aguas",
    unit: "100ml",
    inStock: true,
  },
  // Óleos
  {
    id: "ol-001",
    name: "Óleo de Abre Caminho",
    description: "Abertura de caminhos e remoção de obstáculos.",
    price: 49.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  {
    id: "ol-002",
    name: "Óleo de Oxum",
    description: "Amor, prosperidade e conquistas.",
    price: 54.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  {
    id: "ol-003",
    name: "Óleo de São Cipriano",
    description: "Proteção, domínio e controle de situações.",
    price: 69.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  {
    id: "ol-004",
    name: "Óleo de Palmeiras",
    description: "Força, coragem e vitória.",
    price: 59.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  {
    id: "ol-005",
    name: "Óleo de Passiva",
    description: "Calma, paz e tranquilização de espíritos.",
    price: 64.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  {
    id: "ol-006",
    name: "Óleo de Sete Spirits",
    description: "Trabalho espiritual múltiplo e poderoso.",
    price: 79.90,
    category: "oleos",
    unit: "50ml",
    inStock: true,
  },
  // Pós
  {
    id: "po-001",
    name: "Pó de Ervas",
    description: "Mistura ritualística para defumações e banhos.",
    price: 39.90,
    category: "povos",
    unit: "100g",
    inStock: true,
  },
  {
    id: "po-002",
    name: "Carvão em Pó",
    description: "Base para defumações e purificações.",
    price: 24.90,
    category: "povos",
    unit: "100g",
    inStock: true,
  },
  {
    id: "po-003",
    name: "Benjoim em Pó",
    description: "Elevação espiritual e conexão com o divino.",
    price: 59.90,
    category: "povos",
    unit: "50g",
    inStock: true,
  },
  {
    id: "po-004",
    name: "Cânfora em Pó",
    description: "Limpagem poderosa e despacho de energias.",
    price: 44.90,
    category: "povos",
    unit: "100g",
    inStock: true,
  },
  {
    id: "po-005",
    name: "Alecrim em Pó",
    description: "Clarificação mental e proteção.",
    price: 34.90,
    category: "povos",
    unit: "100g",
    inStock: true,
  },
];

export function getCatalog(): { materials: Material[]; categories: MaterialCategory[] } {
  return { materials, categories };
}

export function getMaterialsByCategory(categoryId: string): Material[] {
  return materials.filter((m) => m.category === categoryId);
}

export function getMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id);
}

export function getCategoryById(id: string): MaterialCategory | undefined {
  return categories.find((c) => c.id === id);
}