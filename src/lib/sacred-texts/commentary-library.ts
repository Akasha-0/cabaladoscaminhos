/**
 * Commentary library with scholar notes for sacred texts
 */

 

export interface Commentary {
  id: string;
  textId: string;
  scholar: string;
  school: string;
  note: string;
  year?: string;
}

export interface Scholar {
  id: string;
  name: string;
  tradition: string;
  period: string;
}

const scholars: Scholar[] = [
  { id: 'rabbinic', name: 'Rabbinic Scholars', tradition: 'Jewish', period: '200 BCE - 500 CE' },
  { id: 'patristic', name: 'Church Fathers', tradition: 'Christian', period: '100 - 800 CE' },
  { id: 'sufi', name: 'Sufi Mystics', tradition: 'Islamic', period: '700 - 1500 CE' },
  { id: 'vedic', name: 'Vedic Scholars', tradition: 'Hindu', period: '1500 BCE - 500 CE' },
  { id: 'zen', name: 'Zen Masters', tradition: 'Buddhist', period: '500 - 1500 CE' },
];

const commentaries: Commentary[] = [
  // Torah / Bible commentaries
  { id: 'gen-1-01', textId: 'genesis-1', scholar: 'Rashi', school: 'rabbinic', note: 'Begin with love of God, not fear. The creation narrative establishes divine order.', year: '1075' },
  { id: 'psalm-23-01', textId: 'psalm-23', scholar: 'Augustine', school: 'patristic', note: 'The shepherd metaphor reveals God as personal guide through wilderness of life.', year: '400' },
  { id: 'psalm-23-02', textId: 'psalm-23', scholar: 'Clement', school: 'patristic', note: 'Green pastures represent spiritual abundance available to the faithful.', year: '150' },

  // Quran commentaries
  { id: 'fatiha-01', textId: 'fatiha', scholar: 'Ibn Abbas', school: 'sufi', note: 'Al-Fatiha contains the essence of all divine scripture in seven verses.', year: '688' },
  { id: 'kursi-01', textId: 'kursi', scholar: 'Al-Ghazali', school: 'sufi', note: 'The Throne Verse describes divine sovereignty beyond human comprehension.', year: '1100' },
  { id: 'ya-sin-01', textId: 'ya-sin', scholar: 'Al-Qurtubi', school: 'sufi', note: 'Ya-Sin opens the heart to receive guidance and divine presence.', year: '1200' },

  // Vedic commentaries
  { id: 'bhagavad-1-01', textId: 'bhagavad-gita-1', scholar: 'Shankaracharya', school: 'vedic', note: 'Arjuna hesitation represents theuniversal soul seeking dharma in conflict.', year: '800' },
  { id: 'bhagavad-2-01', textId: 'bhagavad-gita-2', scholar: 'Ramanuja', school: 'vedic', note: 'The Self is eternal, unborn, and indestructible — transcends physical form.', year: '1100' },
  { id: 'upanishad-01', textId: 'upanishads', scholar: 'Adi Shankar', school: 'vedic', note: 'Tat tvam asi — Thou art That. The identity of individual and universal soul.', year: '750' },

  // Zen commentaries
  { id: 'heart-01', textId: 'heart-sutra', scholar: 'Bodhidharma', school: 'zen', note: 'Form is emptiness, emptiness is form — paradox points beyond conceptual thought.', year: '527' },
  { id: 'diamond-01', textId: 'diamond-sutra', scholar: 'Dogen', school: 'zen', note: 'No one attains enlightenment, yet all are already enlightened.', year: '1240' },
  { id: 'zen-koan-01', textId: 'mu-sutra', scholar: 'Nansen', school: 'zen', note: 'MU — a koan testing the student\'s resolve to penetrate the unspeakable.', year: '850' },
];

/**
 * Get all commentaries
 */
export function getCommentary(): Commentary[] {
  return [...commentaries];
}

/**
 * Get commentaries by text ID
 */
export function getCommentaryByText(textId: string): Commentary[] {
  return commentaries.filter((c) => c.textId === textId);
}

/**
 * Get commentaries by school
 */
export function getCommentaryBySchool(school: string): Commentary[] {
  return commentaries.filter((c) => c.school === school);
}

/**
 * Get all scholars
 */
export function getScholars(): Scholar[] {
  return [...scholars];
}

/**
 * Get scholar by ID
 */
export function getScholarById(id: string): Scholar | undefined {
  return scholars.find((s) => s.id === id);
}
