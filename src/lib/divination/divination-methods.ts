// src/lib/divination/divination-methods.ts
// Catálogo dos métodos de divinatório suportados pela plataforma.
// Fonte canônica: Doc 06 §1 / Doc 14 (Extensibilidade Oracular).
//
// Cada método corresponde a um sistema que pode ser "delegado" para
// o cockpit e/ou usado como input independente.

export interface DivinationMethod {
  /** Identificador curto (slug). */
  id: string;
  /** Nome de exibição. */
  name: string;
  /** Descrição curta (1 linha). */
  description: string;
  /** Sistema-mãe (e.g. "Cigana Real", "Astrologia"). */
  system: string;
  /** Requer mapa natal do consulente? */
  requiresNatal: boolean;
}

const METHODS: DivinationMethod[] = [
  {
    id: 'cigana-real',
    name: 'Mesa Real (Cigana)',
    description: '36 cartas ciganas em matriz 9×4, com delegação de Odu e sistemas natais',
    system: 'Cartas Ciganas',
    requiresNatal: false,
  },
  {
    id: 'astrologia-natal',
    name: 'Astrologia Natal',
    description: 'Mapa astral com signos, casas, aspectos e trânsito atual',
    system: 'Astrologia Ocidental',
    requiresNatal: true,
  },
  {
    id: 'numerologia-cabalistica',
    name: 'Numerologia Cabalística',
    description: 'Caminho de vida, expressão, alma, destino e ciclos pessoais',
    system: 'Numerologia',
    requiresNatal: true,
  },
  {
    id: 'numerologia-tantrica',
    name: 'Numerologia Tântrica',
    description: '11 corpos tântricos, karma, dom divino, caminho de ascensão',
    system: 'Numerologia Tântrica',
    requiresNatal: true,
  },
  {
    id: 'odu-ifa',
    name: 'Odu Ifá (Merindilogun)',
    description: '16 Odús com quizilas, preceitos, ebó e orixás regentes',
    system: 'Ifá / Candomblé',
    requiresNatal: true,
  },
  {
    id: 'tarot-maior',
    name: 'Tarot — Arcanos Maiores',
    description: '22 Arcanos Maiores como espelho do caminho da alma',
    system: 'Tarot',
    requiresNatal: false,
  },
  {
    id: 'iching',
    name: 'I Ching',
    description: '64 hexagramas para consulta situacional',
    system: 'I Ching',
    requiresNatal: false,
  },
];

/** Retorna a lista de métodos de divinatório suportados. */
export function getMethods(): DivinationMethod[] {
  return METHODS;
}
