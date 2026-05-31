/**
 * Tarot-Tarot Correlation Module
 * Maps Tarot Major Arcana cards to other Arcanos (paths in the Tree of Life)
 * Based on the Cabala dos Caminhos framework for spiritual correspondences
 */

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: 'sequential' | 'tree_path' | 'archetypal';
  spiritual_meaning: string;
  energy_flow: 'bidirectional' | 'unidirectional';
}

export const TAROT_TAROT_MAPPINGS: TarotTarotMapping[] = [
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'sequential', spiritual_meaning: 'Iniciação e despertar da consciência', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'Retorno ao ponto original com nova sabedoria', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'sequential', spiritual_meaning: 'Manifestação do poder divino através da sabedoria', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'sequential', spiritual_meaning: 'Transição do conhecimento oculto para expressão criativa', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'archetypal', spiritual_meaning: 'Equilíbrio entre força criativa e autoridade', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'sequential', spiritual_meaning: 'Autoridade espiritual e tradição sagrada', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'sequential', spiritual_meaning: 'Transformação através das escolhas e uniões', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'sequential', spiritual_meaning: 'Assertividade na busca do equilíbrio', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justiça', related_numero: 8, path_type: 'sequential', spiritual_meaning: 'Vitória através do alinhamento divino', energy_flow: 'bidirectional' },
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'sequential', spiritual_meaning: 'Iluminação interior e busca pela verdade', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'sequential', spiritual_meaning: 'Ciclos cósmicos e transformação', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Força', related_numero: 11, path_type: 'sequential', spiritual_meaning: 'Ação correta; coragem diante do destino', energy_flow: 'bidirectional' },
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'sequential', spiritual_meaning: 'Sacrifício voluntário e maestria', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'sequential', spiritual_meaning: 'Metamorfose e renascimento', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperança', related_numero: 14, path_type: 'sequential', spiritual_meaning: 'Equilíbrio e integração das sombras', energy_flow: 'bidirectional' },
  { arcano: 'A Temperança', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'sequential', spiritual_meaning: 'Confronto com ilusões e libertação', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'sequential', spiritual_meaning: 'Revelação das correntes e destruição', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'sequential', spiritual_meaning: 'Destruição e renovação; esperança', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'sequential', spiritual_meaning: 'Luz sanadora após escuridão', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: 'Dissipação das ilusões; clareza', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'sequential', spiritual_meaning: 'Iluminação e renascimento espiritual', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'Consumação da jornada', energy_flow: 'bidirectional' },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Louco', related_numero: 0, path_type: 'sequential', spiritual_meaning: 'Completude e retorno ao início', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'tree_path', spiritual_meaning: 'Caminho de Álec - Conexão entre Keter e Chokhmah', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'O Sol', related_numero: 19, path_type: 'tree_path', spiritual_meaning: 'Manifestação da vontade criativa', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'Intuição lunar e sabedoria oculta', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'Fertilidade espiritual e esperança', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'A Justiça', related_numero: 8, path_type: 'tree_path', spiritual_meaning: 'Estrutura e lei divina', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: 'Tradição sagrada e busca interior', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: 'Escolhas transformadoras', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Temperança', related_numero: 14, path_type: 'tree_path', spiritual_meaning: 'Conquista e equilíbrio', energy_flow: 'bidirectional' },
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'tree_path', spiritual_meaning: 'Poder gentil e sacrifício', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: 'Transformação e confronto', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Louco', related_numero: 0, path_type: 'tree_path', spiritual_meaning: 'Renovação e recomeço', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'archetypal', spiritual_meaning: 'Feminino sagrado encontra masculino sagrado', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'archetypal', spiritual_meaning: 'Controle pessoal vs destino cíclico', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Estrela', related_numero: 17, path_type: 'archetypal', spiritual_meaning: 'Mistério oculto encontra esperança', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Lua', related_numero: 18, path_type: 'archetypal', spiritual_meaning: 'Luz clareza encontra escuridão intuitiva', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'archetypal', spiritual_meaning: 'Solitude vs união e escolha', energy_flow: 'bidirectional' },
];

Object.freeze(TAROT_TAROT_MAPPINGS);

export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.arcano === arcano);
}

export function getAllTarotPaths(): TarotTarotMapping[] {
  return [...TAROT_TAROT_MAPPINGS];
}

export function getPathsByType(pathType: 'sequential' | 'tree_path' | 'archetypal'): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.path_type === pathType);
}

export function getRelatedArcano(arcano: string, pathType?: 'sequential' | 'tree_path' | 'archetypal'): string | null {
  const mappings = pathType
    ? TAROT_TAROT_MAPPINGS.filter((m) => m.arcano === arcano && m.path_type === pathType)
    : TAROT_TAROT_MAPPINGS.filter((m) => m.arcano === arcano);
  return mappings[0]?.related_arcano ?? null;
}

export function areArcanosRelated(arcano1: string, arcano2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
}

export function getMappingsByNumber(numero: number): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.numero_carta === numero);
}

export function getAllArcanos(): string[] {
  const arcanos = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach((m) => {
    arcanos.add(m.arcano);
    arcanos.add(m.related_arcano);
  });
  return Array.from(arcanos).sort();
}

export default { getTarotTarot, getAllTarotPaths };
