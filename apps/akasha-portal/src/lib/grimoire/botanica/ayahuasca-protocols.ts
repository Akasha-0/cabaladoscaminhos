/**
 * Protocolos de Integração Ayahuasca
 *
 * Pre-ceremony anamnesis, post-ceremony integration e rotinas somáticas.
 * Baseado em espiritualidade visceral (Cumino) e medicina da floresta.
 *
 * Pilar 6: Raiz & Esquerda · Forest Alchemy
 */

import type { AyahuascaProtocol } from './types';

export const AYAHUASCA_PROTOCOLS: Record<
  'PreAnamnesis' | 'PostCeremony' | 'ActiveIntegration',
  AyahuascaProtocol
> = {
  PreAnamnesis: {
    stage: 'PreAnamnesis',
    recommendations: {
      somaticRoutines: [
        'Yoga suave para abrir quadris e coluna (30 min)',
        'Respiração holotrópica 15 min antes do trabalho interior',
        'Meditação debody scan para identificar tensões armazenadas',
      ],
      dietaryNotes: [
        'Dieta sem sal por 3 dias antes',
        'Jejum de 12h antes da cerimônia',
        'Abster-se de álcool, drogas e sexo por 5 dias',
        'Beber muita água purificada com sal rosa',
      ],
      integrationNotes: [
        'Prepare um diário para registrar visões',
        'Tenha alguém de confiança como zelador de porta',
        'Defina uma intenção clara antes de beber',
      ],
    },
    sombraAreas: ['Casa 8 (transformação, morte, herança)', 'Lilith (sombra, fome根部)'],
  },

  PostCeremony: {
    stage: 'PostCeremony',
    recommendations: {
      eweBaths: ['ewe-alecrim', 'ewe-arruda', 'ewe-oxal'],
      somaticRoutines: [
        'Descanso absoluto por 24h após cerimônia',
        'Banho de folhas na manhã seguinte (descarrrego)',
        'Yoga restaurativo focado em quadril e sacro',
        'Alongamento suave para processar tensão armazenada',
      ],
      reikiPlacements: [
        'Mão no coração — chakra Anahata',
        'Mão na testa — chakra Ajna',
        'Mão no baixo ventre — Svadhistana',
      ],
      dietaryNotes: [
        'Dieta leve por 7 dias: frutas, vegetais, grãos',
        'Evitar carnes vermelhas por 3 dias',
        'Beber água com sal rosa e limão',
        'Suco de noni se disponível',
      ],
      integrationNotes: [
        'Escreva tudo que lembrar — visões, sensações, insights',
        'Não tome decisões importantes por 3 dias',
        'Evite exposição ao sol intenso por 48h',
      ],
    },
    sombraAreas: ['Casa 8', 'Lilith', 'Casa 12 (inconsciente coletivo)'],
  },

  ActiveIntegration: {
    stage: 'ActiveIntegration',
    recommendations: {
      eweBaths: ['ewe-manjericao', 'ewe-alecrim', 'ewe-ewon'],
      somaticRoutines: [
        'Exercício físico diário (caminhada, natação, yoga)',
        'Prática de respiração 20 min pela manhã',
        'Meditação body scan antes de dormir',
        'Alongamento focado em onde sentiu mais resistência na cerimônia',
      ],
      reikiPlacements: [
        'Autotratamento de Gokai (5 princípios)',
        'Colocar mãos no chakra que mais pediu atenção na sessão',
      ],
      dietaryNotes: [
        'Integração com a dieta do Odu do consulente',
        'Folhas frescas nos alimentos diariamente',
        'Evitar alimentos processados',
      ],
      integrationNotes: [
        'Reler diário e destacar 3 insights principais por semana',
        'Montar um ritual pessoal semanal de integração',
        'Buscar acompanhamento terapêutico se necessário',
      ],
    },
    sombraAreas: [],
  },
};
