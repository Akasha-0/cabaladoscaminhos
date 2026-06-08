// ============================================================
// SWARM TYPES
// ============================================================

export type AgentRole =
  | 'orixa-specialist'
  | 'odu-specialist'
  | 'tantra-specialist'
  | 'chakra-specialist'
  | 'numerology-specialist'
  | 'astrology-specialist'
  | 'wicca-specialist'
  | 'flora-specialist'
  | 'xing-specialist'
  | 'sexuality-specialist'
  | 'coherence-validator'
  | 'prompt-engineer';

export interface AgentDefinition {
  role: AgentRole;
  name: string;
  description: string;
  domains: string[];
  priority: number;
  lastRun?: string;
}

export const AGENT_REGISTRY: Record<AgentRole, AgentDefinition> = {
  'orixa-specialist': {
    role: 'orixa-specialist',
    name: 'Especialista em Orixás',
    description: 'Mapeia todos os Orixás, suas quizilas, oferendas, dias, fundamentos',
    domains: ['orixas', 'quizilas', 'oferendas', 'umbanda', 'candomble'],
    priority: 1,
  },
  'odu-specialist': {
    role: 'odu-specialist',
    name: 'Especialista em Odu de Ifá',
    description: 'Documenta os 16 Odus principais, secundários, compostos, ebós, preceitos',
    domains: ['odu', 'ifa', 'preceitos', 'ebo', 'quizilas'],
    priority: 1,
  },
  'tantra-specialist': {
    role: 'tantra-specialist',
    name: 'Especialista em Numerologia Tântrica',
    description: 'Mapeia corpos prânicos, nadis, kundalini, kumbhakas, bandhas',
    domains: ['tantra', 'prana', 'nadis', 'kundalini', 'bandhas'],
    priority: 1,
  },
  'chakra-specialist': {
    role: 'chakra-specialist',
    name: 'Especialista em Chakras',
    description: 'Documenta 7 chakras principais + 21 secundários, bija mantras, símbolos',
    domains: ['chakras', 'mantras', 'yantras', 'kundalini'],
    priority: 1,
  },
  'numerology-specialist': {
    role: 'numerology-specialist',
    name: 'Especialista em Numerologia Cabalística',
    description: 'Caminho de Vida, Pináculos, Desafios, Lições Cármicas, Maturidade',
    domains: ['numerologia', 'cabalistica', 'pinaculos', 'desafios'],
    priority: 1,
  },
  'astrology-specialist': {
    role: 'astrology-specialist',
    name: 'Especialista em Astrologia',
    description: 'Trânsitos, casas, aspectos, Lilith, Quíron, nodos, partes',
    domains: ['astrologia', 'transitos', 'casas', 'aspectos', 'lilith'],
    priority: 1,
  },
  'wicca-specialist': {
    role: 'wicca-specialist',
    name: 'Especialista em Wicca e Tradições Pagãs',
    description: 'Sabbat, esbat, elementos, deidades, rituais wiccanos',
    domains: ['wicca', 'sabbat', 'esbat', 'pagão'],
    priority: 2,
  },
  'flora-specialist': {
    role: 'flora-specialist',
    name: 'Especialista em Medicina da Floresta',
    description: 'Ervas, banhos, chás, defumações, plantas de poder',
    domains: ['flora-sagrada', 'ervas', 'banhos', 'chas', 'medicina'],
    priority: 2,
  },
  'xing-specialist': {
    role: 'xing-specialist',
    name: 'Especialista em Mapa de Xing',
    description: 'Sistema de correlação energética complementar',
    domains: ['xing-mapa'],
    priority: 2,
  },
  'sexuality-specialist': {
    role: 'sexuality-specialist',
    name: 'Especialista em Sexualidade',
    description: 'Lilith, Casa 5, Casa 8, Plutão, Marte, prazer, sombras',
    domains: ['sexualidade', 'lilith-casa8-sexo', 'prazer', 'sombra'],
    priority: 1,
  },
  'coherence-validator': {
    role: 'coherence-validator',
    name: 'Validador de Coerência',
    description: 'Valida que todas as Knowledge Bases estão coerentes entre si',
    domains: ['validacao', 'coerencia'],
    priority: 3,
  },
  'prompt-engineer': {
    role: 'prompt-engineer',
    name: 'Engenheiro de Prompts',
    description: 'Otimiza prompts agênticos com Chain of Thought',
    domains: ['prompts', 'cot', 'engenharia'],
    priority: 3,
  },
};

export interface AgentTask {
  name: string;
  description: string;
  domains: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload?: Record<string, any>;
  expectedOutput?: string;
}

export interface AgentResult {
  summary: string;
  insights: string[];
  knowledgeEntries?: KnowledgeEntry[];
  confidence: number;
  duration: number;
  sources?: string[];
}

export interface ChainOfThought {
  task: string;
  steps: Array<{ step: number; thought: string; action: string }>;
  reasoning: string;
  conclusion: string;
}

export interface MemoryEntry {
  id: string;
  agent: AgentRole;
  task: string;
  result: string;
  insights: string[];
  timestamp: string;
  cycleNumber: number;
  tags: string[];
}

export interface SwarmMemory {
  entries: MemoryEntry[];
  // Métodos
  initialize(): Promise<void>;
  recall(query: { query: string; domains: string[]; maxResults?: number }): Promise<{ entries: MemoryEntry[] }>;
  remember(entry: Omit<MemoryEntry, 'id' | 'tags'>): Promise<void>;
  persist(): Promise<void>;
  stats(): { entries: number; byAgent: Record<string, number> };
}

export type KnowledgeDomain =
  | 'orixas' | 'quizilas' | 'oferendas' | 'odu' | 'ifa' | 'preceitos' | 'ebo'
  | 'numerologia' | 'cabalistica' | 'pinaculos' | 'desafios' | 'licoes-carmicas'
  | 'astrologia' | 'transitos' | 'casas' | 'aspectos' | 'lilith' | 'quiron' | 'nodos'
  | 'chakras' | 'chakras-secundarios' | 'mantras' | 'yantras' | 'kundalini'
  | 'tantra' | 'prana' | 'nadis' | 'bandhas' | 'corpos-pranicos'
  | 'wicca' | 'sabbat' | 'esbat' | 'paganismo'
  | 'flora-sagrada' | 'ervas' | 'banhos' | 'chas' | 'medicina-floresta'
  | 'xing-mapa' | 'sexualidade' | 'lilith-casa8-sexo' | 'prazer' | 'sombra'
  | 'umbanda' | 'candomble' | 'umbanda-cultos'
  | 'prompts' | 'cot' | 'validacao' | 'coerencia';

export interface KnowledgeEntry {
  id: string;
  domain: KnowledgeDomain;
  key: string;            // ex: 'orixa.oxala', 'odu.ogbe', 'chakra.muladhara'
  data: any;
  source: string;         // 'research', 'tradition', 'agent', 'ia'
  confidence: number;     // 0-100
  validated: boolean;
  createdAt: string;
  updatedAt: string;
  references?: string[];
  contradictions?: string[];
}

export interface KnowledgeBase {
  entries: KnowledgeEntry[];
  load(): Promise<void>;
  add(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeEntry>;
  query(domain: KnowledgeDomain, key?: string): KnowledgeEntry[];
  getRelevant(domains: string[]): { entries: KnowledgeEntry[] };
  validate(): Promise<{ valid: boolean; issues: string[] }>;
  stats(): { entries: number; domains: number; byDomain: Record<string, number> };
  persist(): Promise<void>;
}
