// src/lib/divination/house-delegation.ts
// Delegação canônica: as 36 cartas ciganas → 36 casas da Mesa Real.
//
// Fonte única: `CORRELATION_MAP` (correlation-map.ts), derivado de
// Doc 06 §2 e Doc 06 §3.1. Este módulo apenas *projeta* o mapa canônico
// para a forma completa (`HouseDefinition`) consumida pelo Cockpit,
// derivando campos puramente visuais (cor, ícone) a partir de dados
// já canônicos — sem inventar correspondências esotéricas.

import { CORRELATION_MAP } from '@/lib/ai/correlation-map';
import type { HouseDefinition } from './house-types';

// ============================================================================
// Helpers de derivação (puros, sem dados espirituais inventados)
// ============================================================================

/** Bloco: 9 colunas da matriz 9×4. Coluna 1 → 'A', ..., coluna 9 → 'I'. */
function deriveBloco(houseNumber: number): string {
  const column = ((houseNumber - 1) % 9) + 1;
  return String.fromCharCode(64 + column); // 1→'A', 9→'I'
}

/** Palavra-chave curta: primeira palavra significativa do tema. */
function deriveKeyword(theme: string, houseName: string): string {
  // Preferir a primeira palavra do tema se for útil; senão, do nome.
  const fromTheme = theme.split(/[,—\-]/)[0]?.trim().toLowerCase() ?? '';
  if (fromTheme.length >= 3 && fromTheme.length <= 14) return fromTheme;
  return houseName
    .toLowerCase()
    .replace(/^(o|a|os|as)\s+/, '')
    .split(/\s+/)[0]
    .slice(0, 14);
}

/** Cor primária por bloco — gradiente da paleta Ramiro (laranja → royal). */
function deriveCorPrimaria(bloco: string): string {
  // 9 blocos: A..I ciclam entre laranja (#ea580c) e royal (#2547d0).
  const palette = [
    '#ea580c', // A — laranja primário
    '#dc2626', // B — vermelho
    '#f59e0b', // C — âmbar
    '#65a30d', // D — oliva
    '#0891b2', // E — ciano
    '#2563eb', // F — azul
    '#2547d0', // G — royal
    '#7c3aed', // H — violeta
    '#c026d3', // I — magenta
  ];
  return palette[bloco.charCodeAt(0) - 65] ?? '#ea580c';
}

/** Cor secundária (versão mais escura p/ gradientes/hover). */
function deriveCorSecundaria(primary: string): string {
  // Versão 30% mais escura da cor primária.
  const hex = primary.replace('#', '');
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 40);
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 40);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Ícone lucide-react associado à carta cigana.
 * Mapeamento determinístico por nome canônico (extraído do CORRELATION_MAP);
 * cai num default neutro para nomes fora do mapa.
 */
const ICON_BY_NAME: Record<string, string> = {
  'O Cavaleiro': 'Zap',
  'O Trevo': 'Sparkles',
  'O Navio': 'Ship',
  'A Casa': 'Home',
  'A Árvore': 'TreePine',
  'As Nuvens': 'Cloud',
  'A Serpente': 'Spline',
  'O Caixão': 'Box',
  'O Buquê': 'Flower2',
  'A Foice': 'Scythe',
  'O Chicote': 'Whip',
  'Os Pássaros': 'Bird',
  'O Cão': 'Dog',
  'O Burro': 'CircleDot',
  'O Coelho': 'Rabbit',
  'A Estrela': 'Star',
  'O Veado': 'Deer',
  'A Cegonha': 'Bird',
  'O Cachorro': 'Dog',
  'O Torreão': 'TowerControl',
  'O Gato': 'Cat',
  'O Rato': 'Rat',
  'A Rã': 'Frog',
  'A Borboleta': 'Butterfly',
  'A Flor': 'Flower',
  'A Espada': 'Sword',
  'A Âncora': 'Anchor',
  'O Anjo': 'Angel',
  'O Bouquet': 'Flower2',
  'A Lua': 'Moon',
  'O Sol': 'Sun',
  'A Montanha': 'Mountain',
  'Os Maridos': 'Users',
  'O Corvo': 'Bird',
  'As Crianças': 'Baby',
  'A Cruz': 'Cross',
  'A Espada (Repetida)': 'Sword',
  'O Buquê (Repetido)': 'Flower2',
};

function deriveIcone(houseName: string): string {
  return ICON_BY_NAME[houseName] ?? 'Sparkles';
}

// ============================================================================
// HOUSES_36 — array canônico, derivado de CORRELATION_MAP
// ============================================================================

/**
 * As 36 casas da Mesa Real em ordem (1..36).
 * Derivado de `CORRELATION_MAP` para garantir fonte única de verdade.
 */
export const HOUSES_36: HouseDefinition[] = Object.values(CORRELATION_MAP)
  .sort((a, b) => a.houseId - b.houseId)
  .map((entry) => {
    const bloco = deriveBloco(entry.houseId);
    const corPrimaria = deriveCorPrimaria(bloco);
    return {
      number: entry.houseId,
      cartaCigana: entry.houseName,
      keyword: deriveKeyword(entry.houseTheme, entry.houseName),
      bloco,
      tema: entry.houseTheme,
      significado: entry.houseTheme + '.', // estendido mínimo a partir do tema
      astrologia: entry.astrology.primaryPlanets,
      numerologia: [
        ...entry.kabalah.aspects,
        ...entry.tantric.aspects,
      ],
      corPrimaria,
      corSecundaria: deriveCorSecundaria(corPrimaria),
      icone: deriveIcone(entry.houseName),
    };
  });

/**
 * Busca a definição de uma casa pelo número (1..36).
 * Retorna `undefined` se a casa não existir.
 */
export function getHouseDefinition(houseNumber: number): HouseDefinition | undefined {
  return HOUSES_36.find((h) => h.number === houseNumber);
}
