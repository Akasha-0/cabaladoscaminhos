/**
 * Obara Practice Module
 * Obara - The Orisha of thunder, lightning, and divine justice
 */

export interface ObaraPractice {
  name: string;
  type: string;
  description: string;
  frequency: string;
  offerings: string[];
  prohibited: string[];
  ceremonies: string[];
}

export const ORIXAS = {
  OBARA: 'Obara',
} as const;

export const obaraPractice: ObaraPractice = {
  name: 'Obara',
  type: 'Orixá do raio e da justiça divina',
  description: 'Senhor dos raios e trovões, portador da justiça divina. Transmite coragem, proteção contra inimigos e a força transformadora do raio. É o orixá que ilumina os caminhos obscuros.',
  frequency: 'Sábados',
  offerings: [
    'Milho branco cozido',
    'Feijão carioquinha',
    'Amendoim torrado',
    'Fumo de paiero',
    'Cachaça',
    'Vela preta',
    'Dinda (cabaça)',
    'Bebidas alcoólicas fortes',
    'Galinha negra',
  ],
  prohibited: [
    'Usar violencia sem causa justa',
    'Mentir em tribunal ou processo',
    'Desrespeitar os mais velhos',
    'Queimar objetos de madeira sagrada',
  ],
  ceremonies: [
    'Saudação aos raios',
    'Ritual de proteção contra inimigos',
    'Feitura de instrumentos de ferro',
    'Rogações de justiça',
  ],
};

/**
 * Performs Obara practice ritual
 */
export function performPractice(): ObaraPractice {
  return { ...obaraPractice };
}

export default { performPractice };