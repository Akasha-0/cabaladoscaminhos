/**
 * @akasha/core-iching — Práticas de Cromoterapia
 *
 * Dados de práticas integrativas usando cromoterapia (terapia de cores),
 * extraídos de practices-data.ts para organização.
 */

import type { IntegrativePractice } from './types';

export const CROMOTERAPIA_PRACTICES: IntegrativePractice[] = [
  {
    id: 'luz-amarela',
    name: 'Banho de Luz Amarela',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'fogo',
      color: 'amarelo',
      planet: 'Sol',
      chakra: 3,
      hexagrams: [14, 26],
    },
    lifeAreas: ['prosperidade', 'abundância', 'confiança', 'otimismo'],
    howTo: 'Sente-se em ambiente escuro e exponha-se à luz amarela (lâmpada ou filtro) por 15 minutos. Visualize energia dourada entrando.',
    frequency: 'Manhãs ensolaradas, 3 vezes por semana.',
    isSafe: true,
  },

  {
    id: 'luz-azul',
    name: 'Banho de Luz Azul',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'agua',
      color: 'azul',
      planet: 'Lua',
      chakra: 5,
      hexagrams: [5, 29],
    },
    lifeAreas: ['calma', 'comunicação', 'verdade', 'paz interior'],
    howTo: 'Exponha-se à luz azul por 20 minutos em ambiente tranquilo. Ideal ao entardecer quando há transições de energia.',
    frequency: 'Diariamente ao entardecer por 15-20 dias.',
    isSafe: true,
  },

  {
    id: 'luz-verde',
    name: 'Banho de Luz Verde',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'madeira',
      color: 'verde',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [20, 57],
    },
    lifeAreas: ['cura', 'equilíbrio', 'crescimento', 'natureza'],
    howTo: 'Sente-se na natureza ou exponha-se à luz verde artificial por 15 minutos. Idealmente ao ar livre, próximo a plantas.',
    frequency: 'Diariamente por 21 dias, preferencialmente manhãs.',
    isSafe: true,
  },

  {
    id: 'luz-vermelha',
    name: 'Banho de Luz Vermelha',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'fogo',
      color: 'vermelho',
      planet: 'Marte',
      chakra: 1,
      hexagrams: [6, 34],
    },
    lifeAreas: ['energia', 'coragem', 'vitalidade', 'força'],
    howTo: 'Exponha-se à luz vermelha por 10 minutos, preferencialmente pela manhã. Não exceder 15 minutos para evitar hiperestimulação.',
    frequency: 'Manhãs, 2-3 vezes por semana.',
    isSafe: true,
  },

  {
    id: 'afirmacao-cor',
    name: 'Afirmação com Cor',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      color: 'branco',
      chakra: 7,
      hexagrams: [1, 30],
    },
    lifeAreas: ['alinhamento', 'intenção', 'manifestação', 'propósito'],
    howTo: 'Visualize a cor associada à sua intenção enquanto repete sua afirmação 21 vezes. Por exemplo: "Sou próspero" com visualização dourada.',
    frequency: 'Ao acordar e antes de dormir, por 40 dias.',
    isSafe: true,
  },
];
