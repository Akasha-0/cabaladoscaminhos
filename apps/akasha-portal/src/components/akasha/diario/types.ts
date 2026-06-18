/**
 * Shared types for Diario components.
 * Extracted from page.tsx (F-235).
 */
import type { PilaresDados, Pilar } from '@/lib/grimoire/significados-curados';

export const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  bgVoid: '#06070F',
  bgDeep: '#0B0E1C',
  bgNeb: '#141A33',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

export const PILLAR_LABELS: Record<string, { nome: string; cor: string }> = {
  cabala: { nome: 'Numerologia Cabalística', cor: '#7C5CFF' },
  astrologia: { nome: 'Astrologia', cor: '#2DD4BF' },
  tantrica: { nome: 'Numerologia Tântrica', cor: '#F0B429' },
  odu: { nome: 'Odu de Nascimento', cor: '#FB5781' },
  iching: { nome: 'I Ching', cor: '#A0763A' },
};

export const ESCALA_LABELS: Record<MandatoEsqueleto['escala'], string> = {
  D: 'Mandato do Dia',
  S: 'Escala Semanal',
  Z: 'Sazonal',
  V: 'Vida',
};

export type MandatoEsqueleto = {
  escala: 'D' | 'S' | 'Z' | 'V';
  pilares_relevantes: string[];
  redacao_bruta: string;
  cita_fontes: string[];
};

export type MentorHook = {
  intencao: string;
  crise_detectada: boolean;
  recurso: string | null;
};

export type PilaresDoMandato = {
  cabala: { life_path: number; birthday: number; expression: number; ano_pessoal: number };
  astrologia: {
    sol_signo: string;
    asc_signo: string | null;
    lua_signo: string;
    lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
    trinity: { sombra: number; dom: number; graca: number };
    trinity_dominante: 'sombra' | 'dom' | 'graca';
    lilith_signo?: string | null;
    casa_8_signo?: string | null;
  };
  odu: { odu_principal: string; odu_secundario: string | null; fonte: 'Ifá' | 'Candomblé'; aviso: string };
  iching: { hexagrama_natal: number; hexagrama_dia: number; level: 'shadow' | 'gift' | 'siddhi' };
};

export type MandatoDoDiaResponse = {
  date: string;
  mandato: MandatoEsqueleto;
  pilares: PilaresDoMandato;
  mentor_hook: MentorHook;
};

export type DailyRitualUI = {
  titulo: string;
  instrucao: string;
  elemento?: string;
  cor?: string;
};
