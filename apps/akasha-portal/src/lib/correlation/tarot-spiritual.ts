// ─── Major Arcana Spiritual Correlations ──────────────────────────────────────────
// Canonical source: src/app/api/tarot/reading/route.ts
// Used by: tarot/reading, tarot/consulta

export const MAJOR_ARCANA_SPIRITUAL_CORRELATIONS: Record<
  number,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  0: {
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O véu se levanta e a sabedoria emerge',
    frequency: '963 Hz',
  }, // The Fool
  1: {
    sefirot: ['Chokhmah'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria divina me guia',
    frequency: '741 Hz',
  }, // The Magician
  2: {
    sefirot: ['Binah'],
    chakra: 7,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A sabedoria das deusas flui em mim',
    frequency: '639 Hz',
  }, // The High Priestess
  3: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A Imperatriz abençoa minha criatividade',
    frequency: '528 Hz',
  }, // The Empress
  4: {
    sefirot: ['Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O Imperador traz ordem e estrutura',
    frequency: '528 Hz',
  }, // The Emperor
  5: {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Iansã',
    affirmation: 'Hierofante ilumina o caminho sagrado',
    frequency: '528 Hz',
  }, // The Hierophant
  6: {
    sefirot: ['Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O lovers me guiam para união divina',
    frequency: '528 Hz',
  }, // The Lovers
  7: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A coragem do guerreiro me fortalece',
    frequency: '528 Hz',
  }, // The Chariot
  8: {
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A força interior supera todos os obstáculos',
    frequency: '528 Hz',
  }, // Strength
  9: {
    sefirot: ['Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'O ermitão busca a luz interior',
    frequency: '741 Hz',
  }, // The Hermit
  10: {
    sefirot: ['Netzach', 'Hod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A roda da fortuna gira a meu favor',
    frequency: '528 Hz',
  }, // Wheel of Fortune
  11: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A justiça divina restaura o equilíbrio',
    frequency: '528 Hz',
  }, // Justice
  12: {
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O homem pendurado aceita o sacrifício',
    frequency: '417 Hz',
  }, // The Hanged Man
  13: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A morte traz transformação e renascimento',
    frequency: '417 Hz',
  }, // Death
  14: {
    sefirot: ['Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A temperança equilibra corpo e alma',
    frequency: '528 Hz',
  }, // Temperance
  15: {
    sefirot: ['Gevurah'],
    chakra: 1,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O diabo representa meus bloqueios',
    frequency: '396 Hz',
  }, // The Devil
  16: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A torre cai para rebuild my foundation',
    frequency: '963 Hz',
  }, // The Tower
  17: {
    sefirot: ['Yesod', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A estrela me conecta à luz divina',
    frequency: '528 Hz',
  }, // The Star
  18: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A lua ilumina meus sonhos',
    frequency: '417 Hz',
  }, // The Moon
  19: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O sol brilha com verdade e alegria',
    frequency: '528 Hz',
  }, // The Sun
  20: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O julgamento traz redenção',
    frequency: '963 Hz',
  }, // Judgement
  21: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O mundo se completa em unidade',
    frequency: '963 Hz',
  }, // The World
};
