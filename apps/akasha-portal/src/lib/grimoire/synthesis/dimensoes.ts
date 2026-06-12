/**
 * Akasha Synthesis — 9 Dimensões de Vida
 * R-023 F-223
 *
 * Unifica 5 Pilares em 9 dimensões de vida.
 * Cada dimensão tem: título, ícone, cor, chakra, síntese prática.
 */

import type { Pilar } from '../significados-curados';
import type { Area } from '../traducao-areas';

// ─── Tipos ───────────────────────────────────────────────────────────────

export type DimensaoId =
  | 'saude'
  | 'trabalho'
  | 'sexualidade'
  | 'amor'
  | 'criacao'
  | 'proposito'
  | 'familia'
  | 'espiritualidade'
  | 'superacao';

export interface Dimensao {
  readonly id: DimensaoId;
  readonly titulo: string;
  readonly descricao: string;
  readonly icone: string;
  readonly chakraCor: string;
  readonly pilaresPrimarios: readonly Pilar[];
  readonly pilaresSecundarios: readonly Pilar[];
  readonly synthesNarrativa?: string;
}

export interface DimensaoContribuicao {
  readonly pilar: Pilar;
  readonly frase: string;
  readonly fonte?: string;
  readonly nivel: 'primario' | 'secundario';
}

// ─── Mapeamento Area → DimensaoId ──────────────────────────────────────

/** Mapeia a Area (de traducao-areas.ts) → DimensaoId superior. */
export const DIMENSAO_DE_AREA: Record<Area, DimensaoId> = {
  paz: 'saude',
  saude: 'saude',
  relacoes: 'amor',
  dinheiro: 'trabalho',
  trabalho: 'trabalho',
  proposito: 'proposito',
  criatividade: 'criacao',
  espiritualidade: 'espiritualidade',
  sexualidade: 'sexualidade',
};

// ─── Definição das 9 Dimensões ────────────────────────────────────────

export const DIMENSOES: readonly Dimensao[] = [
  {
    id: 'saude',
    titulo: 'Saúde & Vitalidade',
    descricao: 'Como está seu corpo hoje? Qual é sua energia?',
    icone: '◈',
    chakraCor: '#C43E3E',
    pilaresPrimarios: ['tantrica', 'cabala'],
    pilaresSecundarios: ['astrologia'],
  },
  {
    id: 'trabalho',
    titulo: 'Trabalho & Prosperidade',
    descricao: 'Qual carreira te realiza? Como está seu dinheiro?',
    icone: '◬',
    chakraCor: '#C4763E',
    pilaresPrimarios: ['cabala'],
    pilaresSecundarios: ['astrologia', 'tantrica'],
  },
  {
    id: 'sexualidade',
    titulo: 'Sexualidade & Desejo',
    descricao: 'Como é sua sexualidade? O que te atrai?',
    icone: '◉',
    chakraCor: '#C43E8E',
    pilaresPrimarios: ['tantrica'],
    pilaresSecundarios: ['cabala', 'astrologia', 'odu'],
  },
  {
    id: 'amor',
    titulo: 'Amor & Relacionamentos',
    descricao: 'Como você se relaciona? Qual parceiro é ideal?',
    icone: '♥',
    chakraCor: '#C43E5E',
    pilaresPrimarios: ['astrologia'],
    pilaresSecundarios: ['tantrica', 'cabala', 'odu'],
  },
  {
    id: 'criacao',
    titulo: 'Criação & Expressão',
    descricao: 'Como você se expressa? Qual é sua arte?',
    icone: '✦',
    chakraCor: '#C4C43E',
    pilaresPrimarios: ['cabala', 'astrologia'],
    pilaresSecundarios: ['tantrica'],
  },
  {
    id: 'proposito',
    titulo: 'Propósito & Destino',
    descricao: 'Para que você veio? Qual é sua missão?',
    icone: '★',
    chakraCor: '#8EC43E',
    pilaresPrimarios: ['cabala', 'astrologia'],
    pilaresSecundarios: ['tantrica', 'odu'],
  },
  {
    id: 'familia',
    titulo: 'Família & Ancestralidade',
    descricao: 'Qual é sua herança? O que vem da sua família?',
    icone: '⬡',
    chakraCor: '#3EC48E',
    pilaresPrimarios: ['odu'],
    pilaresSecundarios: ['astrologia', 'tantrica'],
  },
  {
    id: 'espiritualidade',
    titulo: 'Espiritualidade & Transcendência',
    descricao: 'Como você se conecta com o divino?',
    icone: '✧',
    chakraCor: '#3E8EC4',
    pilaresPrimarios: ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'],
    pilaresSecundarios: [],
  },
  {
    id: 'superacao',
    titulo: 'Superação & Desafios',
    descricao: 'Como transformar sombra em força?',
    icone: '⛾',
    chakraCor: '#8E3EC4',
    pilaresPrimarios: ['cabala', 'odu'],
    pilaresSecundarios: ['astrologia', 'tantrica'],
  },
] as const;

/** Lookup rápido por id. */
export const DIMENSAO_POR_ID: Record<DimensaoId, Dimensao> = {
  saude: DIMENSOES[0],
  trabalho: DIMENSOES[1],
  sexualidade: DIMENSOES[2],
  amor: DIMENSOES[3],
  criacao: DIMENSOES[4],
  proposito: DIMENSOES[5],
  familia: DIMENSOES[6],
  espiritualidade: DIMENSOES[7],
  superacao: DIMENSOES[8],
};

/** Cor de fundo do card por dimensão. */
export const DIMENSAO_BG: Record<DimensaoId, string> = {
  saude: 'rgba(196,62,62,0.08)',
  trabalho: 'rgba(196,118,62,0.08)',
  sexualidade: 'rgba(196,62,142,0.08)',
  amor: 'rgba(196,62,94,0.08)',
  criacao: 'rgba(196,196,62,0.08)',
  proposito: 'rgba(142,196,62,0.08)',
  familia: 'rgba(62,196,142,0.08)',
  espiritualidade: 'rgba(62,142,196,0.08)',
  superacao: 'rgba(142,62,196,0.08)',
};

/** Cor da borda do card por dimensão. */
export const DIMENSAO_BORDER: Record<DimensaoId, string> = {
  saude: 'rgba(196,62,62,0.25)',
  trabalho: 'rgba(196,118,62,0.25)',
  sexualidade: 'rgba(196,62,142,0.25)',
  amor: 'rgba(196,62,94,0.25)',
  criacao: 'rgba(196,196,62,0.25)',
  proposito: 'rgba(142,196,62,0.25)',
  familia: 'rgba(62,196,142,0.25)',
  espiritualidade: 'rgba(62,142,196,0.25)',
  superacao: 'rgba(142,62,196,0.25)',
};
