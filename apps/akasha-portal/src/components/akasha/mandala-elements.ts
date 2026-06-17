/**
 * Mandala — Elementos (Fogo / Terra / Ar / Água)
 *
 * Constantes e helper relacionados aos 4 elementos clássicos usados
 * pela Mandala Akáshica. Extraído de MandalaChart.tsx para reduzir
 * o tamanho do componente visual e isolar a lógica de domínio.
 */

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FB5781',
  earth: '#F0B429',
  air: '#7C5CFF',
  water: '#2DD4BF',
};

export const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo',
  earth: 'Terra',
  air: 'Ar',
  water: 'Água',
};

export const ELEMENT_GUIDANCE: Record<string, { balance: string; ritual: string }> = {
  fire: {
    balance:
      'Elemento dominante Fogo — energia de ação, liderança e expansão. Para equilibrar: aterrar com práticas de Terra (corpo, natureza, alimentos raiz).',
    ritual:
      'Ritual: banhos de ervas de terra (alecrim, patchouli), caminhar descalço, meditação com pedras.',
  },
  earth: {
    balance:
      'Elemento dominante Terra — energia de estrutura, paciência e materialização. Para equilibrar: aquecer com Fogo (movimento, expressão, criatividade).',
    ritual:
      'Ritual: dança livre, uso de cores vibrantes, incenso de canela ou cravo para ativar a chama interna.',
  },
  air: {
    balance:
      'Elemento dominante Ar — energia mental, comunicação e movimento. Para equilibrar: ancorar com Água (emoção, intuição, descanso).',
    ritual: 'Ritual: banhos de água fria com pétalas de rosa, meditação aquática, chás calmantes.',
  },
  water: {
    balance:
      'Elemento dominante Água — energia emocional, intuição e profundidade. Para equilibrar: estruturar com Terra (rotinas, corpo, alimentação consciente).',
    ritual:
      'Ritual: caminhadas na natureza, dieta baseada em raízes e tubérculos, pedras de jaspe ou hematita.',
  },
};

export function dominantElement(balance: {
  fire: number;
  earth: number;
  air: number;
  water: number;
}): string {
  const entries = Object.entries(balance) as [string, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}
