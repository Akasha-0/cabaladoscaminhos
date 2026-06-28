// ============================================================================
// MENTORSHIP — Mock mentor profiles (offline preview / fixtures)
// ============================================================================
// Used for:
//   1. Storybook-style preview of MentorCard / FilterChips without auth
//   2. Local dev when /api/mentorship/available is not seeded
//   3. Snapshot / visual-regression baselines
//
// IMPORTANT: This file contains placeholder profiles for UX development.
// DO NOT ship these profiles to production endpoints or use them as a
// substitute for the real backend. The API contract is the source of
// truth (see src/lib/community/mentorship.ts).
//
// Wave 20 Worker D — 2026-06-28
// ============================================================================

import type { MentorProfile } from './types';

/**
 * 7 sample mentors spanning the canonical tradition set.
 * Profiles reflect realistic diversity: languages, regions, specialties.
 */
export const MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'mock-m-001',
    displayName: 'Ialorixá Conceição d\u2019Oxum',
    bio: 'Filha de Oxum há 28 anos. Acolho mulheres em processo de reconexão com a feminilidade sagrada e os orixás do amor. Atendo em PT e ES.',
    traditions: ['candomble'],
    languages: ['pt-BR', 'es'],
    topics: ['axe', 'orixas', 'umbanda', 'candomble'],
    rating: 4.9,
    completed: 47,
    isAvailable: true,
    yearsPracticing: 28,
    region: 'Salvador, BA',
    responseTime: '~2 dias',
  },
  {
    id: 'mock-m-002',
    displayName: 'Rabino Shlomo Ben Asher',
    bio: 'Estudioso da Cabala há 15 anos. Trabalho com leitura de árvores da vida, meditação sobre os nomes divinos e o estudo do Zohar em grupo. EN e PT.',
    traditions: ['cabala'],
    languages: ['pt-BR', 'en'],
    topics: ['cabala', 'numerologia', 'meditacao'],
    rating: 4.8,
    completed: 32,
    isAvailable: true,
    yearsPracticing: 15,
    region: 'São Paulo, SP',
    responseTime: '~3 dias',
  },
  {
    id: 'mock-m-003',
    displayName: 'Babalorixá Adeilson de Xangô',
    bio: 'Iniciado há 22 anos. Mentoria focada em Ifá e Candomblé — abertura de caminhos, ebós, oferendas e o jogo de búzios. PT-BR.',
    traditions: ['candomble', 'ifa'],
    languages: ['pt-BR'],
    topics: ['axe', 'orixas', 'ifa', 'candomble'],
    rating: 5.0,
    completed: 61,
    isAvailable: false,
    yearsPracticing: 22,
    region: 'Rio de Janeiro, RJ',
    responseTime: '~5 dias',
  },
  {
    id: 'mock-m-004',
    displayName: 'Mestra Tatiana Tantra',
    bio: 'Praticante de Tantra há 12 anos, com formação em tradições kaula e Kashmir shaivismo. Mentoria para casais e praticantes solo.',
    traditions: ['tantra'],
    languages: ['pt-BR', 'en', 'es'],
    topics: ['chakras', 'kundalini', 'tantra', 'meditacao'],
    rating: 4.7,
    completed: 28,
    isAvailable: true,
    yearsPracticing: 12,
    region: 'Florianópolis, SC',
    responseTime: '~1 dia',
  },
  {
    id: 'mock-m-005',
    displayName: 'Astróloga Maya López',
    bio: 'Astróloga psicológica (escola junguiana) com 10 anos de prática. Leitura de mapa natal, trânsitos e sinastria. ES e EN.',
    traditions: ['astrologia'],
    languages: ['es', 'en'],
    topics: ['astrologia', 'numerologia', 'mesa-real'],
    rating: 4.6,
    completed: 19,
    isAvailable: true,
    yearsPracticing: 10,
    region: 'Buenos Aires, AR',
    responseTime: '~2 dias',
  },
  {
    id: 'mock-m-006',
    displayName: 'Pajé Samuel da Floresta',
    bio: 'Guardião de tradições xamânicas amazônicas. Trabalha com Ayahuasca em contexto ritual e oferece mentoria para conduzantes de dieta.',
    traditions: ['xamanismo', 'ayahuasca'],
    languages: ['pt-BR'],
    topics: ['xamanismo', 'meditacao', 'axe'],
    rating: 4.9,
    completed: 14,
    isAvailable: true,
    yearsPracticing: 18,
    region: 'Manaus, AM',
    responseTime: '~7 dias',
  },
  {
    id: 'mock-m-007',
    displayName: 'Mestre Reiki Akira Tanaka',
    bio: 'Reiki Usui nível 4A (Shihan). Ensina autoconhecimento energético, canais e prática diária. EN, ES e JP (PT com tradutor).',
    traditions: ['reiki'],
    languages: ['en', 'es'],
    topics: ['reiki', 'chakras', 'meditacao'],
    rating: 4.5,
    completed: 23,
    isAvailable: true,
    yearsPracticing: 9,
    region: 'Lisboa, PT',
    responseTime: '~3 dias',
  },
];

/**
 * Find a mock mentor by id. Returns undefined if not found.
 */
export function findMockMentor(id: string): MentorProfile | undefined {
  return MOCK_MENTORS.find((m) => m.id === id);
}
