// @ts-nocheck
// Ebora data — spiritual illumination and sacred light

export interface EboraEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface EboraData {
  entities: EboraEntity[];
  aspects: string[];
}

const entities: EboraEntity[] = [
  {
    id: "ebora-001",
    name: "Luz Primordial",
    description: "A luz original que emerge da fonte divina, representando a claridade que dissipa toda escuridão interior.",
    characteristics: [" Clareza", "Pureza", "Iluminação", "Transcendência"],
    category: "sacred-light",
    practice: "Meditação na luz interior"
  },
  {
    id: "ebora-002",
    name: "Chama Eterna",
    description: "A chama que arde eternamente no coração do ser, mantendo viva a conexão com o divino.",
    characteristics: ["Devoção", "Persistência", "Conexão sagrada", "Renovação"],
    category: "sacred-light",
    practice: "Respiração da chama sagrada"
  },
  {
    id: "ebora-003",
    name: "Radiação Divina",
    description: "A energia radiante que emana de toda consciência desperta, tocando e transformando tudo ao redor.",
    characteristics: ["Expansão", "Transformação", "Graça", "Unificação"],
    category: "sacred-energy",
    practice: "Expansão da consciência irradiante"
  },
  {
    id: "ebora-004",
    name: "Clareza Mental",
    description: "O estado de mente límpida onde a sabedoria natural emerge sem esforço ou obstáculos.",
    characteristics: ["Discernimento", "Sabedoria", "Equilíbrio", "Presença"],
    category: "mental-clarity",
    practice: "Cultivo da mente clara"
  },
  {
    id: "ebora-005",
    name: "Aurora Espiritual",
    description: "O momento sagrado do despertar onde a escuridão da ignorância dá lugar à luz do conhecimento direto.",
    characteristics: ["Despertar", "Renascimento", "Esperança", "Renovação"],
    category: "spiritual-awakening",
    practice: "Prática do despertar auroral"
  },
  {
    id: "ebora-006",
    name: "Sol Interior",
    description: "O sol que brilha eternamente dentro de cada ser, fonte de toda luz e calor espiritual.",
    characteristics: ["Vitalidade", "Força", "Nutrição", "Sustentação"],
    category: "inner-light",
    practice: "Respiração solar interior"
  },
  {
    id: "ebora-007",
    name: "Reflexo Divino",
    description: "A luz divina que se reflete no espelho da consciência, revelando a verdadeira natureza do ser.",
    characteristics: ["Reflexão", "Verdade", "Autoconhecimento", "Revelação"],
    category: "divine-reflection",
    practice: "Meditação do espelho sagrado"
  },
  {
    id: "ebora-008",
    name: "Bênção Luminosa",
    description: "A graça que desce como luz, abençoando e iluminando todos os aspectos da existência.",
    characteristics: ["Graça", "Abençoar", "Proteção", "Elevação"],
    category: "sacred-blessing",
    practice: "Invocação da bênção luminosa"
  }
];

const aspects: string[] = [
  "Luz Interior",
  "Consciência Expandida",
  "Sabedoria Inata",
  "Conexão Universal",
  "Despertar Espiritual",
  "Unificação da Consciência",
  "Presença Plena",
  "Libertação Interior"
];

function buildData(): EboraData {
  return {
    entities,
    aspects
  };
}

// Singleton cache
let cachedData: EboraData | null = null;

export function getData(): EboraData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): EboraEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): EboraEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): EboraEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  const categories = new Set(entities.map((e) => e.category));
  return Array.from(categories);
}

export function getAspects(): string[] {
  return [...aspects];
}