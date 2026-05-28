export interface AffirmationItem {
  id: string;
  text: string;
  category: string;
}

export interface AffirmationData {
  affirmations: AffirmationItem[];
  categories: string[];
}

const affirmations: AffirmationItem[] = [
  { id: '1', text: 'Eu sou digno de amor e respeito.', category: 'amor-proprio' },
  { id: '2', text: 'Eu escolho pensar de forma positiva.', category: 'pensamento-positivo' },
  { id: '3', text: 'Eu sou suficiente exatamente como sou.', category: 'amor-proprio' },
  { id: '4', text: 'Eu permito que a paz flua através de mim.', category: 'paz' },
  { id: '5', text: 'Eu confio no processo da vida.', category: 'confianca' },
  { id: '6', text: 'Eu abraço novas possibilidades com coragem.', category: 'coragem' },
  { id: '7', text: 'Minha mente está calma e clara.', category: 'paz' },
  { id: '8', text: 'Eu atraio abundância para minha vida.', category: 'abundancia' },
  { id: '9', text: 'Eu sou grato por tudo que tenho.', category: 'gratidao' },
  { id: '10', text: 'Eu libero preocupações que não me servem.', category: 'liberacao' },
  { id: '11', text: 'Cada dia traz novas oportunidades.', category: 'abundancia' },
  { id: '12', text: 'Eu me perdoo comigo mesmo com compaixão.', category: 'amor-proprio' },
];

const categories = [
  'amor-proprio',
  'pensamento-positivo',
  'paz',
  'confianca',
  'coragem',
  'abundancia',
  'gratidao',
  'liberacao',
];

export function getData(): AffirmationData {
  return { affirmations, categories };
}
