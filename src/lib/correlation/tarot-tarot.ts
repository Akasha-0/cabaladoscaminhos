/**
 * Tarot-Tarot Correlation Module
 * Maps Major Arcana cards to related cards based on spiritual paths, thematic connections, and the Fool's Journey
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export type PathType =
  | 'jornada'        // The Fool's Journey path
  | 'transformacao'  // Transformation and metamorphosis
  | 'equilibrio'     // Balance and harmony
  | 'polaridade'     // Duality and opposition
  | 'culminacao'     // Completion and integration
  | 'iniciacao'      // Initiation and awakening
  | 'sombra'         // Shadow and shadow work
  | 'luz'            // Illumination and enlightenment
  | 'ciclo'          // Cyclical return
  | 'ascensao';      // Spiritual ascension

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: PathType;
  spiritual_meaning: string;
}

const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    path_type: 'iniciacao',
    spiritual_meaning:
      'O Louco inicia a jornada espiritual onde o Mago manifesta sua intenção. O vazio do novo começo encontra o poder da vontade criadora. O Louco carrega em si o potencial não-manifestado que o Mago traz à realidade.',
  },
  {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Sacerdotisa',
    related_numero: 2,
    path_type: 'polaridade',
    spiritual_meaning:
      'O Mago representa a vontade consciente enquanto a Sacerdotisa guarda os mistérios do inconsciente. Juntos eles formam o primeiro duality - ação e intuição, exterior e interior, criação e contemplação.',
  },
  {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    path_type: 'transformacao',
    spiritual_meaning:
      'A Sacerdotisa guarda o conhecimento oculto que a Imperatriz manifesta no mundo material. A sabedoria interior se torna fertilidade criativa. O mistério revela sua natureza nutridora.',
  },
  {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    path_type: 'polaridade',
    spiritual_meaning:
      'A Imperatriz é o princípio feminino da fertilidade enquanto o Imperador é o princípio masculino da estrutura. Juntos representam o casamento sagrado entre natureza e ordem, emoção e lógica.',
  },
  {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    path_type: 'jornada',
    spiritual_meaning:
      'O Imperador estabelece a autoridade terrestre que o Hierofante eleva à dimensão sagrada. A estrutura material se torna templo quando a tradição spiritual é incorporada. O poder mundano encontra sua expressão divina.',
  },
  {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    path_type: 'transformacao',
    spiritual_meaning:
      'O Hierofante transmite a sabedoria tradicional enquanto os Enamorados fazem a escolha sagrada que transforma essa sabedoria em experiência vivida. A doutrina se torna decisão de coração.',
  },
  {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Carro',
    related_numero: 7,
    path_type: 'jornada',
    spiritual_meaning:
      'A escolha de amor cria a momentum que o Carro conduz. O casamento interior impulsiona a conquista. A decisão do coração alimenta a vitória da vontade sobre o mundo.',
  },
  {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Justiça',
    related_numero: 8,
    path_type: 'equilibrio',
    spiritual_meaning:
      'O Carro conquista através da força enquanto a Justiça mantém o equilíbrio dessa conquista. A vitória requer equilíbrio entre as forças opostas que a Justiça mede com precisão cósmica.',
  },
  {
    arcano: 'A Justiça',
    numero_carta: 8,
    related_arcano: 'O Eremita',
    related_numero: 9,
    path_type: 'sombra',
    spiritual_meaning:
      'A Justiça illumina com clareza racional enquanto o Eremita busca a sabedoria através da solidão. O equilibrio da balança conduz à interiorização da luz. A verdade externa leva à busca interna.',
  },
  {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Roda da Fortuna',
    related_numero: 10,
    path_type: 'ciclo',
    spiritual_meaning:
      'A iluminação do Eremita revela os ciclos do destino que a Roda representa. A sabedoria interior compreende o movimento eterno. A luz da lanterna ilumina a roda cósmica.',
  },
  {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Força',
    related_numero: 11,
    path_type: 'transformacao',
    spiritual_meaning:
      'A Roda gira com o destino enquanto a Força transforma o medo em coragem. O acaso se torna agency quando a força interior domina as forças externas. A roda do destino encontra a força do coração.',
  },
  {
    arcano: 'A Força',
    numero_carta: 11,
    related_arcano: 'O Enforcado',
    related_numero: 12,
    path_type: 'sombra',
    spiritual_meaning:
      'A Força do coração encontra seu teste no sacrifício do Enforcado. A coragem se torna entrega quando a perspectiva muda. A força aparente se transforma em força através da rendição.',
  },
  {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'transformacao',
    spiritual_meaning:
      'O sacrifício do Enforcado antecipa a transformação radical da Morte. A inversão prepara para a dissolução. O pequeno sacrifício leva ao renascimento completo. A morte do ego se completa.',
  },
  {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Temperança',
    related_numero: 14,
    path_type: 'equilibrio',
    spiritual_meaning:
      'A Morte dissolve enquanto a Temperança equilibra. A transformação completa demanda integração das polaridades. Após a morte do velho self, a Temperança reconstrói com harmonia.',
  },
  {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Diabo',
    related_numero: 15,
    path_type: 'sombra',
    spiritual_meaning:
      'A Temperança harmoniza opostos enquanto o Diabo materializa os apegos. O equilíbrio sagrado testa-se contra as correntes materiais. A harmonia se confronta com a ilusão da prisão.',
  },
  {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'luz',
    spiritual_meaning:
      'O Diabo representa a prisão das ilusões que a Torre destrói. A libertação vem através da crise que remove as estruturas falsas. A queda da torre quebra as correntes do diabo.',
  },
  {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'luz',
    spiritual_meaning:
      'A destruição da Torre abre espaço para a esperança da Estrela. O raio que destrói revela a luz que resta. A crise passa para revelar o alinhamento divino. A escuridão cede à luz das estrelas.',
  },
  {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    path_type: 'jornada',
    spiritual_meaning:
      'A esperança da Estrela enfrenta o teste da Lua. A luz clara encontra os véus do inconsciente. A verdade irradiada enfrenta a ilusão. A estrela guia através das águas da lua.',
  },
  {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'luz',
    spiritual_meaning:
      'A Lua ilumina com luz reflexa enquanto o Sol brilha com luz própria. Os medos da noite se dissolvem no clare do dia. A luz da lua conduz ao sol da verdade. A ilusão dá lugar ao brilho.',
  },
  {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'ascensao',
    spiritual_meaning:
      'O Sol ilumina o caminho que o Julgamento completa. A verdade clara convida ao despertar. O brilho próprio desperta a ressurreição da alma. A criança interior se levanta para renascer.',
  },
  {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'culminacao',
    spiritual_meaning:
      'O Julgamento ressuscita a alma que o Mundo integra. O despertar responde ao chamado que a completion satisfaz. A ressurreição se torna dança cósmica. A jornada retorna ao ponto de partida.',
  },
  {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Louco',
    related_numero: 0,
    path_type: 'ciclo',
    spiritual_meaning:
      'O Mundo completa o ciclo que o Louco iniciou. A dança cósmica retorna ao ponto zero. O fim se torna um novo começo. A completion abre para a próxima jornada infinita.',
  },
  {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'luz',
    spiritual_meaning:
      'O poder do Mago de manifestar se expressa na esperança alinhada da Estrela. A vontade criativa encontra seu propósito divino quando направлена ao alinhamento espiritual.',
  },
  {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'A Estrela',
    related_numero: 17,
    path_type: 'culminacao',
    spiritual_meaning:
      'A fertilidade da Imperatriz floresce na esperança da Estrela. A natureza criativa encontra sua expressão mais elevada. A abundância terrena se eleva à abundância celestial.',
  },
  {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Torre',
    related_numero: 16,
    path_type: 'transformacao',
    spiritual_meaning:
      'A vitória do Carro pode criar orgulho que a Torre dissolve. A conquista bem-sucedida se confronta com a necessidade de queda das estruturas falsas. A arrogância é humilhada.',
  },
  {
    arcano: 'A Justiça',
    numero_carta: 8,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    path_type: 'ascensao',
    spiritual_meaning:
      'A justiça do equilibrar se eleva ao julgamento do despertar. A análise se torna discernimento superior. A verdade medida se transforma na verdade vivida.',
  },
  {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Morte',
    related_numero: 13,
    path_type: 'iniciacao',
    spiritual_meaning:
      'A busca do Eremita pode levar à morte do ego. A iluminação precede a transformação. A luz interior dissolve as identificações falsas. O guru morre para que o discípulo nasça.',
  },
  {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'O Mundo',
    related_numero: 21,
    path_type: 'culminacao',
    spiritual_meaning:
      'A roda do destino encontra sua completude no Mundo. Os ciclos kármicos se resolvem na integração. A fortuna se torna fulfillment quando a roda para.',
  },
  {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Sol',
    related_numero: 19,
    path_type: 'luz',
    spiritual_meaning:
      'O equilíbrio da Temperança brilha na luz do Sol. A alquimia interior cria o ouro do clare. A harmonia se torna brilho próprio. A transmutação completa ilumina.',
  },
  {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    path_type: 'polaridade',
    spiritual_meaning:
      'O Diabo representa a ilusão da prisão enquanto o Hierofante representa a verdade da tradição. A queda do diabo pode ser resgatada pelo ensinamento sagrado.',
  },
  {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Enforcado',
    related_numero: 12,
    path_type: 'jornada',
    spiritual_meaning:
      'A lua ilumina os medos que o Enforcado transcende pela rendição. Os véus da lua são levantados pela inversão do sacrifício. A noite escura cede ao sacrifício sagrado.',
  },
  {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    path_type: 'jornada',
    spiritual_meaning:
      'A esperança da Estrela nutre a fertilidade da Imperatriz. A luz celestial alimenta a terra. A esperança desperta a abundância. O alinhamento cria a manifestação.',
  },
];

Object.freeze(TAROT_TAROT_MAP);
TAROT_TAROT_MAP.forEach(mapping => Object.freeze(mapping));

export const PATH_TYPES: readonly PathType[] = [
  'jornada',
  'transformacao',
  'equilibrio',
  'polaridade',
  'culminacao',
  'iniciacao',
  'sombra',
  'luz',
  'ciclo',
  'ascensao',
] as const;

Object.freeze(PATH_TYPES);

export function getTarotTarot(arcano: string): TarotTarotMapping | null {
  const normalize = (s: string) => s.trim().toLowerCase();
  const found = TAROT_TAROT_MAP.find(m => normalize(m.arcano) === normalize(arcano));
  return found ?? null;
}

export function getAllTarotPaths(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

export function getRelatedArcano(arcano: string): string | null {
  const mapping = getTarotTarot(arcano);
  return mapping?.related_arcano ?? null;
}

export function getAllRelatedArcanos(arcano: string): TarotTarotMapping[] {
  const normalize = (s: string) => s.trim().toLowerCase();
  return TAROT_TAROT_MAP.filter(
    m => normalize(m.arcano) === normalize(arcano) || normalize(m.related_arcano) === normalize(arcano)
  );
}

export function getPathsByType(pathType: PathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(m => m.path_type === pathType);
}

export function getAllArcanos(): string[] {
  const unique = new Set<string>();
  TAROT_TAROT_MAP.forEach(m => {
    unique.add(m.arcano);
    unique.add(m.related_arcano);
  });
  return Array.from(unique).sort((a, b) => {
    const numA = TAROT_TAROT_MAP.find(m => m.arcano === a)?.numero_carta ?? 999;
    const numB = TAROT_TAROT_MAP.find(m => m.arcano === b)?.numero_carta ?? 999;
    return numA - numB;
  });
}

export function hasTarotTarot(arcano: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase();
  return TAROT_TAROT_MAP.some(m => normalize(m.arcano) === normalize(arcano));
}

export function getArcanoByNumber(numero: number): string | null {
  const found = TAROT_TAROT_MAP.find(m => m.numero_carta === numero);
  return found?.arcano ?? null;
}

export function getPathType(arcano: string): PathType | null {
  const mapping = getTarotTarot(arcano);
  return mapping?.path_type ?? null;
}

export function getAllPathTypes(): PathType[] {
  return [...PATH_TYPES];
}

export function getMappingByNumber(numero: number): TarotTarotMapping | null {
  return TAROT_TAROT_MAP.find(m => m.numero_carta === numero) ?? null;
}

export function getBidirectionalPaths(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(m => {
    const reverse = TAROT_TAROT_MAP.find(
      r => r.arcano === m.related_arcano && r.related_arcano === m.arcano
    );
    return reverse !== undefined;
  });
}

export default {
  getTarotTarot,
  getAllTarotPaths,
  getRelatedArcano,
  getAllRelatedArcanos,
  getPathsByType,
  getAllArcanos,
  hasTarotTarot,
  getArcanoByNumber,
  getPathType,
  getAllPathTypes,
  getMappingByNumber,
  getBidirectionalPaths,
};
