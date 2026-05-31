/**
 * Tarot-Tarot Correlation Module
 * Maps Major Arcana cards to other Major Arcana cards through paths on the Tree of Life
 * Based on the 32 paths of wisdom connecting the Sephiroth
 */

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  numero_caminho: number;
  path_type: 'same_sephirot' | 'adjacent_path' | 'progression';
  spiritual_meaning: string;
}

export const TAROT_TAROT_MAPPINGS: Record<string, TarotTarotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    numero_caminho: 11,
    path_type: 'progression',
    spiritual_meaning:
      'O salto da fe precede a manifestacao da vontade. O nada que precede o tudo. A preparacao para o primeiro ato criativo.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Alta Sacerdotisa',
    related_numero: 2,
    numero_caminho: 12,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'O poder de manifestar encontra a sabedoria oculta. A vontade masculina encontra a intuição feminina.',
  },
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    numero_caminho: 13,
    path_type: 'progression',
    spiritual_meaning:
      'O velo do mistério se levanta para revelar a abundancia criativa. A sabedoria oculta se manifesta como fertilidade.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    numero_caminho: 14,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A fertilidade criativa encontra sua expressao estruturada. O feminino se conjuga com o masculino estruturante.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    numero_caminho: 15,
    path_type: 'progression',
    spiritual_meaning:
      'A autoridade marcial se transforma em sabedoria espiritual. O poder terreno cede ao mestre.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    numero_caminho: 16,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A iniciacao sagrada conduz a escolha amorosa. O mestre apresenta o caminho do coracao.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Carro',
    related_numero: 7,
    numero_caminho: 17,
    path_type: 'progression',
    spiritual_meaning:
      'A escolha amorosa encontra seu veiculo de conquista. O amor que vence se expressa atraves da carruagem.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Justica',
    related_numero: 8,
    numero_caminho: 18,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'O triumpho conquistador enfrenta a lei cosmica. A vitoria externa precisa harmonizar-se com o equilibrio.',
  },
  'A Justica': {
    arcano: 'A Justica',
    numero_carta: 8,
    related_arcano: 'O Eremita',
    related_numero: 9,
    numero_caminho: 19,
    path_type: 'progression',
    spiritual_meaning:
      'O equilibrio cosmico conduce a sabedoria interior. A compreensão das leis universais leva a verdade solitaria.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Roda da Fortuna',
    related_numero: 10,
    numero_caminho: 20,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A sabedoria solitaria se integra ao destino ciclico. A iluminacao interior se alinha com o destino.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Forca',
    related_numero: 11,
    numero_caminho: 21,
    path_type: 'progression',
    spiritual_meaning:
      'O destino ciclico encontra seu dominio atraves da forca interior. A sabedoria de navegar os ciclos.',
  },
  'A Forca': {
    arcano: 'A Forca',
    numero_carta: 11,
    related_arcano: 'O Enforcado',
    related_numero: 12,
    numero_caminho: 22,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A forca do coracao se expressa atraves do sacrificio consciente. A coragem que domina as paixoes.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Morte',
    related_numero: 13,
    numero_caminho: 23,
    path_type: 'progression',
    spiritual_meaning:
      'O sacrificio precede a transformacao inevitavel. A entrega sagrada prepara o caminho para o renascimento.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Temperanca',
    related_numero: 14,
    numero_caminho: 24,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A transformacao encontra o equilibrio alquimico. A morte do velho se transfigura na harmonia.',
  },
  'A Temperanca': {
    arcano: 'A Temperanca',
    numero_carta: 14,
    related_arcano: 'O Diabo',
    related_numero: 15,
    numero_caminho: 25,
    path_type: 'progression',
    spiritual_meaning:
      'O equilibrio alquimico confronta as sombras materiais. A harmonia reconhece e transmutas as prisoes.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    numero_caminho: 26,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'As amarras materiais enfrentam a revelacao subita. A materia e desconstruida pelo raio libertador.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    numero_caminho: 27,
    path_type: 'progression',
    spiritual_meaning:
      'A destruicao das ilusoes abre espaco para a esperança renovada. O raio prepara o caminho para a luz.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    numero_caminho: 28,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A esperança luminosa ilumina os mares emocionais. A luz divina guia atraves das aguas.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    numero_caminho: 29,
    path_type: 'progression',
    spiritual_meaning:
      'O inconscio lunar emerge na claridad solar. Os medos se dissolvem na luz da verdade.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    numero_caminho: 30,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A claridad solar precede o julgamento divino. A verdade iluminada aguarda o renascimento.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    numero_caminho: 31,
    path_type: 'progression',
    spiritual_meaning:
      'O chamado do renascimento conduz a completude. A ressurreicao prepara o retorno a unidade.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Louco',
    related_numero: 0,
    numero_caminho: 32,
    path_type: 'same_sephirot',
    spiritual_meaning:
      'A completude retorna ao ponto original. O ciclo se completa e o louco recomeca a jornada.',
  },
} as const;

Object.freeze(TAROT_TAROT_MAPPINGS);
Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

export const MAJOR_ARCANA_NAMES = [
  'O Louco', 'O Mago', 'A Alta Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Justica', 'O Eremita',
  'A Roda da Fortuna', 'A Forca', 'O Enforcado', 'A Morte', 'A Temperanca',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo',
] as const;

export const PATH_TYPES = ['same_sephirot', 'adjacent_path', 'progression'] as const;

export function getTarotTarot(arcano: string): TarotTarotMapping | null {
  return TAROT_TAROT_MAPPINGS[arcano] ?? null;
}

export function getRelatedArcano(arcano: string): string | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.related_arcano ?? null;
}

export function getAllTarotPaths(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

export function getAllArcanos(): string[] {
  return [...MAJOR_ARCANA_NAMES];
}

export function hasTarotTarot(arcano: string): boolean {
  return arcano in TAROT_TAROT_MAPPINGS;
}

export function getArcanoByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_TAROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.arcano ?? null;
}

export function getRelatedByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_TAROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.related_arcano ?? null;
}

export function getArcanosByPathType(
  pathType: 'same_sephirot' | 'adjacent_path' | 'progression'
): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS)
    .filter((m) => m.path_type === pathType)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

export function getAllPathTypes(): string[] {
  return [...PATH_TYPES];
}

export function getPathNumber(arcano: string): number | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.numero_caminho ?? null;
}

export function getPathType(arcano: string): string | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.path_type ?? null;
}

export function getArcanosByPathNumber(numeroCaminho: number): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).filter(
    (m) => m.numero_caminho === numeroCaminho
  );
}

Object.freeze(MAJOR_ARCANA_NAMES);
Object.freeze(PATH_TYPES);

export default {
  getTarotTarot,
  getRelatedArcano,
  getAllTarotPaths,
  getAllArcanos,
  hasTarotTarot,
  getArcanoByNumber,
  getRelatedByNumber,
  getArcanosByPathType,
  getAllPathTypes,
  getPathNumber,
  getPathType,
  getArcanosByPathNumber,
  TAROT_TAROT_MAPPINGS,
  MAJOR_ARCANA_NAMES,
  PATH_TYPES,
};
