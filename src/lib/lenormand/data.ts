/**
 * @deprecated — fonte canônica das cartas é `src/lib/constants/lenormand-cards.ts`
 * (Doc 16 AD-02). Mantido apenas como stub de compatibilidade para rotas B2C
 * quarentenadas via LEGACY_B2C.
 */
import { LENORMAND_CARDS, getLenormandCardById } from '@/lib/constants/lenormand-cards';

/** Alias canônico para getCardByNumero */
// fallow-ignore-next-line unused-export

/** Re-export das cartas canônicas */
export const LENORMAND_CARDS_LEGACY = LENORMAND_CARDS;

/** Casamento temático das 36 casas (B2C legado — fora do scope do Cockpit) */
export const CASAS_TEMATICAS: readonly string[] = [];
