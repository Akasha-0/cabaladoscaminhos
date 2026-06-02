/**
 * @deprecated This file has 42 cards (obsolete Baralho Cigano extended).
 * Use `src/lib/constants/lenormand-cards.ts` for the canonical 36 cards.
 * AD-02 in docs/16_revisao-arquitetura-plano-decisoes.md
 */
import { LENORMAND_CARDS, getLenormandCardById } from '@/lib/constants/lenormand-cards';

/** Alias canônico para getCardByNumero */

/** Re-export das cartas canônicas */
export const LENORMAND_CARDS_LEGACY = LENORMAND_CARDS;

/** Casamento temático das 36 casas (B2C legado — fora do scope do Cockpit) */
export const CASAS_TEMATICAS: readonly string[] = [];
