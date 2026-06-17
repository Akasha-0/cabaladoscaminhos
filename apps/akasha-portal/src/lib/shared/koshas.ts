/**
 * 5 Koshas (Tantra Védica) — fonte de verdade para o InfoPanel do Layer 3 (Tantra).
 *
 * Spec mandala-fase3-zodiac-tantra, Requisito 4.1-4.3.
 *
 * IMPORTANTE: estas 5 koshas (pancha-kosha) são conceito tântrico védico,
 * DIFERENTE das 11 bodies de Yogi Bhajan que o MandalaChart já renderiza
 * no SVG do Layer 3. As 5 koshas aparecem SÓ no InfoPanel, sem mexer no SVG.
 *
 * Fonte: tradição tântrica védica (Taittiriya Upanishad, Vivekachudamani).
 * Pilar 1 (Cabala) koréby: descrições não inventadas, baseadas em fonte reconhecida.
 */

export interface Kosha {
  id: 'anna' | 'prana' | 'mano' | 'vijnana' | 'ananda';
  name: { pt: string; en: string; sanskrit: string };
  color: string;
  description: { pt: string; en: string };
}

export const KOSHAS: readonly Kosha[] = [
  {
    id: 'anna',
    name: { pt: 'Físico', en: 'Physical', sanskrit: 'Anna-maya' },
    color: '#E27D60',
    description: {
      pt: 'Corpo físico, nutrido pelo alimento. Onde a matéria, os ossos e a respiração se manifestam.',
      en: 'Physical body, nourished by food. Where matter, bones, and breath manifest.',
    },
  },
  {
    id: 'prana',
    name: { pt: 'Energético', en: 'Energetic', sanskrit: 'Prana-maya' },
    color: '#C38D9E',
    description: {
      pt: 'Camada da energia vital e da respiração. Onde circula o prana, o sopro que dá movimento.',
      en: 'Layer of vital energy and breath. Where prana flows, the breath that gives movement.',
    },
  },
  {
    id: 'mano',
    name: { pt: 'Mental', en: 'Mental', sanskrit: 'Mano-maya' },
    color: '#9DADE3',
    description: {
      pt: 'Camada dos pensamentos, percepções e padrões mentais. Onde a mente processa o mundo.',
      en: 'Layer of thoughts, perceptions, and mental patterns. Where the mind processes the world.',
    },
  },
  {
    id: 'vijnana',
    name: { pt: 'Sabedoria', en: 'Wisdom', sanskrit: 'Vijnana-maya' },
    color: '#7C5CFF',
    description: {
      pt: 'Camada da sabedoria e do discernimento. Onde a intuição e a visão interior se formam.',
      en: 'Layer of wisdom and discernment. Where intuition and inner vision form.',
    },
  },
  {
    id: 'ananda',
    name: { pt: 'Beatitude', en: 'Bliss', sanskrit: 'Ananda-maya' },
    color: '#FFD166',
    description: {
      pt: 'Camada mais interna, da beatitude e da conexão com a fonte. Onde o ser repousa em si.',
      en: 'Innermost layer, of bliss and connection to source. Where the being rests in itself.',
    },
  },
] as const;
