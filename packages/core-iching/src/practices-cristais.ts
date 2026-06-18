/**
 * @akasha/core-iching — Práticas de Cristaloterapia
 *
 * Dados de práticas integrativas usando cristais,
 * extraídos de practices-data.ts para organização.
 */
import type { IntegrativePractice } from './types';

export const CRISTAIS_PRACTICES: IntegrativePractice[] = [
  {
    id: 'quartzo-rosa',
    name: 'Cristais de Quartzo Rosa',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'rosa',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [5, 31],
    },
    lifeAreas: ['amor', 'autoestima', 'cura emocional', 'relações'],
    howTo:
      'Segure o quartzo rosa em cada mão durante 10 minutos. Visualize uma luz rosa envolvendo seu coração enquanto respira profundamente.',
    frequency: 'Diariamente ao acordar ou antes de dormir.',
    isSafe: true,
  },

  {
    id: 'ametista',
    name: 'Ametista',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'roxo',
      planet: 'Netuno',
      chakra: 6,
      hexagrams: [29, 30],
    },
    lifeAreas: ['espiritualidade', 'calma', 'intuição', 'sonhos'],
    howTo:
      'Coloque uma ametista sob o travesseiro para dormir ou segure durante meditação. Programar a pedra mentalizando intenção por 3 minutos.',
    frequency: 'Durante meditação diária e no quarto de dormir.',
    isSafe: true,
  },

  {
    id: 'turmalina-negra',
    name: 'Turmalina Negra',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'terra',
      color: 'preto',
      planet: 'Saturno',
      chakra: 1,
      hexagrams: [2, 18],
    },
    lifeAreas: ['proteção', 'aterramento', 'absorção de energias negativas'],
    howTo:
      'Segure a turmalina negra na mão esquerda por 5 minutos ao acordar. Ou placing-a na entrada do ambiente para formar escudo protetor.',
    frequency: 'Diariamente, especialmente em dias de alta energia negativa.',
    isSafe: true,
  },

  {
    id: 'citrino',
    name: 'Citrino',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'fogo',
      color: 'amarelo',
      planet: 'Sol',
      chakra: 3,
      hexagrams: [14, 26],
    },
    lifeAreas: ['prosperidade', 'abundância', 'confiança', 'realização'],
    howTo:
      'Segure o citrino na mão direita enquanto visualiza sua intenção de prosperidade. Mantenha perto da carteira ou cofre.',
    frequency: 'Diariamente, carregando sempre que possível.',
    isSafe: true,
  },

  {
    id: 'quartzo-transparente',
    name: 'Quartzo Transparente',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'branco',
      planet: 'Lua',
      chakra: 7,
      hexagrams: [1, 30],
    },
    lifeAreas: ['clareza mental', 'amplificação de intenções', 'cura', 'equilíbrio'],
    howTo:
      'Segure o quartzo transparente na mão dominante. Projete sua intenção euse-o como amplificador visualizando luz passando pela pedra.',
    frequency: 'Durante meditação e trabalho com outras práticas.',
    isSafe: true,
  },
];
