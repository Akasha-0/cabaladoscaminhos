/**
 * Tipos para o Motor de Aláfia e 16 Odus — Akasha
 *
 * Pilar 6: Raiz & Esquerda (Gira de Esquerda / Firmezas)
 * Baseado em spiritual-visceral-spec.md · conversa-gemini.md
 */

/** Polaridades do Jogo de Aláfia (0 a 4 búzios abertos) */
export enum AlafiaPolarity {
  ALAFIA = 4,   // Sim absoluto — paz e luz
  ETAWA = 3,    // Sim com dúvida
  EJIIFE = 2,  // Sim firme — confirmação dupla
  OKANRAN = 1,  // Não / Aviso de dificuldade
  OPIRA = 0,    // Não absoluto / Corte
}

export const ALAFIA_LABELS: Record<AlafiaPolarity, string> = {
  [AlafiaPolarity.ALAFIA]: 'Aláfia — Sim absoluto',
  [AlafiaPolarity.ETAWA]: 'Etawa — Sim com dúvida',
  [AlafiaPolarity.EJIIFE]: 'Ejiife — Sim firme',
  [AlafiaPolarity.OKANRAN]: 'Okanran — Não / Atenção',
  [AlafiaPolarity.OPIRA]: 'Opira — Não absoluto',
};

export const ALAFIA_INTERPRETATIONS: Record<AlafiaPolarity, string> = {
  [AlafiaPolarity.ALAFIA]: 'Sim firme e equilibrado. O或áculo señala caminho claro.',
  [AlafiaPolarity.ETAWA]: 'Símo com elementos não resolvidos. Requer cautela.',
  [AlafiaPolarity.EJIIFE]: 'Confirma门户 duplice. O signo aponta para ação.',
  [AlafiaPolarity.OKANRAN]: ' Bloqueio ou aviso. Dificuldades no caminho.',
  [AlafiaPolarity.OPIRA]: 'Corte absoluto. O caminho está fechado neste momento.',
};

/** Os 16 Odus do Merindilogun */
export enum Odu {
  OGUN = 1,
  EJI = 2,
  OGBE = 3,
  OYARON = 4,
  IROSUN = 5,
  OBARA = 6,
  ODI = 7,
  EJIONILE = 8,
  BAFIFA = 9,
  AIRA = 10,
  OLOFIN = 11,
  EYEOLLA = 12,
  ATE = 13,
  REDE = 14,
  DIN = 15,
  KAUA = 16,
}

export interface OduArchetype {
  id: Odu;
  name: string;
  orixas: string[];
  element: string;
  /** Psychological archetype description */
  archetype: string;
  /** Somatic mapping — body areas this Odu governs */
  somaticAreas: string[];
  /** Left-hand alignment — Exu/Pomba Gira guardians */
  esquerdaAlign: string[];
  /** Key phrase from traditional source */
  frase: string;
  fonte: string;
  karmicTheme: string;
  /** Odu 8 Ejionile = cabeça/movimento; Odu 7 Odi = isolamento */
}

export interface AlafiaOduResult {
  alafia: AlafiaPolarity;
  odu: Odu;
  alafiaInterpretation: string;
  oduArchetype: OduArchetype;
  combinedReading: string;
  esquerdaAlign: string[];
  karmicBlockages: string[];
  somaticAdvice: string[];
  firmezasaFazer: string[];
}

/** Chart context from existing Akasha systems — used for cross-referencing */
export interface OduChartContext {
  oduBirth?: Odu;
  astrologicShadow?: string[]; // Lilith, House 8
  lifePath?: number;
  currentOdu?: Odu;
}
