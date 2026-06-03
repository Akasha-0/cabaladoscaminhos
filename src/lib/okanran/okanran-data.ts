export interface OkanranData {
  name: string;
  odu: number;
  path: string;
  description: string;
  keywords: string[];
  elements: Array<{ id: string; label: string; weight: number }>;
  qualities: string[];
  lessons: string[];
  challenges: string[];
  opportunities: string[];
  rituals: string[];
  colors: string[];
  symbols: string[];
  affirmation: string;
  chakra: string;
  planet: string;
  day: string;
  element: string;
}

/**
 * Complete Okanran data
 */
export const okanranData: OkanranData = {
  name: 'Okanran',
  odu: 9,
  path: 'Caminho da Sabedoria e Inteligencia',
  description: 'Okanran representa a sabedoria, a inteligencia e o conhecimento profundo. Este Odu ensina que a verdadeira sabedoaria vem da experiencia, da reflexao e da capacidade de aplicar o conhecimento com discernimento. Simboliza a conexao entre o passado, presente e futuro atraves da compreensão dos padroes universais.',
  keywords: ['sabedoria', 'inteligencia', 'conhecimento', 'discernimento', 'compreensao'],
  elements: [
    { id: 'ar', label: 'Ar', weight: 8 },
    { id: 'agua', label: 'Agua', weight: 6 },
    { id: 'fogo', label: 'Fogo', weight: 7 },
    { id: 'terra', label: 'Terra', weight: 5 },
  ],
  qualities: [
    'curiosidade',
    'discernimento',
    'reflexao',
    'compreensao',
    'prudencia',
    'analise',
  ],
  lessons: [
    'A sabedoaria se constroi com experiencia e reflexao',
    'Conhecimento sem discriminacao e perigoso',
    'O verdadeiro saber reconhece seus limites',
    'A humildade intelectual abre portas para o aprendizado',
    'A idade da alma importa mais que a idade do corpo',
  ],
  challenges: [
    'arrogancia intelectual',
    'excesso de analise',
    'dificuldade em agir',
    'perfeccionismo paralizante',
    'sobresforco mental',
  ],
  opportunities: [
    'aprender com mestres',
    'compartilhar conhecimento',
    'guia para outros',
    'desenvolvimento de intuicao',
    'acesso a sabedoria ancestral',
  ],
  rituals: [
    'meditacao de silencio',
    'estudo de textos sagrados',
    'oferecimento de alimentos a Oxum',
    'banho de infusion herbal',
    'ritual de invocao da memoria',
  ],
  colors: ['#4169E1', '#6495ED', '#87CEEB', '#B0C4DE'],
  symbols: ['📚', '🔮', '🧠', '✨'],
  affirmation: 'Eu abraco a sabedoaria com humildade e permito que o conhecimento ilumine meu caminho.',
  chakra: 'terceiro olho',
  planet: 'Mercurio',
  day: 'quarta',
  element: 'ar',
};

/**
 * Get all Okanran data
 */
export function getData(): OkanranData {
  return okanranData;
}

export default getData;