/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-A — CRUZAMENTO POR CASA · CONSTANTS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 36 PT-BR temas for the Mesa Real casas + 7-tradição sacred catalog.
 *
 * Casa numbering follows the Cigano Ramiro lineage: Casa 1 = "O Consulente",
 * Casa 8 = "Sexualidade e Transformação", Casa 10 = "Carreira e Vocação", etc.
 * All constants are deeply frozen to prevent accidental mutation.
 */

import type { CasaId, Tradicao } from './types.ts';

// ════════════════════════════════════════════════════════════════════════════
// 36 CASAS — TEMAS (PT-BR)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Mesa Real casa → tema temático.
 * 1-indexed. Casa 1 is "O Consulente", Casa 36 is "O Retorno" (return to origin).
 */
export const TEMAS_CASAS: Readonly<Record<CasaId, string>> = Object.freeze({
  1: 'O Consulente',
  2: 'A Comunicação',
  3: 'Os Irmãos',
  4: 'O Lar e a Família',
  5: 'Os Prazeres e a Criatividade',
  6: 'O Trabalho Diário e a Saúde',
  7: 'O Casamento e as Associações',
  8: 'Sexualidade e Transformação',
  9: 'Filosofia e Viagens',
  10: 'Carreira e Vocação',
  11: 'Amizades e Projetos',
  12: 'Inconsciente e Karma',
  13: 'O Luto e a Renovação',
  14: 'Os Bens e Recursos',
  15: 'Os Prazeres Superiores',
  16: 'A Queda e a Redenção',
  17: 'A Esperança e a Fé',
  18: 'A Família Espiritual',
  19: 'A Amizade Superior',
  20: 'A Vocação Espiritual',
  21: 'A Plenitude',
  22: 'A Liberdade',
  23: 'Os Perigos e as Dores',
  24: 'A Conquista',
  25: 'O Saber Oculto',
  26: 'O Trabalho Concreto',
  27: 'A Caridade',
  28: 'A Morte e o Renascimento',
  29: 'A Iluminação',
  30: 'O Fim e o Início',
  31: 'A Solidariedade',
  32: 'A Pluralidade',
  33: 'A Paciência',
  34: 'A Abundância',
  35: 'A Conclusão',
  36: 'O Retorno',
} as Readonly<Record<CasaId, string>>);

/** Ordered list of all 36 CasaId values (1..36). */
export const CASAS_ORDENADAS: ReadonlyArray<CasaId> = Object.freeze(
  Array.from({ length: 36 }, (_, i) => (i + 1) as CasaId) as ReadonlyArray<CasaId>
);

// ════════════════════════════════════════════════════════════════════════════
// 7-TRADIÇÃO CATALOG
// ════════════════════════════════════════════════════════════════════════════

/**
 * The seven traditions that may contribute to a cruzamento. Note that the
 * engine only emits four (astrologia, numerologia, odu→orixas, cigano); the
 * other three (cabala, tantra, tarot) live in the broader IDEIA.md catalog
 * and are surfaced in the post-jogo chat for supplementary interpretation.
 */
export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
] as ReadonlyArray<Tradicao>);

/**
 * Sacred term catalog per tradicao — used for tokenizer / coverage checks
 * (NOT for the cruzamento engine itself). Helps downstream post-jogo chat
 * identify when an interpretation is touching sacred material.
 */
export const SACRED_TERMS_BY_TRADICAO: Readonly<Record<Tradicao, ReadonlyArray<string>>> = Object.freeze({
  cigano: Object.freeze(['Cigano', 'Cigana', 'Cavaleiro', 'Mesa Real', 'Jogo de 36 cartas']),
  orixas: Object.freeze(['Orixá', 'Odu', 'Ifá', 'Bará', 'Oxalá', 'Iemanjá', 'Ogum', 'Oxóssi', 'Xangô']),
  astrologia: Object.freeze(['Ascendente', 'Meio-do-Céu', 'Lilith', 'Carta Natal', 'Casa Astrológica']),
  cabala: Object.freeze(['Sephirot', 'Árvore da Vida', 'Tiferet', 'Yesod', 'Malkuth']),
  numerologia: Object.freeze(['Número de Destino', 'Ano Pessoal', 'Dia Natalício', 'Pythágoras']),
  tantra: Object.freeze(['Prana', 'Chacra', 'Kundalini', 'Mantra']),
  tarot: Object.freeze(['Arcanos Maiores', 'Arcanos Menores', 'Torre', 'Eremita', 'Sacerdote']),
} as Readonly<Record<Tradicao, ReadonlyArray<string>>>);

// ════════════════════════════════════════════════════════════════════════════
// CIGANO CARD NAMES (36 — Cigano / Lenormand deck)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Cigano card name table (Petite Lenormand lineage). Card #1 = Cigano,
 * #2 = Cigana, #3 = Navio, ..., #29 = Cigana (variant), #36 = Cruz.
 *
 * Note: traditional Petite Lenormand has only 36 cards; this matches the
 * Cigano Ramiro spread used by the consulente (Cigano + Cigana appear at
 * positions 1 and 2 of the deck, with #29 being a Cigana variant).
 */
export const NOMES_CARTAS_CIGANAS: Readonly<Record<number, string>> = Object.freeze({
  1: 'Cigano',
  2: 'Cigana',
  3: 'Navio',
  4: 'Casa',
  5: 'Árvore',
  6: 'Nuvens',
  7: 'Serpente',
  8: 'Caixão',
  9: 'Buquê',
  10: 'Foice',
  11: 'Chicote',
  12: 'Pássaros',
  13: 'Crianca',
  14: 'Raposa',
  15: 'Urso',
  16: 'Estrela',
  17: 'Cegonha',
  18: 'Cão',
  19: 'Torre',
  20: 'Jardim',
  21: 'Montanha',
  22: 'Cruzamento',
  23: 'Ratos',
  24: 'Coração',
  25: 'Anel',
  26: 'Livro',
  27: 'Carta',
  28: 'Homem',
  29: 'Cigana',
  30: 'Lírios',
  31: 'Sol',
  32: 'Lua',
  33: 'Chave',
  34: 'Peixes',
  35: 'Âncora',
  36: 'Cruz',
} as Readonly<Record<number, string>>);

// ════════════════════════════════════════════════════════════════════════════
// ASTROLOGIA — 12 CASAS (sign cusp → thematic gloss for cruzamento)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Gloss for each astrological Casa 1..12 — used when the mesa casa maps to
 * an astrological casa (mesa casas 1..12 = astrologia casas 1..12; mesa
 * casas 13..36 map cyclically or by topic).
 *
 * For the cruzamento engine, we keep this minimal — the real astrologia
 * input comes from `MapaAstrologia.casas[c]` (the consulente's actual
 * natal cusp signs). This table is the FALLBACK gloss for casas without
 * a natal entry.
 */
export const TEMAS_CASAS_ASTROLOGIA: Readonly<Record<number, string>> = Object.freeze({
  1: 'identidade e aparência',
  2: 'recursos e valores',
  3: 'comunicação e irmãos',
  4: 'lar e família',
  5: 'criatividade e prazer',
  6: 'trabalho diário e saúde',
  7: 'parcerias e casamento',
  8: 'sexualidade e transformação',
  9: 'filosofia e viagens',
  10: 'carreira e vocação',
  11: 'amizades e projetos',
  12: 'inconsciente e karma',
} as Readonly<Record<number, string>>);

// ════════════════════════════════════════════════════════════════════════════
// ODUS — 16 KEYWORDS (sample, for citation in cruzamento)
// ════════════════════════════════════════════════════════════════════════════

/**
 * 16 Odus de Ifá with a one-word keyword each (used as a citation anchor
 * in the cruzamento's odu contribution). Full odu interpretations are
 * outside this engine's scope — the cruzamento only needs a stable
 * keyword per odu for the sintese.
 */
export const KEYWORDS_ODUS: Readonly<Record<string, string>> = Object.freeze({
  'Ejiogbe': 'princípio',
  'Oyeku': 'noite',
  'Iwori': 'mistério',
  'Odi': 'frio',
  'Irosu': 'sabão',
  'Owonrin': 'carrapato',
  'Obara': 'abundância',
  'Okanran': 'conflito',
  'Ogunda': 'forja',
  'Osa': 'mês',
  'Ika': 'morte',
  'Oturupon': 'doença',
  'Otura': 'pena',
  'Irete': 'caça',
  'Ofe': 'amor',
  'Ofun': 'morte',
} as Readonly<Record<string, string>>);