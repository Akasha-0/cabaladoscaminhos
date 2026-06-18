/**
 * Tantra — Mapeamentos dos 11 Corpos de Consciência
 *
 * Os 11 corpos tântricos derivam da tradição Nirmana瑜伽 / Bahaull.
 * Cada corpo corresponde a um chakra e a um par de primitivos Akáshicos.
 *
 * Dado que o corpo_predominante é um número 1-11, o mapeamento rico
 * permite que a fonte em PrimitiveContribution inclua chakra, elemento,
 * frequência e proposta de vida — para além do par de primitivos.
 *
 * @version 1.0.0
 */
import type { Primitivo, Polaridade } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TantraElemento = 'fogo' | 'água' | 'terra' | 'ar';

export interface CorpoNumerologia {
  corpo: number; // 1–11
  nome: string; // nome em português
  frequencia: number; // redux do número do corpo
  elemento: TantraElemento;
  /** Chakra principal deste corpo (tradição Hindou / Yoga klasik) */
  chakra: string;
  primitivo: Primitivo; // primeiro primitivo do par
  primitivo2: Primitivo; // segundo primitivo do par
  polaridade: Polaridade;
  palavrasChave: string[];
  /** Proposta de vida deste corpo — o que a alma procura através dele */
  proposta: string;
  fonte: string; // justificativa tradicional
}

// ─── Tabela dos 11 Corpos ────────────────────────────────────────────────────

/**
 * Os 11 corpos tântricos (Nirmana Yoga / Bahaull):
 * 1 Físico — o corpo da densidão e da matéria
 * 2 Astral — o corpo emocional e dos desejos
 * 3 Mental — o corpo do pensamento e da lógica
 * 4 Búdico — o corpo da intuição espiritual e do amor incondicional
 * 5 Celestial — o corpo da divindade e da graça
 * 6 Paramatmann — o corpo da beatitude e da união com o Eu
 * 7 Lituano — o corpo da vontade cósmica
 * 8 Mahata — o corpo da consciência cósmica
 * 9 Pandora — o corpo da receptividade e da compaixão
 * 10 Shiva — o corpo da consciência pura e da testemunha
 * 11 Hari — o corpo do amor divino e da preservação
 *
 * Elementos por corpo (arquétipos naturais):
 * Físico → terra (estabilidade, matéria)
 * Astral → água (emocional, fluido)
 * Mental → ar (mental, comunicativo)
 * Búdico → fogo (coração, fuego espiritual)
 * Celestial → ar (mente celestial)
 * Paramatmann → água (essência profunda)
 * Lituano → terra (vontade antiga, pedra)
 * Mahata → fogo (dinamismo, ação)
 * Pandora → água (receptividade, profundidade emocional)
 * Shiva → fogo (consciência pura, testemunha)
 * Hari → terra (nutrição, preservação)
 */
const CORPOS_DATA: Record<number, Omit<CorpoNumerologia, 'corpo'>> = {
  1: {
    nome: 'Físico',
    frequencia: 1,
    elemento: 'terra',
    chakra: 'Muladhara',
    primitivo: 'Materializacao',
    primitivo2: 'Movimento',
    polaridade: 'ambas',
    palavrasChave: ['corpo', 'saúde', 'movimento', 'terra', 'presença'],
    proposta: 'Ancorar a consciência na matéria e dar forma concreta às intenções.',
    fonte:
      'Tantra — Corpo Físico (1): Muladhara, terra, primeiro corpo de incarnação. Corresponde ao número 1 na numerologia tântrica — início da jornada na matéria.',
  },
  2: {
    nome: 'Astral',
    frequencia: 2,
    elemento: 'água',
    chakra: 'Svadhisthana',
    primitivo: 'Conexao',
    primitivo2: 'Transformacao',
    polaridade: 'ambas',
    palavrasChave: ['emoção', 'desejo', 'água', 'criatividade', 'sentir'],
    proposta: 'Sentir profundamente e permitir que as emoções guiem a transformação.',
    fonte:
      'Tantra — Corpo Astral (2): Svadhisthana, água, corpo dos desejos e da emoção. O número 2 na numerologia tântrica — dualidade, receptividade, fluxo.',
  },
  3: {
    nome: 'Mental',
    frequencia: 3,
    elemento: 'ar',
    chakra: 'Manipura',
    primitivo: 'Sabedoria',
    primitivo2: 'Intuicao',
    polaridade: 'ambas',
    palavrasChave: ['mente', 'pensamento', 'discernimento', 'ar', 'clareza'],
    proposta: 'Desenvolver a mente como instrumento de percepção e sabedoria.',
    fonte:
      'Tantra — Corpo Mental (3): Manipura, ar, corpo do pensamento e da vontade pessoal. O número 3 na numerologia tântrica — expressão, comunicação, expansão mental.',
  },
  4: {
    nome: 'Búdico',
    frequencia: 4,
    elemento: 'fogo',
    chakra: 'Anahata',
    primitivo: 'Expansao',
    primitivo2: 'Servico',
    polaridade: 'luz',
    palavrasChave: ['coração', 'amor', 'fogo', 'compaixão', 'expansão'],
    proposta: 'Abrir o coração e expandir-se no mundo através do amor e do serviço.',
    fonte:
      'Tantra — Corpo Búdico (4): Anahata, fogo, corpo do coração e da compaixão. O número 4 na numerologia tântrica — estabilidade cardíaca, expansão pelo amor.',
  },
  5: {
    nome: 'Celestial',
    frequencia: 5,
    elemento: 'ar',
    chakra: 'Vishuddha',
    primitivo: 'Expressao',
    primitivo2: 'Ordem',
    polaridade: 'ambas',
    palavrasChave: ['celestial', 'comunicação', 'verdade', 'ar', 'expressão'],
    proposta:
      'Expressar a verdade e canalizar a energia celestial através da palavra e da criação.',
    fonte:
      'Tantra — Corpo Celestial (5): Vishuddha, ar, corpo da garganta e da expressão verdadeira. O número 5 na numerologia tântrica — liberdade, mudança, comunicação sagrada.',
  },
  6: {
    nome: 'Paramatmann',
    frequencia: 6,
    elemento: 'água',
    chakra: 'Ajna',
    primitivo: 'Poder',
    primitivo2: 'Amor',
    polaridade: 'ambas',
    palavrasChave: ['eu', 'intuição', 'beatitude', 'água', 'união'],
    proposta: 'Unir-se ao Eu superior e viver a partir da autoridade interior.',
    fonte:
      'Tantra — Corpo Paramatmann (6): Ajna, água, corpo do terceiro olho e da vontade divina. O número 6 na numerologia tântrica — harmonia, intuição, beatitude.',
  },
  7: {
    nome: 'Lituano',
    frequencia: 7,
    elemento: 'terra',
    chakra: 'Sahasrara',
    primitivo: 'Materializacao',
    primitivo2: 'Sabedoria',
    polaridade: 'ambas',
    palavrasChave: ['vontade', 'cósmico', 'terra', 'ancestral', 'persistência'],
    proposta: 'Ancorar a consciência cósmica na terra e manifestar através da vontade.',
    fonte:
      'Tantra — Corpo Lituano (7): Sahasrara via terra, corpo da vontade cósmica. O número 7 na numerologia tântrica — introspecção, sabedoria, busca interior.',
  },
  8: {
    nome: 'Mahata',
    frequencia: 8,
    elemento: 'fogo',
    chakra: 'Sahasrara',
    primitivo: 'Transformacao',
    primitivo2: 'Movimento',
    polaridade: 'ambas',
    palavrasChave: ['consciência', 'ação', 'fogo', 'transformação', 'dinamismo'],
    proposta: 'Transformar a realidade através da ação consciente e do movimento创造性.',
    fonte:
      'Tantra — Corpo Mahata (8): Sahasrara via fogo, corpo da consciência cósmica dinâmica. O número 8 na numerologia tântrica — poder, transformação, realização.',
  },
  9: {
    nome: 'Pandora',
    frequencia: 9,
    elemento: 'água',
    chakra: 'Anahata',
    primitivo: 'Conexao',
    primitivo2: 'Intuicao',
    polaridade: 'luz',
    palavrasChave: ['receptividade', 'abertura', 'água', 'compaixão', 'escuta'],
    proposta: 'Abrir-se completamente à vida e confiar na inteligência do universo.',
    fonte:
      'Tantra — Corpo Pandora (9): Anahata via água, corpo da receptividade pura. O número 9 na numerologia tântrica — completion, compaixão universal, iluminação.',
  },
  10: {
    nome: 'Shiva',
    frequencia: 1, // redux: 1+0=1
    elemento: 'fogo',
    chakra: 'Sahasrara',
    primitivo: 'Poder',
    primitivo2: 'Ordem',
    polaridade: 'luz',
    palavrasChave: ['testemunha', 'pureza', 'fogo', 'consciência', 'ordenação'],
    proposta: 'Viver como testemunha da vida enquanto organiza a realidade com clareza.',
    fonte:
      'Tantra — Corpo Shiva (10): Sahasrara via fogo, corpo da consciência pura de Shiva. O número 10 na numerologia tântrica — iluminação, testemunha, sabedoria antiga.',
  },
  11: {
    nome: 'Hari',
    frequencia: 2, // redux: 1+1=2
    elemento: 'terra',
    chakra: 'Sahasrara',
    primitivo: 'Expansao',
    primitivo2: 'Amor',
    polaridade: 'luz',
    palavrasChave: ['nutrição', 'preservação', 'terra', 'amor', 'sustentação'],
    proposta: 'Sustentar a vida com amor e criar as condições para que outros floresçam.',
    fonte:
      'Tantra — Corpo Hari (11): Sahasrara via terra, corpo do amor divino de Vishnu/Hari. O número 11 na numerologia tântrica — intuição superior, missão espiritual.',
  },
};

export const CORPOS_NUMEROLOGIA: Record<number, CorpoNumerologia> = Object.fromEntries(
  Object.entries(CORPOS_DATA).map(([corpo, data]) => [
    Number(corpo),
    { corpo: Number(corpo), ...data } as CorpoNumerologia,
  ])
) as Record<number, CorpoNumerologia>;

/**
 * Look up a tantric body's numerological data by number (1–11).
 * Returns undefined if the body number is out of range.
 */
export function getCorpoNumerologia(corpo: number): CorpoNumerologia | null {
  if (corpo < 1 || corpo > 11 || !Number.isInteger(corpo)) return null;
  return CORPOS_NUMEROLOGIA[corpo] ?? null;
}

/**
 * Returns all bodies that share the same element.
 */
export function getCorposPorElemento(elemento: TantraElemento): CorpoNumerologia[] {
  return Object.values(CORPOS_NUMEROLOGIA).filter((c) => c.elemento === elemento);
}
