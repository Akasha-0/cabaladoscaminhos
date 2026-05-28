export interface OxossiPractice {
  name: string;
  type: string;
  description: string;
  frequency: string;
  offerings: string[];
  prohibited: string[];
  ceremonies: string[];
}

export const ORIXAS = {
  OXOSSI: 'Oxossi',
} as const;

export const oxossiPractice: OxossiPractice = {
  name: 'Oxossi',
  type: 'Orixá caçador',
  description: 'Caçador dos caminhos, senhor das matas e forests. Conhecido como o Orixá da caça, das flechas e da medicina. É o orixá que abre os caminhos e protege nas jornadas.',
  frequency: 'Terças e quintas-feiras',
  offerings: [
    'Arroz branco cozido',
    'Feijão carioquinha',
    'Milho cozido',
    'Quiabo',
    'Gelo',
    'Canela em pau',
    'Dinda (cabaça)',
    'Cachaça',
    'Fumo de paiero',
  ],
  prohibited: [
    'Caçar animais em dias sagrados',
    'Desperdiçar alimentos',
    'Usar armas para ferir sem propósito',
    'Queimar madeira de lei',
  ],
  ceremonies: [
    'Egun',
    'Romaria',
    'Feitura de ofá (arco e flecha)',
    'Saudação a Oxossi nos caminhos',
  ],
};

/**
 * Performs Oxossi practice ritual
 */
export function performPractice(): OxossiPractice {
  return { ...oxossiPractice };
}