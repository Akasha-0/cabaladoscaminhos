import type { SpiritualCorrelation, CrossSystemPattern, EnergyHarmonyReport } from '@/lib/ai/deep-correlation-engine';
/**
 * MapaAlmaCompleto Type Definitions
 * Complete TypeScript types for the full spiritual map (Mapa da Alma Completo)
 * Integrates: Numerology, Odu (Ifa), Astrology, Tarot, Chakras, Orixas, and Cabala
 *
 * @module mapa-alma
 * @version 1.0.0
 */

import type { NumerologyResult } from '@akasha/core-cabala';
import type { Odu, DrawResult } from '@akasha/core-odus';
import type { MapaNatal, Planeta, Signo, Aspecto, Casa, PosicaoPlaneta } from '@akasha/core-astrology';
import type { CardMeaning } from '../../tarot/meanings';
import type { ChakraV4Data } from '../../chakra/v4/chakra-v4-data';

export type BirthProfile = {
  nomeCompleto: string;
  dataNascimento: string;
  hora?: string;
  cidade: string;
  estado: string;
  pais: string;
};

export type NumerologyResults = {
  lifePath: number;
  expressao: number;
  motivacao: number;
  impressao: number;
  destino: number;
  cicloAtual: number;
  anoPessoal: number;
  metodoUsado: 'pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica' | 'misto';
  raw?: NumerologyResult;
};

export type OduResults = {
  regente: Odu | { numero: number; Caminho: number; nome: string; significado: string };
  secundario?: Odu | { numero: number; Caminho: number; nome: string; significado: string } | null;
  orixas: string[];
  quizilas: string[];
  preceitos: string[];
  ebos: string[];
  elemento: string;
  elementalForce: string;
  lifeLesson: string;
  arcanoTarot: number;
  caminhoSephirah: string;
  raw?: DrawResult;
};

export type AstrologyResults = {
  ascendente: Signo;
  sol: PosicaoPlaneta;
  lua: PosicaoPlaneta;
  mercurio: PosicaoPlaneta;
  venus: PosicaoPlaneta;
  marte: PosicaoPlaneta;
  jupiter: PosicaoPlaneta;
  saturno: PosicaoPlaneta;
  urano: PosicaoPlaneta;
  netuno: PosicaoPlaneta;
  plutao: PosicaoPlaneta;
  chiron: PosicaoPlaneta;
  lilith: PosicaoPlaneta;
  elementos: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalidades: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  casas: Casa[];
  aspectos: Aspecto[];
  raw?: MapaNatal;
};

export type TarotResults = {
  cartaNascimento: number;
  cartaAnoPessoal: number;
  cartaAlma: number;
  interpretacao: CardMeaning;
  cartasAdicionais?: CardMeaning[];
};

export type ChakraInfo = {
  numero: number;
  nome: string;
  estado: 'equilibrado' | 'hiperativo' | 'bloqueado' | 'desbalanceado';
  intensidade: number;
  elemento?: string;
  cor?: string;
};

export type ChakraResults = {
  chakras: ChakraInfo[];
  dominante: string;
  bloqueado: string;
  equilibrio: number;
  raw?: ChakraV4Data[];
};

export type Convergence = {
  sistemas: string[];
  energia: string;
  forca: 'forte' | 'medio' | 'fraco';
  descricao: string;
};
export type HyperSynthesis = {
  signature: string;
  explanation: string;
  practices: string[];
  harmonization: Array<{
    type: 'practice' | 'element' | 'conflict';
    tradition: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  conflicts: Array<{
    type: 'practice' | 'element' | 'conflict';
    tradition: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
};

export type MapaAlmaCompleto = {
  perfil: BirthProfile;
  numerologia: NumerologyResults;
  odu: OduResults;
  astrologia: AstrologyResults;
  tarot: TarotResults;
  chakras: ChakraResults;
  convergencias: Convergence[];
  orixasDominantes: string[];
  dataCalculo: string;
  versao: '1.0.0';
  deepCorrelations?: {
    correlations: SpiritualCorrelation[];
    patterns: CrossSystemPattern[];
    energyHarmony: EnergyHarmonyReport;
  } | null;
  hyperSynthesis?: HyperSynthesis | null;
};

export type {
  NumerologyResult,
  Odu,
  DrawResult,
  MapaNatal,
  PosicaoPlaneta,
// fallow-ignore-next-line unused-type
  Planeta,
  Signo,
  Aspecto,
  Casa,
  CardMeaning,
  ChakraV4Data,
};
